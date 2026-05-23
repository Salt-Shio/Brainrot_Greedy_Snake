<script setup lang="ts">
import type { Direction } from '@/core/types';
import type { InputMode, KeyHint } from '@/core/input/types';

defineProps<{
  controlMode: InputMode;
  challengeMorse: string;
  buffer: string;
  uiDisplay: KeyHint[];
  morseMap: Record<string, Direction>;
}>();

defineEmits<{
  (e: 'setMode', mode: InputMode): void;
}>();
</script>

<template>
  <div class="w-full px-8 flex flex-col items-center justify-center h-full bg-slate-900 border-4 border-slate-700 rounded-3xl">
    <!-- Mode Selection -->
    <div class="flex justify-center mb-6">
      <div 
        class="flex items-center gap-2 px-2 py-1.5 bg-slate-800 rounded-full border border-slate-700 relative"
      >
        <button 
          @click="$emit('setMode', 'SINGLE_KEY')"
          class="px-3 py-1 text-[9px] font-black tracking-widest uppercase transition-colors z-10"
          :class="controlMode === 'SINGLE_KEY' ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'"
        >
          Single
        </button>
        <button 
          @click="$emit('setMode', 'TWIN_KEY')"
          class="px-3 py-1 text-[9px] font-black tracking-widest uppercase transition-colors z-10"
          :class="controlMode === 'TWIN_KEY' ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'"
        >
          Twin
        </button>
        <button 
          @click="$emit('setMode', 'CLASSIC')"
          class="px-3 py-1 text-[9px] font-black tracking-widest uppercase transition-colors z-10"
          :class="controlMode === 'CLASSIC' ? 'text-green-400' : 'text-slate-500 hover:text-slate-300'"
        >
          Classic
        </button>
        <div 
          class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.8)] transition-all duration-300"
          :class="{
            '-translate-x-[45px]': controlMode === 'SINGLE_KEY',
            '-translate-x-0': controlMode === 'TWIN_KEY',
            'translate-x-[45px]': controlMode === 'CLASSIC'
          }"
        ></div>
      </div>
    </div>

    <!-- Morse Section -->
    <div v-if="controlMode !== 'CLASSIC'" class="w-full">
      <p class="text-slate-500 text-[10px] uppercase tracking-[0.4em] mb-4 font-black text-center">Identity Verification</p>
      <div class="text-4xl font-mono text-green-400 font-black tracking-[0.6em] mb-8 text-center drop-shadow-[0_0_15px_rgba(74,222,128,0.4)]">
        {{ challengeMorse }}
      </div>
      
      <div class="space-y-3 mb-10 text-center">
        <p class="text-slate-500 text-[9px] uppercase tracking-widest font-bold">System Buffer</p>
        <div class="text-3xl font-mono text-white font-black h-10 tracking-[0.4em] flex items-center justify-center bg-slate-950/50 rounded-xl border border-slate-800">
          <span v-for="(char, i) in buffer" :key="i" class="animate-in fade-in zoom-in duration-200">{{ char }}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 mb-4 w-full">
        <div v-for="(dir, morse) in morseMap" :key="dir" class="flex items-center justify-between px-4 py-2 bg-slate-950/30 rounded-xl border border-slate-800/50">
          <span class="text-green-500/70 font-mono text-xs font-bold">{{ morse }}</span>
          <span class="text-slate-400 text-base">{{ dir === 'UP' ? '↑' : dir === 'DOWN' ? '↓' : dir === 'LEFT' ? '←' : '→' }}</span>
        </div>
      </div>
    </div>

    <!-- Classic Section -->
    <div v-else class="py-12 flex flex-col items-center">
      <div class="text-6xl mb-6">⌨️</div>
      <h3 class="text-white font-black text-xl tracking-tighter italic mb-2">CLASSIC OVERRIDE</h3>
      <p class="text-slate-500 text-xs font-bold uppercase tracking-widest text-center leading-relaxed">
        Use <span class="text-green-400">WASD</span> or <span class="text-green-400">Arrows</span><br/>to control the snake.
      </p>
    </div>

    <!-- Global Key Hints -->
    <div class="mt-6 flex justify-center gap-6 border-t border-slate-800/50 pt-8 w-full">
      <div v-for="hint in uiDisplay" :key="hint.key" class="flex flex-col items-center gap-2">
        <kbd class="bg-slate-800 px-3 py-1.5 rounded-lg text-white text-[10px] border-b-[3px] border-slate-950 font-black shadow-lg uppercase" :class="{ 'text-green-400': hint.isMain }">{{ hint.key }}</kbd>
        <span class="text-[9px] text-slate-300 uppercase font-bold tracking-[0.1em]">{{ hint.label }}</span>
      </div>
    </div>
  </div>
</template>
