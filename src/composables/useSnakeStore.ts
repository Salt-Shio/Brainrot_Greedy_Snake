import { ref, computed } from 'vue';
import type { Point, Direction, GameState, MemeFood, FoodInstance } from '@/core/types';
import type { InputMode } from '@/core/input/types';
import * as CONFIG from '@/core/config';
import * as LOGIC from '@/core/game-logic';

// --- Module Singleton State ---
const snake = ref<Point[]>([...CONFIG.INITIAL_STATE.SNAKE]);
const foods = ref<FoodInstance[]>([]);
const direction = ref<Direction>('UP');
const nextDirection = ref<Direction>('UP');
const status = ref<GameState>('IDLE');
const score = ref(0);
const eatenCount = ref(0);
const controlMode = ref<InputMode>(CONFIG.DEFAULT_CONTROL_MODE);

// --- Getters ---
const isGameOver = computed(() => status.value === 'GAMEOVER');
const isPlaying = computed(() => status.value === 'PLAYING');

// --- Actions ---

/**
 * 初始化遊戲
 */
const initGame = () => {
  snake.value = [...CONFIG.INITIAL_STATE.SNAKE.map(p => ({ ...p }))];
  
  // 初始化多個食物
  foods.value = [];
  for (let i = 0; i < CONFIG.FOOD_COUNT; i++) {
    const pos = LOGIC.generateFood(
      snake.value, 
      CONFIG.GRID_SIZE, 
      foods.value.map(f => f.position)
    );
    if (pos === null) break; // 地圖已滿，停止生成（理論上不應發生）
    const meme = LOGIC.getRandomMeme(CONFIG.MEME_POOL as MemeFood[]);
    foods.value.push({ position: pos, meme });
  }

  direction.value = 'UP';
  nextDirection.value = 'UP';
  status.value = 'IDLE';
  score.value = 0;
  eatenCount.value = 0;
};

/**
 * 變更方向 (含反向判定)
 */
const changeDirection = (newDir: Direction) => {
  // 禁止 180 度直接回頭
  if (newDir !== CONFIG.OPPOSITE_DIRECTION[direction.value]) {
    nextDirection.value = newDir;
  }
};

/**
 * 遊戲核心單步移動邏輯
 * @returns 如果吃到食物，回傳該食物的迷因資訊，否則回傳 null
 */
const moveStep = (): MemeFood | null => {
  if (status.value !== 'PLAYING') return null;

  // 1. 更新目前移動方向 (從緩衝取值)
  direction.value = nextDirection.value;

  // 2. 計算下一格位置
  const head = snake.value[0];
  const nextHead = LOGIC.getNextHeadPosition(
    head,
    direction.value,
    CONFIG.GRID_SIZE,
    CONFIG.MAP_MODE,
    CONFIG.VECTOR_MAP,
  );

  // 3. 碰撞檢查
  const hitWall = CONFIG.MAP_MODE === 'BOUNDARY' && LOGIC.isWallCollision(nextHead, CONFIG.GRID_SIZE);
  if (hitWall || LOGIC.isSelfCollision(nextHead, snake.value)) {
    status.value = 'GAMEOVER';
    return null;
  }

  // 4. 移動邏輯
  const newSnake = [nextHead, ...snake.value];
  let eatenMeme: MemeFood | null = null;

  // 檢查是否吃到任何一個食物
  const foodIndex = foods.value.findIndex(f => LOGIC.isEating(nextHead, f.position));

  if (foodIndex !== -1) {
    // 吃到食物：長度增加 (不 pop 尾巴)，分數增加，更換該食物位置
    score.value += 10;
    eatenCount.value += 1;
    eatenMeme = { ...foods.value[foodIndex].meme };
    
    // 生成新的食物座標與迷因替換掉被吃掉的
    const newPos = LOGIC.generateFood(
      newSnake, 
      CONFIG.GRID_SIZE, 
      foods.value.filter((_, i) => i !== foodIndex).map(f => f.position)
    );
    const newMeme = LOGIC.getRandomMeme(CONFIG.MEME_POOL as MemeFood[]);
    
    if (newPos !== null) {
      foods.value[foodIndex] = { position: newPos, meme: newMeme };
    } else {
      // 地圖已滿，移除食物但不補充（極端情況）
      foods.value.splice(foodIndex, 1);
    }
  } else {
    // 沒吃到食物：移動 (pop 尾巴)
    newSnake.pop();
  }

  snake.value = newSnake;
  return eatenMeme;
};

const startGame = () => {
  if (status.value === 'IDLE' || status.value === 'GAMEOVER') {
    initGame();
    status.value = 'PLAYING';
  } else if (status.value === 'PAUSED') {
    status.value = 'PLAYING';
  }
};

const pauseGame = () => {
  if (status.value === 'PLAYING') {
    status.value = 'PAUSED';
  }
};

/**
 * 循環切換控制模式 (SINGLE_KEY → TWIN_KEY → CLASSIC → ...)
 */
const toggleControlMode = () => {
  const modes: InputMode[] = ['SINGLE_KEY', 'TWIN_KEY', 'CLASSIC'];
  const currentIndex = modes.indexOf(controlMode.value);
  controlMode.value = modes[(currentIndex + 1) % modes.length];
};

const resetEatenCount = () => {
  eatenCount.value = 0;
};

/**
 * 進入 Boss 戰鬥狀態（只能從 PLAYING 進入）
 */
const enterBossBattle = () => {
  if (status.value === 'PLAYING') {
    status.value = 'BOSS_BATTLE';
  }
};

/**
 * 從 Boss 戰鬥回到正常遊戲（只能從 BOSS_BATTLE 回來）
 */
const resumeFromBoss = () => {
  if (status.value === 'BOSS_BATTLE') {
    status.value = 'PLAYING';
  }
};

export function useSnakeStore() {
  return {
    // State
    snake,
    foods,
    direction,
    status,
    score,
    eatenCount,
    controlMode,
    // Getters
    isGameOver,
    isPlaying,
    // Actions
    initGame,
    changeDirection,
    moveStep,
    startGame,
    pauseGame,
    toggleControlMode,
    resetEatenCount,
    enterBossBattle,
    resumeFromBoss,
  };
}
