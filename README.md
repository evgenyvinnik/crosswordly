# Crosswordly

A modern word puzzle game where players form words by connecting letters on a crossword-style grid. Inspired by Wordle aesthetics, Crosswordly challenges you to find all the target words hidden within each level's grid using a bank of available words.

![Crosswordly Game Preview](public/og-image.png)

## 🎮 Play Now

**[Play Crosswordly at crosswordly.ca](https://crosswordly.ca/)**

## ✨ Features

- **🌍 Multi-Language Support**: Play in 12 languages including English, Spanish, Russian, Portuguese, French, German, Chinese, Japanese, Korean, Hindi, Arabic, and Hebrew
- **📖 RTL Language Support**: Full support for right-to-left languages (Arabic and Hebrew) with proper text direction and layout
- **🔄 Smart Language Routing**: HashRouter-based navigation with automatic language detection and seamless language switching
- **🎯 Multiple Levels**: Progressive difficulty with interactive tutorial and multiple puzzle levels
- **❓ Built-in FAQ**: Comprehensive help section in the tutorial level with collapsible questions
- **💾 Local Storage Persistence**: Your progress, settings, and statistics are automatically saved using Zustand with persist middleware
- **🧭 Intelligent Navigation**: Returning users automatically skip completed tutorial and go directly to level selection
- **📊 Google Analytics Integration**: Optional GA4 tracking for usage analytics and user behavior insights
- **✅ Comprehensive E2E Testing**: 70+ Playwright tests covering all game features and user flows
- **🎨 Responsive Design**: Seamless experience across mobile, tablet, and desktop devices
- **♿ Accessibility**: ARIA labels, keyboard navigation, and screen reader support
- **🎉 Animations**: Smooth transitions and celebratory confetti effects using react-spring and canvas-confetti

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

### Analytics & Quality Assurance

- **[react-ga4 2](https://github.com/codler/react-ga4)** - Google Analytics 4 integration
- **[Playwright 1.56](https://github.com/microsoft/playwright)** - End-to-end testing framework
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

Run end-to-end test suite:

```bash
npm run test:e2e
```

Run tests in UI mode for debugging:

```bash
npx playwright test --ui
```

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

### State Management

- **Zustand with Persistence**: Lightweight state management that syncs with localStorage for progress tracking
- **Tutorial Completion Tracking**: Monitors which levels users have completed to provide appropriate navigation
- **Language Preference Storage**: Remembers user's language choice across sessions

### User Experience

- **Tutorial with FAQ**: Interactive tutorial level includes a comprehensive FAQ section positioned below the clue cards
- **Smart Navigation**: First-time users see the tutorial; returning users go straight to level selection
- **Seamless Language Switching**: One-click language changes that immediately update the UI and URL without page reload
