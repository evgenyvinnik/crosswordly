import { useCallback } from 'react';
import { GameLevel, GameLevelWord, OverlayState } from '../components/game/GameField';
import { GameWord } from '../components/game/gameScreenUtils';
import { getCellKey } from '../lib/gridUtils';
import { PlacedWord, getPlacementKey } from '../components/game/wordPlacementUtils';

type UseWordPlacementProps = {
  level: GameLevel;
  placementsById: Map<string, GameLevelWord>;
  committedLetters: Record<string, string>;
  placedWords: Record<string, PlacedWord | null>;
  buildCommittedLettersForState: (
    placementsState: Record<string, PlacedWord | null>,
  ) => Record<string, string>;
  setWordBank: React.Dispatch<React.SetStateAction<GameWord[]>>;
  setPlacedWords: React.Dispatch<React.SetStateAction<Record<string, PlacedWord | null>>>;
  setCommittedLetters: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setFailedOverlay: React.Dispatch<React.SetStateAction<OverlayState | null>>;
  setRejectedWordId: React.Dispatch<React.SetStateAction<string | number | null>>;
};

/**
 * Custom hook to handle word placement logic and validation.
 * Manages the state of placed words, validates placements against the grid and existing letters,
 * and handles successful or failed placement attempts.
 *
 * @param props - Hook properties
 * @param props.level - Current game level data
 * @param props.placementsById - Map of placement IDs to level word definitions
 * @param props.committedLetters - Map of cell keys to committed letters
 * @param props.placedWords - Record of currently placed words
 * @param props.buildCommittedLettersForState - Helper to rebuild committed letters from placed words
 * @param props.setWordBank - State setter for the word bank
 * @param props.setPlacedWords - State setter for placed words
 * @param props.setCommittedLetters - State setter for committed letters
 * @param props.setFailedOverlay - State setter for the failure overlay
 * @param props.setRejectedWordId - State setter for the rejected word ID
 * @returns Object containing the finishAttempt function
 */
export function useWordPlacement({
  level,
  placementsById,
  committedLetters,
  placedWords,
  buildCommittedLettersForState,
  setWordBank,
  setPlacedWords,
  setCommittedLetters,
  setFailedOverlay,
  setRejectedWordId,
}: UseWordPlacementProps) {
  const finishAttempt = useCallback(
    (word: GameWord, placementId: GameLevelWord['id'] | null) => {
      if (!placementId) {
        return;
      }

      const placementKey = getPlacementKey(placementId);
      const placement = placementsById.get(placementKey);
      if (!placement) {
        return;
      }

      const direction = placement.direction;
      const candidateLetters = word.word.split('');
      const placementLength = placement.word.length;
      const mismatchedIndices: number[] = [];
      const previousEntry = placedWords[placementKey];
      const validationLetters =
        previousEntry !== null && previousEntry !== undefined
          ? buildCommittedLettersForState({ ...placedWords, [placementKey]: null })
          : committedLetters;

      placement.word.split('').forEach((_, index) => {
        const letter = candidateLetters[index];
        const row = placement.startRow + (direction === 'down' ? index : 0);
        const col = placement.startCol + (direction === 'across' ? index : 0);
        const key = getCellKey(row, col);
        const requiredSource = level.prefilledLetters?.[key] ?? validationLetters[key] ?? '';
        const required = requiredSource;

        if (!letter) {
          mismatchedIndices.push(index);
          return;
        }

        if (required && required !== letter) {
          mismatchedIndices.push(index);
        }
      });

      if (candidateLetters.length !== placementLength) {
        for (let i = placementLength; i < candidateLetters.length; i += 1) {
          mismatchedIndices.push(i);
        }
      }

      if (mismatchedIndices.length > 0) {
        if (previousEntry) {
          setPlacedWords((prev) => {
            if (!prev[placementKey]) {
              return prev;
            }
            const next = { ...prev, [placementKey]: null };
            setCommittedLetters(buildCommittedLettersForState(next));
            return next;
          });
          setWordBank((prev) =>
            prev.map((entry) =>
              entry.id === previousEntry.wordId
                ? { ...entry, state: 'idle', direction: undefined, placementId: undefined }
                : entry,
            ),
          );
        }

        setFailedOverlay({
          direction,
          placementId,
          letters: candidateLetters,
          status: 'error',
          mismatchedIndices,
        });
        setRejectedWordId(word.id);
        return;
      }

      setWordBank((prev) =>
        prev.map((entry) =>
          entry.id === word.id ? { ...entry, state: 'locked', direction, placementId } : entry,
        ),
      );
      setPlacedWords((prev) => {
        const previousEntry = prev[placementKey];
        if (previousEntry && previousEntry.wordId !== word.id) {
          setWordBank((bank) =>
            bank.map((entry) =>
              entry.id === previousEntry.wordId
                ? { ...entry, state: 'idle', direction: undefined, placementId: undefined }
                : entry,
            ),
          );
        }
        const next = {
          ...prev,
          [placementKey]: {
            bankIndex: word.bankIndex,
            word: word.word,
            definition: word.definition,
            clueNumber: placement.clueNumber,
            placementId: placement.id,
            direction,
            wordId: word.id,
          },
        };
        setCommittedLetters(buildCommittedLettersForState(next));
        return next;
      });
    },
    [
      placementsById,
      buildCommittedLettersForState,
      committedLetters,
      level.prefilledLetters,
      placedWords,
      setPlacedWords,
      setCommittedLetters,
      setWordBank,
      setFailedOverlay,
      setRejectedWordId,
    ],
  );

  const releaseWord = useCallback(
    (word: GameWord) => {
      if (word.state !== 'locked' || !word.placementId) {
        return;
      }

      const placementKey = getPlacementKey(word.placementId);
      setPlacedWords((prev) => {
        if (!prev[placementKey]) {
          return prev;
        }
        const next = { ...prev, [placementKey]: null };
        setCommittedLetters(buildCommittedLettersForState(next));
        return next;
      });

      setWordBank((prev) =>
        prev.map((entry) =>
          entry.id === word.id
            ? { ...entry, state: 'idle', direction: undefined, placementId: undefined }
            : entry,
        ),
      );
    },
    [buildCommittedLettersForState, setPlacedWords, setCommittedLetters, setWordBank],
  );

  return {
    finishAttempt,
    releaseWord,
  };
}
