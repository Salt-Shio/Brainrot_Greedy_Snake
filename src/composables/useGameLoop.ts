import { onUnmounted, ref } from 'vue';
import { INITIAL_SPEED } from '@/core/config/game';


/**
 * 簡易的遊戲循環管理器
 * @param callback 每個 Tick 要執行的函式
 */
export function useGameLoop(callback: () => void) {
  const timer = ref<number | null>(null);

  const start = (speed: number = INITIAL_SPEED) => {
    if (timer.value) return;
    timer.value = window.setInterval(callback, speed);
  };

  const stop = () => {
    if (timer.value) {
      clearInterval(timer.value);
      timer.value = null;
    }
  };

  // 組件卸載時自動清除計時器，防止記憶體洩漏
  onUnmounted(() => {
    stop();
  });

  return {
    start,
    stop,
    isActive: () => !!timer.value
  };
}
