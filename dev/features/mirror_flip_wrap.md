# 鏡像循環地圖 (Mirror/Flip Wrap)

## 核心邏輯
地圖邊界不再是致死障礙，而是具備翻轉特性的循環連接點。

### 坐標轉換公式
假設 `GRID_SIZE = 20`：

1. **水平穿越 (Horizontal Wrap)**
   - 出現條件: `x < 0` 或 `x >= GRID_SIZE`
   - 邏輯: 
     - 從左側穿出 (`x = -1`) -> 從右側進入 (`x = 19`)，且 `y` 座標翻轉。
     - 從右側穿出 (`x = 20`) -> 從左側進入 (`x = 0`)，且 `y` 座標翻轉。
   - 公式: `y_new = (GRID_SIZE - 1) - y_old`

2. **垂直穿越 (Vertical Wrap)**
   - 出現條件: `y < 0` 或 `y >= GRID_SIZE`
   - 邏輯:
     - 從頂部穿出 (`y = -1`) -> 從底部進入 (`y = 19`)，且 `x` 座標翻轉。
     - 從底部穿出 (`y = 20`) -> 從頂部進入 (`y = 0`)，且 `x` 座標翻轉。
   - 公式: `x_new = (GRID_SIZE - 1) - x_old`

## 實作路徑
- 修改 `src/core/game-logic.ts` 中的 `getNextHeadPosition`。
- 確保食物生成 (`generateFood`) 依然在有效網格內。
- 移除原有的 `isWallCollision` 檢查。
