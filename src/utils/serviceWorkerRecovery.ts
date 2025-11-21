/**
 * Detects stale service worker caches that lead to missing chunk errors
 * (e.g. "Failed to fetch dynamically imported module") and forces a
 * one-time cleanup/reload to pull the latest assets.
 */
export const installAssetRecoveryHandlers = () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }

  const RECOVERY_FLAG = 'crosswordly-cache-recovered';

  const triggerRecovery = async () => {
    if (sessionStorage.getItem(RECOVERY_FLAG)) return;
    sessionStorage.setItem(RECOVERY_FLAG, 'true');

    try {
      const registrations = await navigator.serviceWorker?.getRegistrations();
      registrations?.forEach((registration) => registration.unregister());

      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    } catch (error) {
      console.warn('[Crosswordly] Asset recovery failed', error);
    } finally {
      window.location.reload();
    }
  };

  const isChunkLoadError = (message?: string) =>
    typeof message === 'string' &&
    (message.includes('Failed to fetch dynamically imported module') ||
      message.includes('Importing a module script failed.') ||
      /Loading chunk [\w-]+ failed/i.test(message));

  const handlePromiseRejection = (event: PromiseRejectionEvent) => {
    if (isChunkLoadError(String(event.reason))) {
      void triggerRecovery();
    }
  };

  const handleResourceError = (event: ErrorEvent) => {
    const target = event.target as HTMLElement | null;
    const src =
      (target as HTMLImageElement | HTMLScriptElement | HTMLLinkElement | null)?.src ||
      (target as HTMLLinkElement | null)?.href;

    if (src && src.includes('/assets/')) {
      void triggerRecovery();
    }
  };

  window.addEventListener('unhandledrejection', handlePromiseRejection);
  window.addEventListener('error', handleResourceError, true);
};

