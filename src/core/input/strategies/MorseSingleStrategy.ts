import type { InputStrategy } from '@/core/input/types';
import type { Direction } from '@/core/types';
import { MORSE_CONFIG } from '@/core/config/controls/morse';

export function createMorseSingleStrategy(onDirection: (dir: Direction) => void): InputStrategy {
  let buffer = '';
  let keyDownTime = 0;

  return {
    onKeyDown(e: KeyboardEvent): void {
      if (e.repeat || e.code !== 'Space') return;
      e.preventDefault();
      keyDownTime = Date.now();
    },

    onKeyUp(e: KeyboardEvent): void {
      if (e.code === 'Space') {
        const duration = Date.now() - keyDownTime;
        buffer += duration < MORSE_CONFIG.SINGLE.SHORT_THRESHOLD ? '.' : '-';
      }
    },

    getBuffer(): string {
      return buffer;
    },

    clearBuffer(): void {
      buffer = '';
    },

    submitBuffer(): void {
      const direction = MORSE_CONFIG.MAP[buffer];
      if (direction) {
        onDirection(direction);
      }
      buffer = '';
    },
  };
}
