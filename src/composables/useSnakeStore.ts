import { ref, computed } from 'vue';
import type { Point, Direction, GameState } from '../core/types';
import { 
  GRID_SIZE, 
  INITIAL_SNAKE, 
  INITIAL_FOOD, 
  OPPOSITE_DIRECTION 
} from '../core/constants';
import { 
  getNextHeadPosition, 
  isWallCollision, 
  isSelfCollision, 
  isEating, 
  generateFood 
} from '../core/game-logic';

export function useSnakeStore() {
  // --- State ---
  const snake = ref<Point[]>([...INITIAL_SNAKE]);
  const food = ref<Point>(INITIAL_FOOD);
  const direction = ref<Direction>('UP');
  // 用於緩衝玩家輸入，防止在一個 Tick 內快速按下多個鍵導致逻辑錯誤
  const nextDirection = ref<Direction>('UP');
  const status = ref<GameState>('IDLE');
  const score = ref(0);

  // --- Getters ---
  const isGameOver = computed(() => status.value === 'GAMEOVER');
  const isPlaying = computed(() => status.value === 'PLAYING');

  // --- Actions ---

  /**
   * 初始化遊戲
   */
  const initGame = () => {
    snake.value = [...INITIAL_SNAKE.map(p => ({ ...p }))];
    food.value = { ...INITIAL_FOOD };
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
    if (newDir !== OPPOSITE_DIRECTION[direction.value]) {
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
    const nextHead = getNextHeadPosition(head, direction.value);

    // 3. 碰撞檢查
    if (isWallCollision(nextHead, GRID_SIZE) || isSelfCollision(nextHead, snake.value)) {
      status.value = 'GAMEOVER';
      return;
    }

    // 4. 移動邏輯
    const newSnake = [nextHead, ...snake.value];

    if (isEating(nextHead, food.value)) {
      // 吃到食物：長度增加 (不 pop 尾巴)，分數增加，生成新食物
      score.value += 10;
      food.value = generateFood(newSnake, GRID_SIZE);
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

  return {
    // State
    snake,
    food,
    direction,
    status,
    score,
    // Getters
    isGameOver,
    isPlaying,
    // Actions
    initGame,
    changeDirection,
    moveStep,
    startGame,
    pauseGame
  };
}
