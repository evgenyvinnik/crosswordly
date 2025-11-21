import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { animated, useSpring } from '@react-spring/web';
import type { SpringValue } from '@react-spring/web';
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
import { trackPageView } from './lib/analytics';
import AppMenu from './components/menu/AppMenu';
import { useDirection } from './hooks/useDirection';
import { useTranslation } from 'react-i18next';
import { useSEOMetadata } from './utils/seo';

// Lazy load heavy components
const GameScreen = lazy(() => import('./components/game/GameScreen'));
const LevelSelectScreen = lazy(() => import('./components/levels/LevelSelectScreen'));

const SUSPENSE_FALLBACK = <div className="flex h-screen items-center justify-center" />;
const SETTINGS_OVERLAY_STYLE =
  'fixed inset-0 z-30 flex min-h-screen items-center justify-center bg-[#f6f5f0]/90 px-4 py-10 backdrop-blur-sm';

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

type SplashOverlayProps = {
  isVisible: boolean;
  splashSpring: SpringValue<{ opacity: number }>;
  isSplashComplete: boolean;
  onComplete: () => void;
};

const SplashOverlay = ({
  isVisible,
  splashSpring,
  isSplashComplete,
  onComplete,
}: SplashOverlayProps) => {
  if (!isVisible) {
    return null;
  }

  return (
    <animated.div
      style={splashSpring}
      className="absolute inset-0 z-20 bg-[#f6f5f0]"
      aria-hidden={isSplashComplete}
    >
      <SplashScreen onComplete={onComplete} />
    </animated.div>
  );
};

type SettingsOverlayProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
};

const SettingsOverlay = ({ isOpen, onClose, children }: SettingsOverlayProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={SETTINGS_OVERLAY_STYLE} role="dialog" aria-modal="true">
      <div className="absolute inset-0 h-full w-full" aria-hidden="true" onClick={onClose} />
      {children}
    </div>
  );
};

type AboutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AboutModal = ({ isOpen, onClose }: AboutModalProps) => {
  if (!isOpen) {
    return null;
  }

  return <AboutDialog onClose={onClose} />;
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
  const { levelId } = useParams<{ levelId?: string }>();
  const navigate = useNavigate();
  const location = window.location.hash;
  const { i18n } = useTranslation();

  // Simplify language code (e.g., en-US -> en)
  const currentLang = i18n.language.split('-')[0];

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
  const [activeScreen, setActiveScreen] = useState<'tutorial' | 'levels' | 'level'>('tutorial');
  const [selectedLevel, setSelectedLevel] = useState<LevelDescriptor | null>(null);

  // Check if tutorial is completed (after store hydration)
  const tutorialCompleted = completedLevelIds.includes('tutorial'); // SEO metadata
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

  // Handle hydration - redirect to /levels for returning users on home page
  useEffect(() => {
    if (!hasSplashExited) {
      return; // Wait for splash to exit
    }

    const isOnHome = location === '#/' || location === '' || location === '#';

    if (tutorialCompleted && isOnHome) {
      // Redirect to levels if returning user on home page
      const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
      navigate(`${langPrefix}/levels`);
    }
  }, [hasSplashExited, tutorialCompleted, location, currentLang, navigate]);

  // Handle URL-based level selection and routing
  useEffect(() => {
    if (!hasSplashExited) return;

    // Check if we're on the levels route
    const isLevelsRoute = location.includes('/levels');

    if (isLevelsRoute) {
      setActiveScreen('levels');
      setSelectedLevel(null);
      return;
    }

    if (levelId) {
      const level = baseLevels.find((l) => l.id === levelId);
      if (level) {
        if (levelId === 'tutorial') {
          setSelectedLevel(null);
          setActiveScreen('tutorial');
        } else {
          setSelectedLevel(level);
          setActiveScreen('level');
        }
      }
    } else {
      // No levelId in URL - default to tutorial for new users, levels for returning users
      const isOnHome = location === '#/' || location === '' || location === '#';
      if (isOnHome && tutorialCompleted) {
        setActiveScreen('levels');
      } else if (isOnHome && !tutorialCompleted) {
        setActiveScreen('tutorial');
      }
    }
  }, [levelId, baseLevels, hasSplashExited, location, tutorialCompleted]);

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
