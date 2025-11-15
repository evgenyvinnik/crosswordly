import { useEffect, useMemo, useState } from 'react';
import { animated, useSpring } from '@react-spring/web';
import SettingsMenu, { DEFAULT_SETTINGS, SettingsState } from './components/SettingsMenu';
import SplashScreen from './components/SplashScreen';
import GameScreen from './components/GameScreen';
import LevelSelectScreen, { LevelDescriptor } from './components/LevelSelectScreen';
import SettingsIcon from './components/icons/SettingsIcon';
import PodiumIcon from './components/icons/PodiumIcon';
import CloseIcon from './components/icons/CloseIcon';
import StatsDialog from './components/StatsDialog';
import TutorialIntro from './components/game/TutorialIntro';
import { LEVEL_DEFINITIONS, TUTORIAL_LEVEL } from './levels';
import { useProgressStore } from './state/useProgressStore';

export default function App() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [hasSplashExited, setHasSplashExited] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'tutorial' | 'levels' | 'level'>('tutorial');
  const [selectedLevel, setSelectedLevel] = useState<LevelDescriptor | null>(null);
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
          puzzle,
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

  const handleTutorialComplete = () => {
    markLevelCompleted(TUTORIAL_LEVEL.id, TUTORIAL_LEVEL.words.length);
  };

  const handleTutorialExit = () => {
    setSelectedLevel(null);
    setActiveScreen('levels');
  };

  const handleLevelComplete = (level: LevelDescriptor) => {
    markLevelCompleted(level.id, level.wordCount);
  };

  const handleLevelExit = () => {
    setSelectedLevel(null);
    setActiveScreen('levels');
  };

  const handleLevelSelect = (levelId: string) => {
    const descriptor = levels.find((level) => level.id === levelId);
    if (!descriptor) {
      return;
    }
    if (descriptor.isAvailable) {
      recordSessionPlay();
    }
    if (levelId === TUTORIAL_LEVEL.id) {
      setSelectedLevel(null);
      setActiveScreen('tutorial');
      return;
    }
    if (!descriptor.isAvailable) {
      return;
    }
    setSelectedLevel(descriptor);
    setActiveScreen('level');
  };

  const floatingButtonClass =
    'flex h-11 w-11 items-center justify-center rounded-full border border-[#d3d6da] bg-white/85 text-[#1a1a1b] shadow-sm transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a1a1b]/40';

  const renderActionButtons = (options?: { onClose?: () => void; closeLabel?: string }) => {
    const handleClose = options?.onClose;
    const closeLabel = options?.closeLabel ?? 'Return to level select';
    return (
      <>
        <button
          type="button"
          className={floatingButtonClass}
          onClick={() => setIsSettingsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isSettingsOpen}
          aria-label="Open settings"
        >
          <SettingsIcon className="h-5 w-5" />
        </button>
        <button
          type="button"
          className={floatingButtonClass}
          onClick={() => setIsStatsOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={isStatsOpen}
          aria-label="Open stats"
        >
          <PodiumIcon className="h-5 w-5" />
          <span className="sr-only">Stats</span>
        </button>
        {handleClose ? (
          <button
            type="button"
            className={floatingButtonClass}
            onClick={handleClose}
            aria-label={closeLabel}
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        ) : null}
      </>
    );
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
        <GameScreen
          level={TUTORIAL_LEVEL}
          onComplete={handleTutorialComplete}
          onExit={handleTutorialExit}
          topRightActions={renderActionButtons({
            onClose: handleTutorialExit,
            closeLabel: 'Close tutorial and view levels',
          })}
          header={<TutorialIntro />}
        />
      ) : null}

      {hasSplashExited && activeScreen === 'levels' ? (
        <LevelSelectScreen
          levels={levels}
          onSelectLevel={handleLevelSelect}
          topRightActions={renderActionButtons()}
        />
      ) : null}
      {hasSplashExited && activeScreen === 'level' && selectedLevel ? (
        <GameScreen
          level={selectedLevel.puzzle}
          onComplete={() => handleLevelComplete(selectedLevel)}
          onExit={handleLevelExit}
          topRightActions={renderActionButtons({
            onClose: handleLevelExit,
            closeLabel: 'Return to level select',
          })}
          header={
            <div className="mx-auto flex max-w-3xl flex-col items-center text-center text-[#1a1a1b]">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#8c8f94]">
                Level
              </p>
              <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
                {selectedLevel.title}
              </h1>
              <p className="mt-2 text-base text-[#4b4e52]">{selectedLevel.description}</p>
            </div>
          }
        />
      ) : null}

      {hasSplashExited && isSettingsOpen ? (
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
      {isStatsOpen ? (
        <StatsDialog isOpen stats={stats} onRequestClose={() => setIsStatsOpen(false)} />
      ) : null}
    </div>
  );
}
