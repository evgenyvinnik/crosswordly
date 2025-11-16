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

  return (
    <div className="flex gap-2">
      {LANGUAGES.map((language) => (
        <button
          key={language.code}
          onClick={() => changeLanguage(language.code)}
          className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
            i18n.language === language.code
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
