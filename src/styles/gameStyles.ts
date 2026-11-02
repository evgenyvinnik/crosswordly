/**
 * Centralized style constants for game screen and related components
 */

// Main game panel styles
export const GAME_SCREEN_PANEL_STYLE =
  'relative w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl rounded-[20px] border border-[#e2e5ea] bg-white/95 px-2 py-4 text-center shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur sm:rounded-[32px] sm:px-3 sm:py-4';

export const GAME_SCREEN_ACTIONS_STYLE = 'absolute inset-x-2 top-2 z-10 sm:inset-x-3 sm:top-3';

// The word bank sits beside the board only on wide landscape screens (iPad and desktop). In
// portrait, including the 1024px wide 13" iPad, it stacks under the board so the board can grow
// to the full width instead of being squeezed between the two word columns.
export const GAME_SCREEN_LAYOUT_STYLE =
  'mt-6 flex w-full flex-col items-center gap-3 sm:gap-3 lg:landscape:mt-4 lg:landscape:grid lg:landscape:grid-cols-[auto_minmax(0,1fr)_auto] lg:landscape:items-start lg:landscape:justify-center lg:landscape:gap-4';

export const GAME_SCREEN_BOARD_COLUMN_STYLE =
  'order-1 flex w-full max-w-4xl flex-col items-center gap-3 sm:gap-4 lg:landscape:order-none lg:landscape:col-start-2 lg:landscape:row-start-1 lg:landscape:max-w-none';

export const GAME_SCREEN_SECTION_STYLE =
  'relative flex min-h-screen flex-col items-center justify-start bg-[#f6f5f0] px-1 py-2 text-[#1a1a1b] sm:px-2 sm:py-4';

export const GAME_SCREEN_LEFT_COLUMN_STYLE =
  'order-2 w-full lg:landscape:order-none lg:landscape:col-start-1 lg:landscape:row-start-1 lg:landscape:w-auto lg:landscape:justify-self-end lg:landscape:ml-4 xl:landscape:ml-8';

export const GAME_SCREEN_RIGHT_COLUMN_STYLE =
  'order-2 w-full lg:landscape:order-none lg:landscape:col-start-3 lg:landscape:row-start-1 lg:landscape:w-auto lg:landscape:justify-self-start lg:landscape:mr-4 xl:landscape:mr-8';

export const GAME_SCREEN_ACTIONS_CONTAINER_STYLE = 'mx-auto max-w-5xl lg:max-w-6xl xl:max-w-7xl';

// Word bank column styles
export const WORD_BANK_COLUMN_STYLE = 'w-full max-w-3xl lg:w-1/4 lg:max-w-none';

export const WORD_BANK_GRID_STYLE = 'grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1';

// Direction cards container
export const DIRECTION_CARDS_CONTAINER_STYLE =
  'mt-4 w-full sm:mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2';

// GameField styles
// Cells never grow past --cell-max / --cell-font-max (set by useFittedCellSize), so grids wider
// than the screen shrink to fit instead of overlapping. From `sm` up, a board that fits the screen
// height grows to --cell-grow / --cell-grow-font, but never below the default size, so iPads and
// desktops get a big board. Phones in portrait keep the fixed h-9 cells.
const CELL_FIT_STYLE =
  'max-h-(--cell-max) max-w-(--cell-max) text-[length:min(1.2rem,var(--cell-font-max,1.2rem))] sm:text-[length:min(max(1.55rem,var(--cell-grow-font,0px)),var(--cell-font-max,1.55rem))] md:text-[length:min(max(1.9rem,var(--cell-grow-font,0px)),var(--cell-font-max,1.9rem))]';
export const CELL_SIZE_STYLE = `h-9 w-9 leading-[1] tracking-[0.06em] sm:h-[max(3rem,var(--cell-grow,0px))] sm:w-[max(3rem,var(--cell-grow,0px))] md:h-[max(3.5rem,var(--cell-grow,0px))] md:w-[max(3.5rem,var(--cell-grow,0px))] ${CELL_FIT_STYLE}`;
// Grids larger than 7 cells use slightly smaller cells on desktop
export const LARGE_GRID_CELL_SIZE_STYLE = `h-9 w-9 leading-[1] tracking-[0.06em] sm:h-[max(3rem,var(--cell-grow,0px))] sm:w-[max(3rem,var(--cell-grow,0px))] ${CELL_FIT_STYLE}`;
export const BASE_PLAYABLE_CELL_STYLE =
  'relative flex items-center justify-center rounded-md border text-center font-semibold uppercase tracking-wide transition-colors duration-200';
export const CLUE_NUMBER_BADGE_STYLE =
  'pointer-events-none absolute left-0.5 top-0.5 text-[0.55rem] font-semibold leading-none text-[#5a5e64] sm:left-1 sm:top-1 sm:text-[length:clamp(0.7rem,calc(var(--cell-grow,0px)*0.15),0.9rem)]';
export const BOARD_CONTAINER_STYLE =
  'grid gap-2 rounded-[20px] border border-[#d3d6da] bg-white/95 p-3 shadow-[0_24px_60px_rgba(149,157,165,0.3)] backdrop-blur min-w-[240px] sm:gap-3 sm:rounded-[32px] sm:p-6 sm:min-w-[360px]';

// Common button styles
export const CLOSE_BUTTON_STYLE =
  'flex h-11 w-11 sm:h-16 sm:w-16 items-center justify-center rounded-full border border-[#d3d6da] bg-white/85 text-[#1a1a1b] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b]/40';

// Overlay styles
export const OVERLAY_STYLE =
  'fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6';

// Dialog/Panel styles
export const DIALOG_CONTAINER_STYLE =
  'relative w-full max-w-xl rounded-[28px] bg-white p-6 text-[#1a1a1b] shadow-[0_30px_120px_rgba(15,23,42,0.35)] sm:p-8';
