/**
 * Helpers for running inside the native iOS shell (Capacitor) instead of a browser.
 */
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import { Share } from '@capacitor/share';

/** True when the game runs inside the native app rather than a web browser. */
export const isNativeApp = Capacitor.isNativePlatform();

const playHaptic = (feedback: () => Promise<void>) => {
  if (!isNativeApp) {
    return;
  }
  feedback().catch(() => {
    // Haptics are a nicety: devices without a Taptic Engine simply stay silent
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
 * Public web address of the game. Inside the app the page origin is `capacitor://localhost`,
 * so links meant for other people (shared crosswords) must point here instead.
 */
export const PUBLIC_SITE_URL = 'https://crosswordly.ca/';

/**
 * Opens the iOS share sheet for a link. Rejects when the player dismisses the sheet.
 *
 * @param url - Link to share.
 * @param title - Subject line used by apps such as Mail.
 */
export const shareLinkNatively = async (url: string, title: string) => {
  await Share.share({ title, url });
};

/**
 * Writes a PNG data URL to the app cache and opens the iOS share sheet for it, which offers
 * "Save Image" alongside the usual targets. WKWebView ignores `<a download>` links, so this
 * replaces the browser download flow. Rejects when the player dismisses the sheet.
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
