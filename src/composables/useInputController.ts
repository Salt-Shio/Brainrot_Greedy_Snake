import { ref, computed, onMounted, onUnmounted, watch, type Ref } from 'vue';
import * as CONFIG from '@/core/config';
import type { Direction } from '@/core/types';
import type { InputStrategy, InputMode, SystemAction, KeyHint } from '@/core/input/types';
import { createClassicStrategy } from '@/core/input/strategies/ClassicStrategy';
import { createMorseSingleStrategy } from '@/core/input/strategies/MorseSingleStrategy';
import { createMorseTwinStrategy } from '@/core/input/strategies/MorseTwinStrategy';

// Re-export for backward compatibility
export type { SystemAction, KeyHint } from '@/core/input/types';

/**
 * 統一輸入控制器 (Strategy Pattern Bridge)
 */
export function useInputController(
  mode: Ref<InputMode>,
  onDirection: (dir: Direction) => void,
  onSystem: (action: SystemAction) => void
) {
  // --- 策略實例化 (Encapsulated Strategies) ---
  const strategies: Record<InputMode, InputStrategy> = {
    CLASSIC: createClassicStrategy(onDirection),
    SINGLE_KEY: createMorseSingleStrategy(onDirection),
    TWIN_KEY: createMorseTwinStrategy(onDirection),
  };

  const currentStrategy = computed(() => strategies[mode.value]);
  
  // 緩衝區響應式對接
  const buffer = ref('');
  const syncBuffer = () => {
    buffer.value = currentStrategy.value.getBuffer?.() || '';
  };

  // --- UI Display Logic (封裝展示邏輯) ---
  const uiDisplay = computed(() => {
    const systemKeys = CONFIG.SYSTEM_CONTROLS.KEYS;
    const hints: KeyHint[] = [];

    switch (mode.value) {
      case 'TWIN_KEY':
        hints.push({ key: CONFIG.MORSE_CONFIG.TWIN.DOT_KEY, label: 'Dot (.)', isMain: true });
        hints.push({ key: CONFIG.MORSE_CONFIG.TWIN.DASH_KEY, label: 'Dash (-)', isMain: true });
        hints.push({ key: systemKeys.SUBMIT, label: 'Submit' });
        break;
      case 'SINGLE_KEY':
        hints.push({ key: 'SPACE', label: 'Morse', isMain: true });
        hints.push({ key: systemKeys.SUBMIT, label: 'Submit' });
        break;
      case 'CLASSIC':
        hints.push({ key: 'WASD', label: 'Move', isMain: true });
        break;
    }

    if (mode.value !== 'CLASSIC') {
      hints.push({ key: systemKeys.CLEAR, label: 'Clear' });
    }
    hints.push({ key: systemKeys.PAUSE, label: 'Pause' });

    return hints;
  });

  /**
   * 嘗試解析目前的 Buffer 並執行方向變換
   */
  const submitBuffer = () => {
    currentStrategy.value.submitBuffer?.();
    syncBuffer();
  };

  const clearBuffer = () => {
    currentStrategy.value.clearBuffer?.();
    syncBuffer();
  };

  // --- Key Event Handlers ---

  const handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const systemKeys = CONFIG.SYSTEM_CONTROLS.KEYS;

    // 系統鍵優先處理
    if (key === systemKeys.SUBMIT) return onSystem('SUBMIT');
    if (key === systemKeys.CLEAR) {
      clearBuffer();
      return onSystem('CLEAR');
    }
    if (key === systemKeys.PAUSE) return onSystem('PAUSE');


    // 委派給具體策略
    currentStrategy.value.onKeyDown(e);
    syncBuffer();
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    currentStrategy.value.onKeyUp?.(e);
    syncBuffer();
  };

  // 模式切換時自動清空舊策略的 Buffer
  watch(mode, () => {
    Object.values(strategies).forEach(s => s.clearBuffer?.());
    syncBuffer();
  });

  // --- Lifecycle ---

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  });

  return {
    buffer,
    uiDisplay,
    submitBuffer,
    clearBuffer
  };
}
