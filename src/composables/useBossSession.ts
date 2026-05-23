import { ref, onUnmounted, shallowRef } from 'vue';
import { detectAlternatingMovement, type HandSide } from '@/core/boss-logic';
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
  
  // Mediapipe 實例 (使用 shallowRef 避免 Vue 遞迴 proxy 破壞外部物件)
  const handsModel = shallowRef<any>(null);
  const camera = shallowRef<any>(null);
  const videoElement = shallowRef<HTMLVideoElement | null>(null);

  // 判定暫存變數
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
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });

    // 3. 註冊每幀的回調
    hands.onResults(onResults);
    handsModel.value = hands;

    // 4. 啟動相機
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

    const movement = detectAlternatingMovement(
      results, 
      prevLeftY, 
      prevRightY, 
      lastScoredHand, 
      0.12 // 閾值：12% 的畫面高度
    );

    if (movement?.scored) {
      // 得分！
      count.value++;
      lastScoredHand = movement.hand;

      if (count.value >= targetCount) {
        handleDefeat();
      }
    }

    // 更新歷史資料 (從 results 中提取)
    let currentLeftY = null;
    let currentRightY = null;
    
    if (results.multiHandedness && results.multiHandLandmarks) {
      for (let i = 0; i < results.multiHandedness.length; i++) {
        const label = results.multiHandedness[i].label;
        if (label === 'Left' || label === 'Right') {
           if (label === 'Left') currentLeftY = results.multiHandLandmarks[i][0].y;
           else currentRightY = results.multiHandLandmarks[i][0].y;
        }
      }
    }

    // 只有在當前幀有偵測到手時，才更新 prevY，避免因為手短暫離開畫面而清空記錄
    if (currentLeftY !== null) prevLeftY = currentLeftY;
    if (currentRightY !== null) prevRightY = currentRightY;
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
    startBossBattle
  };
}
