import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type {
  GameLevelWord,
  OverlayState,
  PlayableCellDetails,
  Direction,
} from '../components/game/GameField';
import { BASE_PLAYABLE_CELL_STYLE } from '../styles/gameStyles';

/**
 * Builds an accessible aria-label for a crossword cell, including metadata about the word,
 * row/column indices, and the current letter (if any).
 * @param primaryWord The word that currently owns focus for the cell, if any.
 * @param row Zero-based row index for the cell.
 * @param col Zero-based column index for the cell.
 * @param letter The letter currently placed in the cell.
 */
export const buildCellAriaLabel = (
  primaryWord: GameLevelWord | undefined,
  row: number,
  col: number,
  letter: string,
) => {
  if (primaryWord) {
    const clueText = primaryWord.clueNumber ? ` ${primaryWord.clueNumber}` : '';
    const letterText = letter ? `, letter ${letter}` : ', empty';
    return `${primaryWord.direction} word${clueText}, cell ${row + 1}-${col + 1}${letterText}`;
  }

  return `Cell row ${row + 1}, column ${col + 1}${letter ? `, letter ${letter}` : ', empty'}`;
};

/**
 * Generates click and keyboard handlers that move focus to the supplied word when activated.
 * Returns noop handlers when no actionable word focus callback is provided.
 * @param primaryWord The primary word associated with the cell.
 * @param onWordFocus Callback used to request focus for a specific word by id.
 */
export const createWordFocusHandlers = (
  primaryWord: GameLevelWord | undefined,
  onWordFocus?: (wordId: GameLevelWord['id']) => void,
) => {
  if (!primaryWord || !onWordFocus) {
    return { handleClick: undefined, handleKeyDown: undefined } as const;
  }

  const focusWord = () => onWordFocus(primaryWord.id);

  const handleKeyDown = (event: ReactKeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      focusWord();
    }
  };

  return {
    handleClick: focusWord,
    handleKeyDown,
  } as const;
};

/**
 * Computes the CSS classes that represent the current visual state of a crossword cell.
 * Prefilled cells, overlays, and player commits each map to their own palette.
 * @param isPrefilledCell Whether the cell contains a prefilled letter.
 * @param hasOverlay Whether an overlay is currently displayed for the cell.
 * @param overlayStatus The status associated with the overlay state.
 * @param hasPlayerCommit Whether the player has committed a value to the cell.
 */
export const computeStateClasses = (
  isPrefilledCell: boolean,
  hasOverlay: boolean,
  overlayStatus: OverlayState['status'] | undefined,
  hasPlayerCommit: boolean,
) => {
  if (isPrefilledCell) {
    return ' bg-[#6aaa64] border-[#6aaa64] text-white shadow-inner';
  }
  if (hasOverlay) {
    return overlayStatus === 'error'
      ? ' bg-[#c9b458] border-[#c9b458] text-white cell-pop'
      : ' border-[#6aaa64] bg-[#eef4ec] text-[#1a1a1b]';
  }
  if (hasPlayerCommit) {
    return ' bg-[#787c7e] border-[#787c7e] text-white';
  }
  return ' border-[#d3d6da] bg-white/80 text-transparent';
};

/**
 * Determines whether a cell should be highlighted based on the active word direction and
 * whether higher priority states (overlay, commit, prefill) are present.
 * @param details Metadata describing which directions the cell participates in.
 * @param hasOverlay Whether an overlay is currently displayed for the cell.
 * @param hasPlayerCommit Whether the player has committed a value to the cell.
 * @param isPrefilledCell Whether the cell contains a prefilled letter.
 * @param activeDir The direction (across/down) that currently has focus.
 */
export const shouldHighlightCell = (
  details: PlayableCellDetails,
  hasOverlay: boolean,
  hasPlayerCommit: boolean,
  isPrefilledCell: boolean,
  activeDir: Direction | null | undefined,
) => {
  if (hasOverlay || hasPlayerCommit || isPrefilledCell || !activeDir) {
    return false;
  }
  return details.directions.includes(activeDir);
};

/**
 * Builds the final className string for a crossword cell by combining the base style,
 * computed state classes, and optional highlight ring when the cell participates in the
 * active word.
 * @param cellSizeStyle Tailwind classes that define the cell's size.
 * @param details Metadata describing which directions the cell participates in.
 * @param isPrefilledCell Whether the cell contains a prefilled letter.
 * @param hasOverlay Whether an overlay is currently displayed for the cell.
 * @param overlayStatus The status associated with the overlay state.
 * @param hasPlayerCommit Whether the player has committed a value to the cell.
 * @param activeDir The direction (across/down) that currently has focus.
 */
export const buildCellClassName = (
  cellSizeStyle: string,
  details: PlayableCellDetails,
  isPrefilledCell: boolean,
  hasOverlay: boolean,
  overlayStatus: OverlayState['status'] | undefined,
  hasPlayerCommit: boolean,
  activeDir: Direction | null | undefined,
) => {
  const baseClass = `${BASE_PLAYABLE_CELL_STYLE} ${cellSizeStyle}`;
  const stateClasses = computeStateClasses(
    isPrefilledCell,
    hasOverlay,
    overlayStatus,
    hasPlayerCommit,
  );
  const highlight = shouldHighlightCell(
    details,
    hasOverlay,
    hasPlayerCommit,
    isPrefilledCell,
    activeDir,
  );

  return `${baseClass}${stateClasses}${highlight ? ' ring-2 ring-[#6aaa64] ring-offset-2 ring-offset-[#f6f7f8]' : ''}`;
};
