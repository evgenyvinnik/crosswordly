import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
// Self-hosted fonts so the iOS app works offline and makes no requests to Google. The game's
// other scripts (Cyrillic, CJK, Arabic, Hebrew, Devanagari) are not in these fonts and use the
// system font either way, so only the Latin subsets are bundled.
import '@fontsource/karla/latin-400.css';
import '@fontsource/karla/latin-ext-400.css';
import '@fontsource/karla/latin-500.css';
import '@fontsource/karla/latin-ext-500.css';
import '@fontsource/karla/latin-600.css';
import '@fontsource/karla/latin-ext-600.css';
import '@fontsource/kanit/latin-400.css';
import '@fontsource/kanit/latin-ext-400.css';
import '@fontsource/kanit/latin-500.css';
import '@fontsource/kanit/latin-ext-500.css';
import '@fontsource/kanit/latin-600.css';
import '@fontsource/kanit/latin-ext-600.css';
import '@fontsource/kanit/latin-700.css';
import '@fontsource/kanit/latin-ext-700.css';
import './index.css';
import './i18n/config';
import { initAnalytics } from './utils/analytics';
import { installAssetRecoveryHandlers } from './utils/serviceWorkerRecovery';
import { isNativeApp } from './utils/nativePlatform';

if (isNativeApp) {
  document.documentElement.classList.add('native-app');
}

initAnalytics();
installAssetRecoveryHandlers();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
