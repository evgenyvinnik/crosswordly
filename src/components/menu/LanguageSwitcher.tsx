import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useProgressStore } from '../../state/useProgressStore';
import { SUPPORTED_LANGUAGES, LANGUAGE_NAMES } from '../../i18n/languages';

const LANGUAGES = SUPPORTED_LANGUAGES.map((code) => ({
  code,
  name: LANGUAGE_NAMES[code],
}));

/**
 * Component for switching the application language.
 * Updates the URL and global language state when a new language is selected.
 */
export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const setLanguage = useProgressStore((state) => state.setLanguage);

  const changeLanguage = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    setLanguage(languageCode);

    // Update URL with new language
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentLang = pathParts[0];
    const isCurrentlyLanguagePath = SUPPORTED_LANGUAGES.some(
      (supportedLang) => supportedLang === currentLang,
    );

    let newPath: string;
    if (languageCode === 'en') {
      // For English, remove language prefix
      if (isCurrentlyLanguagePath) {
        // Remove the language code from path
        const remainingPath = pathParts.slice(1);
        newPath = remainingPath.length > 0 ? '/' + remainingPath.join('/') : '/';
      } else {
        newPath = location.pathname || '/';
      }
    } else {
      // For other languages, add/update language prefix
      if (isCurrentlyLanguagePath) {
        pathParts[0] = languageCode;
        newPath = '/' + pathParts.join('/');
      } else {
        const currentPath = location.pathname === '/' ? '' : location.pathname;
        newPath = '/' + languageCode + currentPath;
      }
    }

    navigate(newPath);
  };

  const isActive = (code: string) => {
    // Check if current language starts with the code (handles en-US, es-ES, etc.)
    const currentLangBase = i18n.language.split('-')[0];
    return currentLangBase === code;
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
