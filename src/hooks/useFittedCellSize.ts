import { useLayoutEffect, useState, type CSSProperties, type RefObject } from 'react';

/** Letter size relative to the cell, matching the ratio of the default cell size classes. */
const CELL_FONT_RATIO = 0.55;
/** Largest cell a board grows to on tablets and desktops. */
const MAX_GROWN_CELL_PX = 88;
/** Space left free under the board, or under whatever has to stay on screen with it. */
const BOTTOM_MARGIN_PX = 24;

/**
 * Lets the board grow to fill the screen height on tablets and desktops (see `CELL_SIZE_STYLE`).
 */
export type HeightFit = {
  /** Number of grid rows */
  rows: number;
  /**
   * Layout around the board. Its children that are stacked under the board, such as the word bank
   * on an iPad in portrait, stay on screen together with the board, so a word can be dragged from
   * the bank to any slot without scrolling.
   */
  layoutRef: RefObject<HTMLElement | null>;
};

/**
 * Returns the height of the layout children stacked under the board, plus the gap above them.
 * Children beside the board (the word bank in landscape) do not count.
 */
const getStackedBelowHeight = (layout: HTMLElement, boardBottom: number) => {
  let top = Number.POSITIVE_INFINITY;
  let bottom = Number.NEGATIVE_INFINITY;
  for (const child of Array.from(layout.children)) {
    const rect = child.getBoundingClientRect();
    if (rect.height > 0 && rect.top >= boardBottom - 1) {
      top = Math.min(top, rect.top);
      bottom = Math.max(bottom, rect.bottom);
    }
  }
  if (bottom < top) {
    return 0;
  }
  return bottom - top + (parseFloat(window.getComputedStyle(layout).rowGap) || 0);
};

/**
 * Hook that keeps crossword cells small enough for the whole grid to fit the width available to
 * the board. The cell size classes cap themselves at `--cell-max` and `--cell-font-max` (see
 * `CELL_SIZE_STYLE`), so wide grids (9 or 11 columns) shrink on phones and narrow Split View
 * windows instead of overlapping and spilling off the board. The board's parent must have a
 * width that does not depend on the board itself.
 *
 * With `heightFit`, it also sets `--cell-grow` and `--cell-grow-font`: the largest cell that
 * still fits the width, the screen height and `MAX_GROWN_CELL_PX`. From the `sm` breakpoint the
 * cell size classes grow to it, but never below their default size, so on iPads and desktops the
 * board uses the space instead of looking like a phone layout. Phones in portrait are unaffected.
 *
 * @param boardRef - Reference to the grid element; its padding, border and gaps are accounted for
 * @param columns - Number of grid columns
 * @param heightFit - Rows and surrounding layout, for boards that grow to fill the screen
 * @returns Inline style defining the custom properties, or undefined before the first measurement
 */
export function useFittedCellSize(
  boardRef: RefObject<HTMLElement | null>,
  columns: number,
  heightFit?: HeightFit,
) {
  const [size, setSize] = useState<{ max: number; grow: number | null } | null>(null);
  const rows = heightFit?.rows;
  const layoutRef = heightFit?.layoutRef;

  useLayoutEffect(() => {
    const board = boardRef.current;
    const container = board?.parentElement;
    if (!board || !container || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    let layout: HTMLElement | null = null;
    const update = () => {
      const style = window.getComputedStyle(board);
      const chromeX =
        parseFloat(style.paddingLeft) +
        parseFloat(style.paddingRight) +
        parseFloat(style.borderLeftWidth) +
        parseFloat(style.borderRightWidth);
      const gapX = parseFloat(style.columnGap) || 0;
      const max = Math.floor((container.clientWidth - chromeX - gapX * (columns - 1)) / columns);

      let grow: number | null = null;
      if (rows && layout) {
        const chromeY =
          parseFloat(style.paddingTop) +
          parseFloat(style.paddingBottom) +
          parseFloat(style.borderTopWidth) +
          parseFloat(style.borderBottomWidth);
        const gapY = parseFloat(style.rowGap) || 0;
        const rect = board.getBoundingClientRect();
        // Neither the board's position nor what is stacked under it depends on the board's size,
        // so growing the board never feeds back into this measurement
        const available =
          window.innerHeight -
          (rect.top + window.scrollY) -
          getStackedBelowHeight(layout, rect.bottom) -
          BOTTOM_MARGIN_PX;
        const heightFitPx = Math.floor((available - chromeY - gapY * (rows - 1)) / rows);
        grow = Math.max(0, Math.min(max, heightFitPx, MAX_GROWN_CELL_PX));
      }

      setSize((previous) =>
        previous?.max === max && previous.grow === grow ? previous : { max, grow },
      );
    };

    const observer = new ResizeObserver(update);
    observer.observe(container);
    update();
    // The screen height changes on rotation and when an iPad window is resized
    window.addEventListener('resize', update);

    // The layout around the board only gets its ref once this commit finishes, after the board's
    // own layout effect, so it is picked up in a microtask. Only the layout children beside or
    // under the board are observed: their size never depends on the board, so growing the board
    // cannot trigger another measurement (observing the layout itself, an ancestor of the
    // container, reported a ResizeObserver loop every time a level opened).
    let isActive = true;
    if (layoutRef) {
      queueMicrotask(() => {
        layout = layoutRef.current;
        if (!isActive || !layout) {
          return;
        }
        for (const child of Array.from(layout.children)) {
          if (!child.contains(board)) {
            observer.observe(child);
          }
        }
        update();
      });
    }

    return () => {
      isActive = false;
      observer.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [boardRef, columns, rows, layoutRef]);

  if (size === null) {
    return undefined;
  }

  return {
    '--cell-max': `${size.max}px`,
    '--cell-font-max': `${Math.floor(size.max * CELL_FONT_RATIO)}px`,
    ...(size.grow !== null && {
      '--cell-grow': `${size.grow}px`,
      '--cell-grow-font': `${Math.floor(size.grow * CELL_FONT_RATIO)}px`,
    }),
  } as CSSProperties;
}
