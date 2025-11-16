import { useTranslation } from 'react-i18next';
import { useProgressStore } from '../state/useProgressStore';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
  { code: 'ru', name: 'Русский' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'hi', name: 'हिन्दी' },
  { code: 'ar', name: 'العربية' },
  { code: 'he', name: 'עברית' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const setLanguage = useProgressStore((state) => state.setLanguage);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setLanguage(languageCode);
  };

  const isActive = (code: string) => {
    // Check if current language starts with the code (handles en-US, es-ES, etc.)
    return i18n.language.startsWith(code);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={`rounded-lg px-3 py-2 sm:px-4 sm:py-3 text-base sm:text-lg font-medium transition ${
            isActive(language.code)
              ? 'bg-[#1a1a1b] text-white'
              : 'bg-[#f0f1f3] text-[#4a4d52] hover:bg-[#e0e2e6]'
          }`}
        >
          {language.name}
        </button>
      ))}
    </div>
  );
}
