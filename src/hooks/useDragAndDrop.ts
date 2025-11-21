import { useState, useEffect } from 'react';
import { Direction, GameLevelWord } from '../components/game/GameField';
import { GameWord } from '../utils/gameScreenUtils';

export type DragState = {
  word: GameWord;
  pointerId: number;
  current: { x: number; y: number };
  targetDirection: Direction | null;
  targetPlacementId: GameLevelWord['id'] | null;
};

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
      const placement = computeDropTarget(event.clientX, event.clientY);
      setActiveDrag((prev) =>
        prev
          ? {
              ...prev,
              current: { x: event.clientX, y: event.clientY },
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

    window.addEventListener('pointermove', handlePointerMove, {
      passive: false,
    });
    window.addEventListener('pointerup', handlePointerUp, { passive: false });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [activeDrag, computeDropTarget, finishAttempt]);

  return {
    activeDrag,
    setActiveDrag,
  };
}
