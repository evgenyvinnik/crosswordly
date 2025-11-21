import type { GameLevel, GameLevelWord } from '../components/game/GameField';
import { GUESS_WORDS } from '../words/words';
import { getCellKey, parseCellKey } from './gridUtils';

export type LevelDefinition = {
  id: string;
  title: string;
  description: string;
  order: number;
  isAvailable: boolean;
  hasInstructions?: boolean;
  puzzle: GameLevel;
};

export type LevelsConfig = {
  key: string;
  label: string;
  levels: LevelDefinition[];
};

/**
 * Calculates the transparent (unused) cells in the puzzle grid by marking every cell that
 * is occupied by a word and returning the remaining coordinates.
 *
 * @param grid - The puzzle grid dimensions where the words will be placed.
 * @param words - All words included in the puzzle configuration.
 * @returns Array of coordinates representing cells that should remain transparent.
 */
const buildTransparentCells = (
  grid: GameLevel['grid'],
  words: GameLevelWord[],
): [number, number][] => {
  const occupied = new Set<string>();
  words.forEach((word) => {
    word.word.split('').forEach((_, index) => {
      const row = word.startRow + (word.direction === 'down' ? index : 0);
      const col = word.startCol + (word.direction === 'across' ? index : 0);
      occupied.add(getCellKey(row, col));
    });
  });
  const transparent: [number, number][] = [];
  for (let row = 0; row < grid.height; row += 1) {
    for (let col = 0; col < grid.width; col += 1) {
      if (!occupied.has(getCellKey(row, col))) {
        transparent.push([row, col]);
      }
    }
  }
  return transparent;
};

/**
 * Identifies all cells where at least two words intersect by comparing their coordinates.
 *
 * @param words - All words included in the puzzle configuration.
 * @returns Array of row/column objects describing every intersection point.
 */
const buildIntersections = (words: GameLevelWord[]) => {
  const cellMap = new Map<string, Set<GameLevelWord['direction']>>();
  words.forEach((word) => {
    word.word.split('').forEach((_, index) => {
      const row = word.startRow + (word.direction === 'down' ? index : 0);
      const col = word.startCol + (word.direction === 'across' ? index : 0);
      const key = getCellKey(row, col);
      const directions = cellMap.get(key) ?? new Set<GameLevelWord['direction']>();
      directions.add(word.direction);
      cellMap.set(key, directions);
    });
  });
  return Array.from(cellMap.entries())
    .filter(([, directions]) => directions.size > 1)
    .map(([key]) => parseCellKey(key));
};

/**
 * Assigns clue numbers to words following crossword conventions: scan rows top-to-bottom and
 * columns left-to-right, assigning shared numbers to words that start in the same cell.
 *
 * @param words - All words included in the puzzle configuration.
 * @returns Map of word IDs to their respective clue numbers.
 */
const buildClueNumbers = (words: GameLevelWord[]) => {
  const clueMap = new Map<string | number, number>();
  const positionToClueNumber = new Map<string, number>();
  let clueNumber = 1;

  // Sort words by position: top to bottom, left to right
  // When positions match, across comes before down (standard crossword convention)
  const sortedWords = [...words].sort((a, b) => {
    if (a.startRow !== b.startRow) {
      return a.startRow - b.startRow;
    }
    if (a.startCol !== b.startCol) {
      return a.startCol - b.startCol;
    }
    // Same position: across before down
    if (a.direction !== b.direction) {
      return a.direction === 'across' ? -1 : 1;
    }
    return 0;
  });

  sortedWords.forEach((word) => {
    const key = getCellKey(word.startRow, word.startCol);
    const existingClueNumber = positionToClueNumber.get(key);

    if (existingClueNumber !== undefined) {
      // This position already has a clue number, reuse it
      clueMap.set(word.id, existingClueNumber);
    } else {
      // New position, assign a new clue number
      clueMap.set(word.id, clueNumber);
      positionToClueNumber.set(key, clueNumber);
      clueNumber += 1;
    }
  });

  return clueMap;
};

type PuzzleInputWord = Omit<GameLevelWord, 'clue' | 'clueNumber'> & { clue?: string };

type PuzzleInput = Omit<
  GameLevel,
  'transparentCells' | 'intersections' | 'words' | 'id' | 'name'
> & {
  id?: string;
  name?: string;
  words: PuzzleInputWord[];
  transparentCells?: [number, number][];
  intersections?: { row: number; col: number }[];
};

const WORD_DEFINITIONS = GUESS_WORDS as Record<string, string>;

/**
 * Normalizes raw puzzle input by validating every word has a definition, computing clue numbers,
 * and deriving transparent cells/intersections when not explicitly supplied.
 *
 * @param input - Partial puzzle definition that may omit derived board metadata.
 * @returns Fully populated `GameLevel` ready for rendering and gameplay.
 */
export const createPuzzle = (input: PuzzleInput): GameLevel => {
  const normalizedWords = input.words.map((word) => ({
    ...word,
    word: word.word,
  }));

  normalizedWords.forEach((word) => {
    if (!WORD_DEFINITIONS[word.word]) {
      throw new Error(`Missing definition for word "${word.word}".`);
    }
  });

  const clueNumbers = buildClueNumbers(normalizedWords);
  const wordsWithClueNumbers = normalizedWords.map((word) => ({
    ...word,
    clueNumber: clueNumbers.get(word.id),
  }));

  return {
    id: input.id ?? '',
    name: input.name,
    ...input,
    words: wordsWithClueNumbers,
    transparentCells: input.transparentCells ?? buildTransparentCells(input.grid, normalizedWords),
    intersections: input.intersections ?? buildIntersections(normalizedWords),
  };
};
