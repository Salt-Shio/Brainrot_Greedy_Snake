import type { MapMode, VectorMap, Direction } from '@/core/types';
import type { InputMode } from '@/core/input/types';

/**
 * 遊戲網格大小 (20x20)
 */
export const GRID_SIZE = 20;

/**
 * 地圖邊界模式
 */
export const MAP_MODE: MapMode = 'MIRROR_WRAP';

/**
 * 場上食物數量
 */
export const FOOD_COUNT = 5;

/**
 * 迷因種類總數 (對應 public/assets/memes 裡的檔案數量)
 */
export const TOTAL_MEME_TYPES = 6;

/**
 * 全域音效音量 (0.0 ~ 1.0)
 */
export const MASTER_VOLUME = 0.4;

/**
 * 背景音樂音量 (0.0 ~ 1.0)
 */
export const BGM_VOLUME = 0.4;

/**
 * 背景音樂檔案路徑
 */
export const BGM_URL = '/assets/sounds/bgm.m4a'; // 預設路徑，請確保檔案存在

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
export const OPPOSITE_DIRECTION: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

/**
 * 吃掉幾個食物後觸發 Boss 戰鬥
 */
export const BOSS_TRIGGER_COUNT = 3;

/**
 * Boss 戰鬥需要完成的揮手次數
 */
export const BOSS_TARGET_COUNT = 67;
