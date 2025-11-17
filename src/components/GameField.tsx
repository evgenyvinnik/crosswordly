import { forwardRef, useMemo } from 'react';
import { getCellKey } from '../lib/gridUtils';
import {
  CELL_SIZE_STYLE,
  BASE_PLAYABLE_CELL_STYLE,
  CLUE_NUMBER_BADGE_STYLE,
  BOARD_CONTAINER_STYLE,
} from '../styles/constants';

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
  placementId: GameLevelWord['id'];
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
          const key = getCellKey(row, col);
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
      return new Set(level.transparentCells.map(([row, col]) => getCellKey(row, col)));
    }, [level.transparentCells]);

    const overlayLetters = useMemo(() => {
      if (!overlay) {
        return new Map<string, { letter: string; isMismatch: boolean }>();
      }

      const placement = level.words.find((word) => word.id === overlay.placementId);
      if (!placement) {
        return new Map();
      }

      const map = new Map<string, { letter: string; isMismatch: boolean }>();
      overlay.letters.forEach((letter, index) => {
        const row = placement.startRow + (placement.direction === 'down' ? index : 0);
        const col = placement.startCol + (placement.direction === 'across' ? index : 0);
        map.set(getCellKey(row, col), {
          letter,
          isMismatch: Boolean(overlay.mismatchedIndices?.includes(index)),
        });
      });

      return map;
    }, [overlay, level.words]);

    const startNumbers = useMemo(() => {
      const map = new Map<string, number>();
      level.words.forEach((word, index) => {
        const key = getCellKey(word.startRow, word.startCol);
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
        const key = getCellKey(row, col);
        const isTransparentCell = transparentCellKeys?.has(key);
        const details = isTransparentCell ? undefined : playableCells.get(key);
        const overlayInfo = overlayLetters.get(key);
        const prefilledLetter = level.prefilledLetters?.[key];
        const isPrefilledCell = prefilledLetter !== undefined;
        const committedLetter = committedLetters[key];
        const hasPlayerCommit = Boolean(committedLetter) && !isPrefilledCell;
        const hasOverlay = Boolean(overlayInfo);
        const isErrorOverlayCell = hasOverlay && overlay?.status === 'error';
        const isPreviewOverlayCell = hasOverlay && overlay?.status === 'preview';
        const letter = isPrefilledCell
          ? (prefilledLetter ?? '')
          : (overlayInfo?.letter ?? committedLetter ?? '');

        let className = `${BASE_PLAYABLE_CELL_STYLE} ${CELL_SIZE_STYLE}`;

        if (!details) {
          className += ' border-transparent bg-transparent text-transparent';
        } else {
          if (isPrefilledCell) {
            className += ' bg-[#6aaa64] border-[#6aaa64] text-white shadow-inner';
          } else if (isErrorOverlayCell) {
            className += ' bg-[#c9b458] border-[#c9b458] text-white cell-pop';
          } else if (isPreviewOverlayCell) {
            className += ' border-[#6aaa64] bg-[#eef4ec] text-[#1a1a1b]';
          } else if (hasPlayerCommit) {
            className += ' bg-[#787c7e] border-[#787c7e] text-white';
          } else {
            className += ' border-[#d3d6da] bg-white/80 text-transparent';
          }

          if (
            !hasOverlay &&
            !hasPlayerCommit &&
            !isPrefilledCell &&
            activeDirection &&
            details.directions.includes(activeDirection)
          ) {
            className += ' border-[#6aaa64]';
          }
        }

        const clueNumber = startNumbers.get(key);

        const isTutorialAnchor =
          level.id === 'tutorial' && key === '1-2' && level.prefilledLetters?.[key] === 'a';

        cells.push(
          <div
            key={key}
            className={className}
            data-cell-key={key}
            data-letter-anchor={isTutorialAnchor ? 'tutorial-a' : undefined}
            aria-hidden={!letter}
          >
            {clueNumber !== undefined ? (
              <span className={CLUE_NUMBER_BADGE_STYLE}>{clueNumber}</span>
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
          className={BOARD_CONTAINER_STYLE}
          style={{
            gridTemplateColumns: `repeat(${level.grid.width}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${level.grid.height}, minmax(0, 1fr))`,
          }}
          role="img"
          aria-label={level.name ? `${level.name} crossword grid` : 'Crossword puzzle grid'}
        >
          {cells}
        </div>
      </div>
    );
  },
);

GameField.displayName = 'GameField';

export default GameField;
