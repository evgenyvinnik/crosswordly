import { getCellKey } from './gridUtils';
import type { GameLevelWord } from '../components/game/GameField';

/**
 * Utility functions for drag-and-drop target calculations
 */

/**
 * Computes the drop target placement based on pointer position over the board
 */
export function computeDropTarget(
  clientX: number,
  clientY: number,
  boardElement: HTMLDivElement | null,
  gridWidth: number,
  gridHeight: number,
  cellPlacementIds: Map<string, string[]>,
  placementsById: Map<string, GameLevelWord>,
): GameLevelWord | null {
  if (!boardElement) {
    return null;
  }

  const rect = boardElement.getBoundingClientRect();
  if (clientX < rect.left || clientX > rect.right || clientY < rect.top || clientY > rect.bottom) {
    return null;
  }

  const cellWidth = rect.width / gridWidth;
  const cellHeight = rect.height / gridHeight;
  const colIndex = Math.min(
    gridWidth - 1,
    Math.max(0, Math.floor((clientX - rect.left) / cellWidth)),
  );
  const rowIndex = Math.min(
    gridHeight - 1,
    Math.max(0, Math.floor((clientY - rect.top) / cellHeight)),
  );
  const cellKey = getCellKey(rowIndex, colIndex);
  const placementIdsAtCell = cellPlacementIds.get(cellKey);

  if (!placementIdsAtCell?.length) {
    return null;
  }

  if (placementIdsAtCell.length === 1) {
    const placement = placementsById.get(placementIdsAtCell[0]);
    return placement ?? null;
  }

  const cellCenterX = rect.left + (colIndex + 0.5) * cellWidth;
  const cellCenterY = rect.top + (rowIndex + 0.5) * cellHeight;
  let bestPlacement: GameLevelWord | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  placementIdsAtCell.forEach((placementId) => {
    const placement = placementsById.get(placementId);
    if (!placement) {
      return;
    }
    const axisDistance =
      placement.direction === 'across'
        ? Math.abs(clientY - cellCenterY)
        : Math.abs(clientX - cellCenterX);
    if (axisDistance < bestDistance) {
      bestDistance = axisDistance;
      bestPlacement = placement;
    }
  });

  return bestPlacement;
}
