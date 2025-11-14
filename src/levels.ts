import type { GameLevel } from './components/GameField';

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
        puzzle: {
          id: 'tutorial',
          name: 'Tutorial',
          rows: 5,
          cols: 5,
          words: [
            {
              id: 'tutorial-across',
              direction: 'across',
              answer: 'start',
              start: { row: 1, col: 0 },
              clueNumber: 1,
              clue: 'Kick things off across the row.',
            },
            {
              id: 'tutorial-down',
              direction: 'down',
              answer: 'gamer',
              start: { row: 0, col: 2 },
              clueNumber: 2,
              clue: 'Stack the column with this word.',
            },
          ],
          prefilledLetters: { '1-2': 'A' },
          intersection: { row: 1, col: 2 },
        },
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
        puzzle: {
          id: 'pivot-point',
          name: 'Pivot Point',
          rows: 5,
          cols: 5,
          words: [
            {
              id: 'pivot-point-across',
              direction: 'across',
              answer: 'sound',
              start: { row: 2, col: 0 },
              clueNumber: 1,
              clue: 'Echoing tone sweeps across the row.',
            },
            {
              id: 'pivot-point-down',
              direction: 'down',
              answer: 'candy',
              start: { row: 0, col: 3 },
              clueNumber: 2,
              clue: 'Sugary drop falls through the column.',
            },
          ],
          intersection: { row: 2, col: 3 },
        },
      },
      {
        id: 'ember-beacon',
        title: 'Ember Beacon',
        description: 'Heat and light meet near the far column.',
        order: 3,
        isAvailable: true,
        puzzle: {
          id: 'ember-beacon',
          name: 'Ember Beacon',
          rows: 5,
          cols: 5,
          words: [
            {
              id: 'ember-beacon-across',
              direction: 'across',
              answer: 'flare',
              start: { row: 3, col: 0 },
              clueNumber: 1,
              clue: 'Blazing burst streaks across the row.',
            },
            {
              id: 'ember-beacon-down',
              direction: 'down',
              answer: 'ember',
              start: { row: 0, col: 4 },
              clueNumber: 2,
              clue: 'Glowing coal drops through the column.',
            },
          ],
          intersection: { row: 3, col: 4 },
        },
      },
      {
        id: 'signal-merge',
        title: 'Signal Merge',
        description: 'Guiding beams and steady climbs intersect near the top.',
        order: 4,
        isAvailable: true,
        puzzle: {
          id: 'signal-merge',
          name: 'Signal Merge',
          rows: 5,
          cols: 5,
          words: [
            {
              id: 'signal-merge-across',
              direction: 'across',
              answer: 'crane',
              start: { row: 0, col: 0 },
              clueNumber: 1,
              clue: 'Birdlike boom stretches across the first row.',
            },
            {
              id: 'signal-merge-down',
              direction: 'down',
              answer: 'rider',
              start: { row: 0, col: 1 },
              clueNumber: 2,
              clue: 'Passenger descends through the second column.',
            },
          ],
          intersection: { row: 0, col: 1 },
        },
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
