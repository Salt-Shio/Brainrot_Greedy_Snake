import type { InputStrategy } from '@/core/input/types';
import type { Direction } from '@/core/types';
import { CLASSIC_CONTROLS } from '@/core/config/controls/classic';

export function createClassicStrategy(onDirection: (dir: Direction) => void): InputStrategy {
  return {
    onKeyDown(e: KeyboardEvent): void {
      const classic = CLASSIC_CONTROLS;
      if ((classic.UP as ReadonlyArray<string>).includes(e.key)) onDirection('UP');
      else if ((classic.DOWN as ReadonlyArray<string>).includes(e.key)) onDirection('DOWN');
      else if ((classic.LEFT as ReadonlyArray<string>).includes(e.key)) onDirection('LEFT');
      else if ((classic.RIGHT as ReadonlyArray<string>).includes(e.key)) onDirection('RIGHT');
    },
  };
}
