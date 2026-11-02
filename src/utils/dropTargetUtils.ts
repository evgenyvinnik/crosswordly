import type { GameLevelWord } from '../components/game/GameField';

/**
 * Utility functions for drag-and-drop target calculations
 */

/**
 * How far outside a playable cell, as a share of the cell's width, a tap or a dragged word still
 * counts as aiming at it. Fingers are imprecise, so a word dropped in the gap between cells or just
 * beside a word slot snaps to that slot instead of going back to the word bank.
 */
const SNAP_DISTANCE_RATIO = 0.6;

/**
 * Finds the word slots running through the playable cell at, or nearest to, a point on the board.
 * Cells are measured from the DOM, so the board's padding and the gaps between cells are accounted
 * for. Where an across and a down slot cross, the slot whose line the point is closer to comes first.
 *
 * @param clientX - Horizontal position in client coordinates
 * @param clientY - Vertical position in client coordinates
 * @param boardElement - Grid element whose cells carry `data-cell-key`
 * @param cellPlacementIds - Placement keys of the slots running through each cell
 * @param placementsById - Slot definitions keyed by placement key
 * @returns Slots through the aimed-at cell, closest line first; empty when no cell is near enough
 */
export function findPlacementsAtPoint(
  clientX: number,
  clientY: number,
  boardElement: HTMLElement | null,
  cellPlacementIds: Map<string, string[]>,
  placementsById: Map<string, GameLevelWord>,
): GameLevelWord[] {
  if (!boardElement) {
    return [];
  }

  let nearest: { key: string; rect: DOMRect; distance: number } | null = null;
  for (const cell of boardElement.querySelectorAll<HTMLElement>('[data-cell-key]')) {
    const key = cell.dataset.cellKey;
    if (!key || !cellPlacementIds.has(key)) {
      continue;
    }
    const rect = cell.getBoundingClientRect();
    const dx = Math.max(rect.left - clientX, 0, clientX - rect.right);
    const dy = Math.max(rect.top - clientY, 0, clientY - rect.bottom);
    const distance = Math.hypot(dx, dy);
    if (distance <= rect.width * SNAP_DISTANCE_RATIO && (!nearest || distance < nearest.distance)) {
      nearest = { key, rect, distance };
    }
  }

  if (!nearest) {
    return [];
  }

  const centerX = nearest.rect.left + nearest.rect.width / 2;
  const centerY = nearest.rect.top + nearest.rect.height / 2;
  const lineDistance = (placement: GameLevelWord) =>
    placement.direction === 'across' ? Math.abs(clientY - centerY) : Math.abs(clientX - centerX);

  return (cellPlacementIds.get(nearest.key) ?? [])
    .map((placementId) => placementsById.get(placementId))
    .filter((placement): placement is GameLevelWord => placement !== undefined)
    .sort((a, b) => lineDistance(a) - lineDistance(b));
}
