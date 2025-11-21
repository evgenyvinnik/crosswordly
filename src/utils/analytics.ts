/**
 * Centralized helpers for recording Google Analytics events.
 * The functions in this module wrap `react-ga4` so that events are only sent
 * when a measurement ID is configured and the window/document objects exist.
 */
import ReactGA from 'react-ga4';

/** Google Analytics measurement id pulled from the Vite build-time environment. */
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

let isInitialized = false;

/** True when a measurement id exists and analytics can publish events. */
const hasMeasurementId = GA_MEASUREMENT_ID.length > 0;

/**
 * Lazily initializes Google Analytics once per runtime and returns whether it is safe
 * to send tracking data. In non-browser environments (SSR/tests) the function short-circuits.
 *
 * @returns {boolean} Indicates whether analytics are configured and ready.
 */
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

/**
 * Initializes analytics early on app boot. Safe to call multiple times because the
 * underlying wrapper guards against duplicate initialization.
 */
export const initAnalytics = () => {
  ensureAnalytics();
};

/**
 * Sends a custom analytics event when analytics are available.
 *
 * @param {string} eventName - Google Analytics event name.
 * @param {Record<string, unknown>} [params] - Optional payload forwarded to GA.
 */
export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  if (!ensureAnalytics()) {
    return;
  }
  ReactGA.event(eventName, params);
};

/**
 * Tracks a Google Analytics page view.
 *
 * @param {string} [path] - Explicit pathname for the view; defaults to window.location.
 * @param {string} [title] - Page title override; defaults to document.title.
 */
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

/** Tracks when the player opens the level selection view. */
export const trackLevelSelectView = () => {
  trackEvent('level_select_view', {
    category: 'navigation',
    label: 'User viewed level selection screen',
  });
};

/**
 * Records the beginning of a level play session.
 *
 * @param {string} levelId - Identifier of the level shown to the player.
 * @param {string} [levelCategory] - Optional grouping (difficulty pack, theme, etc.).
 */
export const trackGameLevelStart = (levelId: string, levelCategory?: string) => {
  trackEvent('game_level_start', {
    category: 'gameplay',
    label: `Started level: ${levelId}`,
    level_id: levelId,
    level_category: levelCategory,
  });
};

/**
 * Records a successful completion of a level including word counts for pacing analytics.
 *
 * @param {string} levelId - Identifier of the completed level.
 * @param {number} wordCount - Number of words/entries solved in the level.
 * @param {string} [levelCategory] - Optional grouping (difficulty pack, theme, etc.).
 */
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

/**
 * Marks an impression of a shared crossword, useful for measuring share reach.
 *
 * @param {string} levelId - Identifier encoded in the shared URL.
 */
export const trackCrosswordView = (levelId: string) => {
  trackEvent('crossword_view', {
    category: 'sharing',
    label: `Viewed shared crossword: ${levelId}`,
    level_id: levelId,
  });
};

/**
 * Marks the completion of a crossword that the user opened via a share link.
 *
 * @param {string} levelId - Identifier encoded in the shared URL.
 */
export const trackCrosswordComplete = (levelId: string) => {
  trackEvent('crossword_complete', {
    category: 'sharing',
    label: `Completed shared crossword: ${levelId}`,
    level_id: levelId,
  });
};

/**
 * Tracks that the player shared a puzzle either by copying a link or downloading.
 *
 * @param {string} levelId - Identifier of the puzzle the user shared.
 * @param {'copy' | 'download'} method - Method used to share the puzzle.
 */
export const trackPuzzleShare = (levelId: string, method: 'copy' | 'download') => {
  trackEvent('puzzle_share', {
    category: 'sharing',
    label: `Shared puzzle: ${levelId}`,
    level_id: levelId,
    share_method: method,
  });
};
