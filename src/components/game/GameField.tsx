import { forwardRef, useMemo } from 'react';
import { getCellKey } from '../../lib/gridUtils';
import {
  CELL_SIZE_STYLE,
  BASE_PLAYABLE_CELL_STYLE,
  CLUE_NUMBER_BADGE_STYLE,
  BOARD_CONTAINER_STYLE,
} from '../../styles/constants';

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
  focusedWordId?: GameLevelWord['id'] | null;
  onWordFocus?: (wordId: GameLevelWord['id']) => void;
};

const GameField = forwardRef<HTMLDivElement, GameFieldProps>(
  ({ level, committedLetters, overlay, activeDirection, focusedWordId, onWordFocus }, ref) => {
    // Calculate dynamic styles based on grid size
    const { cellSizeStyle, boardContainerStyle, gapStyle } = useMemo(() => {
      const maxDimension = Math.max(level.grid.width, level.grid.height);

      // For grids larger than 7, adjust sizing
      if (maxDimension > 7) {
        // Reduce cell size slightly on desktop (keep text same size for snugness)
        const desktopCellSize = 'md:h-12 md:w-12';
        // Reduce padding/gap on mobile for larger grids
        const mobilePadding = 'p-2';
        const gap = 'gap-1.5 sm:gap-2';

        return {
          cellSizeStyle: `h-9 w-9 text-[1.2rem] leading-[1] tracking-[0.06em] sm:h-12 sm:w-12 sm:text-[1.55rem] ${desktopCellSize} md:text-[1.9rem]`,
          boardContainerStyle: `grid rounded-[20px] border border-[#d3d6da] bg-white/95 ${mobilePadding} shadow-[0_24px_60px_rgba(149,157,165,0.3)] backdrop-blur sm:rounded-[32px] sm:p-4`,
          gapStyle: gap,
        };
      }

      // Default styles for smaller grids
      return {
        cellSizeStyle: CELL_SIZE_STYLE,
        boardContainerStyle: BOARD_CONTAINER_STYLE,
        gapStyle: 'gap-2 sm:gap-3',
      };
    }, [level.grid.width, level.grid.height]);

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

    const getCellClassName = (
      details: ReturnType<typeof playableCells.get>,
      isPrefilledCell: boolean,
      hasOverlay: boolean,
      overlayStatus: OverlayState['status'] | undefined,
      hasPlayerCommit: boolean,
      activeDir: Direction | null | undefined,
    ) => {
      const baseClass = `${BASE_PLAYABLE_CELL_STYLE} ${cellSizeStyle}`;

      // Transparent/non-playable cell
      if (!details) {
        return `${baseClass} border-transparent bg-transparent text-transparent`;
      }

      // Determine cell state classes
      let stateClasses = '';
      if (isPrefilledCell) {
        stateClasses = ' bg-[#6aaa64] border-[#6aaa64] text-white shadow-inner';
      } else if (hasOverlay && overlayStatus === 'error') {
        stateClasses = ' bg-[#c9b458] border-[#c9b458] text-white cell-pop';
      } else if (hasOverlay && overlayStatus === 'preview') {
        stateClasses = ' border-[#6aaa64] bg-[#eef4ec] text-[#1a1a1b]';
      } else if (hasPlayerCommit) {
        stateClasses = ' bg-[#787c7e] border-[#787c7e] text-white';
      } else {
        stateClasses = ' border-[#d3d6da] bg-white/80 text-transparent';
      }

      // Highlight active direction border
      const isActiveDirCell =
        !hasOverlay &&
        !hasPlayerCommit &&
        !isPrefilledCell &&
        activeDir &&
        details.directions.includes(activeDir);

      const activeBorder = isActiveDirCell ? ' border-[#6aaa64]' : '';

      return baseClass + stateClasses + activeBorder;
    };

    const renderCell = (row: number, col: number) => {
      const key = getCellKey(row, col);
      const isTransparentCell = transparentCellKeys?.has(key);
      const details = isTransparentCell ? undefined : playableCells.get(key);

      // Early exit for transparent cells
      if (!details) {
        return (
          <div
            key={key}
            className={`${BASE_PLAYABLE_CELL_STYLE} ${cellSizeStyle} border-transparent bg-transparent text-transparent`}
            data-cell-key={key}
            aria-hidden
          />
        );
      }

      const overlayInfo = overlayLetters.get(key);
      const prefilledLetter = level.prefilledLetters?.[key];
      const isPrefilledCell = prefilledLetter !== undefined;
      const committedLetter = committedLetters[key];
      const hasPlayerCommit = Boolean(committedLetter) && !isPrefilledCell;
      const hasOverlay = Boolean(overlayInfo);

      const letter = prefilledLetter ?? overlayInfo?.letter ?? committedLetter ?? '';

      const className = getCellClassName(
        details,
        isPrefilledCell,
        hasOverlay,
        overlay?.status,
        hasPlayerCommit,
        activeDirection,
      );

      const clueNumber = startNumbers.get(key);
      const isTutorialAnchor = level.id === 'tutorial' && key === '1-2' && prefilledLetter === 'a';

      // Find which words include this cell
      const wordsAtCell = level.words.filter((word) => {
        for (let i = 0; i < word.word.length; i++) {
          const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
          const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
          if (wordRow === row && wordCol === col) return true;
        }
        return false;
      });

      // Only make the first cell of each word focusable
      const isFirstCellOfWord = wordsAtCell.some(
        (word) => word.startRow === row && word.startCol === col,
      );

      // Check if any word at this cell is focused
      const isCellInFocusedWord = focusedWordId
        ? wordsAtCell.some((word) => word.id === focusedWordId)
        : false;

      // Get the first word at this position for focus handling
      const primaryWord = wordsAtCell[0];

      const handleCellClick = () => {
        if (primaryWord && onWordFocus) {
          onWordFocus(primaryWord.id);
        }
      };

      const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.key === 'Enter' || e.key === ' ') && primaryWord && onWordFocus) {
          e.preventDefault();
          onWordFocus(primaryWord.id);
        }
      };

      // Add focused word styling
      const focusedWordClass = isCellInFocusedWord ? ' ring-2 ring-blue-500 ring-inset' : '';

      return (
        <button
          key={key}
          type="button"
          className={`${className}${focusedWordClass} cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6aaa64] focus:ring-offset-2 focus:z-10`}
          data-cell-key={key}
          data-word-id={primaryWord?.id}
          data-letter-anchor={isTutorialAnchor ? 'tutorial-a' : undefined}
          aria-label={
            primaryWord
              ? `${primaryWord.direction} word ${primaryWord.clueNumber || ''}, cell ${row + 1}-${col + 1}${letter ? `, letter ${letter}` : ', empty'}`
              : `Cell row ${row + 1}, column ${col + 1}${letter ? `, letter ${letter}` : ', empty'}`
          }
          tabIndex={isFirstCellOfWord ? 0 : -1}
          onClick={handleCellClick}
          onKeyDown={handleKeyDown}
        >
          {clueNumber !== undefined ? (
            <span className={CLUE_NUMBER_BADGE_STYLE} aria-hidden="true">
              {clueNumber}
            </span>
          ) : null}
          <span aria-hidden="true">{letter}</span>
        </button>
      );
    };

    const cells = [];
    for (let row = 0; row < level.grid.height; row += 1) {
      for (let col = 0; col < level.grid.width; col += 1) {
        cells.push(renderCell(row, col));
      }
    }

    return (
      <div className="inline-flex flex-col items-center gap-4">
        <div
          ref={ref}
          className={`${boardContainerStyle} ${gapStyle}`}
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
