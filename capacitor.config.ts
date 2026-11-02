import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.crosswordly.app',
  appName: 'Crosswordly',
  webDir: 'dist',
  backgroundColor: '#f6f5f0',
  ios: {
    // Keep the web content clear of the notch / Dynamic Island and the home indicator
    contentInset: 'always',
    backgroundColor: '#f6f5f0',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#f6f5f0',
  },
  plugins: {
    SystemBars: {
      // The page has no `viewport-fit=cover`, so Android pads the web view clear of the navigation
      // bar and camera cutout (like `contentInset` on iOS); MainActivity hides the status bar. The
      // bars always sit on the light page background, so their icons stay dark even when the
      // phone is in dark mode.
      style: 'LIGHT',
    },
  },
};

export default config;
