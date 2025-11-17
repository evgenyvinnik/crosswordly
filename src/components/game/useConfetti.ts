import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

/**
 * Triggers celebratory confetti effects when a puzzle is completed
 */
export const useConfettiOnComplete = (isComplete: boolean) => {
  const confettiTriggeredRef = useRef(false);
  const megaConfettiTriggeredRef = useRef(false);

  // Initial confetti burst
  useEffect(() => {
    if (!isComplete || confettiTriggeredRef.current) {
      return;
    }
    confettiTriggeredRef.current = true;
    confetti({
      particleCount: 160,
      spread: 80,
      origin: { y: 0.6 },
      scalar: 0.9,
      ticks: 100,
    });
  }, [isComplete]);

  // Mega confetti burst with multiple origins
  useEffect(() => {
    if (!isComplete || megaConfettiTriggeredRef.current) {
      return;
    }
    megaConfettiTriggeredRef.current = true;
    const defaults = { spread: 360, ticks: 160, gravity: 0.8, startVelocity: 55, scalar: 1.1 };
    confetti({ ...defaults, particleCount: 200, origin: { x: 0.2, y: 0.2 } });
    confetti({ ...defaults, particleCount: 220, origin: { x: 0.8, y: 0.25 } });
    confetti({ ...defaults, particleCount: 240, origin: { x: 0.5, y: 0.35 } });
  }, [isComplete]);

  // Reset refs when puzzle changes
  const resetConfetti = () => {
    confettiTriggeredRef.current = false;
    megaConfettiTriggeredRef.current = false;
  };

  return { resetConfetti };
};
