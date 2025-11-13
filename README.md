# Crosswordly

Crosswordly is a five-letter word puzzle inspired by Wordle aesthetics. This repository currently hosts the initial Vite + React scaffold that will power the game.

## Getting started

```bash
npm install
npm run dev
```

## Testing

End-to-end coverage is powered by [Playwright](https://playwright.dev/). The first time you set it up, install the browser binaries:

```bash
npx playwright install
```

Run the e2e suite (this will auto-start the Vite dev server unless `PLAYWRIGHT_BASE_URL` is provided):

```bash
npm run test:e2e
```

## Code quality

Run ESLint for type-aware checks and Prettier for consistent formatting:

```bash
# Check lint rules
npm run lint

# Auto-fix lint violations where possible
npm run lint:fix

# Format all supported files
npm run format

# Verify formatting without writing changes
npm run format:check
```

## Deploying to GitHub Pages

The project is pre-configured for GitHub Pages using the `gh-pages` package. Run:

```bash
npm run deploy
```

The deploy script builds the project with the correct base path (`/crosswordly/`) before publishing the `dist` folder to the `gh-pages` branch.

### Automatic deployments

Pushing to the `main` branch triggers the `Deploy to GitHub Pages` GitHub Actions workflow (`.github/workflows/deploy.yml`). The workflow installs dependencies, builds the site with the `GITHUB_PAGES` base path, and publishes the generated `dist/` directory with `actions/deploy-pages`, so the site is always redeployed after each merge to `main`.
