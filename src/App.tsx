import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { animated, useSpring } from '@react-spring/web';
import SettingsMenu, { DEFAULT_SETTINGS, SettingsState } from './components/menu/SettingsMenu';
import SplashScreen from './components/SplashScreen';
import type { LevelDescriptor } from './components/levels/LevelSelectScreen';
import CloseButton from './components/icons/CloseButton';
import StatsDialog from './components/menu/StatsDialog';
import AboutDialog from './components/menu/AboutDialog';
import TutorialIntro from './components/game/TutorialIntro';
import LevelIntro from './components/game/LevelIntro';
import { LEVEL_DEFINITIONS, TUTORIAL_LEVEL } from './components/levels/levelConfigs';
import { useLocalizedLevels } from './components/levels/levelLocalization';
import { useProgressStore } from './state/useProgressStore';
import type { ProgressState } from './state/useProgressStore';
import { trackPageView } from './lib/analytics';
import AppMenu from './components/menu/AppMenu';
import { useDirection } from './hooks/useDirection';
import { useTranslation } from 'react-i18next';
import { useSEOMetadata } from './utils/seo';

// Lazy load heavy components
const GameScreen = lazy(() => import('./components/game/GameScreen'));
const LevelSelectScreen = lazy(() => import('./components/levels/LevelSelectScreen'));

export default function App() {
  useDirection(); // Set document direction based on language
  const { levelId } = useParams<{ levelId?: string }>();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [hasSplashExited, setHasSplashExited] = useState(false);
  const [activeScreen, setActiveScreen] = useState<'tutorial' | 'levels' | 'level'>('tutorial');
  const [selectedLevel, setSelectedLevel] = useState<LevelDescriptor | null>(null);
  const completedLevelIds = useProgressStore((state) => state.completedLevelIds);
  const recordSessionPlay = useProgressStore((state) => state.recordSessionPlay);
  const markLevelCompleted = useProgressStore((state) => state.markLevelCompleted);
  const stats = useProgressStore((state) => state.stats);
  const resetProgress = useProgressStore((state) => state.resetProgress);

  // SEO metadata
  useSEOMetadata(
    selectedLevel?.title
      ? `${selectedLevel.title} - Crosswordly`
      : 'Crosswordly - Five-Letter Word Puzzle Game',
  );

  const handleEraseProgress = () => {
    resetProgress();
    setActiveScreen('tutorial');
    setSelectedLevel(null);
    navigate('/');
  };

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

  useEffect(() => {
    const persistApi = useProgressStore.persist;
    if (!persistApi) {
      return;
    }

    const skipTutorialIfCompleted = (state?: ProgressState) => {
      const nextState = state ?? useProgressStore.getState();
      if (!nextState.completedLevelIds.includes(TUTORIAL_LEVEL.id)) {
        return;
      }
      setActiveScreen((current) => (current === 'tutorial' ? 'levels' : current));
    };

    if (persistApi.hasHydrated?.()) {
      skipTutorialIfCompleted();
    }

    const unsubscribe = persistApi.onFinishHydration?.(skipTutorialIfCompleted);

    return () => {
      unsubscribe?.();
    };
  }, []);

  // Handle URL-based level selection
  useEffect(() => {
    if (!levelId || !hasSplashExited) return;

    const level = baseLevels.find((l) => l.id === levelId);
    if (level) {
      if (levelId === TUTORIAL_LEVEL.id) {
        setSelectedLevel(null);
        setActiveScreen('tutorial');
      } else {
        setSelectedLevel(level);
        setActiveScreen('level');
      }
    }
  }, [levelId, baseLevels, hasSplashExited]);

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

  useEffect(() => {
    trackPageView();
  }, []);

  // Apply localization to the levels
  const localizedBaseLevels = useLocalizedLevels(baseLevels);

  const levels: LevelDescriptor[] = useMemo(
    () =>
      localizedBaseLevels.map((level) => ({
        ...level,
        isCompleted: completedLevelIds.includes(level.id),
      })),
    [localizedBaseLevels, completedLevelIds],
  );

  const handleTutorialComplete = () => {
    recordSessionPlay();
    markLevelCompleted(TUTORIAL_LEVEL.id, TUTORIAL_LEVEL.words.length);
  };

  const handleTutorialExit = () => {
    setSelectedLevel(null);
    setActiveScreen('levels');
    const langPrefix = i18n.language !== 'en' ? `/${i18n.language}` : '';
    navigate(langPrefix || '/');
  };

  const handleLevelComplete = (level: LevelDescriptor) => {
    recordSessionPlay();
    markLevelCompleted(level.id, level.wordCount);
  };

  const handleLevelExit = () => {
    setSelectedLevel(null);
    setActiveScreen('levels');
    const langPrefix = i18n.language !== 'en' ? `/${i18n.language}` : '';
    navigate(langPrefix || '/');
  };

  const handleLevelSelect = (selectedLevelId: string) => {
    const descriptor = levels.find((level) => level.id === selectedLevelId);
    if (!descriptor) {
      return;
    }
    if (selectedLevelId === TUTORIAL_LEVEL.id) {
      setSelectedLevel(null);
      setActiveScreen('tutorial');
      const langPrefix = i18n.language !== 'en' ? `/${i18n.language}` : '';
      navigate(`${langPrefix}/level/${selectedLevelId}`);
      return;
    }
    if (!descriptor.isAvailable) {
      return;
    }
    setSelectedLevel(descriptor);
    setActiveScreen('level');
    const langPrefix = i18n.language !== 'en' ? `/${i18n.language}` : '';
    navigate(`${langPrefix}/level/${selectedLevelId}`);
  };

  const SETTINGS_OVERLAY_STYLE =
    'fixed inset-0 z-30 flex min-h-screen items-center justify-center bg-[#f6f5f0]/90 px-4 py-10 backdrop-blur-sm';

  const renderActionButtons = (options?: { onClose?: () => void; closeLabel?: string }) => {
    const handleClose = options?.onClose;
    const closeLabel = options?.closeLabel ?? 'Return to level select';
    return (
      <div className="flex w-full items-center justify-between gap-3">
        <AppMenu
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenStats={() => setIsStatsOpen(true)}
          onOpenAbout={() => setIsAboutOpen(true)}
        />
        {handleClose ? <CloseButton onClick={handleClose} ariaLabel={closeLabel} /> : null}
      </div>
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
        <Suspense fallback={<div className="flex h-screen items-center justify-center" />}>
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
        </Suspense>
      ) : null}

      {hasSplashExited && activeScreen === 'levels' ? (
        <Suspense fallback={<div className="flex h-screen items-center justify-center" />}>
          <LevelSelectScreen
            levels={levels}
            onSelectLevel={handleLevelSelect}
            topRightActions={renderActionButtons()}
          />
        </Suspense>
      ) : null}
      {hasSplashExited && activeScreen === 'level' && selectedLevel ? (
        <Suspense fallback={<div className="flex h-screen items-center justify-center" />}>
          <GameScreen
            level={selectedLevel.puzzle}
            onComplete={() => handleLevelComplete(selectedLevel)}
            onExit={handleLevelExit}
            topRightActions={renderActionButtons({
              onClose: handleLevelExit,
              closeLabel: 'Return to level select',
            })}
            header={
              <LevelIntro title={selectedLevel.title} description={selectedLevel.description} />
            }
            levelTitle={selectedLevel.title}
          />
        </Suspense>
      ) : null}

      {hasSplashExited && isSettingsOpen ? (
        <div className={SETTINGS_OVERLAY_STYLE} role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
            onClick={() => setIsSettingsOpen(false)}
          />
          <SettingsMenu
            settings={settings}
            onToggle={toggleSetting}
            onClose={() => setIsSettingsOpen(false)}
            onEraseProgress={handleEraseProgress}
          />
        </div>
      ) : null}
      {isStatsOpen ? (
        <StatsDialog isOpen stats={stats} onRequestClose={() => setIsStatsOpen(false)} />
      ) : null}
      {isAboutOpen ? <AboutDialog onClose={() => setIsAboutOpen(false)} /> : null}
    </div>
  );
}
