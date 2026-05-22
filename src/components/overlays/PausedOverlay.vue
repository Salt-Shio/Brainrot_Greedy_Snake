<script setup lang="ts">
defineEmits<{
  (e: 'resume'): void;
}>();
</script>

<template>
  <div class="absolute inset-0 bg-slate-900/90 backdrop-blur-md flex flex-col items-center justify-center rounded-lg border-4 border-yellow-500/30 transition-all duration-300">
    <h2 class="text-4xl font-black text-yellow-500 mb-6 uppercase italic tracking-tighter">System Paused</h2>
    <button 
      @click="$emit('resume')"
      class="px-8 py-3 bg-yellow-500 hover:bg-yellow-400 text-slate-900 font-black rounded-xl transition-all shadow-[0_5px_0_rgb(202,138,4)] active:translate-y-[2px] active:shadow-none"
    >
      RESUME
    </button>
  </div>
</template>
