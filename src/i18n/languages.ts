/**
 * Type-safe language constants for internationalization
 */

/**
 * Application languages, aligned with locale identifiers.
 */
export type SupportedLanguage =
  | 'en'
  | 'es'
  | 'ru'
  | 'pt'
  | 'fr'
  | 'de'
  | 'zh'
  | 'ja'
  | 'ko'
  | 'hi'
  | 'ar'
  | 'he';

/**
 * Canonical list of languages available in the UI, in preferred order.
 */
export const SUPPORTED_LANGUAGES: readonly SupportedLanguage[] = [
  'en',
  'es',
  'ru',
  'pt',
  'fr',
  'de',
  'zh',
  'ja',
  'ko',
  'hi',
  'ar',
  'he',
] as const;

/**
 * Languages that should render UI in a right-to-left direction.
 */
export const RTL_LANGUAGES: ReadonlySet<SupportedLanguage> = new Set(['ar', 'he']);

/**
 * User-friendly labels for every supported language.
 */
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  ru: 'Русский',
  pt: 'Português',
  fr: 'Français',
  de: 'Deutsch',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
  hi: 'हिन्दी',
  ar: 'العربية',
  he: 'עברית',
};

/**
 * Tests if a language identifier is RTL-aware.
 *
 * @param language - Locale code to check, e.g., `en`.
 * @returns True if the language renders right-to-left.
 */
export function isRTLLanguage(language: string): boolean {
  return RTL_LANGUAGES.has(language as SupportedLanguage);
}
