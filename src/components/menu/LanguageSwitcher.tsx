import { useTranslation } from 'react-i18next';
import { useProgressStore } from '../../state/useProgressStore';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../../i18n/languages';

const LANGUAGES = SUPPORTED_LANGUAGES.map((code) => ({
  code,
  name: LANGUAGE_NAMES[code],
}));

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
