<script setup lang="ts">
import { GameState } from '../core/types';

interface Props {
  score: number;
  status: GameState;
}

defineProps<Props>();
</script>

<template>
  <div class="flex items-center justify-between w-full max-w-[500px] mb-6 bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-lg">
    <div class="flex flex-col">
      <span class="text-slate-400 text-xs font-bold uppercase tracking-widest">Score</span>
      <span class="text-3xl font-black text-white font-mono leading-none">{{ score }}</span>
    </div>

    <div class="flex items-center gap-3">
      <div 
        class="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter"
        :class="{
          'bg-blue-500/20 text-blue-400 border border-blue-500/30': status === 'IDLE',
          'bg-green-500/20 text-green-400 border border-green-500/30 animate-pulse': status === 'PLAYING',
          'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30': status === 'PAUSED',
          'bg-rose-500/20 text-rose-400 border border-rose-500/30': status === 'GAMEOVER',
        }"
      >
        {{ status }}
      </div>
    </div>
  </div>
</template>
