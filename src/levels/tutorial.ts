import type { GameLevel } from '../components/GameField';

export const TUTORIAL_LEVEL: GameLevel = {
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
};
