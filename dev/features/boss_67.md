# 67 Boss 遭遇戰 (技術計畫)

## 1. 核心流程 (Core Flow)
1. **觸發期 (Trigger)**:
   - 蛇吃掉特定數量的食物（由計數器追蹤）。
   - 達到閾值時，遊戲本體暫停。
2. **視覺震撼 (Visual Takeover)**:
   - 全螢幕切換至 Boss 動畫 (MP4/GIF)。
   - 開啟「67 Battle」專用覆蓋層。
3. **戰鬥與加速 (Battle & Tempo Ramp)**:
   - 啟動「67」循環背景音軌。
   - 隨著戰鬥秒數增加，影音播放速度同步加快 (1.0x -> 3.5x)。
4. **Mediapipe 判定**:
   - 啟動鏡頭。
   - 玩家比出「6」與「7」手勢以擊敗 Boss。
   - 獲勝後清除食物計數並恢復遊戲。

## 2. 系統架構預計變更

### A. Core 層 (純邏輯)
- `core/types.ts`: 新增 `BossStatus`。
- `core/boss-logic.ts`: 計算隨時間遞增的 `speedFactor`。

### B. Composables 層 (邏輯協調)
- `useAudioController.ts`: 實作動態 `playbackRate` 控制。
- `useMediapipe.ts`: 負責手勢識別。
- `useBossSession.ts`: 協調 Boss 的出現時機與加速定時器。

### C. UI 層 (組件)
- `src/components/overlays/BossBattleOverlay.vue`:
  - 展示層：渲染加速中的 Boss 影片。
  - 偵測層：顯示攝影機預覽。

## 3. 資源處理技術細節 (Technical Implementation)
- **音訊調速**: 使用 `AudioBufferSourceNode.playbackRate`。
- **影片調速**: 使用 `videoElement.playbackRate` 與音訊同步。
