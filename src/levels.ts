import type { GameLevel, GameLevelWord } from './components/GameField';

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
): Array<[number, number]> => {
  const occupied = new Set<string>();
  words.forEach((word) => {
    word.word.split('').forEach((_, index) => {
      const row = word.startRow + (word.direction === 'down' ? index : 0);
      const col = word.startCol + (word.direction === 'across' ? index : 0);
      occupied.add(`${row}-${col}`);
    });
  });
  const transparent: Array<[number, number]> = [];
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

type PuzzleInput = Omit<GameLevel, 'transparentCells' | 'intersections'> & {
  transparentCells?: Array<[number, number]>;
  intersections?: { row: number; col: number }[];
};

const createPuzzle = (input: PuzzleInput): GameLevel => ({
  ...input,
  transparentCells: input.transparentCells ?? buildTransparentCells(input.grid, input.words),
  intersections: input.intersections ?? buildIntersections(input.words),
});

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
              clue: 'Kick things off across the row.',
            },
            {
              id: 'tutorial-down',
              direction: 'down',
              word: 'gamer',
              startRow: 0,
              startCol: 2,
              clueNumber: 2,
              clue: 'Stack the column with this word.',
            },
          ],
          prefilledLetters: { '1-2': 'A' },
        }),
      },
      {
        id: 'tutorial-trail-essay',
        title: 'Trail & Essay',
        description: 'Practice crossing TRAIL and ESSAY with two guiding letters.',
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
              clue: 'Path that winds through the woods.',
            },
            {
              id: 'essay-down',
              direction: 'down',
              word: 'essay',
              startRow: 0,
              startCol: 2,
              clueNumber: 2,
              clue: 'Short written piece.',
            },
          ],
          prefilledLetters: {
            '3-3': 'I',
            '1-2': 'S',
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
              clue: 'Echoing tone sweeps across the row.',
            },
            {
              id: 'pivot-point-down',
              direction: 'down',
              word: 'candy',
              startRow: 0,
              startCol: 3,
              clueNumber: 2,
              clue: 'Sugary drop falls through the column.',
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
              clue: 'Blazing burst streaks across the row.',
            },
            {
              id: 'ember-beacon-down',
              direction: 'down',
              word: 'ember',
              startRow: 0,
              startCol: 4,
              clueNumber: 2,
              clue: 'Glowing coal drops through the column.',
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
              clue: 'Birdlike boom stretches across the first row.',
            },
            {
              id: 'signal-merge-down',
              direction: 'down',
              word: 'rider',
              startRow: 0,
              startCol: 1,
              clueNumber: 2,
              clue: 'Passenger descends through the second column.',
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
