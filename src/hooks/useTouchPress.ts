import { useCallback, useEffect, useRef, type RefObject } from 'react';

/** How long a finger must rest on a word before it is picked up for dragging. */
const HOLD_DELAY_MS = 220;
/** Movement allowed before the press counts as a scroll instead of a tap or hold. */
const MOVE_TOLERANCE_PX = 8;

type Point = { x: number; y: number };

type TouchPressHandlers = {
  /** Called when the finger lifts again without having moved or been held. */
  onTap?: (point: Point) => void;
  /** Called once the finger has rested in place; the page stops scrolling until it lifts. */
  onHold?: (point: Point) => void;
};

/**
 * Hook that tells taps, press-and-hold and scrolling apart for touch pointers, so the game can
 * offer drag and drop on touch screens without breaking page scrolling.
 *
 * iOS only honours `preventDefault()` from touchmove listeners that existed before the touch
 * began, so a listener is installed on the container up front; it blocks scrolling only while a
 * press is being held.
 *
 * @param containerRef - Element that contains every press target
 * @returns Function to call from a touch `pointerdown` handler
 */
export function useTouchPress(containerRef: RefObject<HTMLElement | null>) {
  const isHoldingRef = useRef(false);
  const cancelPressRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return undefined;
    }

    const blockScrollWhileHolding = (event: TouchEvent) => {
      if (isHoldingRef.current && event.cancelable) {
        event.preventDefault();
      }
    };

    container.addEventListener('touchmove', blockScrollWhileHolding, { passive: false });
    return () => {
      container.removeEventListener('touchmove', blockScrollWhileHolding);
      cancelPressRef.current?.();
    };
  }, [containerRef]);

  return useCallback((event: PointerEvent, { onTap, onHold }: TouchPressHandlers) => {
    cancelPressRef.current?.();

    const { pointerId } = event;
    const start = { x: event.clientX, y: event.clientY };
    let latest = start;
    let isHeld = false;

    function stop() {
      window.clearTimeout(holdTimer);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
      window.removeEventListener('pointercancel', handleCancel);
      isHoldingRef.current = false;
      cancelPressRef.current = null;
    }

    function handleMove(moveEvent: PointerEvent) {
      if (moveEvent.pointerId !== pointerId) return;
      latest = { x: moveEvent.clientX, y: moveEvent.clientY };
      if (!isHeld && Math.hypot(latest.x - start.x, latest.y - start.y) > MOVE_TOLERANCE_PX) {
        // The finger is scrolling the page
        stop();
      }
    }

    function handleUp(upEvent: PointerEvent) {
      if (upEvent.pointerId !== pointerId) return;
      const wasTap = !isHeld;
      stop();
      if (wasTap) {
        onTap?.({ x: upEvent.clientX, y: upEvent.clientY });
      }
    }

    function handleCancel(cancelEvent: PointerEvent) {
      if (cancelEvent.pointerId === pointerId) {
        stop();
      }
    }

    const holdTimer = onHold
      ? window.setTimeout(() => {
          isHeld = true;
          isHoldingRef.current = true;
          onHold(latest);
        }, HOLD_DELAY_MS)
      : undefined;

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);
    window.addEventListener('pointercancel', handleCancel);
    cancelPressRef.current = stop;
  }, []);
}
