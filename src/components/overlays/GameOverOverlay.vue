<script setup lang="ts">
defineProps<{
  score: number;
}>();

defineEmits<{
  (e: 'reset'): void;
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center animate-in zoom-in duration-300 w-full h-full bg-slate-900 border-4 border-slate-700 rounded-3xl">
    <h2 class="text-4xl font-black text-rose-500 mb-2 uppercase italic tracking-tighter text-center">Game Over</h2>
    <p class="text-slate-400 mb-6 font-medium text-center">Final Score: {{ score }}</p>
    <button 
      @click="$emit('reset')"
      class="px-8 py-3 bg-green-500 hover:bg-green-400 text-slate-900 font-black rounded-xl transition-all active:scale-95 shadow-[0_5px_0_rgb(22,163,74)] hover:shadow-[0_2px_0_rgb(22,163,74)] hover:translate-y-[3px]"
    >
      PLAY AGAIN
    </button>
  </div>
</template>
