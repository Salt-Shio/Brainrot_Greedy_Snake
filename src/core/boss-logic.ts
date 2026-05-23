// 左右手標識
export type HandSide = 'Left' | 'Right';

// 動作判定結果
export interface MovementResult {
  scored: boolean;
  hand: HandSide;
}
/**
 * 提取手部的參考點 (中指指根 Landmark 9)
 * 這是手掌中最穩定的點，即使手心朝上或高速晃動也不容易丟失。
 */
export function getHandRefY(results: any, side: HandSide): number | null {
  if (!results.multiHandLandmarks || !results.multiHandedness) return null;

  for (let i = 0; i < results.multiHandedness.length; i++) {
    if (results.multiHandedness[i].label === side) {
      // Landmark 9 是中指指根 (Middle Finger MCP)
      return results.multiHandLandmarks[i][9].y;
    }
  }
  return null;
}

/**
 * 核心判定：檢測雙手是否交替向上擺動
 * 採用「動態最低點參考」演算法，專為高速震動設計。
 * @param currentHands 目前這幀資料
 * @param lowestLeftY 自上次左手得分後的最低點 (Y值最大)
 * @param lowestRightY 自上次右手得分後的最低點 (Y值最大)
 * @param lastScoredHand 上次得分的手
 * @param threshold 觸發攻擊的向上位移閾值 (建議設小一點以應對高速動作)
 */
export function detectAlternatingMovement(
  currentHands: any,
  lowestLeftY: number | null,
  lowestRightY: number | null,
  lastScoredHand: HandSide | null,
  threshold: number = 0.06 // 降低閾值，只要向上移動 6% 畫面高度就計分
): MovementResult | null {

  const currentLeftY = getHandRefY(currentHands, 'Left');
  const currentRightY = getHandRefY(currentHands, 'Right');

  if (currentLeftY !== null && lowestLeftY !== null) {
    const leftUpwardDelta = lowestLeftY - currentLeftY; // Y 越小越上面
    if (leftUpwardDelta > threshold && lastScoredHand !== 'Left') {
      return { scored: true, hand: 'Left' };
    }
  }

  if (currentRightY !== null && lowestRightY !== null) {
    const rightUpwardDelta = lowestRightY - currentRightY;
    if (rightUpwardDelta > threshold && lastScoredHand !== 'Right') {
      return { scored: true, hand: 'Right' };
    }
  }

  return null;
}

