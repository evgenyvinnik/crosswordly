import { useEffect, useState, useCallback } from 'react';
import { getCellKey } from '../lib/gridUtils';
import type { GameLevelWord } from '../components/game/GameField';

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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!selectedWord || !puzzleLevel) return;

      if (e.key === 'Backspace') {
        e.preventDefault();
        if (currentLetterIndex > 0) {
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
        }
        return;
      }

      if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
        e.preventDefault();
        if (currentLetterIndex < selectedWord.word.length) {
          const row =
            selectedWord.startRow + (selectedWord.direction === 'down' ? currentLetterIndex : 0);
          const col =
            selectedWord.startCol + (selectedWord.direction === 'across' ? currentLetterIndex : 0);
          const key = getCellKey(row, col);
          const letter = e.key.toLowerCase();

          const nextIndex = currentLetterIndex + 1;

          setTypedLetters((prev) => {
            const updated = {
              ...prev,
              [key]: letter,
            };

            // If word is complete, validate with the updated state
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
        }
      }
    },
    [selectedWord, currentLetterIndex, puzzleLevel, onWordComplete],
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
