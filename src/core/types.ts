/**
 * 代表二維平面上的點或向量
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 遊戲目前的狀態
 */
export type GameState = 'IDLE' | 'PLAYING' | 'GAMEOVER' | 'PAUSED';

/**
 * 移動方向
 */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/**
 * 方向與向量的映射表型別
 */
export type VectorMap = Record<Direction, Point>;
