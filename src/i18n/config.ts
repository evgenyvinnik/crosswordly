import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from './languages';

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

/**
 * Translation catalogs keyed by the language identifier.
 * Keeps TypeScript aware that every supported language has a translation file.
 */
const translations: Record<SupportedLanguage, typeof enTranslations> = {
  en: enTranslations,
  es: esTranslations,
  ru: ruTranslations,
  pt: ptTranslations,
  fr: frTranslations,
  de: deTranslations,
  zh: zhTranslations,
  ja: jaTranslations,
  ko: koTranslations,
  hi: hiTranslations,
  ar: arTranslations,
  he: heTranslations,
};

/**
 * Reads the persisted language preference from localStorage.
 * @returns Preferred language code or null if none is stored/available.
 */
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

/**
 * Builds the shape expected by i18next using the translations mapping above.
 */
const resources = Object.fromEntries(
  SUPPORTED_LANGUAGES.map((lang) => [lang, { translation: translations[lang] }]),
);

/**
 * Initializes i18next for the application using react bindings and a language detector.
 */
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
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
