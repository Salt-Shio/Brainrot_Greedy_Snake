import { ref, computed } from 'vue';
import type { Point, Direction, GameState, MemeFood, FoodInstance, BossBattleMode } from '@/core/types';
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
const highScore = ref(Number(localStorage.getItem('snake_high_score')) || 0);
const eatenCount = ref(0);
const controlMode = ref<InputMode>(CONFIG.DEFAULT_CONTROL_MODE);
const bossBattleMode = ref<BossBattleMode>('GESTURE');

// --- Getters ---
const isGameOver = computed(() => status.value === 'GAMEOVER');
const isPlaying = computed(() => status.value === 'PLAYING');

// --- Actions ---

/**
 * 初始化遊戲
 */
const initGame = () => {
  snake.value = [...CONFIG.INITIAL_STATE.SNAKE.map(p => ({ ...p }))];
  
  // 使用 core 邏輯初始化多個食物
  const newFoods: FoodInstance[] = [];
  for (let i = 0; i < CONFIG.FOOD_COUNT; i++) {
    const pos = LOGIC.generateFood(
      snake.value, 
      CONFIG.GRID_SIZE, 
      newFoods.map(f => f.position)
    );
    if (pos === null) break;
    newFoods.push({ 
      position: pos, 
      meme: LOGIC.getRandomMeme(CONFIG.MEME_POOL as MemeFood[]) 
    });
  }
  foods.value = newFoods;

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

  // 2. 呼叫核心純邏輯計算下一幀
  const result = LOGIC.computeNextMove({
    snake: snake.value,
    foods: foods.value,
    direction: direction.value,
    gridSize: CONFIG.GRID_SIZE,
    mapMode: CONFIG.MAP_MODE,
    vectorMap: CONFIG.VECTOR_MAP,
    memePool: CONFIG.MEME_POOL as MemeFood[],
  });

  // 3. 更新響應式狀態
  snake.value = result.snake;
  foods.value = result.foods;
  score.value += result.scoreDelta;
  status.value = result.status;

  if (result.eatenMeme) {
    eatenCount.value += 1;
  }

  // 檢查並更新最高分數
  if (status.value === 'GAMEOVER') {
    if (score.value > highScore.value) {
      highScore.value = score.value;
      localStorage.setItem('snake_high_score', highScore.value.toString());
    }
  }

  return result.eatenMeme;
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
 * 直接設定控制模式
 */
const setControlMode = (mode: InputMode) => {
  controlMode.value = mode;
};

/**
 * 循環切換控制模式 (保留供其他可能的快捷鍵使用)
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

/**
 * 直接設定 Boss 戰鬥模式
 */
const setBossBattleMode = (mode: BossBattleMode) => {
  bossBattleMode.value = mode;
};

export function useSnakeStore() {
  return {
    // State
    snake,
    foods,
    direction,
    status,
    score,
    highScore,
    eatenCount,
    controlMode,
    bossBattleMode,
    // Getters
    isGameOver,
    isPlaying,
    // Actions
    initGame,
    changeDirection,
    moveStep,
    startGame,
    pauseGame,
    setControlMode,
    setBossBattleMode,
    toggleControlMode,
    resetEatenCount,
    enterBossBattle,
    resumeFromBoss,
  };
}
