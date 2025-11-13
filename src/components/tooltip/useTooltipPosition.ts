import { DependencyList, RefObject, useLayoutEffect, useState } from 'react';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export type TooltipPosition = {
  top: number;
  left: number;
  placement: TooltipPlacement;
};

type TooltipPositionOptions = {
  gap?: number;
  preferredPlacement?: TooltipPlacement;
};

const calculatePosition = (
  targetRect: DOMRect,
  tipRect: DOMRect,
  gap = 8,
  preferredPlacement: TooltipPlacement = 'top',
): TooltipPosition => {
  const spaces = {
    above: targetRect.top,
    below: window.innerHeight - targetRect.bottom,
    left: targetRect.left,
    right: window.innerWidth - targetRect.right,
  };

  const placements = [
    {
      name: 'top',
      fits: spaces.above >= tipRect.height + gap,
      top: targetRect.top - tipRect.height - gap,
      left: targetRect.left + targetRect.width / 2 - tipRect.width / 2,
    },
    {
      name: 'bottom',
      fits: spaces.below >= tipRect.height + gap,
      top: targetRect.bottom + gap,
      left: targetRect.left + targetRect.width / 2 - tipRect.width / 2,
    },
    {
      name: 'right',
      fits: spaces.right >= tipRect.width + gap,
      top: targetRect.top + targetRect.height / 2 - tipRect.height / 2,
      left: targetRect.right + gap,
    },
    {
      name: 'left',
      fits: spaces.left >= tipRect.width + gap,
      top: targetRect.top + targetRect.height / 2 - tipRect.height / 2,
      left: targetRect.left - tipRect.width - gap,
    },
  ];

  const orderedNames: TooltipPlacement[] = [
    preferredPlacement,
    'top',
    'bottom',
    'right',
    'left',
  ].filter((placement, index, array) => array.indexOf(placement) === index);

  const orderedPlacements = orderedNames
    .map((name) => placements.find((placement) => placement.name === name))
    .filter(Boolean) as typeof placements;

  const fallback = placements.find((placement) => placement.name === 'bottom') ?? placements[0];
  const chosen = orderedPlacements.find((placement) => placement.fits) ?? fallback;

  return {
    top: Math.max(gap, Math.min(chosen.top, window.innerHeight - tipRect.height - gap)),
    left: Math.max(gap, Math.min(chosen.left, window.innerWidth - tipRect.width - gap)),
    placement: chosen.name,
  };
};

export const useTooltipPosition = (
  targetRef: RefObject<HTMLElement>,
  tipRef: RefObject<HTMLElement>,
  deps: DependencyList = [],
  options: TooltipPositionOptions = {},
): TooltipPosition => {
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0, placement: 'top' });
  const { gap = 8, preferredPlacement = 'top' } = options;

  useLayoutEffect(() => {
    const target = targetRef.current;
    const tip = tipRef.current;
    if (!target || !tip) return;

    const calculate = () => {
      setPosition(
        calculatePosition(target.getBoundingClientRect(), tip.getBoundingClientRect(), gap, preferredPlacement),
      );
    };

    calculate();
    window.addEventListener('scroll', calculate, true);
    window.addEventListener('resize', calculate);

    return () => {
      window.removeEventListener('scroll', calculate, true);
      window.removeEventListener('resize', calculate);
    };
  }, [targetRef, tipRef, gap, preferredPlacement, ...deps]);

  return position;
};
