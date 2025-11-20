import { test, expect, Page } from '@playwright/test';

/**
 * Test suite for RTL language game content behavior
 *
 * This suite validates that in RTL languages (Arabic, Hebrew):
 * 1. UI elements are properly flipped to RTL
 * 2. Game content (word tiles, clues, letters) remain LTR
 * 3. English letters in words display left-to-right
 */

test.describe('RTL Game Content Behavior', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000); // Wait for splash screen
  });

  async function switchToLanguage(page: Page, languageName: string) {
    // Open menu
    const menuButton = page.locator('button').first();
    await menuButton.click();
    await page.waitForTimeout(300);

    // Open settings
    const settingsButton = page
      .locator('button')
      .filter({
        hasText:
          /settings|configuración|настройки|configurações|paramètres|einstellungen|设置|設定|설정|सेटिंग्स|الإعدادات|הגדרות/i,
      })
      .first();
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Click language
    const langButton = page.getByRole('button', { name: languageName, exact: true });
    await langButton.click();
    await page.waitForTimeout(500);

    // Close settings - use .last() to get the settings close button (tutorial close button may still be visible)
    const closeButton = page
      .getByRole('button', {
        name: /close|cerrar|закрыть|fechar|fermer|schließen|关闭|閉じる|닫기|बंद करें|إغلاق|סגור/i,
      })
      .last();
    await closeButton.click();
    await page.waitForTimeout(300);
  }

  test('Arabic: UI is RTL but game words remain LTR', async ({ page }) => {
    await switchToLanguage(page, 'العربية');

    // Verify document is in RTL mode
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');
    await expect(htmlElement).toHaveAttribute('lang', /ar.*/);

    // Check if word cards exist and have LTR direction
    const wordCards = page.locator('.word-card');
    if ((await wordCards.count()) > 0) {
      const firstCard = wordCards.first();
      const direction = await firstCard.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }

    // Check if word chip letters maintain LTR
    const wordChips = page.locator('.word-chip-letter');
    if ((await wordChips.count()) > 0) {
      const firstChip = wordChips.first();
      const direction = await firstChip.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }
  });

  test('Hebrew: UI is RTL but game words remain LTR', async ({ page }) => {
    await switchToLanguage(page, 'עברית');

    // Verify document is in RTL mode
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');
    await expect(htmlElement).toHaveAttribute('lang', /he.*/);

    // Check if word cards exist and have LTR direction
    const wordCards = page.locator('.word-card');
    if ((await wordCards.count()) > 0) {
      const firstCard = wordCards.first();
      const direction = await firstCard.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }

    // Check if word chip letters maintain LTR
    const wordChips = page.locator('.word-chip-letter');
    if ((await wordChips.count()) > 0) {
      const firstChip = wordChips.first();
      const direction = await firstChip.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }
  });

  test('Arabic: Direction cards content remains LTR', async ({ page }) => {
    await switchToLanguage(page, 'العربية');

    // Verify document is in RTL mode
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Check if direction card content maintains LTR
    const directionCardContent = page.locator('.direction-card-content');
    if ((await directionCardContent.count()) > 0) {
      const firstContent = directionCardContent.first();
      const direction = await firstContent.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');

      const textAlign = await firstContent.evaluate((el) => {
        return window.getComputedStyle(el).textAlign;
      });
      expect(textAlign).toBe('left');
    }

    // Check list items in direction cards
    const listItems = page.locator('.direction-card-content li');
    if ((await listItems.count()) > 0) {
      const firstItem = listItems.first();
      const direction = await firstItem.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');

      const textAlign = await firstItem.evaluate((el) => {
        return window.getComputedStyle(el).textAlign;
      });
      expect(textAlign).toBe('left');
    }
  });

  test('Hebrew: Direction cards content remains LTR', async ({ page }) => {
    await switchToLanguage(page, 'עברית');

    // Verify document is in RTL mode
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Check if direction card content maintains LTR
    const directionCardContent = page.locator('.direction-card-content');
    if ((await directionCardContent.count()) > 0) {
      const firstContent = directionCardContent.first();
      const direction = await firstContent.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }

    // Check list items in direction cards
    const listItems = page.locator('.direction-card-content li');
    if ((await listItems.count()) > 0) {
      const firstItem = listItems.first();
      const direction = await firstItem.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }
  });

  test('English: Switching from RTL back to LTR works correctly', async ({ page }) => {
    test.setTimeout(60000); // Increase timeout for this test
    // First switch to Arabic (RTL)
    await switchToLanguage(page, 'العربية');

    let htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Switch back to English (LTR)
    await switchToLanguage(page, 'English');

    htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'ltr');

    // Verify word cards are LTR
    const wordCards = page.locator('.word-card');
    if ((await wordCards.count()) > 0) {
      const firstCard = wordCards.first();
      const direction = await firstCard.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }
  });

  test('Cell letters in game grid maintain LTR in RTL languages', async ({ page }) => {
    await switchToLanguage(page, 'العربية');

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Check if cell letters maintain LTR
    const cellLetters = page.locator('.cell-letter');
    if ((await cellLetters.count()) > 0) {
      const firstCell = cellLetters.first();
      const direction = await firstCell.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }
  });

  test('Arabic: Game field grid maintains LTR layout', async ({ page }) => {
    await switchToLanguage(page, 'العربية');

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Check if game field container maintains LTR
    const gameFieldContainer = page.locator('[role="img"][aria-label*="grid"]');
    if ((await gameFieldContainer.count()) > 0) {
      const container = gameFieldContainer.first();
      const direction = await container.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }

    // Check individual cells maintain LTR
    const gameCells = page.locator('[data-cell-key]');
    if ((await gameCells.count()) > 0) {
      const firstCell = gameCells.first();
      const direction = await firstCell.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }
  });

  test('Hebrew: Game field grid maintains LTR layout', async ({ page }) => {
    await switchToLanguage(page, 'עברית');

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Check if game field container maintains LTR
    const gameFieldContainer = page.locator('[role="img"][aria-label*="grid"]');
    if ((await gameFieldContainer.count()) > 0) {
      const container = gameFieldContainer.first();
      const direction = await container.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }

    // Check individual cells maintain LTR
    const gameCells = page.locator('[data-cell-key]');
    if ((await gameCells.count()) > 0) {
      const firstCell = gameCells.first();
      const direction = await firstCell.evaluate((el) => {
        return window.getComputedStyle(el).direction;
      });
      expect(direction).toBe('ltr');
    }
  });
});
