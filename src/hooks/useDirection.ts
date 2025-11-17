import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { isRTLLanguage } from '../i18n/languages';

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
