import { Point, Direction, VectorMap } from './types';

/**
 * 遊戲網格大小 (20x20)
 */
export const GRID_SIZE = 20;

/**
 * 初始蛇身座標陣列 (頭在索引 0)
 */
export const INITIAL_SNAKE: Point[] = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 },
];

/**
 * 初始食物位置
 */
export const INITIAL_FOOD: Point = { x: 5, y: 5 };

/**
 * 初始移動速度 (毫秒)
 */
export const INITIAL_SPEED = 200;

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
 * 每個方向的正對向，用於防止 180 度直接回頭
 */
export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};
