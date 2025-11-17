import { createPuzzle } from './levelUtils';
import type { LevelDefinition, LevelsConfig } from './levelUtils';

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
            },
            {
              id: 'tutorial-down',
              direction: 'down',
              word: 'gamer',
              startRow: 0,
              startCol: 2,
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
            },
            {
              id: 'essay-down',
              direction: 'down',
              word: 'essay',
              startRow: 0,
              startCol: 2,
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
        id: 'midline-prism',
        title: 'Midline Prism',
        description: 'A sweeping glide meets a prismatic rise through the heart column.',
        order: 1,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'midline-prism',
          name: 'Midline Prism',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'midline-prism-across',
              direction: 'across',
              word: 'glide',
              startRow: 2,
              startCol: 0,
            },
            {
              id: 'midline-prism-down',
              direction: 'down',
              word: 'prism',
              startRow: 0,
              startCol: 2,
            },
          ],
        }),
      },
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
            },
            {
              id: 'pivot-point-down',
              direction: 'down',
              word: 'candy',
              startRow: 0,
              startCol: 3,
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
            },
            {
              id: 'ember-beacon-down',
              direction: 'down',
              word: 'ember',
              startRow: 0,
              startCol: 4,
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
            },
            {
              id: 'signal-merge-down',
              direction: 'down',
              word: 'rider',
              startRow: 0,
              startCol: 1,
            },
          ],
        }),
      },
      {
        id: 'ridge-relay',
        title: 'Ridge Relay',
        description: 'A brisk span carries a cresting climb tucked just inside the edge.',
        order: 5,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'ridge-relay',
          name: 'Ridge Relay',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'ridge-relay-across',
              direction: 'across',
              word: 'brisk',
              startRow: 1,
              startCol: 0,
            },
            {
              id: 'ridge-relay-down',
              direction: 'down',
              word: 'crest',
              startRow: 0,
              startCol: 1,
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
            },
            {
              id: 'orbital-triad-down-1',
              direction: 'down',
              word: 'orbit',
              startRow: 0,
              startCol: 1,
            },
            {
              id: 'orbital-triad-down-2',
              direction: 'down',
              word: 'arise',
              startRow: 0,
              startCol: 3,
            },
          ],
        }),
      },
      {
        id: 'h-bridge',
        title: 'H Bridge',
        description:
          'Two vertical pillars connected by a horizontal span form the shape of a letter.',
        order: 2,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'h-bridge',
          name: 'H Bridge',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'h-bridge-down-left',
              direction: 'down',
              word: 'heart',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'h-bridge-down-right',
              direction: 'down',
              word: 'caddy',
              startRow: 0,
              startCol: 4,
            },
            {
              id: 'h-bridge-across',
              direction: 'across',
              word: 'award',
              startRow: 2,
              startCol: 0,
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
            },
            {
              id: 'luminous-quartet-down-1',
              direction: 'down',
              word: 'graft',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'luminous-quartet-down-2',
              direction: 'down',
              word: 'mirth',
              startRow: 0,
              startCol: 4,
            },
            {
              id: 'luminous-quartet-across-2',
              direction: 'across',
              word: 'torch',
              startRow: 4,
              startCol: 0,
            },
          ],
        }),
      },
      {
        id: 'apex-peak',
        title: 'Apex Peak',
        description:
          'Two sides converge at a peak, linked by a bar across the middle with a final spine.',
        order: 2,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'apex-peak',
          name: 'Apex Peak',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'apex-peak-down-left',
              direction: 'down',
              word: 'sheet',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'apex-peak-down-right',
              direction: 'down',
              word: 'caret',
              startRow: 0,
              startCol: 4,
            },
            {
              id: 'apex-peak-across',
              direction: 'across',
              word: 'enter',
              startRow: 2,
              startCol: 0,
            },
            {
              id: 'apex-peak-down-center',
              direction: 'down',
              word: 'after',
              startRow: 0,
              startCol: 2,
            },
          ],
        }),
      },
      {
        id: 'hashtag-grid',
        title: 'Hashtag Grid',
        description:
          'Two vertical pillars intersect with two horizontal spans to form a crosshatch pattern.',
        order: 3,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'hashtag-grid',
          name: 'Hashtag Grid',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'hashtag-grid-down-left',
              direction: 'down',
              word: 'habit',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'hashtag-grid-down-right',
              direction: 'down',
              word: 'facet',
              startRow: 0,
              startCol: 4,
            },
            {
              id: 'hashtag-grid-across-top',
              direction: 'across',
              word: 'aroma',
              startRow: 1,
              startCol: 0,
            },
            {
              id: 'hashtag-grid-across-bottom',
              direction: 'across',
              word: 'irate',
              startRow: 3,
              startCol: 0,
            },
          ],
        }),
      },
      {
        id: 'diamond-cross',
        title: 'Diamond Cross',
        description: 'Four words meet in a diamond-like pattern with guided letters.',
        order: 4,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'diamond-cross',
          name: 'Diamond Cross',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'diamond-cross-down-1',
              direction: 'down',
              word: 'dream',
              startRow: 0,
              startCol: 1,
            },
            {
              id: 'diamond-cross-down-2',
              direction: 'down',
              word: 'media',
              startRow: 0,
              startCol: 3,
            },
            {
              id: 'diamond-cross-across-1',
              direction: 'across',
              word: 'dried',
              startRow: 1,
              startCol: 0,
            },
            {
              id: 'diamond-cross-across-2',
              direction: 'across',
              word: 'rapid',
              startRow: 3,
              startCol: 0,
            },
          ],
          prefilledLetters: {
            '0-1': 'd',
            '3-3': 'i',
          },
        }),
      },
    ],
  },
  {
    key: 'five-words',
    label: '5 Words',
    levels: [
      {
        id: 'celestial-column',
        title: 'Celestial Column',
        description: 'Sun and moon spans brace a central beam that pours straight down the middle.',
        order: 1,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'celestial-column',
          name: 'Celestial Column',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'celestial-column-across-1',
              direction: 'across',
              word: 'solar',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'celestial-column-down-left',
              direction: 'down',
              word: 'still',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'celestial-column-down-right',
              direction: 'down',
              word: 'riser',
              startRow: 0,
              startCol: 4,
            },
            {
              id: 'celestial-column-down-center',
              direction: 'down',
              word: 'lumen',
              startRow: 0,
              startCol: 2,
            },
            {
              id: 'celestial-column-across-2',
              direction: 'across',
              word: 'lunar',
              startRow: 4,
              startCol: 0,
            },
          ],
          prefilledLetters: {
            '2-0': 'i',
            '1-2': 'u',
            '3-4': 'e',
          },
        }),
      },
      {
        id: 'inner-span',
        title: 'Inner Span',
        description:
          'Twin pillars burn on the edges while a horizontal core links them across the center.',
        order: 2,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'inner-span',
          name: 'Inner Span',
          grid: { width: 5, height: 5 },
          words: [
            {
              id: 'inner-span-across-1',
              direction: 'across',
              word: 'sight',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'inner-span-down-left',
              direction: 'down',
              word: 'shine',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'inner-span-down-right',
              direction: 'down',
              word: 'torch',
              startRow: 0,
              startCol: 4,
            },
            {
              id: 'inner-span-across-center',
              direction: 'across',
              word: 'inner',
              startRow: 2,
              startCol: 0,
            },
            {
              id: 'inner-span-across-2',
              direction: 'across',
              word: 'earth',
              startRow: 4,
              startCol: 0,
            },
          ],
          prefilledLetters: {
            '1-0': 'h',
            '2-2': 'n',
            '4-4': 'h',
          },
        }),
      },
      {
        id: 'vertical-tower',
        title: 'Vertical Tower',
        description: 'Five words form a tall tower with crossing patterns.',
        order: 3,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'vertical-tower',
          name: 'Vertical Tower',
          grid: { width: 5, height: 7 },
          words: [
            {
              id: 'vertical-tower-down-1',
              direction: 'down',
              word: 'trend',
              startRow: 0,
              startCol: 4,
            },
            {
              id: 'vertical-tower-down-2',
              direction: 'down',
              word: 'arena',
              startRow: 2,
              startCol: 1,
            },
            {
              id: 'vertical-tower-across-1',
              direction: 'across',
              word: 'trait',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'vertical-tower-across-2',
              direction: 'across',
              word: 'train',
              startRow: 3,
              startCol: 0,
            },
            {
              id: 'vertical-tower-across-3',
              direction: 'across',
              word: 'nadir',
              startRow: 6,
              startCol: 0,
            },
          ],
          prefilledLetters: {
            '2-1': 'a',
            '6-1': 'a',
          },
        }),
      },
    ],
  },
  {
    key: 'six-words',
    label: '6 Words',
    levels: [
      {
        id: 'hexagonal-web',
        title: 'Hexagonal Web',
        description: 'Six interwoven words create a complex web of intersections.',
        order: 1,
        isAvailable: true,
        puzzle: createPuzzle({
          id: 'hexagonal-web',
          name: 'Hexagonal Web',
          grid: { width: 5, height: 7 },
          words: [
            {
              id: 'hexagonal-web-down-1',
              direction: 'down',
              word: 'sight',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'hexagonal-web-down-2',
              direction: 'down',
              word: 'anvil',
              startRow: 2,
              startCol: 4,
            },
            {
              id: 'hexagonal-web-down-3',
              direction: 'down',
              word: 'aware',
              startRow: 0,
              startCol: 2,
            },
            {
              id: 'hexagonal-web-across-1',
              direction: 'across',
              word: 'snack',
              startRow: 0,
              startCol: 0,
            },
            {
              id: 'hexagonal-web-across-2',
              direction: 'across',
              word: 'heron',
              startRow: 3,
              startCol: 0,
            },
            {
              id: 'hexagonal-web-across-3',
              direction: 'across',
              word: 'viral',
              startRow: 6,
              startCol: 0,
            },
          ],
          prefilledLetters: {
            '1-0': 'i',
            '3-4': 'n',
          },
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
