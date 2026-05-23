import type { Point, Direction, MapMode, VectorMap, MemeFood, GameState, FoodInstance } from './types';

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

/**
 * 遊戲下一幀狀態的計算結果
 */
export interface GameMoveResult {
  snake: Point[];
  foods: FoodInstance[];
  scoreDelta: number;
  eatenMeme: MemeFood | null;
  status: GameState;
}

/**
 * 計算遊戲下一步的核心純函式 (不依賴任何外部狀態或 Vue)
 */
export function computeNextMove(params: {
  snake: Point[];
  foods: FoodInstance[];
  direction: Direction;
  gridSize: number;
  mapMode: MapMode;
  vectorMap: VectorMap;
  memePool: MemeFood[];
}): GameMoveResult {
  const { snake, foods, direction, gridSize, mapMode, vectorMap, memePool } = params;
  
  // 1. 計算下一格位置
  const head = snake[0];
  const nextHead = getNextHeadPosition(head, direction, gridSize, mapMode, vectorMap);

  // 2. 碰撞檢查
  const hitWall = mapMode === 'BOUNDARY' && isWallCollision(nextHead, gridSize);
  if (hitWall || isSelfCollision(nextHead, snake)) {
    return {
      snake,
      foods,
      scoreDelta: 0,
      eatenMeme: null,
      status: 'GAMEOVER',
    };
  }

  // 3. 移動邏輯
  const newSnake = [nextHead, ...snake];
  const newFoods = [...foods];
  let scoreDelta = 0;
  let eatenMeme: MemeFood | null = null;

  // 檢查是否吃到任何一個食物
  const foodIndex = newFoods.findIndex(f => isEating(nextHead, f.position));

  if (foodIndex !== -1) {
    // 吃到食物：分數增加，長度增加 (不 pop 尾巴)
    scoreDelta = 10;
    eatenMeme = { ...newFoods[foodIndex].meme };
    
    // 生成新的食物替換掉被吃掉的
    const otherFoodPositions = newFoods.filter((_, i) => i !== foodIndex).map(f => f.position);
    const newPos = generateFood(newSnake, gridSize, otherFoodPositions);
    
    if (newPos !== null) {
      newFoods[foodIndex] = { 
        position: newPos, 
        meme: getRandomMeme(memePool) 
      };
    } else {
      newFoods.splice(foodIndex, 1);
    }
  } else {
    // 沒吃到食物：移動 (pop 尾巴)
    newSnake.pop();
  }

  return {
    snake: newSnake,
    foods: newFoods,
    scoreDelta,
    eatenMeme,
    status: 'PLAYING',
  };
}
