import { MASTER_VOLUME, BGM_VOLUME, BGM_URL } from '@/core/config/game';

// --- Singleton Audio Engine ---
let audioCtx: AudioContext | null = null;
let masterLimiter: DynamicsCompressorNode | null = null;

// --- Singleton BGM Instance ---
let bgmAudio: HTMLAudioElement | null = null;

/**
 * 初始化音訊引擎 (必須在使用者互動後調用)
 */
const ensureAudioContext = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // 建立 Master Limiter 避免爆音
    masterLimiter = audioCtx.createDynamicsCompressor();
    masterLimiter.threshold.setValueAtTime(-12, audioCtx.currentTime);
    masterLimiter.knee.setValueAtTime(30, audioCtx.currentTime);
    masterLimiter.ratio.setValueAtTime(12, audioCtx.currentTime);
    masterLimiter.attack.setValueAtTime(0, audioCtx.currentTime);
    masterLimiter.release.setValueAtTime(0.25, audioCtx.currentTime);
    
    masterLimiter.connect(audioCtx.destination);
  }
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  // 初始化 BGM
  if (!bgmAudio) {
    bgmAudio = new Audio(BGM_URL);
    bgmAudio.loop = true;
    bgmAudio.volume = BGM_VOLUME;
  }
};

// 用於快取解碼後的 AudioBuffer
const bufferCache = new Map<string, AudioBuffer>();

/**
 * 腦腐音效控制器
 */
export function useAudioController() {
  /**
   * 播放短促音效 (自動歸一化)
   */
  const playEffect = async (url: string) => {
    try {
      ensureAudioContext();
      if (!audioCtx || !masterLimiter) return;

      let buffer = bufferCache.get(url);

      if (!buffer) {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        buffer = await audioCtx.decodeAudioData(arrayBuffer);
        bufferCache.set(url, buffer);
      }

      const { peak, rms } = getBufferMetrics(buffer);
      const source = audioCtx.createBufferSource();
      source.buffer = buffer;

      const gainNode = audioCtx.createGain();
      
      // --- RMS 響度補正邏輯 ---
      // 目標 RMS 設為 0.15 (約 -16.5 dB)，這是一般遊戲音效較舒適的平均響度
      const targetRMS = 0.15;
      let normalizationGain = rms > 0 ? (targetRMS / rms) : 1;
      
      // 安全機制：補正後的峰值不能超過 1.0 (避免在進入 Limiter 前就嚴重失真)
      if (peak * normalizationGain > 1.0) {
        normalizationGain = 1.0 / peak;
      }
      
      gainNode.gain.value = normalizationGain * MASTER_VOLUME;

      source.connect(gainNode);
      gainNode.connect(masterLimiter);
      source.start(0);
    } catch (err) {
      console.warn('音效播放失敗:', err);
    }
  };

  /**
   * 開始播放背景音樂
   */
  const playBGM = () => {
    ensureAudioContext();
    if (bgmAudio) {
      bgmAudio.play().catch(() => {
        // 忽略自動播放限制錯誤
      });
    }
  };

  /**
   * 暫停背景音樂
   */
  const pauseBGM = () => {
    if (bgmAudio) {
      bgmAudio.pause();
    }
  };

  /**
   * 停止並重置背景音樂
   */
  const stopBGM = () => {
    if (bgmAudio) {
      bgmAudio.pause();
      bgmAudio.currentTime = 0;
    }
  };

  return {
    playEffect,
    playBGM,
    pauseBGM,
    stopBGM,
    init: ensureAudioContext
  };
}

/**
 * 計算 AudioBuffer 的音訊指標 (峰值與平均有效值)
 */
function getBufferMetrics(buffer: AudioBuffer): { peak: number, rms: number } {
  let totalSquareSum = 0;
  let maxPeak = 0;
  const channelCount = buffer.numberOfChannels;
  const sampleCount = buffer.length;

  for (let channel = 0; channel < channelCount; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < sampleCount; i++) {
      const val = data[i];
      const abs = Math.abs(val);
      if (abs > maxPeak) maxPeak = abs;
      totalSquareSum += val * val;
    }
  }

  const rms = Math.sqrt(totalSquareSum / (sampleCount * channelCount));
  return { peak: maxPeak, rms };
}
