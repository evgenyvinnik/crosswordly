import { forwardRef, useMemo } from 'react';

export type Direction = 'across' | 'down';

export type GameLevelWord = {
  id: string;
  direction: Direction;
  answer: string;
  start: { row: number; col: number };
};

export type GameLevel = {
  id: string;
  rows: number;
  cols: number;
  words: GameLevelWord[];
  prefilledLetters?: Record<string, string>;
  intersection?: { row: number; col: number };
};

export type OverlayState = {
  direction: Direction;
  letters: string[];
  status: 'preview' | 'error';
  mismatchedIndices?: number[];
};

type GameFieldProps = {
  level: GameLevel;
  committedLetters: Record<string, string>;
  overlay?: OverlayState | null;
  activeDirection?: Direction | null;
};

const cellSizeClasses = 'h-12 w-12 text-xl sm:h-14 sm:w-14 sm:text-2xl';

const GameField = forwardRef<HTMLDivElement, GameFieldProps>(
  ({ level, committedLetters, overlay, activeDirection }, ref) => {
    const playableCells = useMemo(() => {
      const map = new Map<
        string,
        {
          directions: Direction[];
          indices: Record<Direction, number>;
        }
      >();

      level.words.forEach((word) => {
        word.answer.split('').forEach((_, index) => {
          const row = word.start.row + (word.direction === 'down' ? index : 0);
          const col = word.start.col + (word.direction === 'across' ? index : 0);
          const key = `${row}-${col}`;
          const existing = map.get(key) ?? { directions: [], indices: {} as Record<Direction, number> };
          existing.directions = Array.from(new Set([...existing.directions, word.direction]));
          existing.indices[word.direction] = index;
          map.set(key, existing);
        });
      });

      return map;
    }, [level.words]);

    const overlayLetters = useMemo(() => {
      if (!overlay) {
        return new Map<string, { letter: string; isMismatch: boolean }>();
      }

      const placement = level.words.find((word) => word.direction === overlay.direction);
      if (!placement) {
        return new Map();
      }

      const map = new Map<string, { letter: string; isMismatch: boolean }>();
      overlay.letters.forEach((letter, index) => {
        const row = placement.start.row + (placement.direction === 'down' ? index : 0);
        const col = placement.start.col + (placement.direction === 'across' ? index : 0);
        map.set(`${row}-${col}`, {
          letter,
          isMismatch: Boolean(overlay.mismatchedIndices?.includes(index)),
        });
      });

      return map;
    }, [overlay, level.words]);

    const cells = [];

    for (let row = 0; row < level.rows; row += 1) {
      for (let col = 0; col < level.cols; col += 1) {
        const key = `${row}-${col}`;
        const details = playableCells.get(key);
        const isIntersection = level.intersection?.row === row && level.intersection?.col === col;
        const letter =
          overlayLetters.get(key)?.letter ??
          committedLetters[key] ??
          level.prefilledLetters?.[key] ??
          '';

        let className = `flex items-center justify-center rounded-md border text-center font-semibold uppercase tracking-wide transition-colors duration-200 ${cellSizeClasses}`;

        if (!details) {
          className += ' border-transparent bg-transparent text-transparent';
        } else {
          const overlayInfo = overlayLetters.get(key);
          const hasOverlay = Boolean(overlayInfo);
          const isCommitted = Boolean(committedLetters[key]);

          if (isIntersection && !overlayInfo?.isMismatch) {
            className += ' bg-[#6aaa64] border-[#6aaa64] text-white shadow-inner';
          } else if (overlayInfo?.isMismatch && overlay?.status === 'error') {
            className += ' bg-[#c9b458] border-[#c9b458] text-white';
          } else if (hasOverlay && overlay?.status === 'error') {
            className += ' border-[#d3d6da] bg-white text-[#1a1a1b]';
          } else if (hasOverlay && overlay?.status === 'preview') {
            className += ' border-[#6aaa64] bg-[#eef4ec] text-[#1a1a1b]';
          } else if (isCommitted) {
            className += ' bg-[#1a1a1b] border-[#1a1a1b] text-white';
          } else {
            className += ' border-[#d3d6da] bg-white/80 text-transparent';
          }

          if (!hasOverlay && !isCommitted && activeDirection && details.directions.includes(activeDirection)) {
            className += ' border-[#6aaa64]';
          }
        }

        cells.push(
          <div key={key} className={className} data-cell-key={key} aria-hidden={!letter}>
            {letter}
          </div>
        );
      }
    }

    return (
      <div className="inline-flex flex-col items-center gap-4">
        <div
          ref={ref}
          className="grid gap-2 rounded-2xl border border-[#d3d6da] bg-white/90 p-4 shadow-[0_14px_44px_rgba(149,157,165,0.25)] backdrop-blur"
          style={{
            gridTemplateColumns: `repeat(${level.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${level.rows}, minmax(0, 1fr))`,
          }}
          role="img"
          aria-label="Tutorial crossword grid"
        >
          {cells}
        </div>
      </div>
    );
  }
);

GameField.displayName = 'GameField';

export default GameField;
