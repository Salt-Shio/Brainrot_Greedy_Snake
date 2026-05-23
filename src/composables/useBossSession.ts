import { ref, shallowRef, onUnmounted, computed } from 'vue';
import { detectAlternatingMovement, getHandRefY, type HandSide } from '@/core/boss-logic';
import { BOSS_TARGET_COUNT } from '@/core/config/game';
import { useVisionService } from '@/composables/useVisionService';
import type { BossBattleMode } from '@/core/types';

/**
 * Boss 戰鬥會話管理
 */
export function useBossSession(mode: { value: BossBattleMode }, onDefeat: () => void) {
  const { isReady: isVisionReady, init: initVision, stop: stopVision } = useVisionService();

  // 狀態
  const isActive = ref(false);
  const count = ref(0);
  const targetCount = BOSS_TARGET_COUNT;
  const latestResults = shallowRef<any>(null);
  
  // 判定暫存變數
  let prevLeftY: number | null = null;
  let prevRightY: number | null = null;
  let lastScoredHand: HandSide | null = null;
  let lastScoredNum: string | null = null;

  /**
   * 處理每一幀的辨識結果 (手勢模式)
   */
  const onResults = (results: any) => {
    if (!isActive.value || mode.value !== 'GESTURE') return;

    latestResults.value = results;
    const currentLeftY = getHandRefY(results, 'Left');
    const currentRightY = getHandRefY(results, 'Right');

    if (currentLeftY !== null) {
      if (prevLeftY === null || currentLeftY > prevLeftY) prevLeftY = currentLeftY;
    }
    if (currentRightY !== null) {
      if (prevRightY === null || currentRightY > prevRightY) prevRightY = currentRightY;
    }

    const movement = detectAlternatingMovement(results, prevLeftY, prevRightY, lastScoredHand, 0.06);

    if (movement?.scored) {
      count.value++;
      lastScoredHand = movement.hand;
      if (movement.hand === 'Left') prevLeftY = currentLeftY;
      else prevRightY = currentRightY;

      if (count.value >= targetCount) handleVictory();
    }
  };

  /**
   * 處理鍵盤輸入 (數字模式)
   */
  const handleKeyDown = (e: KeyboardEvent) => {
    if (!isActive.value || mode.value !== 'NUMERIC') return;

    const key = e.key;
    if ((key === '6' || key === '7') && key !== lastScoredNum) {
      count.value++;
      lastScoredNum = key;
      if (count.value >= targetCount) handleVictory();
    }
  };

  /**
   * 開始戰鬥
   */
  const startBossBattle = async (video: HTMLVideoElement) => {
    isActive.value = true;
    count.value = 0;
    
    if (mode.value === 'GESTURE') {
      prevLeftY = null;
      prevRightY = null;
      lastScoredHand = null;
      await initVision(video, onResults);
    } else {
      lastScoredNum = null;
      // 確保不重複監聽
      window.removeEventListener('keydown', handleKeyDown);
      window.addEventListener('keydown', handleKeyDown);
    }
  };

  /**
   * 處理勝利
   */
  const handleVictory = () => {
    isActive.value = false;
    if (mode.value === 'GESTURE') {
      stopVision();
    } else {
      window.removeEventListener('keydown', handleKeyDown);
    }
    onDefeat();
  };

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    isActive,
    count,
    targetCount,
    // 使用 computed 確保響應性
    isCameraReady: computed(() => mode.value === 'GESTURE' ? isVisionReady.value : true),
    latestResults,
    startBossBattle
  };
}
