import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ca.crosswordly.app',
  appName: 'Crosswordly',
  webDir: 'dist',
  backgroundColor: '#f6f5f0',
  ios: {
    // The page draws behind the Dynamic Island (or notch) and the home indicator and pads its own
    // content clear of them (`enableEdgeToEdgeOnIos` in src/utils/nativePlatform.ts)
    contentInset: 'never',
    backgroundColor: '#f6f5f0',
    preferredContentMode: 'mobile',
  },
  android: {
    backgroundColor: '#f6f5f0',
  },
  plugins: {
    SystemBars: {
      // On Android the page has no `viewport-fit=cover` (only iOS adds it), so Capacitor pads the
      // web view clear of the navigation bar and camera cutout; MainActivity hides the status bar.
      // The bars always sit on the light page background, so their icons stay dark even when the
      // phone is in dark mode.
      style: 'LIGHT',
    },
  },
};

export default config;
