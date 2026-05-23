<script setup lang="ts">
import { useSnakeStore } from '@/composables/useSnakeStore';
import { useGameSession } from '@/composables/useGameSession';
import { MORSE_CONFIG } from '@/core/config/controls/morse';

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
  <div class="flex flex-col items-center justify-center min-h-screen p-4 select-none bg-slate-950 text-slate-200 font-sans">
    <!-- Main Game Area -->
    <div class="flex items-start gap-12">
      <div class="flex flex-col gap-8 w-48">
        <!-- Score moved here -->
        <ScoreBoard :score="store.score.value" :status="store.status.value" />

        <NavigationSidebar 
          v-if="store.status.value === 'PLAYING'"
          :control-mode="store.controlMode.value"
          :ui-display="uiDisplay"
          :morse-map="MORSE_CONFIG.MAP"
        />
      </div>

      <div class="relative group">
        <!-- Game World -->
        <GameGrid 
          v-show="store.status.value === 'PLAYING' || store.status.value === 'PAUSED'"
          :snake="store.snake.value" 
          :foods="store.foods.value" 
        />
        
        <!-- Meme Flash Effect -->
        <MemeFlashOverlay :meme="lastEatenMeme" />
        
        <!-- Overlays (IDLE / GAMEOVER) -->
        <div 
          v-if="store.status.value === 'IDLE' || store.status.value === 'GAMEOVER'"
          class="relative rounded-3xl overflow-hidden"
          style="width: min(90vw, 850px); height: min(90vw, 850px);"
        >
          <IdleOverlay 
            v-if="store.status.value === 'IDLE'"
            :control-mode="store.controlMode.value"
            :challenge-morse="challengeMorse"
            :buffer="buffer"
            :ui-display="uiDisplay"
            :morse-map="MORSE_CONFIG.MAP"
            @toggle-mode="store.toggleControlMode()"
          />
          <GameOverOverlay 
            v-else-if="store.status.value === 'GAMEOVER'"
            :score="store.score.value"
            @reset="handleReset"
          />
        </div>

        <!-- Boss Battle Overlay -->
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
            @video-ready="startBossBattle"
          />
        </div>

        <!-- Paused Overlay -->
        <PausedOverlay 
          v-if="store.status.value === 'PAUSED'"
          @resume="handlePauseToggle"
        />

        <!-- Live Morse Feedback (During Play) -->
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

    <!-- Footer -->
    <footer class="mt-12 text-slate-600 text-[10px] font-bold tracking-widest uppercase flex gap-8">
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div> Snake
      </div>
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-rose-500 rounded-full shadow-[0_0_5px_rgba(244,63,94,0.5)]"></div> Food
      </div>
    </footer>
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
