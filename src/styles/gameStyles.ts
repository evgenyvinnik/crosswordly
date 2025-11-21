/**
 * Centralized style constants for game screen and related components
 */

// Main game panel styles
export const GAME_SCREEN_PANEL_STYLE =
  'relative w-full max-w-5xl rounded-[20px] border border-[#e2e5ea] bg-white/95 px-2 py-4 text-center shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur sm:rounded-[32px] sm:px-3 sm:py-4';

export const GAME_SCREEN_ACTIONS_STYLE = 'absolute inset-x-2 top-2 z-10 sm:inset-x-3 sm:top-3';

export const GAME_SCREEN_LAYOUT_STYLE =
  'mt-6 flex w-full flex-col items-center gap-3 sm:gap-3 lg:mt-4 lg:grid lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-start lg:justify-center lg:gap-4';

export const GAME_SCREEN_BOARD_COLUMN_STYLE =
  'order-1 flex w-full max-w-4xl flex-col items-center gap-3 sm:gap-4 lg:order-none lg:col-start-2 lg:row-start-1 lg:w-auto lg:max-w-none lg:justify-self-center';

export const GAME_SCREEN_SECTION_STYLE =
  'relative flex min-h-screen flex-col items-center justify-start bg-[#f6f5f0] px-1 py-2 text-[#1a1a1b] sm:px-2 sm:py-4';

export const GAME_SCREEN_LEFT_COLUMN_STYLE =
  'order-2 w-full lg:order-none lg:col-start-1 lg:row-start-1 lg:w-auto lg:justify-self-end lg:ml-8';

export const GAME_SCREEN_RIGHT_COLUMN_STYLE =
  'order-2 w-full lg:order-none lg:col-start-3 lg:row-start-1 lg:w-auto lg:justify-self-start lg:mr-8';

export const GAME_SCREEN_ACTIONS_CONTAINER_STYLE = 'mx-auto max-w-5xl';


// Word bank column styles
export const WORD_BANK_COLUMN_STYLE = 'w-full max-w-3xl lg:w-1/4 lg:max-w-none';

export const WORD_BANK_GRID_STYLE = 'grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1';

// Direction cards container
export const DIRECTION_CARDS_CONTAINER_STYLE =
  'mt-4 w-full sm:mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2';

// GameField styles
export const CELL_SIZE_STYLE =
  'h-9 w-9 text-[1.2rem] leading-[1] tracking-[0.06em] sm:h-12 sm:w-12 sm:text-[1.55rem] md:h-14 md:w-14 md:text-[1.9rem]';
export const BASE_PLAYABLE_CELL_STYLE =
  'relative flex items-center justify-center rounded-md border text-center font-semibold uppercase tracking-wide transition-colors duration-200';
export const CLUE_NUMBER_BADGE_STYLE =
  'pointer-events-none absolute left-0.5 top-0.5 text-[0.55rem] font-semibold leading-none text-[#5a5e64] sm:left-1 sm:top-1 sm:text-[0.7rem]';
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
