import { useEffect } from 'react';
import type { DragState } from '../components/game/DragPreview';
import type { OverlayState, GameLevelWord } from '../components/game/GameField';
import type { GameWord } from '../utils/gameScreenUtils';

type KeyboardPlacementArgs = {
  activeDrag: DragState | null;
  failedOverlay: OverlayState | null;
  selectedWord: GameWord | null;
  focusedWordSlot: GameLevelWord['id'] | null;
  finishAttempt: (word: GameWord, placementId: GameLevelWord['id'] | null) => void;
  clearSelection: () => void;
};

/**
 * Hook to handle keyboard shortcuts for word placement.
 * Allows users to place a selected word into a focused slot using 'Enter',
 * or cancel the selection using 'Escape'.
 *
 * @param args - Hook arguments
 * @param args.activeDrag - Current drag state (shortcuts disabled during drag)
 * @param args.failedOverlay - Current error overlay state (shortcuts disabled during error)
 * @param args.selectedWord - The currently selected word from the bank
 * @param args.focusedWordSlot - The currently focused word slot on the grid
 * @param args.finishAttempt - Callback to finalize the placement attempt
 * @param args.clearSelection - Callback to clear the current selection
 */
export const useKeyboardPlacementShortcuts = ({
  activeDrag,
  failedOverlay,
  selectedWord,
  focusedWordSlot,
  finishAttempt,
  clearSelection,
}: KeyboardPlacementArgs) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (activeDrag || failedOverlay) {
        return;
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        clearSelection();
        return;
      }

      if (event.key === 'Enter' && selectedWord && focusedWordSlot) {
        event.preventDefault();
        finishAttempt(selectedWord, focusedWordSlot);
        clearSelection();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeDrag, failedOverlay, selectedWord, focusedWordSlot, finishAttempt, clearSelection]);
};
