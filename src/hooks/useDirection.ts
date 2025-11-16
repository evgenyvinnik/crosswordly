import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const RTL_LANGUAGES = ['ar', 'he'];

export function useDirection() {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const isRTL = RTL_LANGUAGES.some((lang) => currentLanguage.startsWith(lang));
  const direction = isRTL ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.dir = direction;
    document.documentElement.lang = currentLanguage;
  }, [direction, currentLanguage]);

  return { direction, isRTL };
}
