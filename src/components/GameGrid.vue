<script setup lang="ts">
import type { Point, FoodInstance, Direction } from '@/core/types';
import { GRID_SIZE, SNAKE_HEAD_URL, SNAKE_BODY_URL } from '@/core/config/game';

interface Props {
  snake: Point[];
  foods: FoodInstance[];
  direction: Direction;
}

const props = defineProps<Props>();

/**
 * 根據目前方向計算蛇頭旋轉角度
 */
const headRotation = (dir: Direction) => {
  switch (dir) {
    case 'UP': return 'rotate-0';
    case 'DOWN': return 'rotate-180';
    case 'LEFT': return '-rotate-90';
    case 'RIGHT': return 'rotate-90';
    default: return 'rotate-0';
  }
};

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
          class="w-full h-full z-10 scale-125 flex items-center justify-center transition-transform duration-150"
          :class="headRotation(props.direction)"
        >
          <img :src="SNAKE_HEAD_URL" class="w-full h-full object-contain" alt="Snake Head" />
        </div>
        <!-- 蛇身 -->
        <div 
          v-else-if="isSnake(x-1, y-1)" 
          class="w-[85%] h-[85%] flex items-center justify-center"
        >
          <img :src="SNAKE_BODY_URL" class="w-full h-full object-contain" alt="Snake Body" />
        </div>
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
