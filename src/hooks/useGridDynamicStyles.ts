import { useMemo } from 'react';

/**
 * Hook to calculate dynamic cell sizing based on grid dimensions
 */
export function useGridDynamicStyles(gridWidth: number, gridHeight: number) {
  return useMemo(() => {
    const maxDimension = Math.max(gridWidth, gridHeight);

    // For grids larger than 7, adjust sizing
    if (maxDimension > 7) {
      const desktopCellSize = 'md:h-12 md:w-12';
      const mobilePadding = 'p-2';
      const gap = 'gap-1.5 sm:gap-2';

      return {
        cellSizeStyle: `h-9 w-9 text-[1.2rem] leading-[1] tracking-[0.06em] sm:h-12 sm:w-12 sm:text-[1.55rem] ${desktopCellSize} md:text-[1.9rem]`,
        boardContainerStyle: `grid rounded-[20px] border border-[#d3d6da] bg-white/95 ${mobilePadding} shadow-[0_24px_60px_rgba(149,157,165,0.3)] backdrop-blur sm:rounded-[32px] sm:p-4`,
        gapStyle: gap,
      };
    }

    // Default styles for smaller grids
    return {
      cellSizeStyle:
        'h-9 w-9 text-[1.2rem] leading-[1] tracking-[0.06em] sm:h-12 sm:w-12 sm:text-[1.55rem] md:h-14 md:w-14 md:text-[1.9rem]',
      boardContainerStyle:
        'grid gap-2 rounded-[20px] border border-[#d3d6da] bg-white/95 p-3 shadow-[0_24px_60px_rgba(149,157,165,0.3)] backdrop-blur min-w-[240px] sm:gap-3 sm:rounded-[32px] sm:p-6 sm:min-w-[360px]',
      gapStyle: 'gap-2 sm:gap-3',
    };
  }, [gridWidth, gridHeight]);
}
