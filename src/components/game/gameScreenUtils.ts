import type { GameLevel, GameLevelWord } from './GameField';
import { GUESS_WORDS } from '../../words/words';

type GuessWordDictionary = Record<string, string>;
type GuessWordEntry = { word: string; definition: string };

const WORD_DEFINITIONS = GUESS_WORDS as GuessWordDictionary;

const GUESS_WORD_ENTRIES: GuessWordEntry[] = Object.entries(WORD_DEFINITIONS).map(
  ([word, definition]) => ({
    word,
    definition,
  }),
);

const WORD_BANK_SIZE = 16;

export type GameWord = {
  id: string | number;
  word: string;
  state: 'idle' | 'locked';
  direction?: 'across' | 'down';
  placementId?: GameLevelWord['id'];
  clueNumber?: number;
  clueId?: string | number;
  definition?: string;
  bankIndex: number;
  isTarget: boolean;
};

export const buildTargetWords = (level: GameLevel): Omit<GameWord, 'bankIndex'>[] =>
  level.words.map((word) => {
    const normalizedWord = word.word;
    return {
      id: word.id ?? normalizedWord,
      word: normalizedWord,
      state: 'idle',
      direction: word.direction,
      clueNumber: word.clueNumber,
      clueId: word.id,
      definition: word.clue ?? WORD_DEFINITIONS[normalizedWord],
      isTarget: true,
    };
  });

/**
 * Generates a random word bank for the game level.
 * Includes the target words required for the puzzle and fills the rest with random words
 * of similar lengths to create a challenge.
 *
 * @param level - The game level configuration
 * @returns Array of GameWord objects representing the word bank
 */
export const getRandomWordBank = (level: GameLevel): GameWord[] => {
  const targetWords = buildTargetWords(level);
  const excluded = new Set(targetWords.map((word) => word.word));
  const targetLengths = new Set(targetWords.map((word) => word.word.length));

  const filteredPool = GUESS_WORD_ENTRIES.filter(
    ({ word }) => targetLengths.has(word.length) && !excluded.has(word),
  );
  const fallbackPool = GUESS_WORD_ENTRIES.filter((entry) => !excluded.has(entry.word));
  const pool = filteredPool.length ? [...filteredPool] : [...fallbackPool];

  const selection: Omit<GameWord, 'bankIndex'>[] = [...targetWords];

  while (selection.length < WORD_BANK_SIZE && pool.length) {
    const index = Math.floor(Math.random() * pool.length);
    const [next] = pool.splice(index, 1);
    if (!next) {
      break;
    }
    selection.push({
      id: next.word,
      word: next.word,
      state: 'idle',
      definition: next.definition,
      isTarget: false,
    });
  }

  const shuffled = selection.slice(0, WORD_BANK_SIZE).sort(() => Math.random() - 0.5);

  return shuffled.map((entry, index) => ({
    ...entry,
    bankIndex: index + 1,
  }));
};
