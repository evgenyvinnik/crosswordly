import { useEffect, useMemo, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import SettingsMenu, { DEFAULT_SETTINGS, SettingsState } from './components/SettingsMenu';
import SplashScreen from './components/SplashScreen';
import TutorialScreen from './components/TutorialScreen';
import LevelSelectScreen, { LevelDescriptor } from './components/LevelSelectScreen';
import SettingsIcon from './components/icons/SettingsIcon';
import StatsDialog from './components/StatsDialog';
import { LEVEL_DEFINITIONS, TUTORIAL_LEVEL } from './levels';
import { useProgressStore } from './state/useProgressStore';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [hasSplashExited, setHasSplashExited] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'tutorial' | 'levels' | 'main'>('tutorial');
  const completedLevelIds = useProgressStore((state) => state.completedLevelIds);
  const recordSessionPlay = useProgressStore((state) => state.recordSessionPlay);
  const markLevelCompleted = useProgressStore((state) => state.markLevelCompleted);
  const stats = useProgressStore((state) => state.stats);

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

  const isTutorialComplete = completedLevelIds.includes(TUTORIAL_LEVEL.id);
  const isMainVisible = isSplashComplete && isTutorialComplete && activeScreen === 'main';

  const mainSpring = useSpring({
    opacity: isMainVisible ? 1 : 0,
    config: { tension: 240, friction: 28 },
  });

  const baseLevels: LevelDescriptor[] = useMemo(
    () =>
      LEVEL_DEFINITIONS.map(
        ({ id, title, description, order, isAvailable, hasInstructions, puzzle }) => ({
          id,
          title,
          description,
          order,
          isAvailable,
          hasInstructions,
          wordCount: puzzle.words.length,
        }),
      ),
    [],
  );

  const levels: LevelDescriptor[] = useMemo(
    () =>
      baseLevels.map((level) => ({
        ...level,
        isCompleted: completedLevelIds.includes(level.id),
      })),
    [baseLevels, completedLevelIds],
  );

  const nextIncompleteLevel = useMemo(() => {
    const ordered = [...levels].sort((a, b) => a.order - b.order);
    return (
      ordered.find(
        (level) => level.id !== TUTORIAL_LEVEL.id && level.isAvailable && !level.isCompleted,
      ) ?? null
    );
  }, [levels]);

  const handleTutorialComplete = () => {
    markLevelCompleted(TUTORIAL_LEVEL.id, TUTORIAL_LEVEL.words.length);
  };

  const handleTutorialExit = () => {
    setActiveScreen('levels');
  };

  const handleLevelSelect = (levelId: string) => {
    const definition = LEVEL_DEFINITIONS.find((level) => level.id === levelId);
    if (definition?.isAvailable) {
      recordSessionPlay();
    }
    if (levelId === TUTORIAL_LEVEL.id) {
      setActiveScreen('tutorial');
      return;
    }
    setActiveScreen('main');
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
        <TutorialScreen
          onComplete={handleTutorialComplete}
          onExit={handleTutorialExit}
          onNextLevel={handleLevelSelect}
          nextLevel={nextIncompleteLevel}
        />
      ) : null}

      {hasSplashExited && activeScreen === 'levels' ? (
        <LevelSelectScreen levels={levels} onSelectLevel={handleLevelSelect} />
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
          <div className="absolute right-4 top-4 z-30 flex flex-col items-end gap-3 sm:right-8 sm:top-8">
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
            <button
              type="button"
              className="rounded-full border border-[#d3d6da] bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#1a1a1b] shadow-sm transition hover:bg-white"
              onClick={() => setIsStatsOpen(true)}
            >
              Stats
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
      {isStatsOpen ? (
        <StatsDialog isOpen stats={stats} onRequestClose={() => setIsStatsOpen(false)} />
      ) : null}
    </div>
  );
}
