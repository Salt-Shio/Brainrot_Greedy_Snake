import type { Point, Direction } from './types';
import { VECTOR_MAP } from './constants';

/**
 * 根據目前頭部位置與方向，計算下一格的座標
 */
export function getNextHeadPosition(head: Point, direction: Direction): Point {
  const vector = VECTOR_MAP[direction];
  return {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };
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
