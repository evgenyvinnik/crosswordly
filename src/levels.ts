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

type PuzzleInputWord = Omit<GameLevelWord, 'clue'> & { clue?: string };

type PuzzleInput = Omit<GameLevel, 'transparentCells' | 'intersections' | 'words'> & {
  words: PuzzleInputWord[];
  transparentCells?: [number, number][];
  intersections?: { row: number; col: number }[];
};

const WORD_DEFINITIONS = GUESS_WORDS as Record<string, string>;

const createPuzzle = (input: PuzzleInput): GameLevel => {
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

  return {
    ...input,
    words: normalizedWords,
    prefilledLetters: normalizedPrefilledLetters,
    transparentCells: input.transparentCells ?? buildTransparentCells(input.grid, normalizedWords),
    intersections: input.intersections ?? buildIntersections(normalizedWords),
  };
};

export const LEVEL_CONFIGS: LevelsConfig[] = [
  {
    key: 'tutorial',
    label: 'Tutorial',
    levels: [
      {
        id: 'tutorial',
        title: 'Tutorial',
        description: 'Learn how to play with full instructions and guided clues.',
        order: 1,
        isAvailable: true,
        hasInstructions: true,
        puzzle: createPuzzle({
          id: 'tutorial',
          name: 'Tutorial',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'tutorial-across',
              direction: 'across',
              word: 'start',
              startRow: 1,
              startCol: 0,
              clueNumber: 1,
            },
            {
              id: 'tutorial-down',
              direction: 'down',
              word: 'gamer',
              startRow: 0,
              startCol: 2,
              clueNumber: 2,
            },
          ],
          prefilledLetters: { '1-2': 'a' },
        }),
      },
      {
        id: 'tutorial-trail-essay',
        title: 'Tutorial 2',
        description: 'Practice crossing with two guiding letters.',
        order: 2,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'tutorial-trail-essay',
          name: 'Trail & Essay',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'trail-across',
              direction: 'across',
              word: 'trail',
              startRow: 3,
              startCol: 0,
              clueNumber: 1,
            },
            {
              id: 'essay-down',
              direction: 'down',
              word: 'essay',
              startRow: 0,
              startCol: 2,
              clueNumber: 2,
            },
          ],
          prefilledLetters: {
            '3-3': 'i',
            '1-2': 's',
          },
        }),
      },
    ],
  },
  {
    key: 'two-words',
    label: '2 Words',
    levels: [
      {
        id: 'pivot-point',
        title: 'Pivot Point',
        description: 'Sound and sweets collide one column off center.',
        order: 2,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'pivot-point',
          name: 'Pivot Point',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'pivot-point-across',
              direction: 'across',
              word: 'sound',
              startRow: 2,
              startCol: 0,
              clueNumber: 1,
            },
            {
              id: 'pivot-point-down',
              direction: 'down',
              word: 'candy',
              startRow: 0,
              startCol: 3,
              clueNumber: 2,
            },
          ],
        }),
      },
      {
        id: 'ember-beacon',
        title: 'Ember Beacon',
        description: 'Heat and light meet near the far column.',
        order: 3,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'ember-beacon',
          name: 'Ember Beacon',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'ember-beacon-across',
              direction: 'across',
              word: 'flare',
              startRow: 3,
              startCol: 0,
              clueNumber: 1,
            },
            {
              id: 'ember-beacon-down',
              direction: 'down',
              word: 'ember',
              startRow: 0,
              startCol: 4,
              clueNumber: 2,
            },
          ],
        }),
      },
      {
        id: 'signal-merge',
        title: 'Signal Merge',
        description: 'Guiding beams and steady climbs intersect near the top.',
        order: 4,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'signal-merge',
          name: 'Signal Merge',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'signal-merge-across',
              direction: 'across',
              word: 'crane',
              startRow: 0,
              startCol: 0,
              clueNumber: 1,
            },
            {
              id: 'signal-merge-down',
              direction: 'down',
              word: 'rider',
              startRow: 0,
              startCol: 1,
              clueNumber: 2,
            },
          ],
        }),
      },
    ],
  },
  {
    key: 'three-words',
    label: '3 Words',
    levels: [
      {
        id: 'orbital-triad',
        title: 'Orbital Triad',
        description: 'One bold span supports two vertical ascents from the top row.',
        order: 1,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'orbital-triad',
          name: 'Orbital Triad',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'orbital-triad-across',
              direction: 'across',
              word: 'solar',
              startRow: 0,
              startCol: 0,
              clueNumber: 1,
            },
            {
              id: 'orbital-triad-down-1',
              direction: 'down',
              word: 'orbit',
              startRow: 0,
              startCol: 1,
              clueNumber: 2,
            },
            {
              id: 'orbital-triad-down-2',
              direction: 'down',
              word: 'arise',
              startRow: 0,
              startCol: 3,
              clueNumber: 3,
            },
          ],
        }),
      },
    ],
  },
  {
    key: 'four-words',
    label: '4 Words',
    levels: [
      {
        id: 'luminous-quartet',
        title: 'Luminous Quartet',
        description: 'Twin beams and twin spans outline a glowing square.',
        order: 1,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'luminous-quartet',
          name: 'Luminous Quartet',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'luminous-quartet-across',
              direction: 'across',
              word: 'gleam',
              startRow: 0,
              startCol: 0,
              clueNumber: 1,
            },
            {
              id: 'luminous-quartet-down-1',
              direction: 'down',
              word: 'graft',
              startRow: 0,
              startCol: 0,
              clueNumber: 2,
            },
            {
              id: 'luminous-quartet-down-2',
              direction: 'down',
              word: 'mirth',
              startRow: 0,
              startCol: 4,
              clueNumber: 3,
            },
            {
              id: 'luminous-quartet-across-2',
              direction: 'across',
              word: 'torch',
              startRow: 4,
              startCol: 0,
              clueNumber: 4,
            },
          ],
        }),
      },
    ],
  },
];

export const LEVEL_DEFINITIONS: LevelDefinition[] = LEVEL_CONFIGS.flatMap(
  (config) => config.levels,
);

const tutorialDefinition = LEVEL_DEFINITIONS.find((definition) => definition.id === 'tutorial');

if (!tutorialDefinition) {
  throw new Error('Tutorial level definition is required.');
}

export const TUTORIAL_LEVEL = tutorialDefinition.puzzle;
