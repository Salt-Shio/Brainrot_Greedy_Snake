/**
 * 代表二維平面上的點或向量
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * 迷因食物資料結構
 */
export interface MemeFood {
  id: string;
  imageUrl: string;
  soundUrl: string;
}

/**
 * 食物實例 (位置 + 迷因)
 */
export interface FoodInstance {
  position: Point;
  meme: MemeFood;
}

/**
 * 遊戲目前的狀態
 */
export type GameState = 'IDLE' | 'PLAYING' | 'GAMEOVER' | 'PAUSED';

/**
 * 地圖邊界模式
 * - BOUNDARY: 撞牆即死
 * - MIRROR_WRAP: 鏡像循環連接
 */
export type MapMode = 'BOUNDARY' | 'MIRROR_WRAP';

/**
 * 移動方向
 */
export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

/**
 * 方向與向量的映射表型別
 */
export type VectorMap = Record<Direction, Point>;
