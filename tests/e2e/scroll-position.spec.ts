import { test, expect } from '@playwright/test';

/**
 * Test suite for scroll position preservation in Level Select Screen
 *
 * This suite validates:
 * 1. Scroll position is preserved when navigating from level select to a level
 * 2. Scroll position is restored when returning via close button
 * 3. Scroll position behavior is consistent
 */

test.describe('Level Select Screen Scroll Position', () => {
  test.beforeEach(async ({ page, context }) => {
    // Clear all cookies and storage
    await context.clearCookies();

    // Navigate to home
    await page.goto('/');

    // Clear storage
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });

    // Reload to apply clean state
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });

    // Wait for splash screen to complete
    await page.waitForTimeout(5000);

    // Complete tutorial to access level select screen
    await page.goto('/#/level/tutorial');
    await page.waitForTimeout(1000);

    // Wait for the game to be ready
    await page.waitForSelector('[data-cell-key]', { timeout: 15000 });

    // Complete the tutorial quickly
    const startWord = page.locator('text=start').first();
    await expect(startWord).toBeVisible({ timeout: 5000 });

    const isTouchDevice = await page.evaluate(() => 'ontouchstart' in window);

    if (isTouchDevice) {
      await startWord.click();
      const startCell = page.locator('[data-cell-key="1-0"]');
      await startCell.click();
    } else {
      const startCell = page.locator('[data-cell-key="1-0"]');
      await startWord.dragTo(startCell);
    }

    await page.waitForTimeout(500);

    const gamerWord = page.locator('text=gamer').first();
    await expect(gamerWord).toBeVisible({ timeout: 5000 });

    if (isTouchDevice) {
      await gamerWord.click();
      const gamerCell = page.locator('[data-cell-key="0-2"]');
      await gamerCell.click();
    } else {
      const gamerCell = page.locator('[data-cell-key="0-2"]');
      await gamerWord.dragTo(gamerCell);
    }

    // Wait for completion modal and click Next to go to level select
    const completionModal = page.getByRole('dialog');
    await expect(completionModal).toBeVisible({ timeout: 5000 });

    const nextButton = page.getByRole('button', { name: /next/i });
    await nextButton.click();

    // Wait for level select screen to load
    await page.waitForTimeout(1500);

    // Verify we're on the level select screen
    await expect(page.locator('h1:has-text("CROSSWORDLY")')).toBeVisible({ timeout: 10000 });
  });

  test('should preserve scroll position when returning from a level', async ({ page }) => {
    // Wait for level select screen to be fully loaded
    await page.waitForTimeout(1000);

    // Scroll down to a specific position
    const scrollPosition = 800;
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPosition);

    // Wait for scroll to settle
    await page.waitForTimeout(500);

    // Verify we scrolled
    const actualScrollBefore = await page.evaluate(() => window.scrollY);
    expect(actualScrollBefore).toBeGreaterThan(600); // Allow some tolerance

    // Navigate to a level by clicking directly on URL
    await page.goto('/#/level/pivot-point');

    // Wait for game to load
    await page.waitForTimeout(1500);
    await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

    // Go back to level select using close button
    const closeButton = page.locator('button[aria-label*="Return"]').first();
    const hasCloseButton = await closeButton.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasCloseButton) {
      await closeButton.click();
    } else {
      // Navigate back directly
      await page.goto('/#/levels');
    }

    // Wait for level select screen to reload
    await page.waitForTimeout(1500);

    // Verify we're back on level select
    await expect(page.locator('h1:has-text("CROSSWORDLY")')).toBeVisible({ timeout: 10000 });

    // Check if scroll position was preserved
    const actualScrollAfter = await page.evaluate(() => window.scrollY);

    // The scroll position should be close to where we left it (within 150px tolerance)
    expect(Math.abs(actualScrollAfter - actualScrollBefore)).toBeLessThan(150);
  });

  test('should preserve scroll position after completing a level and clicking Next', async ({
    page,
  }) => {
    // Scroll to see lower-level tiles
    const scrollPosition = 1200;
    await page.evaluate((pos) => window.scrollTo(0, pos), scrollPosition);
    await page.waitForTimeout(500);

    const initialScroll = await page.evaluate(() => window.scrollY);
    expect(initialScroll).toBeGreaterThan(1000);

    // Click on a level that should be visible after scrolling
    const levelButtons = page.locator('section button[type="button"]:not([aria-label*="menu"])');
    const twoWordLevel = levelButtons.nth(3); // Pick a level from the visible area

    await expect(twoWordLevel).toBeVisible({ timeout: 5000 });
    await twoWordLevel.click();

    // Wait for game to load
    await page.waitForTimeout(1500);
    await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

    // Find available words and place them
    const firstWord = page.locator('[data-bankindex]').first();
    const isVisible = await firstWord.isVisible({ timeout: 5000 }).catch(() => false);

    if (isVisible) {
      const isTouchDevice = await page.evaluate(() => 'ontouchstart' in window);

      // Place first word
      if (isTouchDevice) {
        await firstWord.click();
        const targetCell = page.locator('[data-cell-key]').first();
        await targetCell.click();
      } else {
        const targetCell = page.locator('[data-cell-key]').first();
        await firstWord.dragTo(targetCell);
      }

      await page.waitForTimeout(500);

      // Place second word
      const secondWord = page.locator('[data-bankindex]').first();
      const secondWordVisible = await secondWord.isVisible({ timeout: 3000 }).catch(() => false);

      if (secondWordVisible) {
        if (isTouchDevice) {
          await secondWord.click();
          const targetCell = page.locator('[data-cell-key]').nth(1);
          await targetCell.click();
        } else {
          const targetCell = page.locator('[data-cell-key]').nth(1);
          await secondWord.dragTo(targetCell);
        }
      }
    }

    // Check if completion modal appears (level might be complete)
    const completionModal = page.getByRole('dialog');
    const modalAppeared = await completionModal.isVisible({ timeout: 8000 }).catch(() => false);

    if (modalAppeared) {
      // Click Next button
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();

      // Wait for return to level select
      await page.waitForTimeout(1500);

      // Verify we're back
      await expect(page.locator('h1:has-text("CROSSWORDLY")')).toBeVisible({ timeout: 10000 });

      // Check scroll position preservation
      const finalScroll = await page.evaluate(() => window.scrollY);

      // Should be close to initial scroll position
      expect(Math.abs(finalScroll - initialScroll)).toBeLessThan(100);
    } else {
      // If we couldn't complete the level, just navigate back and verify
      const closeButton = page.locator('button[aria-label*="Return"]').first();
      const hasClose = await closeButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasClose) {
        await closeButton.click();
        await page.waitForTimeout(1500);
        await expect(page.locator('h1:has-text("CROSSWORDLY")')).toBeVisible({ timeout: 10000 });

        const finalScroll = await page.evaluate(() => window.scrollY);
        expect(Math.abs(finalScroll - initialScroll)).toBeLessThan(100);
      }
    }
  });

  test('should reset scroll position to 0 when navigating from tutorial', async ({ page }) => {
    // Start fresh from tutorial
    await page.goto('/#/level/tutorial');
    await page.waitForTimeout(1000);

    // Complete tutorial if not already completed
    await page.waitForSelector('[data-cell-key]', { timeout: 15000 });

    const startWord = page.locator('text=start').first();
    const isStartVisible = await startWord.isVisible({ timeout: 3000 }).catch(() => false);

    if (isStartVisible) {
      // Tutorial not completed yet, complete it
      const isTouchDevice = await page.evaluate(() => 'ontouchstart' in window);

      if (isTouchDevice) {
        await startWord.click();
        await page.locator('[data-cell-key="1-0"]').click();
        await page.waitForTimeout(500);
        await page.locator('text=gamer').first().click();
        await page.locator('[data-cell-key="0-2"]').click();
      } else {
        await startWord.dragTo(page.locator('[data-cell-key="1-0"]'));
        await page.waitForTimeout(500);
        await page.locator('text=gamer').first().dragTo(page.locator('[data-cell-key="0-2"]'));
      }

      // Click Next in completion modal
      const completionModal = page.getByRole('dialog');
      await expect(completionModal).toBeVisible({ timeout: 5000 });
      await page.getByRole('button', { name: /next/i }).click();
    }

    // Should be at level select with scroll at top
    await page.waitForTimeout(1500);
    await expect(page.locator('h1:has-text("CROSSWORDLY")')).toBeVisible({ timeout: 10000 });

    // Verify scroll is at or near top (0 position)
    const scrollAtTop = await page.evaluate(() => window.scrollY);
    expect(scrollAtTop).toBeLessThan(50); // Allow small tolerance for rendering
  });

  test('should preserve scroll across multiple level navigation cycles', async ({ page }) => {
    // Scroll to a specific position
    const targetScroll = 600;
    await page.evaluate((pos) => window.scrollTo(0, pos), targetScroll);
    await page.waitForTimeout(500);

    const scroll1 = await page.evaluate(() => window.scrollY);

    // Navigate to a level
    const levelButtons = page.locator('section button[type="button"]:not([aria-label*="menu"])');
    const levelButton = levelButtons.nth(3);
    await levelButton.click();
    await page.waitForTimeout(1500);

    // Go back
    const closeButton1 = page.locator('button[aria-label*="Return"]').first();
    const hasClose1 = await closeButton1.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasClose1) {
      await closeButton1.click();
    } else {
      await page.goto('/#/levels');
    }

    await page.waitForTimeout(1500);

    // Check scroll preserved
    const scroll2 = await page.evaluate(() => window.scrollY);
    expect(Math.abs(scroll2 - scroll1)).toBeLessThan(100);

    // Navigate to another level
    const levelButtons2 = page.locator('section button[type="button"]:not([aria-label*="menu"])');
    const levelButton2 = levelButtons2.nth(5);
    await levelButton2.click();
    await page.waitForTimeout(1500);

    // Go back again
    const closeButton2 = page.locator('button[aria-label*="Return"]').first();
    const hasClose2 = await closeButton2.isVisible({ timeout: 3000 }).catch(() => false);

    if (hasClose2) {
      await closeButton2.click();
    } else {
      await page.goto('/#/levels');
    }

    await page.waitForTimeout(1500);

    // Verify scroll still preserved
    const scroll3 = await page.evaluate(() => window.scrollY);
    expect(Math.abs(scroll3 - scroll2)).toBeLessThan(100);
  });

  test('should scroll to top when opening a level', async ({ page }) => {
    // Wait for level select screen
    await page.waitForTimeout(1000);

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);

    // Click a level
    const levelButtons = page.locator('section button[type="button"]:not([aria-label*="menu"])');
    const levelButton = levelButtons.nth(5); // Pick a level further down
    await levelButton.click();

    // Wait for game to load
    await page.waitForTimeout(1500);
    await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

    // Check scroll position is 0
    const scrollPosition = await page.evaluate(() => window.scrollY);
    expect(scrollPosition).toBe(0);
  });
});
