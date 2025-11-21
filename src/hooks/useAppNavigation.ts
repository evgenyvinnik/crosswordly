import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { LevelDescriptor } from '../components/levels/LevelSelectScreen';

type UseAppNavigationProps = {
  baseLevels: LevelDescriptor[];
  tutorialCompleted: boolean;
  hasSplashExited: boolean;
};

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

  const [activeScreen, setActiveScreen] = useState<'tutorial' | 'levels' | 'level'>('tutorial');
  const [selectedLevel, setSelectedLevel] = useState<LevelDescriptor | null>(null);

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

  return {
    activeScreen,
    setActiveScreen,
    selectedLevel,
    setSelectedLevel,
    currentLang,
    navigate,
  };
};
