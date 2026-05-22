import type { InputStrategy } from '@/core/input/types';
import type { Direction } from '@/core/types';
import { MORSE_CONFIG } from '@/core/config/controls/morse';

export function createMorseTwinStrategy(onDirection: (dir: Direction) => void): InputStrategy {
  let buffer = '';

  return {
    onKeyDown(e: KeyboardEvent): void {
      if (e.repeat) return;
      const twin = MORSE_CONFIG.TWIN;
      const key = e.key.toLowerCase();

      if (key === twin.DOT_KEY) buffer += '.';
      else if (key === twin.DASH_KEY) buffer += '-';
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
