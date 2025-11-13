import React, {
  CSSProperties,
  ReactNode,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import { TooltipPlacement, useTooltipPosition } from './useTooltipPosition';

const TIMEOUT = 1000;

type TooltipProps = {
  tooltip: ReactNode;
  children: ReactNode;
  sticky?: boolean;
  autoDismissAfter?: number;
  forceVisible?: boolean;
  targetClassName?: string;
  targetStyle?: CSSProperties;
  tooltipClassName?: string;
  portalRoot?: HTMLElement | null;
  preferredPlacement?: TooltipPlacement;
};

export const Tooltip = ({
  tooltip,
  children,
  sticky = false,
  autoDismissAfter = TIMEOUT,
  forceVisible,
  targetClassName = '',
  targetStyle,
  tooltipClassName = '',
  portalRoot,
  preferredPlacement = 'top',
}: TooltipProps) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isMounted, setIsMounted] = useState(() => Boolean(forceVisible));

  const effectiveSticky = sticky || autoDismissAfter === 0;
  const effectiveTimeout = effectiveSticky ? null : (autoDismissAfter ?? TIMEOUT);
  const isControlled = typeof forceVisible === 'boolean';
  const visible = isControlled ? forceVisible : internalVisible;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
    }
  }, [visible]);

  const positionDeps = useMemo(
    () => [visible, tooltip, preferredPlacement],
    [visible, tooltip, preferredPlacement],
  );
  const pos = useTooltipPosition(targetRef, tipRef, positionDeps, { preferredPlacement });

  const clearTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    if (!effectiveTimeout || isControlled) return;
    clearTimer();
    timeoutRef.current = setTimeout(() => setInternalVisible(false), effectiveTimeout);
  }, [clearTimer, effectiveTimeout, isControlled]);

  useEffect(() => {
    if (!visible || effectiveSticky || isControlled) return;
    const handleMove = () => startTimer();
    window.addEventListener('pointermove', handleMove, { passive: true });
    startTimer();
    return () => {
      window.removeEventListener('pointermove', handleMove);
      clearTimer();
    };
  }, [visible, effectiveSticky, isControlled, startTimer, clearTimer]);

  const onClose = () => {
    clearTimer();
    setInternalVisible(false);
  };

  const defaultPortalRoot = typeof document !== 'undefined' ? document.body : null;
  const portalTarget = portalRoot ?? defaultPortalRoot;
  const shouldRenderTooltip = isMounted && portalTarget;

  const transitionClasses = visible
    ? 'opacity-100 translate-y-0 scale-100'
    : 'pointer-events-none opacity-0 translate-y-1 scale-95';

  const handleTransitionEnd = (event: React.TransitionEvent<HTMLDivElement>) => {
    if (event.target !== event.currentTarget) return;
    if (!visible) {
      setIsMounted(false);
    }
  };

  return (
    <>
      <div
        ref={targetRef}
        onPointerEnter={
          isControlled
            ? undefined
            : () => {
                setInternalVisible(true);
              }
        }
        onPointerLeave={
          isControlled
            ? undefined
            : () => {
                if (!effectiveSticky) {
                  setInternalVisible(false);
                }
              }
        }
        className={`inline-block ${targetClassName}`}
        style={targetStyle}
      >
        {children}
      </div>

      {shouldRenderTooltip
        ? createPortal(
            <div
              ref={tipRef}
              className={`pointer-events-auto fixed z-[9999] flex max-w-sm items-center gap-2 rounded-full border border-[#d3d6da] bg-white px-5 py-3 text-sm font-medium text-[#1a1a1b] shadow-[0_18px_32px_rgba(149,157,165,0.25)] transition duration-300 ease-out ${transitionClasses} ${tooltipClassName} relative`}
              style={{
                top: `${pos.top}px`,
                left: `${pos.left}px`,
                fontFamily:
                  "'Excalifont', 'Karla', 'Kanit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
              onPointerMove={startTimer}
              onTransitionEnd={handleTransitionEnd}
            >
              <div className="flex-1">{tooltip}</div>
              {effectiveSticky && (
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1a1a1b] text-base font-semibold text-white transition hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6aaa64]/70"
                  aria-label="Close tooltip"
                >
                  ×
                </button>
              )}
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
};