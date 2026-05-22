import type { Point, Direction } from './types';
import { VECTOR_MAP, MAP_MODE } from './config/game';

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
 * 在地圖上隨機產生食物，且必須避開蛇身
 */
export function generateFood(snakeBody: Point[], gridSize: number): Point {
  let newFood: Point;
  let isOccupied: boolean;

  // 使用迴圈直到找到不在蛇身上的位置
  // 對於 20x20 的網格來說，效能影響極小
  do {
    newFood = getRandomPoint(gridSize);
    isOccupied = snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y);
  } while (isOccupied);

  return newFood;
}
