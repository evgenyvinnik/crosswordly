import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

/** Letter size relative to the cell, matching the ratio of the default cell size classes. */
const CELL_FONT_RATIO = 0.55;

/**
 * Hook that keeps crossword cells small enough for the whole grid to fit the width available to
 * the board. The cell size classes cap themselves at `--cell-max` and `--cell-font-max` (see
 * `CELL_SIZE_STYLE`), so wide grids (9 or 11 columns) shrink on phones and iPad portrait instead
 * of overlapping and spilling off the board. The board's parent must have a width that does not
 * depend on the board itself.
 *
 * @param boardRef - Reference to the grid element; its padding, border and column gap are accounted for
 * @param columns - Number of grid columns
 * @returns Inline style defining the custom properties, or undefined before the first measurement
 */
export function useFittedCellSize(boardRef: RefObject<HTMLElement | null>, columns: number) {
  const [cellMax, setCellMax] = useState<number | null>(null);

  useLayoutEffect(() => {
    const board = boardRef.current;
    const container = board?.parentElement;
    if (!board || !container || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const update = () => {
      const style = window.getComputedStyle(board);
      const chrome =
        parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight) +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.borderRightWidth);
      const gap = parseFloat(style.columnGap) || 0;
      setCellMax(Math.floor((container.clientWidth - chrome - gap * (columns - 1)) / columns));
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(container);
    return () => observer.disconnect();
  }, [boardRef, columns]);

  if (cellMax === null) {
    return undefined;
  }

  return {
    '--cell-max': `${cellMax}px`,
    '--cell-font-max': `${Math.floor(cellMax * CELL_FONT_RATIO)}px`,
  } as CSSProperties;
}
