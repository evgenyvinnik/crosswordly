/**
 * Utilities for encoding and decoding puzzle solutions for sharing
 */

export type PuzzleSolution = {
  levelId: string;
  across: string[];
  down: string[];
};

/**
 * Encode a puzzle solution to a base64 string for sharing
 */
export function encodePuzzleSolution(solution: PuzzleSolution): string {
  const json = JSON.stringify(solution);
  // Use browser's btoa for base64 encoding
  return btoa(json).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode a base64 string to a puzzle solution
 */
export function decodePuzzleSolution(encoded: string): PuzzleSolution | null {
  try {
    // Restore standard base64 format
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = base64 + '=='.slice(0, (4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    const solution = JSON.parse(json) as PuzzleSolution;

    // Validate the structure
    if (
      !solution ||
      typeof solution.levelId !== 'string' ||
      !Array.isArray(solution.across) ||
      !Array.isArray(solution.down)
    ) {
      return null;
    }

    return solution;
  } catch {
    return null;
  }
}
