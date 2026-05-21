# Greedy Snake MVP 開發計畫 (TS 嚴格架構版)

## 1. 架構原則 (Architecture Principles)
- **純邏輯優先**: 核心運算完全與 Vue 框架脫鉤，保證高度可測試性。
- **強型別約束**: 運用 TypeScript 介面定義所有資料流，消除執行期型別錯誤。
- **單向資料流**: `UI 事件` -> `State Actions` -> `UI 重新渲染`。

---

## 2. 開發階段拆解 (Phases)

### 第一階段：Data Design (核心資料與型別) - `src/core/`
定義遊戲世界的基礎物理與規則常數。

- **`types.ts`**: 定義資料介面
  - `Point { x: number, y: number }` (座標)
  - `GameState = 'idle' | 'playing' | 'gameover' | 'paused'`
  - `Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'`
- **`constants.ts`**: 定義遊戲常數
  - `GRID_SIZE`: 網格大小 (如 20x20)
  - `INITIAL_SNAKE`: 初始蛇身座標陣列
  - `INITIAL_SPEED`: 初始移動速度 (ms)
  - `VECTOR_MAP`: 方向與向量的映射表 (如 UP: {x: 0, y: -1})

### 第二階段：Function Design (純邏輯運算) - `src/core/`
實作與 UI 無關的純函式 (Pure Functions)。

- **`game-logic.ts`**:
  - `getNextHeadPosition(head: Point, direction: Direction): Point` (計算下一格)
  - `isCollision(head: Point, body: Point[], gridSize: number): boolean` (邊界與自體碰撞判定)
  - `generateFood(snakeBody: Point[], gridSize: number): Point` (隨機生成且避開蛇身的食物)

### 第三階段：State Management (狀態與控制器) - `src/composables/`
結合 Vue 的 Reactivity 系統與 Game Loop。

- **`useSnakeStore.ts`**:
  - **State**: `snake` (Point[]), `food` (Point), `direction` (Direction), `score` (number), `status` (GameState).
  - **Actions**: `initGame()`, `changeDirection(newDir)`, `moveStep()`.
- **`useGameLoop.ts`**:
  - 基於 `setInterval` 或 `requestAnimationFrame` 建立計時器。
  - 根據 `status` 控制暫停/繼續，觸發 Store 的 `moveStep()`。

### 第四階段：Frontend UI (視覺呈現) - `src/components/`
使用 Tailwind CSS 渲染狀態，並處理使用者輸入。

- **`components/GameGrid.vue`**:
  - 純展示元件 (Presentational Component)。
  - 接收 `snake` 和 `food` 作為 Props。
  - 使用 CSS Grid 動態渲染網格。
- **`components/ScoreBoard.vue`**: 顯示分數與當前狀態。
- **`App.vue` (入口組合)**:
  - 監聽全域 `keydown` 事件並過濾無效按鍵 (如反向移動)。
  - 組合 `GameGrid` 與 `ScoreBoard`。

---

## 3. 目錄結構預覽
```text
src/
├── core/
│   ├── types.ts          # [階段 1]
│   ├── constants.ts      # [階段 1]
│   └── game-logic.ts     # [階段 2]
├── composables/
│   ├── useSnakeStore.ts  # [階段 3]
│   └── useGameLoop.ts    # [階段 3]
├── components/
│   ├── GameGrid.vue      # [階段 4]
│   └── ScoreBoard.vue    # [階段 4]
├── App.vue
└── main.ts
```
