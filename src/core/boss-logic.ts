import type { Results } from '@mediapipe/hands';

// 左右手標識
export type HandSide = 'Left' | 'Right';

// 動作判定結果
export interface MovementResult {
  scored: boolean;
  hand: HandSide;
}

/**
 * 提取手腕的垂直座標 (Y軸)，作為手部位置的基準
 * Mediapipe 的座標系統：Y軸向下為正 (0.0 是頂部，1.0 是底部)
 */
export function getWristY(results: Results, side: HandSide): number | null {
  if (!results.multiHandLandmarks || !results.multiHandedness) return null;

  for (let i = 0; i < results.multiHandedness.length; i++) {
    // 注意：前置鏡頭通常會有左右相反的現象，這裡我們直接用 Mediapipe 的 Label
    if (results.multiHandedness[i].label === side) {
      // Landmark 0 通常是手腕 (Wrist)
      return results.multiHandLandmarks[i][0].y;
    }
  }
  return null;
}

/**
 * 核心判定：檢測雙手是否交替上下擺動
 * @param currentHands 目前這幀的資料
 * @param prevLeftY 上一次記錄的左手高度
 * @param prevRightY 上一次記錄的右手高度
 * @param lastScoredHand 上一次得分的手 (確保交替)
 * @param threshold 移動距離的閾值 (避免微小抖動計分)
 */
export function detectAlternatingMovement(
  currentHands: Results,
  prevLeftY: number | null,
  prevRightY: number | null,
  lastScoredHand: HandSide | null,
  threshold: number = 0.15 // 設定 15% 畫面高度的移動量才算一次有效揮動
): MovementResult | null {
  
  const currentLeftY = getWristY(currentHands, 'Left');
  const currentRightY = getWristY(currentHands, 'Right');

  if (currentLeftY === null || currentRightY === null) return null;

  // 如果沒有歷史資料，就先儲存目前狀態，不計分
  if (prevLeftY === null || prevRightY === null) return null;

  // 計算垂直位移量 (向上移動，Y值會變小，所以差值為負)
  // 為了方便理解，我們將 "向上擺動" 視為攻擊動作
  const leftDelta = prevLeftY - currentLeftY; 
  const rightDelta = prevRightY - currentRightY;

  // 檢查左手是否用力往上揮 (超過閾值)，且上次得分的不是左手
  if (leftDelta > threshold && lastScoredHand !== 'Left') {
    return { scored: true, hand: 'Left' };
  }

  // 檢查右手是否用力往上揮 (超過閾值)，且上次得分的不是右手
  if (rightDelta > threshold && lastScoredHand !== 'Right') {
    return { scored: true, hand: 'Right' };
  }

  return null;
}
