import { useState, useLayoutEffect } from "react";

const calculatePosition = (targetRect, tipRect, gap = 8) => {
  const spaces = {
    above: targetRect.top,
    below: window.innerHeight - targetRect.bottom,
    left: targetRect.left,
    right: window.innerWidth - targetRect.right,
  };

  const placements = [
    {
      name: "top",
      fits: spaces.above >= tipRect.height + gap,
      top: targetRect.top - tipRect.height - gap,
      left: targetRect.left + targetRect.width / 2 - tipRect.width / 2,
    },
    {
      name: "bottom",
      fits: spaces.below >= tipRect.height + gap,
      top: targetRect.bottom + gap,
      left: targetRect.left + targetRect.width / 2 - tipRect.width / 2,
    },
    {
      name: "right",
      fits: spaces.right >= tipRect.width + gap,
      top: targetRect.top + targetRect.height / 2 - tipRect.height / 2,
      left: targetRect.right + gap,
    },
    {
      name: "left",
      fits: spaces.left >= tipRect.width + gap,
      top: targetRect.top + targetRect.height / 2 - tipRect.height / 2,
      left: targetRect.left - tipRect.width - gap,
    },
  ];

  const chosen = placements.find((p) => p.fits) || placements[1]; // fallback to bottom

  return {
    top: Math.max(gap, Math.min(chosen.top, window.innerHeight - tipRect.height - gap)),
    left: Math.max(gap, Math.min(chosen.left, window.innerWidth - tipRect.width - gap)),
    placement: chosen.name,
  };
};

export const useTooltipPosition = (targetRef, tipRef, deps = []) => {
  const [position, setPosition] = useState({ top: 0, left: 0, placement: "top" });

  useLayoutEffect(() => {
    const target = targetRef.current;
    const tip = tipRef.current;
    if (!target || !tip) return;

    const calculate = () => {
      setPosition(calculatePosition(target.getBoundingClientRect(), tip.getBoundingClientRect()));
    };

    calculate();
    window.addEventListener("scroll", calculate, true);
    window.addEventListener("resize", calculate);

    return () => {
      window.removeEventListener("scroll", calculate, true);
      window.removeEventListener("resize", calculate);
    };
  }, deps);

  return position;
};