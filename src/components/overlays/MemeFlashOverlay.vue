<script setup lang="ts">
import { ref, watch } from 'vue';
import type { MemeFood } from '@/core/types';

const props = defineProps<{
  meme: MemeFood | null;
}>();

const visibleMeme = ref<MemeFood | null>(null);
const isAnimating = ref(false);
const animationKey = ref(0);

// 當有新的迷因被吃掉時觸發動畫
watch(() => props.meme, (newMeme) => {
  if (newMeme) {
    visibleMeme.value = newMeme;
    isAnimating.value = true;
    animationKey.value += 1; // 重置動畫狀態
    
    // 動態結束後清除 (與 CSS 動畫時間同步)
    setTimeout(() => {
      isAnimating.value = false;
    }, 800);
  }
}, { deep: true });
</script>

<template>
  <div 
    v-if="visibleMeme && isAnimating"
    :key="animationKey"
    class="meme-flash-container pointer-events-none absolute inset-0 flex items-center justify-center z-30 overflow-hidden"
  >
    <img 
      :src="visibleMeme.imageUrl" 
      class="meme-flash-image w-[120%] h-[120%] object-contain opacity-20"
      alt="Flash Meme"
    />
  </div>
</template>

<style scoped>
.meme-flash-container {
  /* 混合模式讓它更像幻影，不遮擋細節 */
  mix-blend-mode: screen; 
}

.meme-flash-image {
  animation: flash-zoom 0.8s ease-out forwards;
}

@keyframes flash-zoom {
  0% {
    transform: scale(0.5);
    opacity: 0;
    filter: blur(10px) brightness(2);
  }
  20% {
    opacity: 0.3;
    filter: blur(0px) brightness(1.5);
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
    filter: blur(20px) brightness(1);
  }
}
</style>
