import { useSnakeStore } from '@/composables/useSnakeStore';
import { useGameLoop } from '@/composables/useGameLoop';
import { useInputController } from '@/composables/useInputController';
import { useAudioController } from '@/composables/useAudioController';
import { useBossSession } from '@/composables/useBossSession';
import { useMorseChallenge } from '@/composables/useMorseChallenge';
import { useMemeEffects } from '@/composables/useMemeEffects';
import type { SystemAction } from '@/core/input/types';
import * as CONFIG from '@/core/config';

/**
 * 遊戲流程協調器
 *
 * 職責：
 * - 整合多個單一職責的 Composables
 * - 協調狀態機轉換（IDLE, PLAYING, PAUSED, GAMEOVER, BOSS_BATTLE）
 * - 管理 GameLoop 的啟動與停止
 */
export function useGameSession() {
  const store = useSnakeStore();
  const { playBGM, pauseBGM, stopBGM } = useAudioController();
  
  // 分解後的模組
  const { challengeMorse, generateChallenge, verifyChallenge } = useMorseChallenge();
  const { lastEatenMeme, triggerEatenEffect } = useMemeEffects();

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
  } = useBossSession(store.bossBattleMode, handleBossDefeat);

  // --- GameLoop 核心循環 ---
  const loop = useGameLoop(() => {
    const eatenMeme = store.moveStep();
    
    // 1. 處理吃到食物
    if (eatenMeme) {
      triggerEatenEffect(eatenMeme);

      // 檢查是否達到觸發 Boss 的閾值
      if (store.eatenCount.value >= CONFIG.BOSS_TRIGGER_COUNT) {
        triggerBossBattle();
      }
    }

    // 2. 處理遊戲結束
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

  // --- 系統事件處理 ---

  /**
   * 處理提交判定 (身分驗證 or 摩斯轉向)
   */
  const handleSubmit = () => {
    if (store.status.value === 'IDLE') {
      // IDLE 狀態：驗證摩斯挑戰身分，成功則開局
      if (verifyChallenge(buffer.value)) {
        store.startGame();
        playBGM();
        loop.start();
        clearBuffer();
      }
    } else if (store.status.value === 'PLAYING') {
      // PLAYING 狀態：手動提交摩斯指令
      submitBuffer();
    }
  };

  /**
   * 處理暫停切換
   */
  const handlePauseToggle = () => {
    if (store.status.value === 'PLAYING') {
      store.pauseGame();
      pauseBGM();
      loop.stop();
    } else if (store.status.value === 'PAUSED') {
      store.startGame();
      playBGM();
      loop.start();
    }
  };

  /**
   * 處理系統功能鍵 (來自 InputController)
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
   * 處理方向輸入 (含 CLASSIC 模式的自動開局)
   */
  const handleDirection = (newDir: Parameters<typeof store.changeDirection>[0]) => {
    if (store.status.value === 'IDLE' && store.controlMode.value === 'CLASSIC') {
      store.startGame();
      playBGM();
      loop.start();
    }
    store.changeDirection(newDir);
  };

  // --- 輸入控制器對接 ---
  const { buffer, uiDisplay, submitBuffer, clearBuffer } = useInputController(
    store.controlMode,
    handleDirection,
    handleSystem,
  );

  /**
   * 重置遊戲
   */
  const handleReset = () => {
    loop.stop();
    stopBGM();
    store.initGame();
    generateChallenge(); // 重置時重新生成挑戰碼
  };

  return {
    // 狀態與資料
    challengeMorse,
    lastEatenMeme,
    isBossActive,
    bossHitCount,
    bossTargetCount,
    isBossCameraReady,
    latestResults,
    buffer,
    uiDisplay,
    // 行動與事件
    startBossBattle,
    handlePauseToggle,
    handleReset,
  };
}
