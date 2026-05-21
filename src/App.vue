<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useSnakeStore } from './composables/useSnakeStore';
import { useGameLoop } from './composables/useGameLoop';
import { Direction } from './core/types';
import GameGrid from './components/GameGrid.vue';
import ScoreBoard from './components/ScoreBoard.vue';

const store = useSnakeStore();
const loop = useGameLoop(() => {
  store.moveStep();
});

/**
 * 處理鍵盤輸入
 */
const handleKeyDown = (e: KeyboardEvent) => {
  const keyMap: Record<string, Direction> = {
    ArrowUp: 'UP',
    ArrowDown: 'DOWN',
    ArrowLeft: 'LEFT',
    ArrowRight: 'RIGHT',
    w: 'UP',
    s: 'DOWN',
    a: 'LEFT',
    d: 'RIGHT',
  };

  const newDir = keyMap[e.key];
  if (newDir) {
    // 如果遊戲還沒開始，按下方向鍵就直接開始
    if (store.status.value === 'IDLE') {
      store.startGame();
      loop.start();
    }
    store.changeDirection(newDir);
  }

  // 空白鍵暫停/繼續
  if (e.code === 'Space') {
    if (store.status.value === 'PLAYING') {
      store.pauseGame();
    } else if (store.status.value === 'PAUSED') {
      store.startGame();
    }
  }
};

// 監聽遊戲狀態來控制 Loop
watch(store.status, (newStatus) => {
  if (newStatus === 'PLAYING') {
    loop.start();
  } else {
    loop.stop();
  }
});

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const handleReset = () => {
  store.initGame();
  store.startGame();
};
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 select-none">
    <header class="mb-8 text-center">
      <h1 class="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-green-400 to-emerald-600 tracking-tighter italic">
        SNAKE.TS
      </h1>
      <p class="text-slate-500 font-bold text-xs tracking-[0.3em] uppercase mt-2">Precision Control MVP</p>
    </header>

    <ScoreBoard :score="store.score.value" :status="store.status.value" />

    <div class="relative group">
      <GameGrid :snake="store.snake.value" :food="store.food.value" />
      
      <!-- Overlay for Game Over / Idle -->
      <div 
        v-if="store.status.value !== 'PLAYING'"
        class="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg border border-slate-700/50 transition-all duration-500"
      >
        <div v-if="store.status.value === 'GAMEOVER'" class="text-center animate-in zoom-in duration-300">
          <h2 class="text-4xl font-black text-rose-500 mb-2 uppercase italic tracking-tighter">Game Over</h2>
          <p class="text-slate-400 mb-6 font-medium">Final Score: {{ store.score.value }}</p>
          <button 
            @click="handleReset"
            class="px-8 py-3 bg-green-500 hover:bg-green-400 text-slate-900 font-black rounded-xl transition-all active:scale-95 shadow-[0_5px_0_rgb(22,163,74)] hover:shadow-[0_2px_0_rgb(22,163,74)] hover:translate-y-[3px]"
          >
            PLAY AGAIN
          </button>
        </div>

        <div v-else-if="store.status.value === 'IDLE'" class="text-center">
          <div class="text-6xl mb-4 animate-bounce">🐍</div>
          <p class="text-slate-300 font-bold mb-6">Press Arrow Keys or WASD to Start</p>
          <div class="flex gap-4 text-slate-500 text-[10px] font-mono uppercase tracking-widest">
            <span>[Space] Pause</span>
            <span>[Arrows] Move</span>
          </div>
        </div>

        <div v-else-if="store.status.value === 'PAUSED'" class="text-center">
          <h2 class="text-4xl font-black text-yellow-500 mb-6 uppercase italic tracking-tighter">Paused</h2>
          <button 
            @click="store.startGame"
            class="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black rounded-xl transition-all"
          >
            RESUME
          </button>
        </div>
      </div>
    </div>

    <footer class="mt-12 text-slate-600 text-[10px] font-bold tracking-widest uppercase flex gap-8">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full"></div> Snake
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-rose-500 rounded-full"></div> Food
      </div>
    </footer>
  </div>
</template>

<style>
@keyframes zoom-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-in {
  animation: zoom-in 0.3s ease-out;
}
</style>
