import ReactGA from 'react-ga4';

const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

let isInitialized = false;

const hasMeasurementId = GA_MEASUREMENT_ID.length > 0;

const ensureAnalytics = () => {
  if (typeof window === 'undefined' || !hasMeasurementId) {
    return false;
  }

  if (!isInitialized) {
    ReactGA.initialize(GA_MEASUREMENT_ID);
    isInitialized = true;
  }

  return true;
};

export const initAnalytics = () => {
  ensureAnalytics();
};

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (!ensureAnalytics()) {
    return;
  }
  ReactGA.event(eventName, params);
};

export const trackPageView = (path?: string, title?: string) => {
  if (!ensureAnalytics()) {
    return;
  }

  const payload: {
    hitType: 'pageview';
    page?: string;
    title?: string;
  } = { hitType: 'pageview' };

  const defaultPath = typeof window !== 'undefined' ? window.location.pathname : undefined;
  const defaultTitle = typeof document !== 'undefined' ? document.title : undefined;

  if (path ?? defaultPath) {
    payload.page = path ?? defaultPath;
  }

  if (title ?? defaultTitle) {
    payload.title = title ?? defaultTitle;
  }

  ReactGA.send(payload);
};

// Track when user views the level select screen
export const trackLevelSelectView = () => {
  trackEvent('level_select_view', {
    category: 'navigation',
    label: 'User viewed level selection screen',
  });
};

// Track when user starts playing a game level
export const trackGameLevelStart = (levelId: string, levelCategory?: string) => {
  trackEvent('game_level_start', {
    category: 'gameplay',
    label: `Started level: ${levelId}`,
    level_id: levelId,
    level_category: levelCategory,
  });
};

// Track when user completes a game level
export const trackGameLevelComplete = (
  levelId: string,
  wordCount: number,
  levelCategory?: string,
) => {
  trackEvent('game_level_complete', {
    category: 'gameplay',
    label: `Completed level: ${levelId}`,
    level_id: levelId,
    word_count: wordCount,
    level_category: levelCategory,
  });
};

// Track when user views a shared crossword puzzle
export const trackCrosswordView = (levelId: string) => {
  trackEvent('crossword_view', {
    category: 'sharing',
    label: `Viewed shared crossword: ${levelId}`,
    level_id: levelId,
  });
};

// Track when user completes a shared crossword puzzle
export const trackCrosswordComplete = (levelId: string) => {
  trackEvent('crossword_complete', {
    category: 'sharing',
    label: `Completed shared crossword: ${levelId}`,
    level_id: levelId,
  });
};

// Track when user shares a puzzle
export const trackPuzzleShare = (levelId: string, method: 'copy' | 'download') => {
  trackEvent('puzzle_share', {
    category: 'sharing',
    label: `Shared puzzle: ${levelId}`,
    level_id: levelId,
    share_method: method,
  });
};
