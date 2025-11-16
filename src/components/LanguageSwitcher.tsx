import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Español' },
];

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  const isActive = (code: string) => {
    // Check if current language starts with the code (handles en-US, es-ES, etc.)
    return i18n.language.startsWith(code);
  };

  return (
    <div className="flex gap-2 sm:gap-4">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={`rounded-lg px-3 py-2 sm:px-6 sm:py-4 text-lg sm:text-2xl font-medium transition ${
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
