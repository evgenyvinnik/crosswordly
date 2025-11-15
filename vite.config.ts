import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const hasCustomDomain = existsSync(resolve(__dirname, 'CNAME'));
const deployingToProjectPage = process.env.GITHUB_PAGES === 'true' && !hasCustomDomain;
const base = deployingToProjectPage ? '/crosswordly/' : '/';

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
