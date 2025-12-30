import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
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
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'favicon.svg',
        'favicon-32x32.png',
        'favicon-48x48.png',
        'icon-192.png',
        'icon-512.png',
        'screenshot-mobile.png',
        'screenshot-desktop.png',
        'robots.txt',
        'sitemap.xml',
      ],
      manifest: {
        name: 'Crosswordly - Word Puzzle Game',
        short_name: 'Crosswordly',
        description:
          'An innovative word puzzle game that combines crossword challenges with intuitive drag-and-drop gameplay',
        id: base,
        theme_color: '#6aaa64',
        background_color: '#f6f5f0',
        display: 'standalone',
        orientation: 'portrait-primary',
        scope: base,
        start_url: base,
        categories: ['games', 'education', 'entertainment'],
        icons: [
          {
            src: `${base}icon-192.png`,
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable',
          },
          {
            src: `${base}icon-512.png`,
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Play Tutorial',
            url: `${base}level/tutorial`,
            description: 'Start with the tutorial level',
          },
          {
            name: 'Level Select',
            url: `${base}levels`,
            description: 'Choose a level to play',
          },
        ],
        screenshots: [
          {
            src: `${base}screenshot-mobile.png`,
            sizes: '640x1136',
            type: 'image/png',
            form_factor: 'narrow',
          },
          {
            src: `${base}screenshot-desktop.png`,
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
          },
        ],
        share_target: {
          action: `${base}crossword`,
          method: 'GET',
          enctype: 'application/x-www-form-urlencoded',
          params: {
            url: 'puzzle',
          },
        },
      },
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff,woff2}'],
        skipWaiting: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 365 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom'],
          'i18n-vendor': ['i18next', 'react-i18next'],
          'animation-vendor': ['@react-spring/web', 'canvas-confetti'],
          // Large data-heavy modules split into their own chunks
          'level-data': ['src/components/levels/levelConfigs.ts'],
          'word-data': ['src/words/words.ts'],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
