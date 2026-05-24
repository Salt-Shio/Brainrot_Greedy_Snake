<script setup lang="ts">
import type { GameState } from '@/core/types';

interface Props {
  score: number;
  highScore: number;
  status: GameState;
}

defineProps<Props>();
</script>

<template>
  <div class="flex flex-col gap-4 w-full max-w-[500px] mb-6 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg">
    <!-- Current Score - Only show when NOT in IDLE state -->
    <div v-if="status !== 'IDLE'" class="flex items-center justify-between animate-in">
      <div class="flex flex-col">
        <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">Score</span>
        <span class="text-3xl font-black text-white font-mono leading-none">{{ score }}</span>
      </div>
    </div>

    <!-- High Score Display -->
    <div 
      class="flex justify-between items-center"
      :class="{ 'pt-2 border-t border-slate-700/50': status !== 'IDLE' }"
    >
      <span class="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Best</span>
      <span class="text-lg font-bold text-yellow-500 font-mono">{{ highScore }}</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes zoom-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-in {
  animation: zoom-in 0.2s ease-out;
}
</style>
