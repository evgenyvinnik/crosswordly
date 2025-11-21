import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useSpring } from '@react-spring/web';
import SettingsMenu, { DEFAULT_SETTINGS, SettingsState } from './components/menu/SettingsMenu';
import type { LevelDescriptor } from './components/levels/LevelSelectScreen';
import CloseButton from './components/icons/CloseButton';
import StatsDialog from './components/menu/StatsDialog';
import TutorialIntro from './components/game/TutorialIntro';
import LevelIntro from './components/game/LevelIntro';
import { LEVEL_DEFINITIONS, TUTORIAL_LEVEL } from './components/levels/levelConfigs';
import { useLocalizedLevels } from './components/levels/levelLocalization';
import { useProgressStore } from './state/useProgressStore';
import { trackPageView } from './lib/analytics';
import AppMenu from './components/menu/AppMenu';
import { useDirection } from './hooks/useDirection';
import { useSEOMetadata } from './utils/seo';
import SplashOverlay from './components/overlays/SplashOverlay';
import SettingsOverlay from './components/overlays/SettingsOverlay';
import AboutModal from './components/overlays/AboutModal';
import { useAppNavigation } from './hooks/useAppNavigation';

// Lazy load heavy components
const GameScreen = lazy(() => import('./components/game/GameScreen'));
const LevelSelectScreen = lazy(() => import('./components/levels/LevelSelectScreen'));

const SUSPENSE_FALLBACK = <div className="flex h-screen items-center justify-center" />;

type VisibleSuspenseProps = {
  isVisible: boolean;
  children: ReactNode;
};

const VisibleSuspense = ({ isVisible, children }: VisibleSuspenseProps) => {
  if (!isVisible) {
    return null;
  }
  return <Suspense fallback={SUSPENSE_FALLBACK}>{children}</Suspense>;
};

type LevelScreenContentProps = {
  selectedLevel: LevelDescriptor | null;
  onComplete: (level: LevelDescriptor) => void;
  onExit: () => void;
  topRightActions: ReactNode;
};

const LevelScreenContent = ({
  selectedLevel,
  onComplete,
  onExit,
  topRightActions,
}: LevelScreenContentProps) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedLevel?.id]);

  if (!selectedLevel) {
    return null;
  }

  return (
    <GameScreen
      level={selectedLevel.puzzle}
      onComplete={() => onComplete(selectedLevel)}
      onExit={onExit}
      topRightActions={topRightActions}
      header={<LevelIntro title={selectedLevel.title} description={selectedLevel.description} />}
      levelTitle={selectedLevel.title}
    />
  );
};

export default function App() {
  useDirection(); // Set document direction based on language

  // Get progress state first
  const completedLevelIds = useProgressStore((state) => state.completedLevelIds);
  const recordSessionPlay = useProgressStore((state) => state.recordSessionPlay);
  const markLevelCompleted = useProgressStore((state) => state.markLevelCompleted);
  const stats = useProgressStore((state) => state.stats);
  const resetProgress = useProgressStore((state) => state.resetProgress);

  // Initialize state - don't check tutorial completion at init time because store may not be hydrated yet
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const [hasSplashExited, setHasSplashExited] = useState(false);

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

  // Check if tutorial is completed (after store hydration)
  const tutorialCompleted = completedLevelIds.includes('tutorial');

  const { activeScreen, setActiveScreen, selectedLevel, setSelectedLevel, currentLang, navigate } =
    useAppNavigation({
      baseLevels,
      tutorialCompleted,
      hasSplashExited,
    });

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
    const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
    navigate(langPrefix || '/');
  };

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
    markLevelCompleted('tutorial', TUTORIAL_LEVEL.words.length);
  };

  const handleTutorialExit = () => {
    setSelectedLevel(null);
    setActiveScreen('levels');
    const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
    navigate(`${langPrefix}/levels`);
  };

  const handleLevelComplete = (level: LevelDescriptor) => {
    recordSessionPlay();
    markLevelCompleted(level.id, level.wordCount);
  };

  const handleLevelExit = () => {
    setSelectedLevel(null);
    setActiveScreen('levels');
    const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
    navigate(`${langPrefix}/levels`);
  };

  const handleLevelSelect = (selectedLevelId: string) => {
    const descriptor = levels.find((level) => level.id === selectedLevelId);
    if (!descriptor) {
      return;
    }
    if (selectedLevelId === 'tutorial') {
      setSelectedLevel(null);
      setActiveScreen('tutorial');
      const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
      navigate(`${langPrefix}/level/${selectedLevelId}`);
      return;
    }
    if (!descriptor.isAvailable) {
      return;
    }
    setSelectedLevel(descriptor);
    setActiveScreen('level');
    const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
    navigate(`${langPrefix}/level/${selectedLevelId}`);
  };

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
      <SplashOverlay
        isVisible={!hasSplashExited}
        splashSpring={splashSpring}
        isSplashComplete={isSplashComplete}
        onComplete={() => setIsSplashComplete(true)}
      />

      <VisibleSuspense isVisible={hasSplashExited && activeScreen === 'tutorial'}>
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
      </VisibleSuspense>

      <VisibleSuspense isVisible={hasSplashExited && activeScreen === 'levels'}>
        <LevelSelectScreen
          levels={levels}
          onSelectLevel={handleLevelSelect}
          topRightActions={renderActionButtons()}
        />
      </VisibleSuspense>

      <VisibleSuspense isVisible={hasSplashExited && activeScreen === 'level'}>
        <LevelScreenContent
          selectedLevel={selectedLevel}
          onComplete={handleLevelComplete}
          onExit={handleLevelExit}
          topRightActions={renderActionButtons({
            onClose: handleLevelExit,
            closeLabel: 'Return to level select',
          })}
        />
      </VisibleSuspense>

      <SettingsOverlay
        isOpen={hasSplashExited && isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      >
        <SettingsMenu
          settings={settings}
          onToggle={toggleSetting}
          onClose={() => setIsSettingsOpen(false)}
          onEraseProgress={handleEraseProgress}
        />
      </SettingsOverlay>

      <StatsDialog
        isOpen={isStatsOpen}
        stats={stats}
        onRequestClose={() => setIsStatsOpen(false)}
      />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
