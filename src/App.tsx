import { useEffect, useMemo, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import SettingsMenu, { DEFAULT_SETTINGS, SettingsState } from './components/SettingsMenu';
import SplashScreen from './components/SplashScreen';
import TutorialScreen from './components/TutorialScreen';
import LevelSelectScreen, { LevelDescriptor } from './components/LevelSelectScreen';
import SettingsIcon from './components/icons/SettingsIcon';
import { TUTORIAL_LEVEL } from './levels/tutorial';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [hasSplashExited, setHasSplashExited] = useState(false);
  const [isTutorialComplete, setIsTutorialComplete] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'tutorial' | 'levels' | 'main'>('tutorial');

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

  const isMainVisible = isSplashComplete && isTutorialComplete && activeScreen === 'main';

  const mainSpring = useSpring({
    opacity: isMainVisible ? 1 : 0,
    config: { tension: 240, friction: 28 },
  });

  const availableLevels: LevelDescriptor[] = useMemo(
    () => [
      {
        id: TUTORIAL_LEVEL.id,
        title: TUTORIAL_LEVEL.name,
        description: 'Learn how to play with full instructions and guided clues.',
        order: 1,
        isAvailable: true,
        hasInstructions: true,
      },
    ],
    [],
  );

  const handleTutorialComplete = () => {
    setIsTutorialComplete(true);
    setActiveScreen('main');
  };

  const handleTutorialExit = () => {
    setActiveScreen('levels');
  };

  const handleLevelSelect = (levelId: string) => {
    if (levelId === TUTORIAL_LEVEL.id) {
      setActiveScreen('tutorial');
    }
  };

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

      {hasSplashExited && activeScreen === 'tutorial' ? (
        <TutorialScreen onComplete={handleTutorialComplete} onExit={handleTutorialExit} />
      ) : null}

      {hasSplashExited && activeScreen === 'levels' ? (
        <LevelSelectScreen levels={availableLevels} onSelectLevel={handleLevelSelect} />
      ) : null}

      {isMainVisible ? (
        <animated.main
          className="flex min-h-screen items-center justify-center bg-[#f6f5f0] px-4"
          style={mainSpring}
          aria-hidden={!isMainVisible}
        >
          <div className="rounded-3xl border border-[#d3d6da] bg-white/90 px-10 py-14 text-center shadow-[0_20px_60px_rgba(149,157,165,0.35)]">
            <p className="text-xs font-semibold uppercase tracking-[0.5em] text-[#8c8f94]">
              Main Game
            </p>
            <p className="mt-4 text-2xl font-semibold text-[#1a1a1b]">Coming soon</p>
          </div>
        </animated.main>
      ) : null}

      {hasSplashExited && (
        <>
          <div className="absolute right-4 top-4 z-30 sm:right-8 sm:top-8">
            <button
              type="button"
              className="group rounded-full border border-[#d3d6da] bg-white/80 p-3 text-[#1a1a1b] shadow-sm transition hover:bg-white"
              onClick={() => setIsSettingsOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={isSettingsOpen}
              aria-label="Open settings"
            >
              <SettingsIcon className="h-5 w-5" />
            </button>
          </div>

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
              <SettingsMenu
                settings={settings}
                onToggle={toggleSetting}
                onClose={() => setIsSettingsOpen(false)}
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
