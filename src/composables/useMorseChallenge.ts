import { ref } from 'vue';
import * as CONFIG from '@/core/config';

/**
 * 摩斯密碼挑戰邏輯
 * 職責：
 * - 生成隨機摩斯密碼挑戰
 * - 驗證玩家輸入是否符合挑戰
 */
export function useMorseChallenge() {
  const challengeMorse = ref('');

  /**
   * 重新生成挑戰密碼
   */
  const generateChallenge = () => {
    const symbols = ['.', '-'];
    challengeMorse.value = Array.from(
      { length: CONFIG.MORSE_CONFIG.CHALLENGE.LENGTH },
      () => symbols[Math.floor(Math.random() * 2)]
    ).join('');
  };

  /**
   * 驗證輸入
   */
  const verifyChallenge = (input: string) => {
    return input === challengeMorse.value;
  };

  // 初始生成
  generateChallenge();

  return {
    challengeMorse,
    generateChallenge,
    verifyChallenge
  };
}
