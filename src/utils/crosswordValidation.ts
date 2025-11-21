import { getCellKey } from '../lib/gridUtils';
import { GameLevel, GameLevelWord } from '../components/game/GameField';

/**
 * Validates if a word is correctly placed in the crossword
 */
export function validateWordPlacement(
  word: GameLevelWord,
  typedLetters: Record<string, string>,
): boolean {
  for (let i = 0; i < word.word.length; i++) {
    const row = word.startRow + (word.direction === 'down' ? i : 0);
    const col = word.startCol + (word.direction === 'across' ? i : 0);
    const key = getCellKey(row, col);
    const typed = typedLetters[key];
    const expected = word.word[i];
    if (!typed || typed !== expected) {
      return false;
    }
  }
  return true;
}

/**
 * Gets all cells that are protected (part of correct words)
 */
export function getProtectedCells(
  puzzleLevel: GameLevel,
  correctWords: Set<string>,
  excludeWordId: GameLevelWord['id'],
): Set<string> {
  const protectedCells = new Set<string>();

  puzzleLevel.words.forEach((word) => {
    if (word.id === excludeWordId) return;

    const isMarkedCorrect = correctWords.has(word.id.toString());
    if (isMarkedCorrect) {
      for (let i = 0; i < word.word.length; i++) {
        const r = word.startRow + (word.direction === 'down' ? i : 0);
        const c = word.startCol + (word.direction === 'across' ? i : 0);
        const cellKey = getCellKey(r, c);
        protectedCells.add(cellKey);
      }
    }
  });

  return protectedCells;
}

/**
 * Gets a map of protected cells to their correct letters
 */
export function getProtectedLetters(
  puzzleLevel: GameLevel,
  correctWords: Set<string>,
): Map<string, string> {
  const protectedLetters = new Map<string, string>();

  puzzleLevel.words.forEach((word) => {
    if (correctWords.has(word.id.toString())) {
      for (let i = 0; i < word.word.length; i++) {
        const r = word.startRow + (word.direction === 'down' ? i : 0);
        const c = word.startCol + (word.direction === 'across' ? i : 0);
        const cellKey = getCellKey(r, c);
        protectedLetters.set(cellKey, word.word[i]);
      }
    }
  });

  return protectedLetters;
}

/**
 * Clears letters from an incorrect word while preserving protected letters
 */
export function clearIncorrectWord(
  word: GameLevelWord,
  currentLetters: Record<string, string>,
  protectedCells: Set<string>,
  protectedLetters: Map<string, string>,
): Record<string, string> {
  const next = { ...currentLetters };

  for (let i = 0; i < word.word.length; i++) {
    const row = word.startRow + (word.direction === 'down' ? i : 0);
    const col = word.startCol + (word.direction === 'across' ? i : 0);
    const key = getCellKey(row, col);
    const isProtected = protectedCells.has(key);

    if (isProtected) {
      const correctLetter = protectedLetters.get(key);
      if (correctLetter) {
        next[key] = correctLetter;
      }
    } else {
      delete next[key];
    }
  }

  return next;
}
