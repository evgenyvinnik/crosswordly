import type { GameLevel, GameLevelWord } from './components/GameField';
import { GUESS_WORDS } from './words/words';

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

const buildTransparentCells = (
  grid: GameLevel['grid'],
  words: GameLevelWord[],
): [number, number][] => {
  const occupied = new Set<string>();
  words.forEach((word) => {
    word.word.split('').forEach((_, index) => {
      const row = word.startRow + (word.direction === 'down' ? index : 0);
      const col = word.startCol + (word.direction === 'across' ? index : 0);
      occupied.add(`${row}-${col}`);
    });
  });
  const transparent: [number, number][] = [];
  for (let row = 0; row < grid.height; row += 1) {
    for (let col = 0; col < grid.width; col += 1) {
      if (!occupied.has(`${row}-${col}`)) {
        transparent.push([row, col]);
      }
    }
  }
  return transparent;
};

const buildIntersections = (words: GameLevelWord[]) => {
  const cellMap = new Map<string, Set<GameLevelWord['direction']>>();
  words.forEach((word) => {
    word.word.split('').forEach((_, index) => {
      const row = word.startRow + (word.direction === 'down' ? index : 0);
      const col = word.startCol + (word.direction === 'across' ? index : 0);
      const key = `${row}-${col}`;
      const directions = cellMap.get(key) ?? new Set<GameLevelWord['direction']>();
      directions.add(word.direction);
      cellMap.set(key, directions);
    });
  });
  return Array.from(cellMap.entries())
    .filter(([, directions]) => directions.size > 1)
    .map(([key]) => {
      const [row, col] = key.split('-').map(Number);
      return { row, col };
    });
};

const buildLetterPlacements = (words: GameLevelWord[]) => {
  const placements = new Map<
    string,
    {
      letter: string;
      row: number;
      col: number;
    }
  >();

  words.forEach((word) => {
    word.word.split('').forEach((letter, index) => {
      const row = word.startRow + (word.direction === 'down' ? index : 0);
      const col = word.startCol + (word.direction === 'across' ? index : 0);
      const key = `${row}-${col}`;
      if (!placements.has(key)) {
        placements.set(key, { letter, row, col });
      }
    });
  });

  return placements;
};

const buildClueNumbers = (words: GameLevelWord[]) => {
  const clueMap = new Map<string | number, number>();
  let clueNumber = 1;

  // Sort words by position: top to bottom, left to right
  const sortedWords = [...words].sort((a, b) => {
    if (a.startRow !== b.startRow) {
      return a.startRow - b.startRow;
    }
    return a.startCol - b.startCol;
  });

  const processedPositions = new Set<string>();

  sortedWords.forEach((word) => {
    const key = `${word.startRow}-${word.startCol}`;
    if (!processedPositions.has(key)) {
      clueMap.set(word.id, clueNumber);
      clueNumber += 1;
      processedPositions.add(key);
    } else {
      clueMap.set(word.id, clueMap.get(key) || clueNumber);
    }
  });

  return clueMap;
};

const maybeApplyRandomColumnPrefills = (
  words: GameLevelWord[],
  currentPrefilled: Record<string, string> | undefined,
  desiredTotalPrefills: number,
) => {
  const resolvedPrefilled = { ...(currentPrefilled ?? {}) };
  const existingKeys = new Set(Object.keys(resolvedPrefilled));
  const neededPrefills = Math.max(0, desiredTotalPrefills - existingKeys.size);
  if (neededPrefills === 0) {
    return Object.keys(resolvedPrefilled).length ? resolvedPrefilled : undefined;
  }

  const letterPlacements = buildLetterPlacements(words);
  const cellsByColumn = new Map<number, { key: string; letter: string }[]>();

  letterPlacements.forEach(({ letter, col }, key) => {
    if (existingKeys.has(key)) {
      return;
    }
    const columnCells = cellsByColumn.get(col) ?? [];
    columnCells.push({ key, letter });
    cellsByColumn.set(col, columnCells);
  });

  const availableColumnEntries = Array.from(cellsByColumn.entries()).filter(
    ([, columnCells]) => columnCells.length > 0,
  );

  let prefillsAdded = 0;

  while (prefillsAdded < neededPrefills && availableColumnEntries.length > 0) {
    const columnIndex = Math.floor(Math.random() * availableColumnEntries.length);
    const [, columnCells] = availableColumnEntries.splice(columnIndex, 1)[0];
    if (!columnCells.length) {
      continue;
    }
    const cellIndex = Math.floor(Math.random() * columnCells.length);
    const cell = columnCells[cellIndex];
    resolvedPrefilled[cell.key] = cell.letter;
    existingKeys.add(cell.key);
    prefillsAdded += 1;
  }

  return Object.keys(resolvedPrefilled).length ? resolvedPrefilled : undefined;
};

type PuzzleInputWord = Omit<GameLevelWord, 'clue' | 'clueNumber'> & { clue?: string };

type PuzzleInput = Omit<GameLevel, 'transparentCells' | 'intersections' | 'words'> & {
  words: PuzzleInputWord[];
  transparentCells?: [number, number][];
  intersections?: { row: number; col: number }[];
};

const WORD_DEFINITIONS = GUESS_WORDS as Record<string, string>;

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

  const normalizedPrefilledLetters = input.prefilledLetters
    ? Object.fromEntries(Object.entries(input.prefilledLetters).map(([key, value]) => [key, value]))
    : undefined;

  const resolvedPrefilledLetters =
    normalizedWords.length === 5
      ? maybeApplyRandomColumnPrefills(normalizedWords, normalizedPrefilledLetters, 3)
      : normalizedPrefilledLetters;

  const clueNumbers = buildClueNumbers(normalizedWords);
  const wordsWithClueNumbers = normalizedWords.map((word) => ({
    ...word,
    clueNumber: clueNumbers.get(word.id),
  }));

  return {
    ...input,
    words: wordsWithClueNumbers,
    prefilledLetters: resolvedPrefilledLetters,
    transparentCells: input.transparentCells ?? buildTransparentCells(input.grid, normalizedWords),
    intersections: input.intersections ?? buildIntersections(normalizedWords),
  };
};
