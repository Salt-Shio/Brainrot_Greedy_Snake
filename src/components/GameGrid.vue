<script setup lang="ts">
import type { Point } from '@/core/types';
import { GRID_SIZE } from '@/core/config/game';

interface Props {
  snake: Point[];
  food: Point;
}

const props = defineProps<Props>();

/**
 * 檢查特定座標是否為蛇身的一部份
 */
const isSnake = (x: number, y: number) => {
  return props.snake.some(segment => segment.x === x && segment.y === y);
};

/**
 * 檢查是否為蛇頭
 */
const isSnakeHead = (x: number, y: number) => {
  return props.snake[0].x === x && props.snake[0].y === y;
};

/**
 * 檢查是否為食物
 */
const isFood = (x: number, y: number) => {
  return props.food.x === x && props.food.y === y;
};
</script>

<template>
  <div 
    class="grid bg-slate-900 border-4 border-slate-700 shadow-2xl rounded-lg overflow-hidden"
    :style="{
      gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
      gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
      width: 'min(90vw, 500px)',
      height: 'min(90vw, 500px)'
    }"
  >
    <!-- 遍歷每一格 -->
    <template v-for="y in GRID_SIZE" :key="y">
      <div 
        v-for="x in GRID_SIZE" 
        :key="`${x-1}-${y-1}`"
        class="border border-slate-800/30 flex items-center justify-center text-[10px]"
      >
        <!-- 蛇頭 -->
        <div 
          v-if="isSnakeHead(x-1, y-1)" 
          class="w-full h-full bg-green-400 rounded-sm shadow-[0_0_10px_rgba(74,222,128,0.5)] z-10 scale-110"
        ></div>
        <!-- 蛇身 -->
        <div 
          v-else-if="isSnake(x-1, y-1)" 
          class="w-[85%] h-[85%] bg-green-600 rounded-sm"
        ></div>
        <!-- 食物 -->
        <div 
          v-else-if="isFood(x-1, y-1)" 
          class="w-[70%] h-[70%] bg-rose-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]"
        ></div>
      </div>
    </template>
  </div>
</template>
