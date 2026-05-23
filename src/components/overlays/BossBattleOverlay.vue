<script setup lang="ts">
import { ref, onMounted } from 'vue';

const props = defineProps<{
  count: number;
  targetCount: number;
  score: number;
  isCameraReady: boolean;
}>();

const emit = defineEmits<{
  (e: 'videoReady', video: HTMLVideoElement): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  if (videoRef.value) {
    emit('videoReady', videoRef.value);
  }
});
</script>

<template>
  <div class="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
    
    <!-- 視覺中心：Boss 背景影片 (需要您放置檔案) -->
    <!-- 影片來源：/public/assets/memes/boss_bg.mp4 -->
    <video 
      :src="'/assets/memes/boss_bg.mp4'" 
      class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen scale-110"
      autoplay 
      loop 
      muted 
      playsinline
    ></video>

    <!-- 頂部：狀態提示與分數 -->
    <div class="absolute top-8 left-8 z-10 text-left">
      <div class="flex flex-col">
        <span class="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Current Score</span>
        <span class="text-2xl font-black text-white font-mono leading-none">{{ score }}</span>
      </div>
    </div>

    <div class="absolute top-8 text-center z-10 w-full pointer-events-none">
      <h2 class="text-4xl font-black text-rose-500 uppercase tracking-widest animate-bounce">
        BOSS ENCOUNTER
      </h2>
      <p v-if="!isCameraReady" class="text-yellow-400 font-mono mt-2 animate-pulse text-xs">
        Initializing Vision System...
      </p>
      <p v-else class="text-green-400 font-mono mt-2 font-bold tracking-widest text-xs">
        WAVE YOUR HANDS ALTERNATELY!
      </p>
    </div>

    <!-- 中間：巨大的計數器 -->
    <div class="relative z-10 flex flex-col items-center justify-center">
      <div 
        class="text-9xl font-black font-mono tracking-tighter transition-all duration-100"
        :class="[
          count > 0 ? 'text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.8)] scale-110' : 'text-slate-700',
          count >= targetCount ? 'text-green-400 drop-shadow-[0_0_50px_rgba(74,222,128,1)]' : ''
        ]"
      >
        {{ count }}
      </div>
      <div class="text-3xl text-rose-500 font-black mt-2 tracking-[0.5em] opacity-80">
        / {{ targetCount }}
      </div>
    </div>

    <!-- 底部：攝影機預覽框 -->
    <div class="absolute bottom-8 right-8 w-48 h-36 bg-slate-900 border-4 border-slate-700 rounded-xl overflow-hidden shadow-2xl">
      <!-- 鏡像翻轉攝影機畫面 -->
      <video 
        ref="videoRef" 
        class="w-full h-full object-cover -scale-x-100" 
        autoplay 
        playsinline
      ></video>
    </div>

    <!-- 滿分時的全螢幕白閃特效 -->
    <div 
      v-if="count >= targetCount" 
      class="absolute inset-0 bg-white z-50 animate-[fadeOut_1s_ease-out_forwards]"
    ></div>

  </div>
</template>

<style scoped>
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; visibility: hidden; }
}
</style>
