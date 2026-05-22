
/**
 * 輸入策略介面
 */
export interface InputStrategy {
  onKeyDown(e: KeyboardEvent): void;
  onKeyUp?(e: KeyboardEvent): void;
  getBuffer?(): string;
  clearBuffer?(): void;
  submitBuffer?(): void;
}

export type InputMode = 'SINGLE_KEY' | 'TWIN_KEY' | 'CLASSIC';

/**
 * 系統動作類型
 */
export type SystemAction = 'SUBMIT' | 'CLEAR' | 'PAUSE';

/**
 * UI 按鍵提示項目
 */
export interface KeyHint {
  key: string;
  label: string;
  isMain?: boolean;
}

