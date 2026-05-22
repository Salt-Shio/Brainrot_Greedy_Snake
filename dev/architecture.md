# 系統架構指南 (Architecture Guide)

> 本文件紀錄 Brainrot Greedy Snake 的架構設計思維與開發規範，  
> 供所有開發者在動工前必讀。  
> **規則 > 直覺。看完再寫。**

---

## 1. 架構哲學

### 核心思想：Pure Logic First（純邏輯優先）

本專案最重要的一個原則：**遊戲規則不應該知道 Vue 的存在**。

一個函式如果能「在 Node.js 裡直接執行測試」，它就在對的位置。  
如果它用到了 `ref`、`computed`、`onMounted`，它就屬於 composables 層，不屬於 core 層。

```
「在 Vitest 裡，不需要掛載 Vue，就能跑完核心邏輯的測試」—— 這是判斷函式歸屬的黃金準則。
```

### 關注點分離（Separation of Concerns）

每一層只做自己的事，不往上也不往下越界：

```
UI 層（.vue）
  ↓ 呼叫 Actions / 讀取 State
響應式層（composables/）
  ↓ 呼叫 Pure Functions
純邏輯層（core/）
```

---

## 2. 目錄結構與職責

```
src/
├── core/                          # 純邏輯層（Pure Logic）
│   ├── index.ts                   # 統一出口（barrel）
│   ├── types.ts                   # 領域型別定義（Point, Direction, GameState...）
│   ├── game-logic.ts              # 遊戲規則純函式（無任何 Vue 依賴）
│   ├── config/                    # 靜態常數配置
│   │   ├── index.ts               # 配置統一出口
│   │   ├── game.ts                # 遊戲參數（GRID_SIZE, MAP_MODE, SPEED...）
│   │   ├── initial-state.ts       # 遊戲初始資料
│   │   └── controls/              # 各控制模式的按鍵映射
│   │       ├── classic.ts
│   │       ├── morse.ts
│   │       └── system.ts
│   └── input/                     # 輸入系統領域模型
│       ├── types.ts               # InputStrategy 介面、InputMode、KeyHint...
│       └── strategies/            # 各輸入策略的具體實作
│           ├── ClassicStrategy.ts
│           ├── MorseSingleStrategy.ts
│           └── MorseTwinStrategy.ts
│
├── composables/                   # 響應式層（Reactivity）
│   ├── useSnakeStore.ts           # 遊戲狀態（Module Singleton）
│   ├── useGameLoop.ts             # 遊戲循環計時器管理
│   ├── useInputController.ts      # 輸入策略橋接器
│   └── useGameSession.ts          # 遊戲流程協調器（業務邏輯匯集點）
│
├── components/                    # UI 展示層（Presentational）
│   ├── GameGrid.vue               # 遊戲網格渲染（純展示）
│   ├── ScoreBoard.vue             # 分數顯示
│   ├── NavigationSidebar.vue      # 操作提示側欄
│   └── overlays/                  # 覆蓋層（依遊戲狀態顯示）
│       ├── IdleOverlay.vue        # 待機畫面（含身分驗證）
│       ├── PausedOverlay.vue      # 暫停畫面
│       └── GameOverOverlay.vue    # 死亡畫面
│
├── App.vue                        # 入口元件（純組裝）
├── main.ts                        # Vue 掛載點
└── style.css                      # 全域樣式（Tailwind 基礎 + 自定義動畫）
```

---

## 3. 各層規則

### 3-1. `core/` — 純邏輯層

**✅ 可以做：**
- 純函式計算（輸入相同 → 輸出相同，無副作用）
- 型別/介面定義
- 靜態常數

**❌ 絕對禁止：**
- `import { ref, reactive, ... } from 'vue'`
- 任何 DOM 操作
- 任何非同步 I/O

**新增遊戲規則時**，先問自己：「這個邏輯能被 unit test 直接呼叫嗎？」  
→ 能 → 放 `core/game-logic.ts`  
→ 需要 Vue 狀態 → 放 composables

---

### 3-2. `composables/` — 響應式層

**職責分工（重要！每個 composable 只做一件事）：**

| Composable | 職責 |
|-----------|------|
| `useSnakeStore` | 持有所有遊戲狀態，提供 Actions，**唯一的狀態真相來源** |
| `useGameLoop` | 管理 `setInterval` 的生命週期，對外只暴露 `start/stop` |
| `useInputController` | 橋接鍵盤事件 → 策略模式，對外暴露 `buffer`、`uiDisplay` |
| `useGameSession` | **業務邏輯協調器**，整合上面三者，處理狀態轉換的判定邏輯 |

**`useSnakeStore` 是 Module Singleton：**

```ts
// ✅ 正確：state 宣告在函式外，全域唯一
const snake = ref<Point[]>([]);
export function useSnakeStore() {
  return { snake, ... };
}

// ❌ 錯誤：state 在函式內，每次呼叫都是新實例
export function useSnakeStore() {
  const snake = ref<Point[]>([]);  // 這樣會狀態分裂！
  return { snake, ... };
}
```

**composable 的呼叫規則：**
- `App.vue` 只能呼叫 `useSnakeStore()` 和 `useGameSession()`
- `useGameSession` 可以呼叫所有其他 composables（它是協調器）
- UI 子元件**不應該**直接呼叫任何 composable，改用 Props 接收

---

### 3-3. `components/` — UI 展示層

**原則：元件越笨越好（Dumb Components）**

好的 UI 元件應該：
- 只接收 Props，透過 `$emit` 往上通知事件
- 不持有業務邏輯，不直接讀取 store
- 可以在隔離狀態下被 Storybook 渲染（即使本專案沒用 Storybook）

```ts
// ✅ 好的元件：不知道 store 的存在
defineProps<{ score: number; status: GameState }>();
defineEmits<{ (e: 'reset'): void }>();

// ❌ 壞的元件：UI 直接操作業務邏輯
import { useSnakeStore } from '@/composables/useSnakeStore';
const store = useSnakeStore();
store.initGame(); // UI 不該直接呼叫這個
```

---

## 4. 型別系統規則

### 型別的歸屬地

| 型別 | 歸屬 | 原因 |
|------|------|------|
| `Point`, `Direction`, `GameState`, `MapMode` | `core/types.ts` | 遊戲世界的領域模型 |
| `InputStrategy`, `InputMode`, `KeyHint`, `SystemAction` | `core/input/types.ts` | 輸入系統的領域模型 |
| Vue 元件特定的型別（Props interface） | 元件檔案內部 | 只有該元件用到 |

**原則：型別跟著它描述的領域走，不跟著第一個用到它的地方走。**

### 嚴格禁止 `any`

TypeScript 的 strict mode 是開著的，任何 `any` 都是技術債。  
遇到難以定型的情況，先用 `unknown` 再 narrow，或是在 `core/types.ts` 補充型別。

---

## 5. 輸入系統架構（Strategy Pattern）

輸入系統採用**策略模式（Strategy Pattern）**，讓三種控制模式（Classic / Single Morse / Twin Morse）共享同一個介面，但各自封裝不同行為。

```
useInputController
    │
    ├── 根據 mode ref，選擇對應策略
    │
    ├── ClassicStrategy  → 監聽 WASD / 方向鍵
    ├── MorseSingleStrategy → 監聽 Space 的長短按
    └── MorseTwinStrategy   → 監聽 i (dot) / o (dash)
```

**新增控制模式的步驟：**
1. 在 `core/input/types.ts` 的 `InputMode` union type 加入新值
2. 在 `core/input/strategies/` 新增對應的工廠函式，實作 `InputStrategy` 介面
3. 在 `useInputController.ts` 的 `strategies` 物件加入新策略
4. 在 `core/config/controls/` 加入對應的按鍵配置

**注意：本專案的 `tsconfig.app.json` 啟用了 `erasableSyntaxOnly: true`，  
禁止使用 class 的 parameter properties 語法（`constructor(private foo: Bar) {}`）。  
→ 所有 Strategy 一律使用「工廠函式 + 閉包」實作，參考現有寫法。**

---

## 6. 狀態機（Game State Machine）

遊戲狀態只有四種，轉換規則嚴格如下：

```
        ┌──────────────────────────────────────────┐
        │                                          │
        ▼                                          │
     [IDLE] ──────────────────────────────► [PLAYING]
        ▲                                    │    │
        │                                    │    │
    initGame()                         pauseGame() │ 撞牆 / 撞自己
        │                                    │    │
        │                                    ▼    ▼
        │                                [PAUSED] [GAMEOVER]
        │                                    │
        │                               startGame()
        │                                    │
        └────────────────────────────────────┘
```

**規則：**
- 狀態只能透過 `useSnakeStore` 的 Actions 改變
- `useGameSession` 負責判斷「什麼時機」呼叫哪個 Action
- UI 元件只能呼叫 `useGameSession` 暴露的函式，或透過 `@emit` 通知

---

## 7. 新增功能的標準流程

以「新增一個 Boss 遭遇系統」為例：

```
Step 1. 定義型別
  → core/types.ts 加入 BossState, BossType 等型別

Step 2. 實作純邏輯
  → core/boss-logic.ts 實作：
    - shouldTriggerBoss(score: number): boolean
    - getBossPattern(type: BossType): BombPattern[]

Step 3. 擴充 Store（如果需要新狀態）
  → useSnakeStore.ts 加入 bossState ref + 對應 actions
  （記住：state 要在函式外宣告，Module Singleton）

Step 4. 建立功能 Composable（如果邏輯夠複雜）
  → composables/useBossSession.ts

Step 5. 在 useGameSession 整合觸發時機
  → useGameSession.ts 裡的 moveStep callback 或定時器

Step 6. 新增 UI 元件
  → components/overlays/BossOverlay.vue（純展示，Props only）

Step 7. 在 App.vue 組裝
  → 最少量的修改
```

---

## 8. Import 路徑規範

**統一使用 `@` 別名（`@` = `src/`），禁止跨層相對路徑。**

```ts
// ✅ 正確
import type { Point } from '@/core/types';
import { GRID_SIZE } from '@/core/config';

// ❌ 錯誤：跨目錄的相對路徑容易在檔案搬移後斷掉
import type { Point } from '../../core/types';
import type { Point } from './types'; // 路徑不存在
```

**同層或往下的相對路徑是 OK 的：**
```ts
// ✅ 在 core/config/game.ts 內引用同層的 types，沒問題
import type { MapMode } from '../types';
```

---

## 9. 常見陷阱（Gotchas）

### ❗ `useSnakeStore` 不是普通 composable

普通的 Vue composable 每次呼叫都是新實例。  
`useSnakeStore` 刻意設計為 Module Singleton，所有呼叫者共享同一份 state。  
子元件**不需要**也**不應該**自己呼叫 `useSnakeStore()`，應該透過 Props 接收資料。

### ❗ `erasableSyntaxOnly` 禁止 class parameter properties

```ts
// ❌ 這個語法在本專案會報 build error
class MyStrategy {
  constructor(private onDirection: (d: Direction) => void) {}
}

// ✅ 改用工廠函式
function createMyStrategy(onDirection: (d: Direction) => void): InputStrategy {
  return { onKeyDown(e) { ... } };
}
```

### ❗ `OPPOSITE_DIRECTION` 用 Record<string, string> 而非 Record<Direction, Direction>

目前為快速開發妥協，如果之後加入新方向，**記得同步更新**這個映射表。  
（TODO: 改用 `Record<Direction, Direction>`）

---

## 10. 文件更新守則

| 文件 | 更新時機 |
|------|---------|
| `dev/architecture.md`（本文件） | 架構有重大變動時 |
| `dev/planning.md` | 新增 Brainrot 特色功能規劃時 |
| `dev/mvp_init.md` | MVP 階段設計回顧，原則上不修改（歷史文件） |
| `dev/features/` | 每個 Brainrot Feature 的詳細技術規格 |
| `docs/errors.md` | 解決 Bug 後記錄原因與解法 |
| `docs/TODO.md` | 每次開發完成後更新待辦清單 |
