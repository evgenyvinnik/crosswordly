import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import type { GameLevelWord, OverlayState, PlayableCellDetails, Direction } from './GameField';
import { BASE_PLAYABLE_CELL_STYLE } from '../../styles/constants';

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
