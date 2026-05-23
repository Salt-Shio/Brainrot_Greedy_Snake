import { ref } from 'vue';
import { useSnakeStore } from '@/composables/useSnakeStore';
import { useGameLoop } from '@/composables/useGameLoop';
import { useInputController } from '@/composables/useInputController';
import { useAudioController } from '@/composables/useAudioController';
import { useBossSession } from '@/composables/useBossSession';
import type { SystemAction } from '@/core/input/types';
import type { MemeFood } from '@/core/types';
import * as CONFIG from '@/core/config';

/**
 * 遊戲流程協調器
 *
 * 職責：
 * - 摩斯密碼挑戰的生命週期（生成、驗證）
 * - 遊戲狀態轉換的業務邏輯（IDLE → PLAYING 的身分驗證）
 * - 暫停 / 繼續
 * - GameLoop 的啟停協調
 * - 輸入控制器的橋接
 * - Boss 戰鬥的啟動與結束協調
 */
export function useGameSession() {
  const store = useSnakeStore();
  const { playEffect, playBGM, pauseBGM, stopBGM } = useAudioController();

  // --- Boss 戰鬥協調 ---
  const handleBossDefeat = () => {
    store.resumeFromBoss();
    store.resetEatenCount();
    playBGM();
    loop.start();
  };

  const { 
    isActive: isBossActive, 
    count: bossHitCount, 
    targetCount: bossTargetCount, 
    isCameraReady: isBossCameraReady,
    latestResults,
    startBossBattle 
  } = useBossSession(handleBossDefeat);

  // 用於觸發 UI 閃爍特效的響應式狀態
  const lastEatenMeme = ref<MemeFood | null>(null);

  // --- GameLoop ---
  const loop = useGameLoop(() => {
    const eatenMeme = store.moveStep();
    
    // 如果吃到食物，播放對應的迷因音效並觸發閃爍特效
    if (eatenMeme) {
      playEffect(eatenMeme.soundUrl);
      lastEatenMeme.value = { ...eatenMeme };

      // 檢查是否達到觸發 Boss 的閾值
      if (store.eatenCount.value >= CONFIG.BOSS_TRIGGER_COUNT) {
        triggerBossBattle();
      }
    }

    // 檢查是否遊戲結束，若是則暫停 BGM
    if (store.status.value === 'GAMEOVER') {
      pauseBGM();
      loop.stop();
    }
  });

  const triggerBossBattle = () => {
    store.enterBossBattle();
    pauseBGM();
    loop.stop();
  };

  // --- 摩斯密碼挑戰 ---
  const challengeMorse = ref('');

  const generateChallenge = () => {
    const symbols = ['.', '-'];
    challengeMorse.value = Array.from(
      { length: CONFIG.MORSE_CONFIG.CHALLENGE.LENGTH },
      () => symbols[Math.floor(Math.random() * 2)]
    ).join('');
  };

  // 初始化挑戰
  generateChallenge();

  // --- 系統事件處理 ---

  /**
   * 處理提交判定（身分驗證 or 摩斯轉向）
   */
  const handleSubmit = () => {
    if (store.status.value === 'IDLE') {
      // IDLE 狀態：驗證摩斯挑戰
      if (buffer.value === challengeMorse.value) {
        store.startGame();
        playBGM(); // 開始播放 BGM
        loop.start();
        clearBuffer();
      }
    } else if (store.status.value === 'PLAYING') {
      // PLAYING 狀態：解析摩斯指令
      submitBuffer();
    }
  };

  /**
   * 處理暫停切換
   */
  const handlePauseToggle = () => {
    if (store.status.value === 'PLAYING') {
      store.pauseGame();
      pauseBGM(); // 暫停 BGM
      loop.stop();
    } else if (store.status.value === 'PAUSED') {
      store.startGame();
      playBGM(); // 恢復 BGM
      loop.start();
    }
  };

  /**
   * 處理系統功能鍵
   */
  const handleSystem = (action: SystemAction) => {
    switch (action) {
      case 'SUBMIT':
        handleSubmit();
        break;
      case 'PAUSE':
        handlePauseToggle();
        break;
      case 'CLEAR':
        // clearBuffer 已在 useInputController 內部處理
        break;
    }
  };

  /**
   * 處理方向輸入（含 CLASSIC 模式的自動開局）
   */
  const handleDirection = (newDir: Parameters<typeof store.changeDirection>[0]) => {
    if (store.status.value === 'IDLE' && store.controlMode.value === 'CLASSIC') {
      store.startGame();
      playBGM(); // 經典模式開始也播放 BGM
      loop.start();
    }
    store.changeDirection(newDir);
  };

  // --- 輸入控制器 ---
  const { buffer, uiDisplay, submitBuffer, clearBuffer } = useInputController(
    store.controlMode,
    handleDirection,
    handleSystem,
  );

  /**
   * 重置遊戲並重新生成挑戰
   */
  const handleReset = () => {
    loop.stop();
    stopBGM(); // 重設時停止 BGM
    store.initGame();
    generateChallenge();
  };

  return {
    // 挑戰相關
    challengeMorse,
    lastEatenMeme,
    // Boss 相關
    isBossActive,
    bossHitCount,
    bossTargetCount,
    isBossCameraReady,
    latestResults,
    startBossBattle,
    // 輸入控制器 (供 UI 使用)
    buffer,
    uiDisplay,
    // 事件處理
    handlePauseToggle,
    handleReset,
  };
}
