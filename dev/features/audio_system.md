# 腦腐音效系統 (Brainrot Audio System)

## 功能核心
根據遊戲狀態與距離，動態控制音效表現，營造「腦腐」氛圍。

### 關鍵功能
- **動態音量控制**: 
  - 根據 Boss 的剩餘血量或與玩家的「距離」自動調整音量。
  - 當 Boss 接近或準備發動大招時，音量最大化。
- **音軌切換**: 平時為背景輕音樂，Boss 戰切換至激昂/混亂的腦腐音軌。

## 技術實作
- 使用 `new Audio()` 或 `AudioContext`。
- 實作 `useAudioController.ts` 提供 `play()`, `setVolume()`, `fadeTo()` 等介面。
- 資源存放於 `public/audio/`。
