<script setup lang="ts">
import { useSnakeStore } from '@/composables/useSnakeStore';
import { useGameSession } from '@/composables/useGameSession';
import { MORSE_CONFIG } from '@/core/config/controls/morse';
import { GLOBAL_BG_VIDEO_URL } from '@/core/config/game';

// Components
import GameGrid from '@/components/GameGrid.vue';
import ScoreBoard from '@/components/ScoreBoard.vue';
import NavigationSidebar from '@/components/NavigationSidebar.vue';
import IdleOverlay from '@/components/overlays/IdleOverlay.vue';
import GameOverOverlay from '@/components/overlays/GameOverOverlay.vue';
import PausedOverlay from '@/components/overlays/PausedOverlay.vue';
import MemeFlashOverlay from '@/components/overlays/MemeFlashOverlay.vue';
import BossBattleOverlay from '@/components/overlays/BossBattleOverlay.vue';

const store = useSnakeStore();
const { 
  challengeMorse, 
  lastEatenMeme, 
  buffer, 
  uiDisplay, 
  handlePauseToggle, 
  handleReset,
  bossHitCount,
  bossTargetCount,
  isBossCameraReady,
  latestResults,
  startBossBattle
} = useGameSession();
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 select-none bg-slate-950 text-slate-200 font-sans overflow-hidden">
    <!-- 全域背景影片 (除了 Boss 戰以外都顯示) -->
    <video
      v-if="store.status.value !== 'BOSS_BATTLE'"
      :src="GLOBAL_BG_VIDEO_URL"
      autoplay
      loop
      muted
      playsinline
      class="fixed inset-0 w-full h-full object-cover opacity-30 pointer-events-none z-0"
    ></video>

    <!-- 主遊戲區域 (z-10 確保在影片之上) -->
    <div class="flex items-start gap-12 relative z-10">
      <div class="flex flex-col gap-8 w-48">
        <!-- 分數顯示 -->
        <ScoreBoard :score="store.score.value" :status="store.status.value" />

        <NavigationSidebar 
          v-if="store.status.value === 'PLAYING'"
          :control-mode="store.controlMode.value"
          :ui-display="uiDisplay"
          :morse-map="MORSE_CONFIG.MAP"
        />
      </div>

      <div class="relative group">
        <!-- 遊戲網格 -->
        <GameGrid 
          v-show="store.status.value === 'PLAYING' || store.status.value === 'PAUSED'"
          :snake="store.snake.value" 
          :foods="store.foods.value" 
          :direction="store.direction.value"
        />
        
        <!-- 迷因閃爍特效 -->
        <MemeFlashOverlay :meme="lastEatenMeme" />
        
        <!-- 覆蓋層 (IDLE / GAMEOVER) -->
        <div 
          v-if="store.status.value === 'IDLE' || store.status.value === 'GAMEOVER'"
          class="relative rounded-3xl overflow-hidden"
          style="width: min(90vw, 850px); height: min(90vw, 850px);"
        >
          <IdleOverlay 
            v-if="store.status.value === 'IDLE'"
            :control-mode="store.controlMode.value"
            :boss-battle-mode="store.bossBattleMode.value"
            :challenge-morse="challengeMorse"
            :buffer="buffer"
            :ui-display="uiDisplay"
            :morse-map="MORSE_CONFIG.MAP"
            @set-mode="store.setControlMode"
            @set-boss-mode="store.setBossBattleMode"
          />
          <GameOverOverlay 
            v-else-if="store.status.value === 'GAMEOVER'"
            :score="store.score.value"
            @reset="handleReset"
          />
        </div>

        <!-- Boss 戰鬥覆蓋層 -->
        <div 
          v-if="store.status.value === 'BOSS_BATTLE'"
          class="relative rounded-3xl overflow-hidden"
          style="width: min(90vw, 850px); height: min(90vw, 850px);"
        >
          <BossBattleOverlay 
            :count="bossHitCount"
            :target-count="bossTargetCount"
            :is-camera-ready="isBossCameraReady"
            :latest-results="latestResults"
            :mode="store.bossBattleMode.value"
            @video-ready="startBossBattle"
          />
        </div>

        <!-- 暫停覆蓋層 -->
        <PausedOverlay 
          v-if="store.status.value === 'PAUSED'"
          @resume="handlePauseToggle"
        />

        <!-- 摩斯密碼即時回饋 -->
        <div 
          v-if="store.status.value === 'PLAYING' && store.controlMode.value !== 'CLASSIC'"
          class="absolute -bottom-10 left-1/2 -translate-x-1/2 flex gap-2 items-center"
        >
          <div class="text-green-500 font-mono text-2xl font-black tracking-[0.5em] h-8">
            {{ buffer || ' ' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes zoom-in {
  from { transform: scale(0.9); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.animate-in {
  animation: zoom-in 0.3s ease-out;
}
</style>
