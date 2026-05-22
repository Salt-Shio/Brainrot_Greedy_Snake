import type { MapMode, VectorMap } from '../types';
import type { InputMode } from '../input/types';

/**
 * 遊戲網格大小 (20x20)
 */
export const GRID_SIZE = 20;

/**
 * 地圖邊界模式
 */
export const MAP_MODE: MapMode = 'MIRROR_WRAP';

/**
 * 初始移動速度 (毫秒)
 */
export const INITIAL_SPEED = 300;

/**
 * 方向向量映射表
 */
export const VECTOR_MAP: VectorMap = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

/**
 * 預設控制模式
 */
export const DEFAULT_CONTROL_MODE: InputMode = 'TWIN_KEY';

/**
 * 每個方向的正對向，用於防止 180 度直接回頭
 */
export const OPPOSITE_DIRECTION: Record<string, string> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};
