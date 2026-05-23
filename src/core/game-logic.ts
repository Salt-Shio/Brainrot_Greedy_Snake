import type { Point, Direction, MapMode, VectorMap, MemeFood } from './types';

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
  const max = gridSize - 1;

  // 水平越界處理 (LEFT/RIGHT)
  // 如果 x 越界，則 y 麓像圖德翻轉
  const xOut = point.x < 0 || point.x >= gridSize;
  const yOut = point.y < 0 || point.y >= gridSize;

  const x = point.x < 0 ? max : point.x >= gridSize ? 0 : point.x;
  const y = point.y < 0 ? max : point.y >= gridSize ? 0 : point.y;

  return {
    x: yOut ? max - x : x,
    y: xOut ? max - y : y,
  };
}

/**
 * 根據目前頭部位置與方向，計算下一格的座標
 */
export function getNextHeadPosition(
  head: Point,
  direction: Direction,
  gridSize: number,
  mapMode: MapMode,
  vectorMap: VectorMap,
): Point {
  const vector = vectorMap[direction];
  const nextRaw = {
    x: head.x + vector.x,
    y: head.y + vector.y,
  };

  if (mapMode === 'MIRROR_WRAP') {
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
 * 在地圖上隨機產生食物，且必須避開蛇身與現有食物
 * @returns 新食物的座標，若地圖已滿則回傳 null
 */
export function generateFood(snakeBody: Point[], gridSize: number, existingFoods: Point[] = []): Point | null {
  // 建立已占用格子的雜湊集，避免重複遍歷
  const occupied = new Set<string>([
    ...snakeBody.map(p => `${p.x},${p.y}`),
    ...existingFoods.map(p => `${p.x},${p.y}`),
  ]);

  // 收集所有可用格子
  const available: Point[] = [];
  for (let y = 0; y < gridSize; y++) {
    for (let x = 0; x < gridSize; x++) {
      if (!occupied.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) return null;

  return available[Math.floor(Math.random() * available.length)];
}
