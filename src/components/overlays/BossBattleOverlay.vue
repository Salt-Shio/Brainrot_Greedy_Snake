<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { BossBattleMode } from '@/core/types';

const props = defineProps<{
  count: number;
  targetCount: number;
  isCameraReady: boolean;
  latestResults: any;
  mode: BossBattleMode; // 接收模式
}>();

const emit = defineEmits<{
  (e: 'videoReady', video: HTMLVideoElement): void;
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const canvasRef = ref<HTMLCanvasElement | null>(null);
const bossVideoRef = ref<HTMLVideoElement | null>(null);

onMounted(() => {
  if (videoRef.value) {
    emit('videoReady', videoRef.value);
  }
  if (bossVideoRef.value) {
    bossVideoRef.value.volume = 0.8; // 設定 Boss 影片音量為 80%
  }
});

// 當有新的辨識結果時，在畫布上繪製骨架
watch(() => props.latestResults, (results) => {
  if (!canvasRef.value || !results || !props.isCameraReady) return;

  const canvasCtx = canvasRef.value.getContext('2d');
  if (!canvasCtx) return;

  const drawingUtils = (window as any);
  if (!drawingUtils.drawConnectors || !drawingUtils.drawLandmarks) return;

  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasRef.value.width, canvasRef.value.height);
  
  // 由於影片是 scale-x-100，我們也要鏡像繪製
  canvasCtx.translate(canvasRef.value.width, 0);
  canvasCtx.scale(-1, 1);

  if (results.multiHandLandmarks) {
    for (const landmarks of results.multiHandLandmarks) {
      // 繪製關節連接線
      drawingUtils.drawConnectors(canvasCtx, landmarks, (window as any).HAND_CONNECTIONS, {
        color: '#00FF00',
        lineWidth: 5
      });
      // 繪製關節點
      drawingUtils.drawLandmarks(canvasCtx, landmarks, {
        color: '#FF0000',
        lineWidth: 2
      });
    }
  }
  canvasCtx.restore();
}, { deep: true });
</script>

<template>
  <div class="absolute inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center overflow-hidden">
    
    <!-- 視覺中心：Boss 背景影片 (需要您放置檔案) -->
    <!-- 影片來源：/public/assets/memes/boss_bg.mp4 -->
    <video 
      ref="bossVideoRef"
      :src="'/assets/memes/boss_bg.mp4'" 
      class="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-screen scale-110"
      autoplay 
      loop 
      playsinline
    ></video>

    <div class="absolute top-8 text-center z-10 w-full pointer-events-none">
      <h2 class="text-4xl font-black text-rose-500 uppercase tracking-widest animate-bounce">
        BOSS ENCOUNTER
      </h2>
      <template v-if="mode === 'GESTURE'">
        <p v-if="!isCameraReady" class="text-yellow-400 font-mono mt-2 animate-pulse text-xs">
          Initializing Vision System...
        </p>
        <p v-else class="text-green-400 font-mono mt-2 font-bold tracking-widest text-xs">
          WAVE YOUR HANDS ALTERNATELY!
        </p>
      </template>
      <template v-else>
        <p class="text-green-400 font-mono mt-2 font-bold tracking-widest text-xs">
          PRESS <span class="text-white bg-rose-600 px-2 rounded">6</span> AND <span class="text-white bg-rose-600 px-2 rounded">7</span> ALTERNATELY!
        </p>
      </template>
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
    </div>

    <!-- 底部：攝影機預覽與骨架繪製 (子母畫面 PiP) -->
    <div 
      v-show="mode === 'GESTURE'"
      class="absolute bottom-6 right-6 w-40 h-30 bg-slate-900 border-2 border-slate-700 rounded-lg overflow-hidden shadow-2xl z-20 group hover:scale-110 transition-transform duration-300"
    >
      <video 
        ref="videoRef" 
        class="w-full h-full object-cover -scale-x-100 opacity-60" 
        autoplay 
        playsinline
      ></video>
      <!-- 用於繪製骨架的畫布 -->
      <canvas 
        ref="canvasRef" 
        class="absolute inset-0 w-full h-full"
        width="640"
        height="480"
      ></canvas>
      <!-- 狀態標籤 -->
      <div class="absolute bottom-1 right-1 px-1.5 py-0.5 bg-rose-600 text-[8px] font-black text-white rounded-sm uppercase tracking-tighter">
        Live Feed
      </div>
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
