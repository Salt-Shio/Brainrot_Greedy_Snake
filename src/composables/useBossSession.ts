import { ref, onUnmounted, shallowRef } from 'vue';
import { detectAlternatingMovement, getHandRefY, type HandSide } from '@/core/boss-logic';
import { BOSS_TARGET_COUNT } from '@/core/config/game';

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe';

/**
 * 動態注入 CDN script 標籤（若已存在則直接 resolve）
 */
function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load: ${src}`));
    document.head.appendChild(script);
  });
}

export function useBossSession(onDefeat: () => void) {

  // 狀態
  const isActive = ref(false);
  const count = ref(0);
  const targetCount = BOSS_TARGET_COUNT;
  const isCameraReady = ref(false);
  const latestResults = shallowRef<any>(null);
  
  // Mediapipe 實例 (使用 shallowRef 避免 Vue 遞迴 proxy 破壞外部物件)
  const handsModel = shallowRef<any>(null);
  const camera = shallowRef<any>(null);
  const videoElement = shallowRef<HTMLVideoElement | null>(null);

  // 判定暫存變數 (在這裡，prevY 代表的是「自上次得分後的最低點位置」)
  let prevLeftY: number | null = null;
  let prevRightY: number | null = null;
  let lastScoredHand: HandSide | null = null;

  /**
   * 初始化相機與模型
   */
  const initVision = async (video: HTMLVideoElement) => {
    videoElement.value = video;

    // 1. 動態載入 Mediapipe CDN scripts（已載入則直接跳過）
    try {
      await loadScript(`${MEDIAPIPE_CDN}/hands/hands.js`);
      await loadScript(`${MEDIAPIPE_CDN}/camera_utils/camera_utils.js`);
      await loadScript(`${MEDIAPIPE_CDN}/drawing_utils/drawing_utils.js`);
    } catch (err) {
      console.error('Mediapipe CDN 載入失敗:', err);
      return;
    }

    const HandsClass = (window as any).Hands;
    const CameraClass = (window as any).Camera;

    if (!HandsClass) {
      console.error('Mediapipe Hands model failed to load');
      return;
    }

    // 2. 初始化 Hands 模型
    const hands = new HandsClass({
      locateFile: (file: string) => {
        return `${MEDIAPIPE_CDN}/hands/${file}`;
      }
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1, // 0或1，1比較準但吃效能
      minDetectionConfidence: 0.4, // 降低門檻以應對高速移動
      minTrackingConfidence: 0.4
    });

    // 2. 註冊每幀的回調
    hands.onResults(onResults);
    handsModel.value = hands;

    // 3. 啟動相機
    if (!CameraClass) {
      console.error('Mediapipe Camera utility failed to load');
      return;
    }

    const cam = new CameraClass(video, {
      onFrame: async () => {
        if (handsModel.value) {
          await handsModel.value.send({ image: video });
        }
      },
      width: 640,
      height: 480
    });

    await cam.start();
    camera.value = cam;
    isCameraReady.value = true;
  };

  /**
   * 處理每一幀的辨識結果
   */
  const onResults = (results: any) => {
    if (!isActive.value) return;

    // 保存結果供 UI 繪製
    latestResults.value = results;

    // 取得目前參考點高度
    const currentLeftY = getHandRefY(results, 'Left');
    const currentRightY = getHandRefY(results, 'Right');

    // 1. 動態更新最低點 (Y 越大代表位置越低)
    if (currentLeftY !== null) {
      if (prevLeftY === null || currentLeftY > prevLeftY) prevLeftY = currentLeftY;
    }
    if (currentRightY !== null) {
      if (prevRightY === null || currentRightY > prevRightY) prevRightY = currentRightY;
    }

    // 2. 執行判定
    const movement = detectAlternatingMovement(
      results, 
      prevLeftY, 
      prevRightY, 
      lastScoredHand, 
      0.06 // 只要向上揮 6% 畫面高度就算一次，適合極速抖動
    );

    if (movement?.scored) {
      // 得分！
      count.value++;
      lastScoredHand = movement.hand;

      // 重要：得分後立刻將該手的參考點重置為目前高度，重新開始下一波震動追蹤
      if (movement.hand === 'Left') prevLeftY = currentLeftY;
      else prevRightY = currentRightY;

      if (count.value >= targetCount) {
        handleDefeat();
      }
    }
  };

  const startBossBattle = async (video: HTMLVideoElement) => {
    isActive.value = true;
    count.value = 0;
    prevLeftY = null;
    prevRightY = null;
    lastScoredHand = null;
    await initVision(video);
  };

  const handleDefeat = () => {
    isActive.value = false;
    if (camera.value) {
      camera.value.stop();
    }
    onDefeat();
  };

  onUnmounted(() => {
    if (camera.value) camera.value.stop();
    if (handsModel.value) handsModel.value.close();
  });

  return {
    isActive,
    count,
    targetCount,
    isCameraReady,
    latestResults,
    startBossBattle
  };
}
