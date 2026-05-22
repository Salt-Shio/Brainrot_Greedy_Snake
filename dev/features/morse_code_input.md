# 摩斯密碼控制 (Morse Code Input)

## 控制邏輯
玩家透過長短按鍵位組合來下達方向指令。

### 鍵位對應 (預計)
- `.` (短按): 向上 (UP)
- `..` (短短): 向下 (DOWN)
- `-` (長按): 向左 (LEFT)
- `--` (長長): 向右 (RIGHT)

### 技術參數
- **短按判定**: 按壓時間 < 200ms。
- **長按判定**: 按壓時間 >= 200ms。
- **判定延遲 (Idle Timeout)**: 當使用者停止按鍵 300ms 後，讀取緩衝區內容並執行指令。

## 實作路徑
- 建立 `src/composables/useMorseInput.ts`。
- 監聽 `keydown` 與 `keyup` 事件。
- 使用 `setTimeout` 實作判定延遲。
- 整合進 `App.vue` 取代現有的方向鍵監聽。
