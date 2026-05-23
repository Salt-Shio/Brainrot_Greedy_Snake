import type { Point } from '@/core/types';

/**
 * 遊戲初始數據
 */
export const INITIAL_STATE = {
  SNAKE: [
    { x: 10, y: 10 },
    { x: 10, y: 11 },
    { x: 10, y: 12 },
  ] as Point[],
} as const;
