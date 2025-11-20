import { HashRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import App from './App';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from './i18n/languages';
import { useHreflangTags } from './utils/seo';

const LazyCrosswordPuzzleScreen = lazy(() => import('./components/shared/CrosswordPuzzleScreen'));

/**
 * Component to handle language switching from URL
 */
function LanguageWrapper({ children }: { children: React.ReactNode }) {
  const { lang } = useParams<{ lang?: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    const targetLang =
      lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage) ? lang : 'en';
    const currentLangBase = i18n.language.split('-')[0];

    if (currentLangBase !== targetLang) {
      i18n.changeLanguage(targetLang);
    }
  }, [lang, i18n]);

  useHreflangTags();

  return <>{children}</>;
}

/**
 * Main router component that wraps the entire application
 */
export default function AppRouter() {
  return (
    <HashRouter>
      <Routes>
        {/* Home route */}
        <Route
          path="/"
          element={
            <LanguageWrapper>
              <App />
            </LanguageWrapper>
          }
        />

        {/* Levels list route */}
        <Route
          path="/levels"
          element={
            <LanguageWrapper>
              <App />
            </LanguageWrapper>
          }
        />

        {/* Language-prefixed home route */}
        <Route
          path="/:lang"
          element={
            <LanguageWrapper>
              <App />
            </LanguageWrapper>
          }
        />

        {/* Language-prefixed levels list */}
        <Route
          path="/:lang/levels"
          element={
            <LanguageWrapper>
              <App />
            </LanguageWrapper>
          }
        />

        {/* Level routes without language prefix */}
        <Route
          path="/level/:levelId"
          element={
            <LanguageWrapper>
              <App />
            </LanguageWrapper>
          }
        />

        {/* Level routes with language prefix */}
        <Route
          path="/:lang/level/:levelId"
          element={
            <LanguageWrapper>
              <App />
            </LanguageWrapper>
          }
        />

        {/* Shared crossword route */}
        <Route
          path="/crossword/:solutionHash"
          element={
            <LanguageWrapper>
              <SharedPuzzleWrapper />
            </LanguageWrapper>
          }
        />

        {/* Shared crossword route with language prefix */}
        <Route
          path="/:lang/crossword/:solutionHash"
          element={
            <LanguageWrapper>
              <SharedPuzzleWrapper />
            </LanguageWrapper>
          }
        />

        {/* Fallback to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

/**
 * Wrapper component for crossword puzzles that passes props from App's context
 */
function SharedPuzzleWrapper() {
  // For crossword puzzles, we create a simple standalone experience
  // Settings/stats/about modals can be added later if needed
  return (
    <Suspense fallback={<CrosswordFallback />}>
      <LazyCrosswordPuzzleScreen
        onOpenSettings={() => {
          /* TODO: Implement */
        }}
        onOpenStats={() => {
          /* TODO: Implement */
        }}
        onOpenAbout={() => {
          /* TODO: Implement */
        }}
      />
    </Suspense>
  );
}

function CrosswordFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f6f5f0]">
      <div className="text-lg text-gray-600">Loading crossword...</div>
    </div>
  );
}
