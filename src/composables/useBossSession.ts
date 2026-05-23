import { ref, shallowRef } from 'vue';
import { detectAlternatingMovement, getHandRefY, type HandSide } from '@/core/boss-logic';
import { BOSS_TARGET_COUNT } from '@/core/config/game';
import { useVisionService } from '@/composables/useVisionService';

/**
 * Boss 戰鬥會話管理
 * 職責：
 * - 追蹤戰鬥進度 (hit count)
 * - 判斷戰鬥勝利/失敗條件
 * - 呼叫核心判定邏輯
 */
export function useBossSession(onDefeat: () => void) {
  const { isReady: isCameraReady, init: initVision, stop: stopVision } = useVisionService();

  // 狀態
  const isActive = ref(false);
  const count = ref(0);
  const targetCount = BOSS_TARGET_COUNT;
  const latestResults = shallowRef<any>(null);
  
  // 判定暫存變數 (在這裡，prevY 代表的是「自上次得分後的最低點位置」)
  let prevLeftY: number | null = null;
  let prevRightY: number | null = null;
  let lastScoredHand: HandSide | null = null;

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
      0.06 // 只要向上揮 6% 畫面高度就算一次
    );

    if (movement?.scored) {
      count.value++;
      lastScoredHand = movement.hand;

      // 重要：得分後立刻將該手的參考點重置為目前高度，重新開始下一波震動追蹤
      if (movement.hand === 'Left') prevLeftY = currentLeftY;
      else prevRightY = currentRightY;

      if (count.value >= targetCount) {
        handleVictory();
      }
    }
  };

  /**
   * 開始戰鬥
   */
  const startBossBattle = async (video: HTMLVideoElement) => {
    isActive.value = true;
    count.value = 0;
    prevLeftY = null;
    prevRightY = null;
    lastScoredHand = null;
    
    // 初始化 Vision 服務並註冊回調
    await initVision(video, onResults);
  };

  /**
   * 處理勝利
   */
  const handleVictory = () => {
    isActive.value = false;
    stopVision();
    onDefeat();
  };

  return {
    isActive,
    count,
    targetCount,
    isCameraReady,
    latestResults,
    startBossBattle
  };
}
