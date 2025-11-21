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
