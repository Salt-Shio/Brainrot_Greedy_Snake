import { ref, computed } from 'vue';
import type { Point, Direction, GameState } from '@/core/types';
import type { InputMode } from '@/core/input/types';
import * as CONFIG from '@/core/config';
import * as LOGIC from '@/core/game-logic';

// --- Module Singleton State ---
// 所有 ref 宣告在函式外，確保全域唯一狀態。
// 無論哪個元件或 composable 呼叫 useSnakeStore()，拿到的都是同一份資料。
const snake = ref<Point[]>([...CONFIG.INITIAL_STATE.SNAKE]);
const food = ref<Point>(CONFIG.INITIAL_STATE.FOOD);
const direction = ref<Direction>('UP');
// 用於緩衝玩家輸入，防止在一個 Tick 內快速按下多個鍵導致邏輯錯誤
const nextDirection = ref<Direction>('UP');
const status = ref<GameState>('IDLE');
const score = ref(0);
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
  food.value = { ...CONFIG.INITIAL_STATE.FOOD };
  direction.value = 'UP';
  nextDirection.value = 'UP';
  status.value = 'IDLE';
  score.value = 0;
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
 */
const moveStep = () => {
  if (status.value !== 'PLAYING') return;

  // 1. 更新目前移動方向 (從緩衝取值)
  direction.value = nextDirection.value;

  // 2. 計算下一格位置
  const head = snake.value[0];
  const nextHead = LOGIC.getNextHeadPosition(head, direction.value, CONFIG.GRID_SIZE);

  // 3. 碰撞檢查
  const hitWall = CONFIG.MAP_MODE === 'BOUNDARY' && LOGIC.isWallCollision(nextHead, CONFIG.GRID_SIZE);
  if (hitWall || LOGIC.isSelfCollision(nextHead, snake.value)) {
    status.value = 'GAMEOVER';
    return;
  }

  // 4. 移動邏輯
  const newSnake = [nextHead, ...snake.value];

  if (LOGIC.isEating(nextHead, food.value)) {
    // 吃到食物：長度增加 (不 pop 尾巴)，分數增加，生成新食物
    score.value += 10;
    food.value = LOGIC.generateFood(newSnake, CONFIG.GRID_SIZE);
  } else {
    // 沒吃到食物：移動 (pop 尾巴)
    newSnake.pop();
  }

  snake.value = newSnake;
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

export function useSnakeStore() {
  return {
    // State
    snake,
    food,
    direction,
    status,
    score,
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
  };
}
