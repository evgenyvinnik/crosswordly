/**
 * Centralized style constants for consistent styling across components
 */

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
