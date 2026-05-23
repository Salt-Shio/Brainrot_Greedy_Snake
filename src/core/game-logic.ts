import type { Point, Direction, MemeFood } from './types';
import { VECTOR_MAP, MAP_MODE } from '@/core/config/game';

/**
 * 從資源池中隨機挑選一個迷因食物
 */
export function getRandomMeme(pool: MemeFood[]): MemeFood {
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

/**
 * 處理座標循環 (Wrap Logic)

 * 根據 Mirror/Flip 規則進行座標轉換
 */
export function wrapPosition(point: Point, gridSize: number): Point {
  const wrapped = { ...point };

  // 水平越界處理 (LEFT/RIGHT)
  if (point.x < 0) {
    wrapped.x = gridSize - 1;
    wrapped.y = (gridSize - 1) - point.y;
  } else if (point.x >= gridSize) {
    wrapped.x = 0;
    wrapped.y = (gridSize - 1) - point.y;
  }

  // 垂直越界處理 (UP/DOWN)
  if (point.y < 0) {
    wrapped.y = gridSize - 1;
    wrapped.x = (gridSize - 1) - point.x;
  } else if (point.y >= gridSize) {
    wrapped.y = 0;
    wrapped.x = (gridSize - 1) - point.x;
  }

  return wrapped;
}

/**
 * 根據目前頭部位置與方向，計算下一格的座標
 */
export function getNextHeadPosition(head: Point, direction: Direction, gridSize: number): Point {
  const vector = VECTOR_MAP[direction];
  const nextRaw = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  if (MAP_MODE === 'MIRROR_WRAP') {
    return wrapPosition(nextRaw, gridSize);
  }

  return nextRaw;
}

/**
 * 檢查座標是否超出邊界
 */
export function isWallCollision(point: Point, gridSize: number): boolean {
  return (
    point.x < 0 || 
    point.y < 0 || 
    point.x >= gridSize || 
    point.y >= gridSize
  );
}

/**
 * 檢查座標是否與蛇身碰撞 (撞到自己)
 */
export function isSelfCollision(head: Point, body: Point[]): boolean {
  // 檢查頭部座標是否出現在身體陣列中
  return body.some(segment => segment.x === head.x && segment.y === head.y);
}

/**
 * 檢查是否吃到食物
 */
export function isEating(head: Point, food: Point): boolean {
  return head.x === food.x && head.y === food.y;
}

/**
 * 產生隨機座標
 */
function getRandomPoint(gridSize: number): Point {
  return {
    x: Math.floor(Math.random() * gridSize),
    y: Math.floor(Math.random() * gridSize),
  };
}

/**
 * 在地圖上隨機產生食物，且必須避開蛇身與現有食物
 */
export function generateFood(snakeBody: Point[], gridSize: number, existingFoods: Point[] = []): Point {
  let newFood: Point;
  let isOccupied: boolean;

  // 使用迴圈直到找到不在蛇身上且不在現有食物位置的座標
  do {
    newFood = getRandomPoint(gridSize);
    const isOnSnake = snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y);
    const isOnFood = existingFoods.some(food => food.x === newFood.x && food.y === newFood.y);
    isOccupied = isOnSnake || isOnFood;
  } while (isOccupied);

  return newFood;
}
