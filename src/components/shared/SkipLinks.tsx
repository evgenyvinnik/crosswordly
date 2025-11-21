import { useTranslation } from 'react-i18next';

/**
 * Skip links for keyboard navigation accessibility.
 * Allows keyboard users to skip directly to main content or the word bank.
 */
export function SkipLinks() {
  const { t } = useTranslation();

  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed left-4 top-4 z-[9999] rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {t('accessibility.skipToContent')}
      </a>
      <a
        href="#word-bank"
        className="fixed left-4 top-16 z-[9999] rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {t('accessibility.skipToWordBank')}
      </a>
    </div>
  );
}
