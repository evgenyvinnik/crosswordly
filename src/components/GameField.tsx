import { forwardRef, useMemo } from 'react';

export type Direction = 'across' | 'down';

export type GameLevelWord = {
  id: string | number;
  direction: Direction;
  word: string;
  startRow: number;
  startCol: number;
  clue?: string;
  clueNumber?: number;
};

export type GameLevel = {
  id: string;
  name?: string;
  grid: { width: number; height: number };
  words: GameLevelWord[];
  prefilledLetters?: Record<string, string>;
  transparentCells?: [number, number][];
  intersections?: { row: number; col: number }[];
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

const cellSizeClasses =
  'h-12 w-12 text-[1.55rem] leading-[1] tracking-[0.06em] sm:h-14 sm:w-14 sm:text-[1.9rem]';

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
        word.word.split('').forEach((_, index) => {
          const row = word.startRow + (word.direction === 'down' ? index : 0);
          const col = word.startCol + (word.direction === 'across' ? index : 0);
          const key = `${row}-${col}`;
          const existing = map.get(key) ?? {
            directions: [],
            indices: {} as Record<Direction, number>,
          };
          existing.directions = Array.from(new Set([...existing.directions, word.direction]));
          existing.indices[word.direction] = index;
          map.set(key, existing);
        });
      });

      return map;
    }, [level.words]);

    const transparentCellKeys = useMemo(() => {
      if (!level.transparentCells?.length) {
        return null;
      }
      return new Set(level.transparentCells.map(([row, col]) => `${row}-${col}`));
    }, [level.transparentCells]);

    const intersectionKeys = useMemo(() => {
      if (!level.intersections?.length) {
        return null;
      }
      return new Set(level.intersections.map(({ row, col }) => `${row}-${col}`));
    }, [level.intersections]);

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
        const row = placement.startRow + (placement.direction === 'down' ? index : 0);
        const col = placement.startCol + (placement.direction === 'across' ? index : 0);
        map.set(`${row}-${col}`, {
          letter,
          isMismatch: Boolean(overlay.mismatchedIndices?.includes(index)),
        });
      });

      return map;
    }, [overlay, level.words]);

    const startNumbers = useMemo(() => {
      const map = new Map<string, number>();
      level.words.forEach((word, index) => {
        const key = `${word.startRow}-${word.startCol}`;
        const resolvedNumber =
          word.clueNumber ?? (typeof word.id === 'number' ? word.id : index + 1);
        const existing = map.get(key);
        map.set(key, existing ? Math.min(existing, resolvedNumber) : resolvedNumber);
      });
      return map;
    }, [level.words]);

    const cells = [];

    for (let row = 0; row < level.grid.height; row += 1) {
      for (let col = 0; col < level.grid.width; col += 1) {
        const key = `${row}-${col}`;
        const isTransparentCell = transparentCellKeys?.has(key);
        const details = isTransparentCell ? undefined : playableCells.get(key);
        const isIntersection = intersectionKeys?.has(key);
        const letter =
          overlayLetters.get(key)?.letter ??
          committedLetters[key] ??
          level.prefilledLetters?.[key] ??
          '';

        let className = `relative flex items-center justify-center rounded-md border text-center font-semibold uppercase tracking-wide transition-colors duration-200 ${cellSizeClasses}`;

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

          if (
            !hasOverlay &&
            !isCommitted &&
            activeDirection &&
            details.directions.includes(activeDirection)
          ) {
            className += ' border-[#6aaa64]';
          }
        }

        const clueNumber = startNumbers.get(key);

        const isTutorialAnchor =
          level.id === 'tutorial' &&
          key === '1-2' &&
          level.prefilledLetters?.[key]?.toUpperCase() === 'A';

        cells.push(
          <div
            key={key}
            className={className}
            data-cell-key={key}
            data-letter-anchor={isTutorialAnchor ? 'tutorial-a' : undefined}
            aria-hidden={!letter}
          >
            {clueNumber !== undefined ? (
              <span className="pointer-events-none absolute left-1 top-1 text-[0.7rem] font-semibold leading-none text-[#5a5e64] sm:left-1.5 sm:top-1.5">
                {clueNumber}
              </span>
            ) : null}
            {letter}
          </div>,
        );
      }
    }

    return (
      <div className="inline-flex flex-col items-center gap-4">
        <div
          ref={ref}
          className="grid gap-3 rounded-[32px] border border-[#d3d6da] bg-white/95 p-6 shadow-[0_24px_60px_rgba(149,157,165,0.3)] backdrop-blur min-w-[260px] sm:min-w-[360px]"
          style={{
            gridTemplateColumns: `repeat(${level.grid.width}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${level.grid.height}, minmax(0, 1fr))`,
          }}
          role="img"
          aria-label={
            level.name ? `${level.name} crossword grid` : 'Crossword puzzle grid'
          }
        >
          {cells}
        </div>
      </div>
    );
  },
);

GameField.displayName = 'GameField';

export default GameField;
