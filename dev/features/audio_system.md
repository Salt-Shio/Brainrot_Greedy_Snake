# 腦腐音效系統 (Brainrot Audio System)

## 功能核心
負責處理遊戲中所有的聲音回饋，包含短促的迷因音效與持續性的 Boss 音軌。

### 關鍵功能
1. **迷因特效音 (SFX)**: 
   - 支援快速併發播放（例如連吃食物時音效疊加）。
   - 由迷因食物系統觸發。
2. **動態 Boss 音軌**:
   - 支援無縫循環。
   - **動態調速 (Playback Rate)**: 隨著戰鬥時間或憤怒值提升，同步增加播放速度 (1.0x -> 3.5x)。
3. **中央增益控制**:
   - 提供靜音、音量微調功能。

## 技術實作
- **Web Audio API**: 作為核心引擎，提供精準的速度控制。
- **useAudioController.ts**: 
  - `playEffect(url)`: 播放一次性音效。
  - `startBossLoop(url)`: 啟動可調速的循環背景音。
  - `setBossTempo(rate)`: 更新當前播放速率。
