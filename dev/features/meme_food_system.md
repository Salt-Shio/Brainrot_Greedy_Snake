# 迷因食物系統 (Meme Food System)

## 功能核心
將原本單一的紅點食物升級為隨機的迷因圖片，並在吃掉時觸發獨特的音效。

## 1. 資料結構 (Meme Pool)
定義一組迷因物件庫：
- **`id`**: 唯一識別碼。
- **`imageUrl`**: 迷因圖片路徑 (如 `/assets/memes/cat.png`)。
- **`soundUrl`**: 吃掉時的音效路徑 (如 `/assets/sounds/meow.mp3`)。

## 2. 核心機制
- **隨機生成**: 每次食物被吃掉後，從迷因池中隨機挑選下一個迷因圖片顯示在網格上。
- **音效觸發**: 在蛇頭與食物座標重合的瞬間，即時播放該迷因對應的音效。
- **Boss 關聯**: 追蹤吃掉的食物總數，作為觸發 67 Boss 戰的條件。

## 3. 實作路徑
- 在 `src/core/config/` 建立 `meme-pool.ts`。
- 修改 `useSnakeStore.ts` 的食物狀態，使其包含迷因資訊。
- 更新 `GameGrid.vue`，將原本的圓形渲染改為 `<img>` 或 `background-image`。
- 整合 `useAudioController.ts` 播放音效。
