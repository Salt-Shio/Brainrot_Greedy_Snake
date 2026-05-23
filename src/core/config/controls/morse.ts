import type { Direction } from '@/core/types';

/**
 * 摩斯密碼引擎配置 (包含單鍵/雙鍵所有邏輯)
 */
export const MORSE_CONFIG = {
  // 1. 核心映射 (共用)
  MAP: {
    '..-': 'UP',
    '--.': 'DOWN',
    '-.-': 'LEFT',
    '.-.': 'RIGHT',
  } as Record<string, Direction>,

  // 2. 挑戰設定
  CHALLENGE: {
    LENGTH: 5,
  },

  // 3. 單鍵模式設定 (SINGLE_KEY)
  SINGLE: {
    TRIGGER_KEY: ' ', // Space
    SHORT_THRESHOLD: 150,
  },

  // 4. 雙鍵模式設定 (TWIN_KEY)
  TWIN: {
    DOT_KEY: 'i',
    DASH_KEY: 'o',
  },
} as const;
