import { useEffect, type RefObject } from 'react';
import type { OverlayState } from '../components/game/GameField';
import type { GameWord } from '../utils/gameScreenUtils';
import type { DragState } from '../components/game/DragPreview';

type BoardPointerHookArgs = {
  boardRef: RefObject<HTMLDivElement | null>;
  activeDrag: DragState | null;
  failedOverlay: OverlayState | null;
  selectedWord: GameWord | null;
  attemptTapPlacement: (event: PointerEvent) => void;
  startBoardDrag: (event: PointerEvent) => void;
};

const isPrimaryPointerEvent = (event: PointerEvent) => event.button === 0 && event.isPrimary;

/**
 * Hook to handle pointer interactions on the game board.
 * Manages tap-to-place and drag-to-move gestures. The pointer does not have to land squarely on a
 * cell: the handlers snap it to the nearest word slot, so the gaps between cells count too.
 *
 * @param args - Hook arguments
 * @param args.boardRef - Reference to the board DOM element
 * @param args.activeDrag - Current drag state, if any
 * @param args.failedOverlay - State of the failure overlay, if active
 * @param args.selectedWord - Currently selected word from the bank
 * @param args.attemptTapPlacement - Callback to attempt placing a selected word
 * @param args.startBoardDrag - Callback to start dragging a word from the board
 */
export const useBoardPointerInteractions = ({
  boardRef,
  activeDrag,
  failedOverlay,
  selectedWord,
  attemptTapPlacement,
  startBoardDrag,
}: BoardPointerHookArgs) => {
  useEffect(() => {
    const boardElement = boardRef.current;
    if (!boardElement) {
      return undefined;
    }

    const handleBoardPointerDown = (event: PointerEvent) => {
      if (!isPrimaryPointerEvent(event) || activeDrag || failedOverlay) {
        return;
      }

      if (selectedWord) {
        attemptTapPlacement(event);
        return;
      }

      startBoardDrag(event);
    };

    // Pressing and holding picks words up; keep Android from treating it as a context-menu request
    const preventContextMenu = (event: Event) => event.preventDefault();

    boardElement.addEventListener('pointerdown', handleBoardPointerDown);
    boardElement.addEventListener('contextmenu', preventContextMenu);

    return () => {
      boardElement.removeEventListener('pointerdown', handleBoardPointerDown);
      boardElement.removeEventListener('contextmenu', preventContextMenu);
    };
  }, [boardRef, activeDrag, failedOverlay, selectedWord, attemptTapPlacement, startBoardDrag]);
};
