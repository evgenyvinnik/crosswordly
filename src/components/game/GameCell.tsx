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
