import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from '../i18n/languages';

const SITE_URL = 'https://crosswordly.ca';

/**
 * Hook to update hreflang meta tags based on current route
 */
export function useHreflangTags() {
  const location = useLocation();

  useEffect(() => {
    // Remove existing hreflang links
    const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingLinks.forEach((link) => link.remove());

    // Get the current path without the language prefix
    const pathParts = location.pathname.split('/').filter(Boolean);
    const currentLang = pathParts[0];
    const isLanguagePath = SUPPORTED_LANGUAGES.includes(currentLang as SupportedLanguage);
    const pathWithoutLang = isLanguagePath ? pathParts.slice(1).join('/') : pathParts.join('/');

    // Add x-default
    const defaultLink = document.createElement('link');
    defaultLink.rel = 'alternate';
    defaultLink.href = `${SITE_URL}/#/${pathWithoutLang}`;
    defaultLink.hreflang = 'x-default';
    document.head.appendChild(defaultLink);

    // Add language-specific links
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const link = document.createElement('link');
      link.rel = 'alternate';
      link.href = `${SITE_URL}/#/${lang}/${pathWithoutLang}`;
      link.hreflang = lang;
      document.head.appendChild(link);
    });
  }, [location]);
}

/**
 * Hook to update page title and description based on current route
 */
export function useSEOMetadata(title?: string, description?: string) {
  useEffect(() => {
    if (title) {
      document.title = title;
      const ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) {
        ogTitle.setAttribute('content', title);
      }
    }

    if (description) {
      const metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      }
      const ogDescription = document.querySelector('meta[property="og:description"]');
      if (ogDescription) {
        ogDescription.setAttribute('content', description);
      }
    }
  }, [title, description]);
}
