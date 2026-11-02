import { addTransitionType, startTransition, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LevelDescriptor } from '../components/levels/LevelSelectScreen';
import { NAV_BACK, NAV_FORWARD } from '../components/shared/transitions';

type Screen = 'tutorial' | 'levels' | 'level';

type UseAppNavigationProps = {
  baseLevels: LevelDescriptor[];
  tutorialCompleted: boolean;
  hasSplashExited: boolean;
};

/**
 * Hook to manage application navigation and routing state.
 * Handles URL synchronization, level selection, and initial redirects based on user progress.
 *
 * @param props - Configuration properties
 * @param props.baseLevels - List of available levels
 * @param props.tutorialCompleted - Whether the user has completed the tutorial
 * @param props.hasSplashExited - Whether the splash screen animation has finished
 * @returns Navigation state and helpers
 */
export const useAppNavigation = ({
  baseLevels,
  tutorialCompleted,
  hasSplashExited,
}: UseAppNavigationProps) => {
  const { levelId } = useParams<{ levelId?: string }>();
  const navigate = useNavigate();
  const location = window.location.hash;
  const { i18n } = useTranslation();
  const currentLang = i18n.language.split('-')[0];

  const [activeScreen, setActiveScreen] = useState<Screen>('tutorial');
  const [selectedLevel, setSelectedLevel] = useState<LevelDescriptor | null>(null);

  // Whether the home URL should show the level list, decided when the player arrives at a URL:
  // only players who had already finished the tutorial skip it. Finishing the tutorial while on
  // the home URL must not switch screens, or its completion dialog would vanish unseen.
  const [homeShowsLevels, setHomeShowsLevels] = useState(tutorialCompleted);
  const [homeDecisionLocation, setHomeDecisionLocation] = useState(location);
  if (location !== homeDecisionLocation) {
    setHomeDecisionLocation(location);
    setHomeShowsLevels(tutorialCompleted);
  }

  // Handle hydration - redirect to /levels for returning users on home page
  useEffect(() => {
    if (!hasSplashExited) {
      return; // Wait for splash to exit
    }

    const isOnHome = location === '#/' || location === '' || location === '#';

    if (homeShowsLevels && isOnHome) {
      // Redirect to levels if returning user on home page
      const langPrefix = currentLang !== 'en' ? `/${currentLang}` : '';
      navigate(`${langPrefix}/levels`);
    }
  }, [hasSplashExited, homeShowsLevels, location, currentLang, navigate]);

  // Handle URL-based level selection and routing. This also runs while the splash is showing so the
  // right screen is ready to reveal. Browser back/forward changes don't animate: React renders
  // popstate updates synchronously, never as view transitions.
  useEffect(() => {
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
      if (isOnHome && homeShowsLevels) {
        setActiveScreen('levels');
      } else if (isOnHome && !homeShowsLevels) {
        setActiveScreen('tutorial');
      }
    }
  }, [levelId, baseLevels, location, homeShowsLevels]);

  /**
   * Shows a screen in response to a player action. A screen change runs as a transition tagged
   * with its direction, so the leaving and entering screens slide (see `ScreenTransition`):
   * entering a puzzle moves forward and returning to the level list moves back.
   *
   * @param screen - The screen to show
   * @param level - The level to play on the `level` screen
   */
  const showScreen = (screen: Screen, level: LevelDescriptor | null = null) => {
    const apply = () => {
      setActiveScreen(screen);
      setSelectedLevel(level);
    };
    // React would keep the type of a transition that changes nothing for the next transition
    if (screen === activeScreen) {
      apply();
      return;
    }
    startTransition(() => {
      addTransitionType(screen === 'levels' ? NAV_BACK : NAV_FORWARD);
      apply();
    });
  };

  return {
    activeScreen,
    selectedLevel,
    showScreen,
    currentLang,
    navigate,
  };
};
