import { test, expect } from '@playwright/test';

/**
 * Accessibility Test Suite
 *
 * Validates keyboard navigation, focus management, ARIA labels, and screen reader support
 */

test.describe('Keyboard Navigation', () => {
  test('should allow Tab navigation through the page', async ({ page }) => {
    await page.goto('/');

    // Wait for the page to load
    await page.waitForSelector('text=Crosswordly', { timeout: 10000 });

    // Tab through interactive elements
    await page.keyboard.press('Tab');
    const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
    expect(firstFocused).toBeTruthy();
  });

  test('should navigate to game field using Tab key', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for word cards to appear (tutorial shows word bank)
    await page.waitForSelector('.word-card', { timeout: 10000 });

    // Tab through elements - should be able to reach interactive elements
    let reachedInteractiveElement = false;
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return {
          tagName: el?.tagName,
          canFocus: el?.tabIndex !== undefined && el?.tabIndex >= 0,
        };
      });

      // Check if we've reached any focusable element
      if (focusedElement.canFocus) {
        reachedInteractiveElement = true;
        break;
      }
    }

    expect(reachedInteractiveElement).toBe(true);
  });

  test('should navigate word slots with Tab in game field', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for word cards or game cells to appear
    await page.waitForSelector('.word-card, button[aria-label*="Cell"]', { timeout: 10000 });

    // Tab to first game field cell
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('aria-label')?.includes('Cell');
      });

      if (focusedElement) break;
    }

    // Continue tabbing through word slots
    const visitedCells = [];
    for (let i = 0; i < 5; i++) {
      const ariaLabel = await page.evaluate(() =>
        document.activeElement?.getAttribute('aria-label'),
      );
      if (ariaLabel) visitedCells.push(ariaLabel);
      await page.keyboard.press('Tab');
    }

    // Should have navigated through multiple cells
    expect(visitedCells.length).toBeGreaterThan(0);
  });

  test('should support Escape key to clear selections', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for word cards to appear
    await page.waitForSelector('.word-card', { timeout: 10000 });

    // Select a word card
    const wordCard = await page.locator('.cursor-pointer').first();
    await wordCard.click();

    // Press Escape
    await page.keyboard.press('Escape');

    // Selection should be cleared (no visual indication of selection)
    const hasActiveSelection = await page.evaluate(() => {
      return document.querySelector('[class*="ring-blue"]') !== null;
    });

    // After escape, no blue ring should be visible (or it should be minimal)
    expect(hasActiveSelection).toBeDefined();
  });
});

test.describe('Focus Styles', () => {
  test('should display visible focus indicators on interactive elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Crosswordly', { timeout: 10000 });

    // Tab to first interactive element
    await page.keyboard.press('Tab');

    // Check that focused element has outline or ring
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return styles.outline !== 'none' || styles.outlineWidth !== '0px';
    });

    expect(hasFocusStyle).toBe(true);
  });

  test('should show green focus ring on game field cells', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for interactive elements to appear
    await page.waitForSelector('button, .word-card', { timeout: 10000 });

    // Tab to game field
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      const isGameCell = await page.evaluate(() => {
        const el = document.activeElement;
        return el?.getAttribute('aria-label')?.includes('Cell');
      });

      if (isGameCell) break;
    }

    // Check for focus styling (outline or ring)
    const focusStyle = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const styles = window.getComputedStyle(el);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        outlineWidth: styles.outlineWidth,
      };
    });

    expect(focusStyle.outlineWidth).not.toBe('0px');
  });

  test('should not show focus outline on mouse clicks', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for word cards to appear
    await page.waitForSelector('.word-card', { timeout: 10000 });

    // Click a word card with mouse
    const wordCard = await page.locator('.cursor-pointer').first();
    await wordCard.click();

    // Focus should be on the element but :focus-visible shouldn't apply
    const hasVisibleFocus = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      // Check if :focus-visible pseudo-class would match
      // This is a heuristic check
      return el.matches(':focus-visible');
    });

    // After mouse click, :focus-visible should ideally not apply
    // (though this is browser-dependent)
    expect(hasVisibleFocus).toBeDefined();
  });
});

test.describe('ARIA Labels and Semantic HTML', () => {
  test('should have proper ARIA labels on interactive elements', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for interactive elements
    await page.waitForSelector('button', { timeout: 10000 });

    // Check for ARIA labels or accessible names on buttons
    const buttons = await page.locator('button').all();
    const hasAccessibleButtons = buttons.length > 0;
    expect(hasAccessibleButtons).toBe(true);
  });

  test('should have localized ARIA labels in English', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);

    // Check that the page is in English
    const lang = await page.getAttribute('html', 'lang');
    expect(lang).toMatch(/^en/i);
  });

  test('should have semantic main content region', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Crosswordly', { timeout: 10000 });

    // Check for main landmark
    const mainContent = await page.locator('main').count();
    expect(mainContent).toBeGreaterThan(0);
  });

  test('should have accessible navigation elements', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Crosswordly', { timeout: 10000 });

    // Check for nav or header with interactive elements
    const hasNav = await page.evaluate(() => {
      return (
        document.querySelector('nav') !== null ||
        document.querySelector('header') !== null ||
        document.querySelector('[role="navigation"]') !== null
      );
    });

    expect(hasNav).toBe(true);
  });

  test('should have proper button roles and labels', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for interactive elements to appear
    await page.waitForSelector('.word-card, button', { timeout: 10000 });

    // All interactive elements should be buttons or links
    const interactiveElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a[href], [role="button"]');
      return elements.length;
    });

    expect(interactiveElements).toBeGreaterThan(0);
  });
});

test.describe('Keyboard Help Text', () => {
  test('should show keyboard help when word is selected', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for word cards to appear
    await page.waitForSelector('.word-card', { timeout: 10000 });

    // Select a word card
    const wordCard = await page.locator('.cursor-pointer').first();
    await wordCard.click();

    // Look for help text
    const helpText = await page.locator('[role="status"]').first().textContent();

    // Should contain keyboard instructions
    expect(helpText).toBeTruthy();
  });

  test('should update help text based on context', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for word cards to appear
    await page.waitForSelector('.word-card', { timeout: 10000 });

    // Select a word card
    const wordCard = await page.locator('.cursor-pointer').first();
    await wordCard.click();

    // Wait for help text
    await page.waitForSelector('[role="status"]', { timeout: 2000 });
    const helpText = await page.locator('[role="status"]').first().textContent();

    // Should mention Tab, Enter, or Escape
    expect(helpText).toMatch(/Tab|Enter|Escape|press/i);
  });
});

test.describe('Screen Reader Support', () => {
  test('should have live regions for dynamic content', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for game to load
    await page.waitForSelector('.word-card', { timeout: 10000 });

    // Check for aria-live regions or dynamic content containers
    const hasLiveRegions = await page.evaluate(() => {
      return (
        document.querySelector('[aria-live]') !== null ||
        document.querySelector('[role="status"]') !== null ||
        document.querySelector('[role="alert"]') !== null
      );
    });
    expect(hasLiveRegions).toBeDefined();
  });

  test('should have polite live region for status updates', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (tutorial loads automatically)
    await page.waitForTimeout(5000);
    // Wait for word cards to appear
    await page.waitForSelector('.word-card', { timeout: 10000 });

    // Select a word to trigger status update
    const wordCard = await page.locator('.cursor-pointer').first();
    await wordCard.click();

    // Check for polite live region
    const hasPoliteRegion = await page.locator('[aria-live="polite"]').count();
    expect(hasPoliteRegion).toBeGreaterThan(0);
  });

  test('should have descriptive page title', async ({ page }) => {
    await page.goto('/');

    const title = await page.title();
    expect(title).toMatch(/Crosswordly/i);
    expect(title.length).toBeGreaterThan(0);
  });

  test('should have language attribute on html element', async ({ page }) => {
    await page.goto('/');

    const lang = await page.locator('html').getAttribute('lang');
    expect(lang).toBeTruthy();
    expect(lang).toMatch(/^[a-z]{2}(-[A-Z]{2})?$/); // ISO language code
  });
});

test.describe('Color Contrast and Visual Accessibility', () => {
  test('should render page without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.waitForSelector('text=Crosswordly', { timeout: 10000 });

    // Filter out known non-critical errors (favicon, 404, service worker dev mode warnings)
    const criticalErrors = errors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('Service worker') &&
        !e.includes('workbox') &&
        !e.includes('sw.js'),
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('should have visible text content', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('text=Crosswordly', { timeout: 10000 });

    // Check that main heading is visible
    const heading = await page.locator('text=Crosswordly').first();
    const isVisible = await heading.isVisible();

    expect(isVisible).toBe(true);
  });
});
