import { useState, useEffect } from 'react';
import { GameLevelWord } from '../components/game/GameField';
import { type DragState, getDragAimPoint } from '../components/game/DragPreview';
import { GameWord } from '../utils/gameScreenUtils';

/** Distance from the top or bottom of the screen within which a dragged word scrolls the page. */
const EDGE_SCROLL_ZONE_PX = 64;
/** Scroll speed, in pixels per second, when a dragged word is right at the edge of the screen. */
const EDGE_SCROLL_MAX_SPEED = 900;
/** Longest frame gap counted, so a stalled frame does not make the page jump. */
const EDGE_SCROLL_MAX_FRAME_MS = 50;

type UseDragAndDropProps = {
  computeDropTarget: (
    clientX: number,
    clientY: number,
    currentTargetId?: GameLevelWord['id'] | null,
  ) => GameLevelWord | null;
  finishAttempt: (word: GameWord, placementId: GameLevelWord['id'] | null) => void;
};

/**
 * Returns how fast to scroll the page, in pixels per second, for a word dragged near the top or
 * bottom of the screen: negative scrolls up, positive scrolls down and zero leaves the page alone.
 *
 * @param drag - Current drag state
 */
const getEdgeScrollSpeed = (drag: DragState) => {
  // A word dragged by touch floats above the finger, so the word reaches the top edge first and
  // the finger reaches the bottom edge first
  const distanceToTop = getDragAimPoint(drag.current, drag.isTouch).y;
  const distanceToBottom = window.innerHeight - drag.current.y;
  const speedFor = (distance: number) =>
    ((EDGE_SCROLL_ZONE_PX - Math.max(distance, 0)) / EDGE_SCROLL_ZONE_PX) * EDGE_SCROLL_MAX_SPEED;

  if (distanceToTop < EDGE_SCROLL_ZONE_PX) {
    return -speedFor(distanceToTop);
  }
  if (distanceToBottom < EDGE_SCROLL_ZONE_PX) {
    return speedFor(distanceToBottom);
  }
  return 0;
};

/**
 * Custom hook to manage drag and drop state and interactions.
 * Handles pointer move and up events to update drag position and finalize drop, and scrolls the
 * page while a word is held near the top or bottom of the screen, so words lower in the word bank
 * can reach a board that no longer fits on screen with them.
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
      const placement = computeDropTarget(aim.x, aim.y, activeDrag.targetPlacementId);
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

  // Keeps scrolling while the word rests near an edge; the board moves under a still pointer, so
  // the drop target is worked out again after every step
  useEffect(() => {
    if (!activeDrag || getEdgeScrollSpeed(activeDrag) === 0) {
      return undefined;
    }

    let frame = 0;
    let lastFrameTime: number | null = null;
    const scrollStep = (time: number) => {
      // Scroll by elapsed time rather than per frame, so 120 Hz screens do not scroll twice as fast
      const elapsed =
        lastFrameTime === null ? 16 : Math.min(time - lastFrameTime, EDGE_SCROLL_MAX_FRAME_MS);
      lastFrameTime = time;
      const speed = getEdgeScrollSpeed(activeDrag);
      const scrollBefore = window.scrollY;
      window.scrollBy(
        0,
        Math.sign(speed) * Math.max(1, Math.round((Math.abs(speed) * elapsed) / 1000)),
      );
      if (window.scrollY !== scrollBefore) {
        const aim = getDragAimPoint(activeDrag.current, activeDrag.isTouch);
        const placement = computeDropTarget(aim.x, aim.y, activeDrag.targetPlacementId);
        if ((placement?.id ?? null) !== activeDrag.targetPlacementId) {
          // The new drag state re-runs this effect, which carries on scrolling
          setActiveDrag((prev) =>
            prev
              ? {
                  ...prev,
                  targetDirection: placement?.direction ?? null,
                  targetPlacementId: placement?.id ?? null,
                }
              : prev,
          );
          return;
        }
      }
      frame = window.requestAnimationFrame(scrollStep);
    };
    frame = window.requestAnimationFrame(scrollStep);

    return () => window.cancelAnimationFrame(frame);
  }, [activeDrag, computeDropTarget]);

  return {
    activeDrag,
    setActiveDrag,
  };
}
