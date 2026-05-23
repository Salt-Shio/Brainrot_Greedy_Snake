<script setup lang="ts">
import type { Point, FoodInstance } from '@/core/types';
import { GRID_SIZE } from '@/core/config/game';

interface Props {
  snake: Point[];
  foods: FoodInstance[];
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
 * 獲取該座標的食物 (如果有)
 */
const getFoodAt = (x: number, y: number): FoodInstance | undefined => {
  return props.foods.find(f => f.position.x === x && f.position.y === y);
};
</script>

<template>
  <div 
    class="grid bg-slate-900 border-4 border-slate-700 shadow-2xl rounded-lg overflow-hidden"
    :style="{
      gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
      gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
      width: 'min(90vw, 850px)',
      height: 'min(90vw, 850px)'
    }"
  >
    <!-- 遍歷每一格 -->
    <template v-for="y in GRID_SIZE" :key="y">
      <div 
        v-for="x in GRID_SIZE" 
        :key="`${x-1}-${y-1}`"
        class="border border-slate-800/30 flex items-center justify-center text-[10px] relative"
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
        <!-- 食物 (迷因圖片) - 使用絕對定位防止撐開網格 -->
        <div 
          v-else-if="getFoodAt(x-1, y-1)" 
          class="absolute inset-0 flex items-center justify-center z-20 pointer-events-none"
        >
          <div class="w-[95%] h-[95%] bg-slate-800 rounded-sm border border-green-500/30 shadow-2xl flex items-center justify-center overflow-hidden">
            <img 
              :src="getFoodAt(x-1, y-1)?.meme.imageUrl" 
              class="w-full h-full object-contain"
              alt="Meme Food"
            />
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
