import { useEffect, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import SettingsMenu, { DEFAULT_SETTINGS, SettingsState } from './components/SettingsMenu';
import SplashScreen from './components/SplashScreen';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [hasSplashExited, setHasSplashExited] = useState(false);

  const toggleSetting = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  useEffect(() => {
    if (!isSplashComplete) {
      setHasSplashExited(false);
    }
  }, [isSplashComplete]);

  const splashSpring = useSpring({
    opacity: isSplashComplete ? 0 : 1,
    config: { tension: 240, friction: 30 },
    onRest: ({ value }) => {
      if (isSplashComplete && value.opacity === 0) {
        setHasSplashExited(true);
      }
    },
  });

  const mainSpring = useSpring({
    opacity: isSplashComplete ? 1 : 0,
    config: { tension: 240, friction: 28 },
  });

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f5f0] text-[#1a1a1b]">
      {!hasSplashExited && (
        <animated.div
          style={splashSpring}
          className="absolute inset-0 z-20 bg-[#f6f5f0]"
          aria-hidden={isSplashComplete}
        >
          <SplashScreen onComplete={() => setIsSplashComplete(true)} />
        </animated.div>
      )}

      <animated.main
        className="flex min-h-screen items-center justify-center bg-[#f6f5f0] px-4"
        style={mainSpring}
        aria-hidden={!isSplashComplete}
      >
        <div className="rounded-3xl border border-[#d3d6da] bg-white/90 px-10 py-14 text-center shadow-[0_20px_60px_rgba(149,157,165,0.35)]">
          <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[#8c8f94]">
            Main Game
          </p>
          <p className="mt-4 text-2xl font-semibold text-[#1a1a1b]">Coming soon</p>
        </div>
      </animated.main>

      {hasSplashExited && (
        <>
          <button
            type="button"
            className="group absolute right-4 top-4 z-30 rounded-full border border-[#d3d6da] bg-white/80 p-3 text-[#1a1a1b] shadow-sm transition hover:bg-white sm:right-8 sm:top-8"
            onClick={() => setIsSettingsOpen(true)}
            aria-haspopup="dialog"
            aria-expanded={isSettingsOpen}
            aria-label="Open settings"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              className="h-5 w-5"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {isSettingsOpen ? (
            <div
              className="fixed inset-0 z-30 flex min-h-screen items-center justify-center bg-[#f6f5f0]/90 px-4 py-10 backdrop-blur-sm"
              role="dialog"
              aria-modal="true"
            >
              <div
                className="absolute inset-0 h-full w-full"
                aria-hidden="true"
                onClick={() => setIsSettingsOpen(false)}
              />
              <SettingsMenu settings={settings} onToggle={toggleSetting} onClose={() => setIsSettingsOpen(false)} />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
