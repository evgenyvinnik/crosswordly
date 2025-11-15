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
