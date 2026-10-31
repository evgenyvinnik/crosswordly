import { useState, useEffect } from 'react';
import { GameLevelWord } from '../components/game/GameField';
import { type DragState, getDragAimPoint } from '../components/game/DragPreview';
import { GameWord } from '../utils/gameScreenUtils';

type UseDragAndDropProps = {
  computeDropTarget: (clientX: number, clientY: number) => GameLevelWord | null;
  finishAttempt: (word: GameWord, placementId: GameLevelWord['id'] | null) => void;
};

/**
 * Custom hook to manage drag and drop state and interactions.
 * Handles pointer move and up events to update drag position and finalize drop.
 *
 * @param props - Hook properties
 * @param props.computeDropTarget - Function to determine the drop target based on coordinates
 * @param props.finishAttempt - Function to handle the completion of a drag attempt
 * @returns Object containing the active drag state and a setter for it
 */
export function useDragAndDrop({ computeDropTarget, finishAttempt }: UseDragAndDropProps) {
  const [activeDrag, setActiveDrag] = useState<DragState | null>(null);

  useEffect(() => {
    if (!activeDrag) {
      return undefined;
    }

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      const current = { x: event.clientX, y: event.clientY };
      const aim = getDragAimPoint(current, activeDrag.isTouch);
      const placement = computeDropTarget(aim.x, aim.y);
      setActiveDrag((prev) =>
        prev
          ? {
              ...prev,
              current,
              targetDirection: placement?.direction ?? null,
              targetPlacementId: placement?.id ?? null,
            }
          : prev,
      );
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (event.pointerId !== activeDrag.pointerId) return;
      event.preventDefault();
      setActiveDrag((prev) => {
        if (!prev) return null;
        const dropPlacementId = prev.targetPlacementId;
        finishAttempt(prev.word, dropPlacementId);
        return null;
      });
    };

    // The browser took over the gesture (for example a system swipe): drop the word nowhere
    const handlePointerCancel = (event: PointerEvent) => {
      if (event.pointerId !== activeDrag.pointerId) return;
      setActiveDrag(null);
    };

    window.addEventListener('pointermove', handlePointerMove, {
      passive: false,
    });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });
    window.addEventListener('pointercancel', handlePointerCancel);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerCancel);
    };
  }, [activeDrag, computeDropTarget, finishAttempt]);

  return {
    activeDrag,
    setActiveDrag,
  };
}
