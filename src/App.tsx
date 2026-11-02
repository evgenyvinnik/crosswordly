import { lazy, startTransition, Suspense, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import SettingsMenu, { DEFAULT_SETTINGS, SettingsState } from './components/menu/SettingsMenu';
import type { LevelDescriptor } from './components/levels/LevelSelectScreen';
import CloseButton from './components/icons/CloseButton';
import StatsDialog from './components/menu/StatsDialog';
import TutorialIntro from './components/game/TutorialIntro';
import LevelIntro from './components/game/LevelIntro';
import { LEVEL_DEFINITIONS, TUTORIAL_LEVEL } from './components/levels/levelConfigs';
import { useLocalizedLevels } from './components/levels/levelLocalization';
import { useProgressStore } from './state/useProgressStore';
import { trackPageView } from './utils/analytics';
import { isSearchEngineBot } from './utils/userAgent';
import AppMenu from './components/menu/AppMenu';
import { useDirection } from './hooks/useDirection';
import { useSEOMetadata } from './utils/seo';
import SplashOverlay from './components/overlays/SplashOverlay';
import SettingsOverlay from './components/overlays/SettingsOverlay';
import AboutModal from './components/overlays/AboutModal';
import { useAppNavigation } from './hooks/useAppNavigation';
import { useCloseOnBack } from './hooks/useCloseOnBack';
import { ScreenTransition } from './components/shared/transitions';

// Lazy load heavy components
const GameScreen = lazy(() => import('./components/game/GameScreen'));
const LevelSelectScreen = lazy(() => import('./components/levels/LevelSelectScreen'));

const SUSPENSE_FALLBACK = <div className="flex h-screen items-center justify-center" />;

type ScreenProps = {
  isVisible: boolean;
  children: ReactNode;
};

/** Mounts a screen while it is visible; navigation transitions slide it in and out. */
const Screen = ({ isVisible, children }: ScreenProps) => {
  if (!isVisible) {
    return null;
  }
  return <ScreenTransition>{children}</ScreenTransition>;
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

/**
 * Root application component.
 * Manages global state, routing, and the main layout structure.
 * Handles the splash screen, navigation between screens (tutorial, levels, game),
 * and global overlays (settings, stats, about).
 */
export default function App() {
  useDirection(); // Set document direction based on language

  // Get progress state first
  const completedLevelIds = useProgressStore((state) => state.completedLevelIds);
  const recordSessionPlay = useProgressStore((state) => state.recordSessionPlay);
  const markLevelCompleted = useProgressStore((state) => state.markLevelCompleted);
  const stats = useProgressStore((state) => state.stats);
  const resetProgress = useProgressStore((state) => state.resetProgress);

  const shouldSkipSplash = isSearchEngineBot();

  // Initialize state - don't check tutorial completion at init time because store may not be hydrated yet
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsState>(DEFAULT_SETTINGS);
  const [hasSplashExited, setHasSplashExited] = useState(shouldSkipSplash);

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

  const { activeScreen, selectedLevel, showScreen, currentLang, navigate } = useAppNavigation({
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
    showScreen('tutorial');
    const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
    navigate(langPrefix || '/');
  };

  const toggleSetting = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Revealing the first screen as a transition keeps the splash up until that screen's code has
  // loaded, then fades the splash out over it
  const handleSplashComplete = () => {
    startTransition(() => setHasSplashExited(true));
  };

  /**
   * Opens or closes a dialog as a transition so its enter and exit animations play.
   *
   * @param setOpen - State setter for the dialog
   * @param isOpen - Whether the dialog should be open
   */
  const setDialogOpen = (setOpen: (isOpen: boolean) => void, isOpen: boolean) => {
    startTransition(() => setOpen(isOpen));
  };

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
    showScreen('levels');
    const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
    navigate(`${langPrefix}/levels`);
  };

  const handleLevelComplete = (level: LevelDescriptor) => {
    recordSessionPlay();
    markLevelCompleted(level.id, level.wordCount);
  };

  const handleLevelExit = () => {
    showScreen('levels');
    const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
    navigate(`${langPrefix}/levels`);
  };

  // Android Back does what the screen's close button does; on the level list it leaves the app
  useCloseOnBack(hasSplashExited && activeScreen === 'tutorial', handleTutorialExit);
  useCloseOnBack(hasSplashExited && activeScreen === 'level', handleLevelExit);

  const handleLevelSelect = (selectedLevelId: string) => {
    const descriptor = levels.find((level) => level.id === selectedLevelId);
    if (!descriptor) {
      return;
    }
    if (selectedLevelId === 'tutorial') {
      showScreen('tutorial');
      const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
      navigate(`${langPrefix}/level/${selectedLevelId}`);
      return;
    }
    if (!descriptor.isAvailable) {
      return;
    }
    showScreen('level', descriptor);
    const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
    navigate(`${langPrefix}/level/${selectedLevelId}`);
  };

  const renderActionButtons = (options?: { onClose?: () => void; closeLabel?: string }) => {
    const handleClose = options?.onClose;
    const closeLabel = options?.closeLabel ?? 'Return to level select';
    return (
      <div className="flex w-full items-center justify-between gap-3">
        <AppMenu
          onOpenSettings={() => setDialogOpen(setIsSettingsOpen, true)}
          onOpenStats={() => setDialogOpen(setIsStatsOpen, true)}
          onOpenAbout={() => setDialogOpen(setIsAboutOpen, true)}
        />
        {handleClose ? <CloseButton onClick={handleClose} ariaLabel={closeLabel} /> : null}
      </div>
    );
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f6f5f0] text-[#1a1a1b]">
      <SplashOverlay isVisible={!hasSplashExited} onComplete={handleSplashComplete} />

      {/* One boundary for every screen: when a transition shows a screen whose code hasn't loaded,
          the current screen stays up until it is ready instead of flashing the fallback */}
      <Suspense fallback={SUSPENSE_FALLBACK}>
        <Screen isVisible={hasSplashExited && activeScreen === 'tutorial'}>
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
        </Screen>

        <Screen isVisible={hasSplashExited && activeScreen === 'levels'}>
          <LevelSelectScreen
            levels={levels}
            onSelectLevel={handleLevelSelect}
            topRightActions={renderActionButtons()}
          />
        </Screen>

        <Screen isVisible={hasSplashExited && activeScreen === 'level'}>
          <LevelScreenContent
            selectedLevel={selectedLevel}
            onComplete={handleLevelComplete}
            onExit={handleLevelExit}
            topRightActions={renderActionButtons({
              onClose: handleLevelExit,
              closeLabel: 'Return to level select',
            })}
          />
        </Screen>
      </Suspense>

      <SettingsOverlay
        isOpen={hasSplashExited && isSettingsOpen}
        onClose={() => setDialogOpen(setIsSettingsOpen, false)}
      >
        <SettingsMenu
          settings={settings}
          onToggle={toggleSetting}
          onClose={() => setDialogOpen(setIsSettingsOpen, false)}
          onEraseProgress={handleEraseProgress}
        />
      </SettingsOverlay>

      <StatsDialog
        isOpen={isStatsOpen}
        stats={stats}
        onRequestClose={() => setDialogOpen(setIsStatsOpen, false)}
      />
      <AboutModal isOpen={isAboutOpen} onClose={() => setDialogOpen(setIsAboutOpen, false)} />
    </div>
  );
}
