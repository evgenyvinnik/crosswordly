import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isRTLLanguage } from '../i18n/languages';

/**
 * Hook to manage the document direction (LTR/RTL) based on the current language.
 * Updates the `dir` and `lang` attributes of the `<html>` element.
 *
 * @returns Object containing the current direction and a boolean indicating if it is RTL.
 */
export function useDirection() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isRTL = isRTLLanguage(currentLanguage);
  const direction = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;
  }, [direction, currentLanguage]);

  return { direction, isRTL };
}
