import { defineConfig } from 'vite';
import babel from '@rolldown/plugin-babel';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const hasCustomDomain = existsSync(resolve(__dirname, 'CNAME'));
const deployingToProjectPage = process.env.GITHUB_PAGES === 'true' && !hasCustomDomain;
const base = deployingToProjectPage ? '/crosswordly/' : '/';
// The iOS app (Capacitor) ships its assets in the app bundle, so it needs no service worker or manifest
const isNativeBuild = process.env.CAPACITOR_BUILD === 'true';

export default defineConfig({
  base,
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    VitePWA({
      disable: isNativeBuild,
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
      },
    }),
  ],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // Split vendor libraries into separate chunks
            { name: 'react-vendor', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
            { name: 'i18n-vendor', test: /node_modules[\\/](i18next|react-i18next)[\\/]/ },
            {
              name: 'animation-vendor',
              test: /node_modules[\\/](@react-spring[\\/]|canvas-confetti[\\/])/,
            },
            // Large data-heavy modules split into their own chunks. Groups also capture their
            // dependencies, so word-data claims words.ts first or level-data would absorb it.
            { name: 'level-data', test: /src[\\/]components[\\/]levels[\\/]levelConfigs\.ts$/ },
            { name: 'word-data', test: /src[\\/]words[\\/]words\.ts$/, priority: 1 },
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
