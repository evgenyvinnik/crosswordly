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
};

export default config;
