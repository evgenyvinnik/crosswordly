/**
 * Grid utilities for crossword puzzle manipulation
 */

/**
 * Generate a unique key for a grid cell
 */
export function getCellKey(row: number, col: number): string {
  return `${row}-${col}`;
}

/**
 * Parse a cell key back into row and column coordinates
 */
export function parseCellKey(key: string): { row: number; col: number } {
  const [row, col] = key.split('-').map(Number);
  return { row, col };
}
