import { shallowRef, onUnmounted } from 'vue';

const MEDIAPIPE_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe';

/**
 * 動態注入 CDN script 標籤
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

/**
 * 視覺服務 Composable
 * 職責：
 * - 封裝 Mediapipe Hands 模型與 Camera 工具的載入與初始化
 * - 提供底層視訊串流與辨識結果的橋接
 */
export function useVisionService() {
  const handsModel = shallowRef<any>(null);
  const camera = shallowRef<any>(null);
  const isReady = shallowRef(false);

  /**
   * 初始化 Vision 系統
   * @param videoElement 綁定的 HTMLVideoElement
   * @param onResults 辨識結果的回調函式
   */
  const init = async (videoElement: HTMLVideoElement, onResults: (results: any) => void) => {
    try {
      // 1. 載入 CDN scripts
      await Promise.all([
        loadScript(`${MEDIAPIPE_CDN}/hands/hands.js`),
        loadScript(`${MEDIAPIPE_CDN}/camera_utils/camera_utils.js`),
        loadScript(`${MEDIAPIPE_CDN}/drawing_utils/drawing_utils.js`)
      ]);

      const HandsClass = (window as any).Hands;
      const CameraClass = (window as any).Camera;

      if (!HandsClass || !CameraClass) {
        throw new Error('Mediapipe classes not found in window');
      }

      // 2. 初始化模型
      const hands = new HandsClass({
        locateFile: (file: string) => `${MEDIAPIPE_CDN}/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.4,
        minTrackingConfidence: 0.4
      });

      hands.onResults(onResults);
      handsModel.value = hands;

      // 3. 啟動攝影機
      const cam = new CameraClass(videoElement, {
        onFrame: async () => {
          if (handsModel.value) {
            await handsModel.value.send({ image: videoElement });
          }
        },
        width: 640,
        height: 480
      });

      await cam.start();
      camera.value = cam;
      isReady.value = true;
    } catch (err) {
      console.error('Vision system initialization failed:', err);
    }
  };

  /**
   * 停止 Vision 系統
   */
  const stop = () => {
    if (camera.value) {
      camera.value.stop();
      camera.value = null;
    }
    if (handsModel.value) {
      handsModel.value.close();
      handsModel.value = null;
    }
    isReady.value = false;
  };

  onUnmounted(stop);

  return {
    isReady,
    init,
    stop
  };
}
