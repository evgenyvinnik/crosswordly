import { memo } from 'react';
import { BASE_PLAYABLE_CELL_STYLE, CLUE_NUMBER_BADGE_STYLE } from '../../styles/constants';
import type { Direction } from './GameField';

const getStateClasses = (
  isPrefilledCell: boolean,
  hasOverlay: boolean,
  overlayStatus: GameCellProps['overlayStatus'],
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

const shouldHighlightActiveDirection = (
  hasOverlay: boolean,
  hasPlayerCommit: boolean,
  isPrefilledCell: boolean,
  activeDirection: Direction | null | undefined,
  cellDirections: Direction[],
) => {
  if (hasOverlay || hasPlayerCommit || isPrefilledCell || !activeDirection) {
    return false;
  }
  return cellDirections.includes(activeDirection);
};

type GameCellProps = {
  cellKey: string;
  cellSizeStyle: string;
  letter: string;
  clueNumber?: number;
  isPrefilledCell: boolean;
  hasOverlay: boolean;
  overlayStatus?: 'preview' | 'error';
  hasPlayerCommit: boolean;
  activeDirection?: Direction | null;
  cellDirections: Direction[];
  isTransparent?: boolean;
  isTutorialAnchor?: boolean;
};

/**
 * Renders a single cell in the game grid.
 * Handles the visual state of the cell based on whether it's prefilled, committed,
 * part of an overlay (preview/error), or active.
 *
 * @param props - Component properties
 * @param props.cellKey - Unique identifier for the cell
 * @param props.cellSizeStyle - CSS class for cell sizing
 * @param props.letter - The letter to display in the cell
 * @param props.clueNumber - Optional clue number to display
 * @param props.isPrefilledCell - Whether the cell contains a prefilled letter
 * @param props.hasOverlay - Whether the cell is part of an active overlay
 * @param props.overlayStatus - Status of the overlay (preview or error)
 * @param props.hasPlayerCommit - Whether the user has committed a letter to this cell
 * @param props.activeDirection - The currently active direction
 * @param props.cellDirections - Directions associated with this cell
 * @param props.isTransparent - Whether the cell is transparent (non-playable)
 * @param props.isTutorialAnchor - Whether this cell serves as an anchor for tutorial elements
 */
const GameCell = ({
  cellKey,
  cellSizeStyle,
  letter,
  clueNumber,
  isPrefilledCell,
  hasOverlay,
  overlayStatus,
  hasPlayerCommit,
  activeDirection,
  cellDirections,
  isTransparent,
  isTutorialAnchor,
}: GameCellProps) => {
  // Transparent/non-playable cell
  if (isTransparent) {
    return (
      <div
        key={cellKey}
        className={`${BASE_PLAYABLE_CELL_STYLE} ${cellSizeStyle} border-transparent bg-transparent text-transparent`}
        data-cell-key={cellKey}
        aria-hidden
      />
    );
  }

  const stateClasses = getStateClasses(isPrefilledCell, hasOverlay, overlayStatus, hasPlayerCommit);
  const highlightBorder = shouldHighlightActiveDirection(
    hasOverlay,
    hasPlayerCommit,
    isPrefilledCell,
    activeDirection,
    cellDirections,
  )
    ? ' border-[#6aaa64]'
    : '';

  const className = `${BASE_PLAYABLE_CELL_STYLE} ${cellSizeStyle}${stateClasses}${highlightBorder}`;

  return (
    <div
      key={cellKey}
      className={className}
      data-cell-key={cellKey}
      data-letter-anchor={isTutorialAnchor ? 'tutorial-a' : undefined}
      aria-hidden={!letter}
    >
      {clueNumber !== undefined ? (
        <span className={CLUE_NUMBER_BADGE_STYLE}>{clueNumber}</span>
      ) : null}
      {letter}
    </div>
  );
};

export default memo(GameCell);
