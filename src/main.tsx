import React from 'react';
import ReactDOM from 'react-dom/client';
import AppRouter from './AppRouter';
import './index.css';
import './i18n/config';
import { initAnalytics } from './utils/analytics';
import { installAssetRecoveryHandlers } from './utils/serviceWorkerRecovery';

initAnalytics();
installAssetRecoveryHandlers();

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppRouter />
  </React.StrictMode>,
);
