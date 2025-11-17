/**
 * Type-safe language constants for internationalization
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

export const RTL_LANGUAGES: ReadonlySet<SupportedLanguage> = new Set(['ar', 'he']);

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

export function isRTLLanguage(language: string): boolean {
  return RTL_LANGUAGES.has(language as SupportedLanguage);
}
