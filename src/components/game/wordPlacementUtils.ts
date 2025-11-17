import type { GameLevel, GameLevelWord } from './GameField';
import { getCellKey } from '../../lib/gridUtils';
import type { GameWord } from './gameScreenUtils';

export type PlacedWord = {
  bankIndex: number;
  word: string;
  definition?: string;
  clueNumber?: number;
  placementId: string | number;
  direction: 'across' | 'down';
  wordId: string | number;
};

export const getPlacementKey = (placementId: GameLevelWord['id']) => placementId.toString();

export const buildEmptyPlacementState = (
  words: GameLevelWord[],
): Record<string, PlacedWord | null> =>
  words.reduce(
    (acc, word) => {
      acc[getPlacementKey(word.id)] = null;
      return acc;
    },
    {} as Record<string, PlacedWord | null>,
  );

/**
 * Validates if a word can be placed at a given position
 * Returns array of mismatched letter indices if invalid
 */
export const validateWordPlacement = (
  word: GameWord,
  placement: GameLevelWord,
  level: GameLevel,
  committedLetters: Record<string, string>,
): number[] => {
  const { direction } = placement;
  const candidateLetters = word.word.split('');
  const placementLength = placement.word.length;
  const mismatchedIndices: number[] = [];

  placement.word.split('').forEach((_, index) => {
    const letter = candidateLetters[index];
    const row = placement.startRow + (direction === 'down' ? index : 0);
    const col = placement.startCol + (direction === 'across' ? index : 0);
    const key = getCellKey(row, col);
    const required = level.prefilledLetters?.[key] ?? committedLetters[key] ?? '';

    if (!letter) {
      mismatchedIndices.push(index);
      return;
    }

    if (required && required !== letter) {
      mismatchedIndices.push(index);
    }
  });

  // Check if word is too long
  if (candidateLetters.length !== placementLength) {
    for (let i = placementLength; i < candidateLetters.length; i += 1) {
      mismatchedIndices.push(i);
    }
  }

  return mismatchedIndices;
};

/**
 * Builds the complete committed letters state from placements
 */
export const buildCommittedLetters = (
  placementsState: Record<string, PlacedWord | null>,
  placementsById: Map<string, GameLevelWord>,
  prefilledLetters?: Record<string, string>,
): Record<string, string> => {
  const base: Record<string, string> = {
    ...(prefilledLetters ?? {}),
  };

  Object.entries(placementsState).forEach(([placementKey, entry]) => {
    if (!entry) {
      return;
    }
    const placement = placementsById.get(placementKey);
    if (!placement) {
      return;
    }
    entry.word.split('').forEach((letter, index) => {
      const row = placement.startRow + (placement.direction === 'down' ? index : 0);
      const col = placement.startCol + (placement.direction === 'across' ? index : 0);
      base[getCellKey(row, col)] = letter;
    });
  });

  return base;
};
