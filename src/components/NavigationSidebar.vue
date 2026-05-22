<script setup lang="ts">
import * as CONFIG from '@/core/config';
import type { InputMode, KeyHint } from '@/core/input/types';

defineProps<{
  controlMode: InputMode;
  uiDisplay: KeyHint[];
}>();
</script>

<template>
  <aside 
    class="hidden lg:flex flex-col gap-4 p-6 bg-slate-900/50 rounded-2xl border border-slate-800 animate-in fade-in slide-in-from-left-4 duration-500"
  >
    <p class="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">Navigation</p>
    
    <div class="space-y-4">
      <!-- Classic Mapping -->
      <template v-if="controlMode === 'CLASSIC'">
        <div v-for="key in ['W', 'S', 'A', 'D']" :key="key" class="flex flex-col">
          <span class="text-green-400 font-bold text-xl">{{ key }}</span>
          <span class="text-slate-400 text-lg font-bold">
            {{ key === 'W' ? '↑' : key === 'S' ? '↓' : key === 'A' ? '←' : '→' }}
          </span>
        </div>
      </template>
      <!-- Morse Mapping -->
      <template v-else>
        <div v-for="(dir, morse) in CONFIG.MORSE_CONFIG.MAP" :key="dir" class="flex flex-col">
          <span class="text-green-400 font-mono text-xl font-black">{{ morse }}</span>
          <span class="text-slate-400 text-lg font-bold">
            {{ dir === 'UP' ? '↑' : dir === 'DOWN' ? '↓' : dir === 'LEFT' ? '←' : '→' }}
          </span>
        </div>
      </template>
    </div>

    <!-- Secondary Keys (Submit, Clear, Pause) -->
    <div class="mt-6 pt-6 border-t border-slate-800 space-y-2">
      <div v-for="hint in uiDisplay.filter(h => !h.isMain)" :key="hint.key" class="flex justify-between text-[10px] text-slate-500">
        <span class="uppercase">{{ hint.label }}</span>
        <span class="text-slate-300 font-bold uppercase">[{{ hint.key }}]</span>
      </div>
    </div>
  </aside>
</template>
