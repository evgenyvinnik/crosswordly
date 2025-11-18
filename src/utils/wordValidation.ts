import { getCellKey } from '../lib/gridUtils';
import type { GameLevelWord } from '../components/game/GameField';

/**
 * Utility functions for word validation in crossword puzzles
 */

/**
 * Validates a word against the puzzle grid
 * @returns true if word is correct, false otherwise
 */
export function validateWordInGrid(
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
 * Clears incorrect word from the grid while preserving correct intersecting words
 */
export function clearIncorrectWord(
  word: GameLevelWord,
  currentLetters: Record<string, string>,
  correctWords: Set<string>,
  allWords: GameLevelWord[],
): Record<string, string> {
  const next = { ...currentLetters };

  // Find all cells that belong to OTHER words that have been validated as CORRECT
  const protectedCells = new Set<string>();
  const protectedLetters = new Map<string, string>();

  allWords.forEach((otherWord) => {
    if (otherWord.id === word.id) return;

    if (correctWords.has(otherWord.id.toString())) {
      for (let i = 0; i < otherWord.word.length; i++) {
        const r = otherWord.startRow + (otherWord.direction === 'down' ? i : 0);
        const c = otherWord.startCol + (otherWord.direction === 'across' ? i : 0);
        const cellKey = getCellKey(r, c);
        protectedCells.add(cellKey);
        protectedLetters.set(cellKey, otherWord.word[i]);
      }
    }
  });

  // Delete letters that aren't protected, and restore protected ones
  for (let i = 0; i < word.word.length; i++) {
    const row = word.startRow + (word.direction === 'down' ? i : 0);
    const col = word.startCol + (word.direction === 'across' ? i : 0);
    const key = getCellKey(row, col);

    if (protectedCells.has(key)) {
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

/**
 * Sorts words by clue number for consistent ordering
 */
export function sortWordsByClueNumber<T extends { clueNumber?: number; id: string | number }>(
  words: T[],
): T[] {
  return [...words].sort((a, b) => {
    const aNum = a.clueNumber ?? Number.MAX_SAFE_INTEGER;
    const bNum = b.clueNumber ?? Number.MAX_SAFE_INTEGER;
    if (aNum !== bNum) return aNum - bNum;
    return a.id.toString().localeCompare(b.id.toString());
  });
}

/**
 * Finds all words at a specific grid cell
 */
export function getWordsAtCell(row: number, col: number, words: GameLevelWord[]): GameLevelWord[] {
  return words.filter((word) => {
    for (let i = 0; i < word.word.length; i++) {
      const wordRow = word.startRow + (word.direction === 'down' ? i : 0);
      const wordCol = word.startCol + (word.direction === 'across' ? i : 0);
      if (wordRow === row && wordCol === col) {
        return true;
      }
    }
    return false;
  });
}
