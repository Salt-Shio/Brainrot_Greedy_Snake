import type { MemeFood } from '@/core/types';
import { TOTAL_MEME_TYPES } from './game';

/**
 * 迷因食物資源池
 * 根據 TOTAL_MEME_TYPES 自動生成所有的圖片與音效路徑
 */
export const MEME_POOL: MemeFood[] = Array.from({ length: TOTAL_MEME_TYPES }, (_, i) => {
  const index = i + 1;
  return {
    id: `meme-${index}`,
    imageUrl: `/assets/memes/meme_${index}.svg`,
    soundUrl: `/assets/sounds/meme_${index}.m4a`,
  };
});
