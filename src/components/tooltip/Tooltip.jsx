import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTooltipPosition } from "./useTooltipPosition";

const TIMEOUT = 1000;

const TooltipEnvelope = ({
  tooltip,
  children,
  sticky = false,
  autoDismissAfter = TIMEOUT,
}) => {
  const [visible, setVisible] = useState(false);
  const targetRef = useRef(null);
  const tipRef = useRef(null);
  const timeoutRef = useRef(null);

  const effectiveSticky = sticky || autoDismissAfter === 0;
  const effectiveTimeout = effectiveSticky ? null : autoDismissAfter ?? TIMEOUT;

  const pos = useTooltipPosition(targetRef, tipRef, [visible, tooltip]);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startTimer = () => {
    if (!effectiveTimeout) return;
    clearTimer();
    timeoutRef.current = setTimeout(() => setVisible(false), effectiveTimeout);
  };

  useEffect(() => {
    if (!visible || effectiveSticky) return;
    const handleMove = () => startTimer();
    window.addEventListener("pointermove", handleMove, { passive: true });
    startTimer();
    return () => {
      window.removeEventListener("pointermove", handleMove);
      clearTimer();
    };
  }, [visible, effectiveSticky, effectiveTimeout]);

  const onClose = () => {
    clearTimer();
    setVisible(false);
  };

  return (
    <>
      <div
        ref={targetRef}
        onPointerEnter={() => setVisible(true)}
        className="inline-block"
      >
        {children}
      </div>

      {visible &&
        createPortal(
          <div
            ref={tipRef}
            className="pointer-events-auto fixed z-[9999] flex max-w-xs items-center gap-3 rounded-2xl border border-[#e2e5ea] bg-white/95 px-5 py-4 text-sm leading-relaxed text-[#1a1a1b] shadow-[0_24px_60px_rgba(26,26,27,0.2)] backdrop-blur"
            style={{ top: `${pos.top}px`, left: `${pos.left}px` }}
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
          </div>,
          document.body
        )}
    </>
  );
};

export default function Tooltip() {
  const demoButtonClasses =
    "inline-flex items-center justify-center rounded-2xl border border-[#d3d6da] bg-white px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-[#1a1a1b] shadow-[0_16px_32px_rgba(149,157,165,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_28px_45px_rgba(149,157,165,0.32)]";

  const Section = ({ title, children }) => (
    <div className="w-full space-y-4">
      <h3 className="text-xs font-semibold uppercase tracking-[0.45em] text-[#8c8f94]">
        {title}
      </h3>
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
        <TooltipEnvelope tooltip="This tooltip has X because autoDismissAfter=0" autoDismissAfter={0}>
          <div className={demoButtonClasses}>Hover me (0 behaves sticky)</div>
        </TooltipEnvelope>
      </Section>
    </main>
  );
}
