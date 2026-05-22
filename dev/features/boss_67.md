# 67 Boss 遭遇戰

## 戰鬥機制
隨機或定期觸發的特殊 Boss 戰，要求玩家進行實體動作互動。

### 特色
- **音效驅動**: 隨著 Boss 出現，音頻中「67」的腦腐聲會越來越大。
- **動作判定**: 玩家必須對著攝影機做出「6」與「7」的手勢或特定動作。

### 技術棧
- **Mediapipe Hands/Pose**: 用於前端攝像頭畫面即時分析。
- **Web Audio API**: 動態控制音效增益 (Gain)。

## 實作路徑
- 建立 `src/components/MediapipeLayer.vue` 用於渲染攝像頭預覽。
- 實作手勢判定邏輯。
- 在 `useSnakeStore.ts` 中新增 `bossStatus` 管理戰鬥狀態。
