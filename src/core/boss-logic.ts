import type { Results } from '@mediapipe/hands';

// 左右手標識
export type HandSide = 'Left' | 'Right';

// 動作判定結果
export interface MovementResult {
  scored: boolean;
  hand: HandSide;
}

/**
 * 提取手部的平均垂直座標 (Y軸中心點)
 * 取所有 21 個 Landmark 的平均值，比單純取手腕更穩定，
 * 即使手心朝上、側放也能精準追蹤手部重心。
 */
export function getHandCenterY(results: Results, side: HandSide): number | null {
  if (!results.multiHandLandmarks || !results.multiHandedness) return null;

  for (let i = 0; i < results.multiHandedness.length; i++) {
    if (results.multiHandedness[i].label === side) {
      const landmarks = results.multiHandLandmarks[i];
      // 計算所有點的平均 Y 值
      const sumY = landmarks.reduce((acc, curr) => acc + curr.y, 0);
      return sumY / landmarks.length;
    }
  }
  return null;
}

/**
 * 核心判定：檢測雙手是否交替上下擺動
 */
export function detectAlternatingMovement(
  currentHands: Results,
  prevLeftY: number | null,
  prevRightY: number | null,
  lastScoredHand: HandSide | null,
  threshold: number = 0.12 
): MovementResult | null {

  const currentLeftY = getHandCenterY(currentHands, 'Left');
  const currentRightY = getHandCenterY(currentHands, 'Right');

  if (currentLeftY === null || currentRightY === null) return null;

  // 如果沒有歷史資料，就先儲存目前狀態，不計分
  if (prevLeftY === null || prevRightY === null) return null;

  // 計算垂直位移量 (向上移動，Y值會變小，所以差值為負)
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
