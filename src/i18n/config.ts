import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslations from './locales/en.json';
import esTranslations from './locales/es.json';
import ruTranslations from './locales/ru.json';
import ptTranslations from './locales/pt.json';
import frTranslations from './locales/fr.json';
import deTranslations from './locales/de.json';
import zhTranslations from './locales/zh.json';
import jaTranslations from './locales/ja.json';
import koTranslations from './locales/ko.json';
import hiTranslations from './locales/hi.json';
import arTranslations from './locales/ar.json';
import heTranslations from './locales/he.json';

// Get stored language preference from localStorage
const getStoredLanguage = (): string | null => {
  try {
    const stored = localStorage.getItem('crossword-progress');
    if (stored) {
      const parsed = JSON.parse(stored);
      return parsed.state?.settings?.language || null;
    }
  } catch (error) {
    console.error('Failed to get stored language:', error);
  }
  return null;
};

const storedLanguage = getStoredLanguage();

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      es: {
        translation: esTranslations,
      },
      ru: {
        translation: ruTranslations,
      },
      pt: {
        translation: ptTranslations,
      },
      fr: {
        translation: frTranslations,
      },
      de: {
        translation: deTranslations,
      },
      zh: {
        translation: zhTranslations,
      },
      ja: {
        translation: jaTranslations,
      },
      ko: {
        translation: koTranslations,
      },
      hi: {
        translation: hiTranslations,
      },
      ar: {
        translation: arTranslations,
      },
      he: {
        translation: heTranslations,
      },
    },
    lng: storedLanguage || undefined, // Use stored language if available
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['navigator', 'localStorage'],
      caches: ['localStorage'],
    },
    // Add debug mode to see what's happening
    debug: false,
    // Force reload resources
    load: 'languageOnly',
  });

export default i18n;
