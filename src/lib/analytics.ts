const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let isInitialized = false;

const hasMeasurementId = Boolean(GA_MEASUREMENT_ID);

const withGtag = (callback: (gtag: (...args: unknown[]) => void) => void) => {
  if (typeof window === 'undefined' || !hasMeasurementId || !window.gtag) {
    return;
  }
  callback(window.gtag);
};

export const initAnalytics = () => {
  if (typeof document === 'undefined' || isInitialized || !hasMeasurementId) {
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[data-analytics-provider="google"]',
  );
  if (!existingScript) {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.dataset.analyticsProvider = 'google';
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer?.push(args);
    };

  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);

  isInitialized = true;
};

export const trackEvent = (eventName: string, params?: Record<string, unknown>) => {
  withGtag((gtag) => {
    gtag('event', eventName, params ?? {});
  });
};

export const trackPageView = (path?: string, title?: string) => {
  trackEvent('page_view', {
    page_path: path ?? (typeof window !== 'undefined' ? window.location.pathname : undefined),
    page_title: title ?? (typeof document !== 'undefined' ? document.title : undefined),
  });
};
