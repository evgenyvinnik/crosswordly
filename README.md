# Crosswordly

A modern word puzzle game where players form words by connecting letters on a crossword-style grid. Inspired by Wordle aesthetics, Crosswordly challenges you to find all the target words hidden within each level's grid using a bank of available words.

![Crosswordly Game Preview](public/og-image.png)

## 🎮 Play Now

**[Play Crosswordly at crosswordly.ca](https://crosswordly.ca/)**

## ✨ Features

### 🌐 Internationalization & Localization

- **🌍 Multi-Language Support**: Play in 12 languages including English, Spanish, Russian, Portuguese, French, German, Chinese, Japanese, Korean, Hindi, Arabic, and Hebrew
- **📖 RTL Language Support**: Full support for right-to-left languages (Arabic and Hebrew) with proper text direction and layout, while maintaining LTR for game content
- **🔄 Smart Language Routing**: HashRouter-based navigation with automatic language detection and seamless language switching

### ♿ Accessibility (WCAG 2.1 AA Compliant)

- **⌨️ Full Keyboard Navigation**: Complete keyboard support with visible focus indicators and intuitive Tab/Shift+Tab navigation
- **🔊 Screen Reader Support**: Comprehensive ARIA labels, live regions for dynamic updates, and semantic HTML structure
- **🎯 Focus Management**: Smart focus handling with visual indicators (green focus rings) and Escape key support
- **📱 Touch & Mouse Support**: Accessible across all input methods with proper touch targets and hover states
- **🎨 High Contrast**: Clear visual feedback with accessible color contrast ratios
- **🔤 Localized Labels**: ARIA labels adapt to the selected language for native-language screen reader support

### 📱 Progressive Web App (PWA)

- **📲 Installable**: Add to home screen on mobile and desktop devices for app-like experience
- **⚡ Offline Support**: Service worker caching enables offline gameplay after first visit
- **🚀 Fast Loading**: Optimized caching strategy with Workbox for instant subsequent loads
- **📦 Asset Caching**: Strategic caching of critical assets (favicon, robots.txt, sitemap.xml)
- **🎯 App Manifest**: Full PWA manifest with icons, theme colors, and display configuration
- **🍎 iOS Support**: Apple touch icons and meta tags for seamless iOS home screen installation

### 🎮 Game Features

- **🎯 Multiple Levels**: Progressive difficulty with 45+ puzzle levels from 2-word to 8-word challenges
- **📖 Interactive Tutorial**: Comprehensive onboarding with built-in FAQ and collapsible help sections
- **🔗 Puzzle Sharing**: Share completed puzzles via encoded URLs for friends to solve
- **🏆 Statistics Tracking**: Track solved puzzles, playtime, and completion rates by category
- **💾 Progress Persistence**: Automatic save using Zustand with localStorage middleware
- **🧭 Intelligent Navigation**: Returning users skip completed content and resume where they left off
- **🎉 Celebrations**: Smooth animations and confetti effects for puzzle completion

### 🛠️ Developer Experience

- **📊 Google Analytics Integration**: Optional GA4 tracking for usage analytics and user behavior insights
- **✅ Comprehensive Testing**: 179 Playwright E2E tests with 94.7% pass rate covering all features
- **🎨 Responsive Design**: Seamless experience across mobile, tablet, and desktop devices
- **🔧 Modern Tooling**: React 19, TypeScript 5.6, Vite 7, Tailwind CSS 3
- **📚 Editor-Friendly Docs**: Extensive JSDoc coverage across shared components, hooks, and utilities for inline API hints and onboarding

## 🛠️ Technology Stack

### Core Framework & Libraries

- **[React 19](https://github.com/facebook/react)** - Modern UI library with latest features
- **[TypeScript 5.6](https://github.com/microsoft/TypeScript)** - Type-safe development
- **[Vite 7](https://github.com/vitejs/vite)** - Fast build tool and dev server
- **[Tailwind CSS 3](https://github.com/tailwindlabs/tailwindcss)** - Utility-first CSS framework

### Routing & State Management

- **[React Router 7](https://github.com/remix-run/react-router)** - Declarative routing with HashRouter for GitHub Pages compatibility
- **[Zustand 5](https://github.com/pmndrs/zustand)** - Lightweight state management with persistence middleware

### Internationalization

- **[i18next 25](https://github.com/i18next/i18next)** - Internationalization framework with 12 language translations
- **[react-i18next 16](https://github.com/i18next/react-i18next)** - React bindings for i18next
- **[i18next-browser-languagedetector 8](https://github.com/i18next/i18next-browser-languageDetector)** - Automatic language detection

### UI & Animations

- **[react-spring 10](https://github.com/pmndrs/react-spring)** - Spring-physics based animations
- **[canvas-confetti 1.9](https://github.com/catdad/canvas-confetti)** - Celebration effects
- **[html2canvas 1.4](https://github.com/niklasvh/html2canvas)** - Screenshot generation for sharing

### PWA & Service Worker

- **[vite-plugin-pwa 0.22](https://github.com/vite-pwa/vite-plugin-pwa)** - PWA manifest generation and service worker management
- **[workbox-window 7](https://github.com/GoogleChrome/workbox)** - Service worker lifecycle management and caching strategies

### Analytics & Quality Assurance

- **[react-ga4 2](https://github.com/codler/react-ga4)** - Google Analytics 4 integration
- **[Playwright 1.56](https://github.com/microsoft/playwright)** - End-to-end testing framework with 179 comprehensive tests
- **[ESLint 9](https://github.com/eslint/eslint)** - Code linting with TypeScript support
- **[Prettier 3](https://github.com/prettier/prettier)** - Code formatting

### Build Tools & Optimization

- **[babel-plugin-react-compiler](https://github.com/facebook/react/tree/main/compiler)** - React compiler for automatic optimization
- **[PostCSS 8](https://github.com/postcss/postcss)** - CSS transformations
- **[Autoprefixer 10](https://github.com/postcss/autoprefixer)** - Automatic vendor prefixing

## 🚀 Build and Test

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
npm install
```

### Development

Start the development server with hot module replacement:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

Build optimized production bundle:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

### Testing

Install Playwright browsers (first time only):

```bash
npx playwright install
```

Run the complete end-to-end test suite (179 tests):

```bash
npm run test:e2e
```

Run tests in UI mode for debugging:

```bash
npx playwright test --ui
```

#### Test Coverage

The project includes comprehensive E2E test coverage:

- ✅ **Accessibility Tests** (29 tests): Keyboard navigation, ARIA labels, focus management, screen reader support
- ✅ **PWA Tests** (22 tests): Service worker registration, caching, offline support, manifest validation
- ✅ **Language Tests** (24 tests): Multi-language switching, RTL support, browser language detection
- ✅ **Game Logic Tests** (52 tests): Crossword puzzles, word placement, level completion, sharing
- ✅ **UI Component Tests** (52 tests): Menu interactions, settings, statistics, modals, tutorials

Total: **179 passing tests** with 94.7% pass rate (10 tests appropriately skipped for production-only features)

### Code Quality

Lint TypeScript and React code:

```bash
npm run lint
```

Auto-fix linting issues:

```bash
npm run lint:fix
```

Format all files with Prettier:

```bash
npm run format
```

Check formatting without making changes:

```bash
npm run format:check
```

### Deployment

Deploy to GitHub Pages:

```bash
npm run deploy
```

The project includes a GitHub Actions workflow that automatically deploys to GitHub Pages on every push to the `main` branch.

### Analytics Configuration (Optional)

To enable Google Analytics:

1. Create a GA4 property and obtain your `G-XXXXXXXXXX` measurement ID
2. Copy `.env.example` to `.env` (or `.env.local`)
3. Set `VITE_GA_MEASUREMENT_ID` to your measurement ID
4. Restart the dev server or rebuild

Analytics tracks page views, level progression, tutorial completion, and other user interactions.

## 🏗️ Architecture Highlights

### Smart Routing System

- **HashRouter Implementation**: Uses React Router's HashRouter for seamless GitHub Pages deployment without server-side configuration
- **Language-Based URLs**: Supports language-specific routes (e.g., `/#/es/levels`, `/#/fr/level/tutorial`) with English as the default (no prefix)
- **Automatic Language Detection**: Detects user's browser language and applies it automatically, with localStorage persistence
- **Intelligent Redirects**: Returning users who completed the tutorial are automatically redirected to the level selection screen

### Progressive Web App Architecture

- **Service Worker Integration**: Workbox-powered service worker for intelligent asset caching and offline support
- **Manifest Generation**: Automated PWA manifest generation via vite-plugin-pwa with icons, theme colors, and app metadata
- **Caching Strategy**: Strategic precaching of critical assets with runtime caching for dynamic content
- **Update Mechanism**: Automatic service worker updates with user-friendly prompts for new versions
- **Cross-Platform Support**: Optimized for installation on iOS, Android, Windows, macOS, and Linux

### Accessibility Architecture

- **Semantic HTML**: Proper use of semantic elements (main, nav, button, heading hierarchy)
- **ARIA Implementation**: Comprehensive ARIA labels, roles, and live regions for screen readers
- **Keyboard Navigation**: Logical tab order, visible focus indicators, and keyboard shortcuts
- **Focus Management**: Automatic focus restoration, skip links, and focus trapping in modals
- **Localized Accessibility**: ARIA labels and screen reader text adapt to the selected language
- **Testing Coverage**: 29 dedicated accessibility tests validating keyboard navigation, ARIA labels, focus styles, and screen reader support

### State Management

- **Zustand with Persistence**: Lightweight state management that syncs with localStorage for progress tracking
- **Tutorial Completion Tracking**: Monitors which levels users have completed to provide appropriate navigation
- **Language Preference Storage**: Remembers user's language choice across sessions
- **Statistics Persistence**: Tracks solve counts, playtime, and achievements across sessions

### User Experience

- **Tutorial with FAQ**: Interactive tutorial level includes a comprehensive FAQ section positioned below the clue cards
- **Smart Navigation**: First-time users see the tutorial; returning users go straight to level selection
- **Seamless Language Switching**: One-click language changes that immediately update the UI and URL without page reload
- **Offline-First Design**: Game remains playable without internet connection after initial load
