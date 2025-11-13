import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const base = process.env.GITHUB_PAGES === 'true' ? '/crosswordly/' : '/';

export default defineConfig({
  base,
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler', { runtimeModule: '@react/compiler-runtime' }]],
      },
    }),
  ],
});
