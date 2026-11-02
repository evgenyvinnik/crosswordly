import { useEffect, useEffectEvent } from 'react';
import { pushBackHandler } from '../utils/nativePlatform';

/**
 * Runs `onBack` when the player presses the Android Back button (or makes the Back gesture) while
 * `isActive` is true, e.g. to close an open dialog. The most recently activated caller wins, so
 * Back closes the top dialog first. Has no effect on the web and on iOS.
 *
 * @param isActive - Whether Back should currently run `onBack`, e.g. whether the dialog is open
 * @param onBack - What Back does, usually the same as the dialog's close button
 */
export const useCloseOnBack = (isActive: boolean, onBack: () => void) => {
  const handleBack = useEffectEvent(onBack);

  useEffect(() => {
    if (!isActive) {
      return;
    }
    return pushBackHandler(() => handleBack());
  }, [isActive]);
};
