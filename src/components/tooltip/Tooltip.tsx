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

const caretLineByPlacement: Record<TooltipPlacement, string> = {
  top: 'left-1/2 top-full h-8 w-px -translate-x-1/2 translate-y-1 bg-gradient-to-b from-[#1a1a1b]/10 via-[#6aaa64] to-[#6aaa64]/0',
  bottom:
    'left-1/2 bottom-full h-8 w-px -translate-x-1/2 -translate-y-1 bg-gradient-to-t from-[#1a1a1b]/10 via-[#6aaa64] to-[#6aaa64]/0',
  left: 'top-1/2 left-full h-px w-8 -translate-y-1/2 translate-x-1 bg-gradient-to-r from-[#1a1a1b]/10 via-[#6aaa64] to-[#6aaa64]/0',
  right:
    'top-1/2 right-full h-px w-8 -translate-y-1/2 -translate-x-1 bg-gradient-to-l from-[#1a1a1b]/10 via-[#6aaa64] to-[#6aaa64]/0',
};

const getCaretLineClass = (placement: TooltipPlacement) =>
  `block ${caretLineByPlacement[placement] ?? caretLineByPlacement.top}`;

type TooltipEnvelopeProps = {
  tooltip: ReactNode;
  children: ReactNode;
  sticky?: boolean;
  autoDismissAfter?: number;
  forceVisible?: boolean;
  targetClassName?: string;
  targetStyle?: CSSProperties;
  tooltipClassName?: string;
  portalRoot?: HTMLElement | null;
};

export const TooltipEnvelope = ({
  tooltip,
  children,
  sticky = false,
  autoDismissAfter = TIMEOUT,
  forceVisible,
  targetClassName = '',
  targetStyle,
  tooltipClassName = '',
  portalRoot,
}: TooltipEnvelopeProps) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const tipRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const effectiveSticky = sticky || autoDismissAfter === 0;
  const effectiveTimeout = effectiveSticky ? null : (autoDismissAfter ?? TIMEOUT);
  const isControlled = typeof forceVisible === 'boolean';
  const visible = isControlled ? forceVisible : internalVisible;

  const positionDeps = useMemo(() => [visible, tooltip], [visible, tooltip]);
  const pos = useTooltipPosition(targetRef, tipRef, positionDeps);
  const placement = pos.placement ?? 'top';

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

      {visible && portalTarget
        ? createPortal(
            <div
              ref={tipRef}
              className={`pointer-events-auto fixed z-[9999] flex max-w-xs items-center gap-3 rounded-2xl border border-[#e2e5ea] bg-white/95 px-5 py-4 text-sm leading-relaxed text-[#1a1a1b] shadow-[0_24px_60px_rgba(26,26,27,0.2)] backdrop-blur ${tooltipClassName} relative`}
              style={{
                top: `${pos.top}px`,
                left: `${pos.left}px`,
                fontFamily:
                  "'Excalifont', 'Karla', 'Kanit', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              }}
              onPointerMove={startTimer}
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
              <span
                aria-hidden
                className={`pointer-events-none absolute ${getCaretLineClass(placement)}`}
              />
            </div>,
            portalTarget,
          )
        : null}
    </>
  );
};

export default function Tooltip() {
  const demoButtonClasses =
    'inline-flex items-center justify-center rounded-2xl border border-[#d3d6da] bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1b] shadow-[0_16px_32px_rgba(149,157,165,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_45px_rgba(149,157,165,0.32)]';

  const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <div className="w-full space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.45em] text-[#8c8f94]">{title}</h3>
      {children}
    </div>
  );

  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center gap-10 rounded-[32px] border border-[#e2e5ea] bg-[#f6f5f0] px-6 py-12 text-[#1a1a1b]">
      <h1 className="text-3xl font-semibold leading-tight">Tooltip Demo</h1>

      <Section title="Default (auto-dismiss after 1s of inactivity)">
        <TooltipEnvelope tooltip="This tooltip will auto-dismiss after the default timeout">
          <div className={demoButtonClasses}>Hover me (default)</div>
        </TooltipEnvelope>
      </Section>

      <Section title="Custom auto-dismiss (2s)">
        <TooltipEnvelope tooltip="This tooltip auto-dismisses after 2s" autoDismissAfter={2000}>
          <div className={demoButtonClasses}>Hover me (2s)</div>
        </TooltipEnvelope>
      </Section>

      <Section title="Sticky (manual close)">
        <TooltipEnvelope tooltip="This tooltip stays open until you click X" sticky>
          <div className={demoButtonClasses}>Hover me (sticky)</div>
        </TooltipEnvelope>
      </Section>

      <Section title="autoDismissAfter = 0 (treated as sticky)">
        <TooltipEnvelope
          tooltip="This tooltip has X because autoDismissAfter=0"
          autoDismissAfter={0}
        >
          <div className={demoButtonClasses}>Hover me (0 behaves sticky)</div>
        </TooltipEnvelope>
      </Section>
    </main>
  );
}
