import { useCallback, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

/**
 * Triggers celebratory confetti effects when a puzzle is completed
 */
export const useConfettiOnComplete = (isComplete: boolean) => {
  const hasFiredRef = useRef(false);
  const timeoutIdsRef = useRef<number[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    if (!isComplete) {
      hasFiredRef.current = false;
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutIdsRef.current = [];
      return undefined;
    }

    if (hasFiredRef.current) {
      return undefined;
    }

    hasFiredRef.current = true;

    const defaults = { spread: 360, ticks: 160, gravity: 0.8, startVelocity: 55, scalar: 1.1 };

    const scheduleBurst = (callback: () => void, delayMs = 0) => {
      const timeoutId = window.setTimeout(() => window.requestAnimationFrame(callback), delayMs);
      timeoutIdsRef.current.push(timeoutId);
    };

    scheduleBurst(
      () =>
        confetti({
          particleCount: 160,
          spread: 80,
          origin: { y: 0.6 },
          scalar: 0.9,
          ticks: 100,
        }),
      0,
    );

    scheduleBurst(
      () => confetti({ ...defaults, particleCount: 200, origin: { x: 0.2, y: 0.2 } }),
      90,
    );
    scheduleBurst(
      () => confetti({ ...defaults, particleCount: 220, origin: { x: 0.8, y: 0.25 } }),
      170,
    );
    scheduleBurst(
      () => confetti({ ...defaults, particleCount: 240, origin: { x: 0.5, y: 0.35 } }),
      250,
    );

    return () => {
      timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
      timeoutIdsRef.current = [];
    };
  }, [isComplete]);

  const resetConfetti = useCallback(() => {
    hasFiredRef.current = false;
    timeoutIdsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutIdsRef.current = [];
  }, []);

  return { resetConfetti };
};
