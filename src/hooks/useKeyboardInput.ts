import { useEffect, useState, useCallback } from 'react';
import { getCellKey } from '../lib/gridUtils';
import type { GameLevelWord } from '../components/game/GameField';

const isAlphaKey = (key: string) => key.length === 1 && /[a-zA-Z]/.test(key);

/**
 * Custom hook to handle keyboard input for crossword puzzle typing
 */
export function useKeyboardInput(
  selectedWord: GameLevelWord | null,
  puzzleLevel: { words: GameLevelWord[] } | null,
  onWordComplete: (word: GameLevelWord, letters: Record<string, string>) => void,
) {
  const [typedLetters, setTypedLetters] = useState<Record<string, string>>({});
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);

  // Reset current letter index when word changes
  useEffect(() => {
    setCurrentLetterIndex(0);
  }, [selectedWord]);

  const handleBackspaceKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== 'Backspace' || !selectedWord) {
        return false;
      }

      event.preventDefault();
      if (currentLetterIndex === 0) {
        return true;
      }

      const prevIndex = currentLetterIndex - 1;
      const row = selectedWord.startRow + (selectedWord.direction === 'down' ? prevIndex : 0);
      const col = selectedWord.startCol + (selectedWord.direction === 'across' ? prevIndex : 0);
      const key = getCellKey(row, col);
      setTypedLetters((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setCurrentLetterIndex(prevIndex);
      return true;
    },
    [selectedWord, currentLetterIndex],
  );

  const handleLetterKey = useCallback(
    (event: KeyboardEvent) => {
      if (!selectedWord || !isAlphaKey(event.key)) {
        return false;
      }

      event.preventDefault();
      if (currentLetterIndex >= selectedWord.word.length) {
        return true;
      }

      const row =
        selectedWord.startRow + (selectedWord.direction === 'down' ? currentLetterIndex : 0);
      const col =
        selectedWord.startCol + (selectedWord.direction === 'across' ? currentLetterIndex : 0);
      const key = getCellKey(row, col);
      const letter = event.key.toLowerCase();
      const nextIndex = currentLetterIndex + 1;

      setTypedLetters((prev) => {
        const updated = {
          ...prev,
          [key]: letter,
        };

        if (nextIndex >= selectedWord.word.length) {
          setTimeout(() => {
            onWordComplete(selectedWord, updated);
          }, 100);
        }

        return updated;
      });

      if (nextIndex < selectedWord.word.length) {
        setCurrentLetterIndex(nextIndex);
      }

      return true;
    },
    [selectedWord, currentLetterIndex, onWordComplete],
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!selectedWord || !puzzleLevel) {
        return;
      }

      if (handleBackspaceKey(event)) {
        return;
      }

      handleLetterKey(event);
    },
    [selectedWord, puzzleLevel, handleBackspaceKey, handleLetterKey],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    typedLetters,
    setTypedLetters,
    currentLetterIndex,
    setCurrentLetterIndex,
  };
}
