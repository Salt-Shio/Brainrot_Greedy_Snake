import { ref } from 'vue';
import { useAudioController } from '@/composables/useAudioController';
import type { MemeFood } from '@/core/types';

/**
 * 迷迷特效邏輯 (音效與視覺閃爍)
 * 職責：
 * - 播放吃到食物時的音效
 * - 管理最後吃到食物的迷迷資訊供 UI 閃爍使用
 */
export function useMemeEffects() {
  const { playEffect } = useAudioController();
  
  // 用於觸發 UI 閃爍特效的響應式狀態
  const lastEatenMeme = ref<MemeFood | null>(null);

  /**
   * 觸發吃到食物的效果
   */
  const triggerEatenEffect = (meme: MemeFood) => {
    playEffect(meme.soundUrl);
    lastEatenMeme.value = { ...meme };
  };

  /**
   * 清除特效狀態
   */
  const clearEatenEffect = () => {
    lastEatenMeme.value = null;
  };

  return {
    lastEatenMeme,
    triggerEatenEffect,
    clearEatenEffect
  };
}
