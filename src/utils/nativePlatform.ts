/**
 * Helpers for running inside the native iOS and Android shells (Capacitor) instead of a browser.
 */
import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/languages';

/** True when the game runs inside the native app rather than a web browser. */
export const isNativeApp = Capacitor.isNativePlatform();

/** True inside the Android app, which has a system Back button and gesture to handle. */
export const isAndroidApp = Capacitor.getPlatform() === 'android';

/**
 * Lets the iOS app draw behind the Dynamic Island (or notch) and the home indicator, so each
 * screen's own background reaches the edges of the display instead of stopping at a strip of
 * window colour. Screens pad their content clear of them with `py-safe-*` (`src/index.css`), as
 * `env(safe-area-inset-*)` is only non-zero with `viewport-fit=cover`. The web view's automatic
 * inset is off for this (`contentInset: 'never'` in `capacitor.config.ts`). The website and the
 * Android app keep the plain viewport: there the browser or Capacitor keeps the page clear of the
 * system UI. Does nothing outside the iOS app.
 */
export const enableEdgeToEdgeOnIos = () => {
  if (Capacitor.getPlatform() !== 'ios') {
    return;
  }
  const viewport = document.querySelector('meta[name="viewport"]');
  viewport?.setAttribute('content', `${viewport.getAttribute('content')}, viewport-fit=cover`);
};

const playHaptic = (feedback: () => Promise<void>) => {
  if (!isNativeApp) {
    return;
  }
  feedback().catch(() => {
    // Haptics are a nicety: devices without a Taptic Engine or vibrator simply stay silent
  });
};

/** Light tap for selecting, picking up or removing a word. Does nothing on the web. */
export const hapticTap = () => playHaptic(() => Haptics.impact({ style: ImpactStyle.Light }));

/** Firmer tap when a word locks into the grid. Does nothing on the web. */
export const hapticPlace = () => playHaptic(() => Haptics.impact({ style: ImpactStyle.Medium }));

/** Error buzz when a word does not fit. Does nothing on the web. */
export const hapticError = () =>
  playHaptic(() => Haptics.notification({ type: NotificationType.Error }));

/** Success pattern when the puzzle is solved. Does nothing on the web. */
export const hapticSuccess = () =>
  playHaptic(() => Haptics.notification({ type: NotificationType.Success }));

/**
 * Public web address of the game. Inside the app the page origin is `capacitor://localhost`
 * (iOS) or `https://localhost` (Android), so links meant for other people (shared crosswords)
 * must point here instead.
 */
export const PUBLIC_SITE_URL = 'https://crosswordly.ca/';

/**
 * Opens the system share sheet for a link. Rejects when the player dismisses the sheet.
 *
 * @param url - Link to share.
 * @param title - Subject line used by apps such as Mail.
 */
export const shareLinkNatively = async (url: string, title: string) => {
  await Share.share({ title, url });
};

/**
 * Writes a PNG data URL to the app cache and opens the system share sheet for it, which offers
 * "Save Image" (iOS) or the gallery and Files apps (Android) alongside the usual targets. Neither
 * app web view saves `<a download>` links, so this replaces the browser download flow. Rejects
 * when the player dismisses the sheet.
 *
 * @param dataUrl - `data:image/png;base64,...` URL, e.g. from `canvas.toDataURL()`.
 * @param fileName - File name shown in the share sheet.
 */
export const shareImageNatively = async (dataUrl: string, fileName: string) => {
  const { uri } = await Filesystem.writeFile({
    path: fileName,
    data: dataUrl.slice(dataUrl.indexOf(',') + 1),
    directory: Directory.Cache,
  });
  await Share.share({ files: [uri] });
};

const backHandlers: (() => void)[] = [];

/**
 * Registers what the Android Back button should do while a dialog or screen is showing, such as
 * closing the dialog. The most recently registered handler runs first, so Back closes the top
 * dialog before the one under it.
 *
 * @param handler - Called on Back instead of the default behaviour.
 * @returns A function that unregisters the handler.
 */
export const pushBackHandler = (handler: () => void) => {
  backHandlers.push(handler);
  return () => {
    const index = backHandlers.lastIndexOf(handler);
    if (index !== -1) {
      backHandlers.splice(index, 1);
    }
  };
};

/** Whether the page shows a home route: `#/`, `#/levels` or their `#/es/levels` style forms. */
const isOnHomeRoute = () => {
  const path = window.location.hash.replace(/^#\/?/, '').split('?')[0];
  const segments = path.split('/').filter(Boolean);
  if (SUPPORTED_LANGUAGES.includes(segments[0] as SupportedLanguage)) {
    segments.shift();
  }
  return segments.length === 0 || (segments.length === 1 && segments[0] === 'levels');
};

/**
 * Handles the Android Back button and gesture. Back runs the newest handler from
 * `pushBackHandler` (closing a dialog, leaving a level); with none, it goes back in history, and
 * on a home route it sends the app to the background like other Android apps. Home routes skip
 * history because going back from the level list lands on `#/`, which redirects to it again.
 * Does nothing on the web and on iOS.
 */
export const installBackButtonHandler = () => {
  if (!isAndroidApp) {
    return;
  }
  void App.addListener('backButton', ({ canGoBack }) => {
    const handler = backHandlers.at(-1);
    if (handler) {
      handler();
    } else if (canGoBack && !isOnHomeRoute()) {
      window.history.back();
    } else {
      void App.minimizeApp();
    }
  });
};
