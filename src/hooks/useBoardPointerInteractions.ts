import { useEffect, type RefObject } from 'react';
import type { OverlayState } from '../components/game/GameField';
import type { GameWord } from '../components/game/gameScreenUtils';
import type { DragState } from '../components/game/DragPreview';

type BoardPointerHookArgs = {
  boardRef: RefObject<HTMLDivElement | null>;
  activeDrag: DragState | null;
  failedOverlay: OverlayState | null;
  selectedWord: GameWord | null;
  attemptTapPlacement: (event: PointerEvent, cellKey: string) => void;
  startBoardDrag: (event: PointerEvent, cellKey: string) => void;
};

const isPrimaryPointerEvent = (event: PointerEvent) => event.button === 0 && event.isPrimary;

const getCellKeyFromEvent = (event: PointerEvent) => {
  const target = event.target instanceof HTMLElement ? event.target : null;
  const cellElement = target?.closest<HTMLElement>('[data-cell-key]');
  return cellElement?.dataset.cellKey ?? null;
};

/**
 * Hook to handle pointer interactions on the game board.
 * Manages tap-to-place and drag-to-move gestures.
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

      const cellKey = getCellKeyFromEvent(event);
      if (!cellKey) {
        return;
      }

      if (selectedWord) {
        attemptTapPlacement(event, cellKey);
        return;
      }

      startBoardDrag(event, cellKey);
    };

    boardElement.addEventListener('pointerdown', handleBoardPointerDown);

    return () => {
      boardElement.removeEventListener('pointerdown', handleBoardPointerDown);
    };
  }, [boardRef, activeDrag, failedOverlay, selectedWord, attemptTapPlacement, startBoardDrag]);
};
