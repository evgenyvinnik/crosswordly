/**
 * Centralized style constants for game screen and related components
 */

// Main game panel styles
export const GAME_SCREEN_PANEL_STYLE =
  'relative w-full max-w-5xl rounded-[20px] border border-[#e2e5ea] bg-white/95 px-2 py-4 text-center shadow-[0_24px_80px_rgba(149,157,165,0.35)] backdrop-blur sm:rounded-[32px] sm:px-3 sm:py-4';

export const GAME_SCREEN_ACTIONS_STYLE = 'absolute inset-x-2 top-2 z-10 sm:inset-x-3 sm:top-3';

export const GAME_SCREEN_LAYOUT_STYLE =
  'mt-6 flex w-full flex-col items-center gap-3 sm:gap-3 lg:mt-4 lg:flex-row lg:items-start lg:justify-center lg:gap-4';

export const GAME_SCREEN_BOARD_COLUMN_STYLE =
  'order-1 flex w-full max-w-4xl flex-col items-center gap-3 sm:gap-4 lg:order-2 lg:w-auto lg:max-w-none';

export const GAME_SCREEN_DRAG_PREVIEW_STYLE =
  'pointer-events-none fixed z-50 flex -translate-x-1/2 -translate-y-1/2 items-center rounded-full bg-white px-6 py-3 text-lg font-semibold uppercase text-[#1a1a1b] shadow-[0_12px_30px_rgba(0,0,0,0.2)]';

// Section background style
export const GAME_SECTION_STYLE =
  'relative flex min-h-screen flex-col items-center justify-start bg-[#f6f5f0] px-1 py-2 text-[#1a1a1b] sm:px-2 sm:py-4';

// Word bank column styles
export const WORD_BANK_COLUMN_STYLE = 'w-full max-w-3xl lg:w-1/4 lg:max-w-none';

export const WORD_BANK_GRID_STYLE = 'grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-1';

// Direction cards container
export const DIRECTION_CARDS_CONTAINER_STYLE =
  'mt-4 w-full sm:mt-6 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2';
