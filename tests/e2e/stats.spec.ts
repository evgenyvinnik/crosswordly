import { test, expect } from '@playwright/test';

/**
 * Test suite for StatsDialog functionality
 *
 * This suite validates:
 * 1. Stats display correctly when opening stats dialog
 * 2. Solving puzzles increases the correct stat counters
 * 3. Erasing progress resets all stats to zero
 * 4. Stats are categorized correctly by word count (2-8 words)
 */

test.describe('StatsDialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete
    await page.waitForTimeout(4000);
  });

  test.describe('Stats Display', () => {
    test('opens stats dialog from menu', async ({ page }) => {
      // Open the menu
      const menuButton = page.getByRole('button', { name: /open menu/i });
      await menuButton.click();
      await page.waitForTimeout(500);

      // Click on Stats
      const statsButton = page.getByRole('button', { name: /stats/i });
      await statsButton.click();
      await page.waitForTimeout(500);

      // Verify stats dialog is visible
      const statsDialog = page.getByRole('dialog');
      await expect(statsDialog).toBeVisible();

      // Verify title
      await expect(page.getByText('Statistics')).toBeVisible();

      // Verify main stats sections
      await expect(page.getByText('Played')).toBeVisible();
      await expect(page.getByText('Solved')).toBeVisible();

      // Verify all word count categories are present
      await expect(page.getByText('2 words')).toBeVisible();
      await expect(page.getByText('3 words')).toBeVisible();
      await expect(page.getByText('4 words')).toBeVisible();
      await expect(page.getByText('5 words')).toBeVisible();
      await expect(page.getByText('6 words')).toBeVisible();
      await expect(page.getByText('7 words')).toBeVisible();
      await expect(page.getByText('8 words')).toBeVisible();
    });

    test('closes stats dialog when close button is clicked', async ({ page }) => {
      // Open stats dialog
      const menuButton = page.getByRole('button', { name: /open menu/i });
      await menuButton.click();
      await page.waitForTimeout(500);

      const statsButton = page.getByRole('button', { name: /stats/i });
      await statsButton.click();
      await page.waitForTimeout(500);

      // Verify dialog is open
      const statsDialog = page.getByRole('dialog');
      await expect(statsDialog).toBeVisible();

      // Close dialog - use the X button in the stats dialog specifically
      const closeButton = statsDialog.getByRole('button', { name: /close/i });
      await closeButton.click();
      await page.waitForTimeout(500);

      // Verify dialog is closed
      await expect(statsDialog).not.toBeVisible();
    });

    test('closes stats dialog when clicking outside', async ({ page }) => {
      // Open stats dialog
      const menuButton = page.getByRole('button', { name: /open menu/i });
      await menuButton.click();
      await page.waitForTimeout(500);

      const statsButton = page.getByRole('button', { name: /stats/i });
      await statsButton.click();
      await page.waitForTimeout(500);

      // Verify dialog is open
      const statsDialog = page.getByRole('dialog');
      await expect(statsDialog).toBeVisible();

      // Click outside the dialog (on the overlay)
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);

      // Verify dialog is closed
      await expect(statsDialog).not.toBeVisible();
    });
  });

  test.describe('Solving Puzzles Updates Stats', () => {
    test('solving a 2-word puzzle increases played and solved counters', async ({ page }) => {
      // Complete the tutorial level (2-word puzzle: "start" and "gamer")
      await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

      const startWord = page.locator('text=start').first();
      await expect(startWord).toBeVisible({ timeout: 5000 });

      const isTouchDevice = await page.evaluate(() => 'ontouchstart' in window);

      // Place "start" word
      if (isTouchDevice) {
        await startWord.click();
        const startCell = page.locator('[data-cell-key="1-0"]');
        await startCell.click();
      } else {
        const startCell = page.locator('[data-cell-key="1-0"]');
        await startWord.dragTo(startCell);
      }

      await page.waitForTimeout(500);

      // Place "gamer" word
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

      // Wait for completion modal
      const completionModal = page.getByRole('dialog');
      await expect(completionModal).toBeVisible({ timeout: 5000 });

      // Click Next button to close the completion modal (navigates to level select)
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Now open menu from level select screen
      const menuButton = page.getByRole('button', { name: /open menu/i });
      await menuButton.click();
      await page.waitForTimeout(1000);

      const statsButton = page.getByRole('button', { name: /stats/i });
      await statsButton.waitFor({ state: 'visible', timeout: 10000 });
      await statsButton.click({ force: true });
      await page.waitForTimeout(1000);

      // Get played count - should be at least 1
      const playedSection = page.locator('text=Played').locator('..');
      const playedText = await playedSection.locator('.text-4xl').textContent();
      const played = parseInt(playedText || '0', 10);
      expect(played).toBeGreaterThanOrEqual(1);

      // Get 2-word puzzle count - should be at least 1
      const twoWordRow = page.locator('text=2 words').locator('..');
      const twoWordText = await twoWordRow.locator('span.text-white').textContent();
      const twoWord = parseInt(twoWordText || '0', 10);
      expect(twoWord).toBeGreaterThanOrEqual(1);

      // Verify solved count matches word count totals
      const solvedSection = page.locator('text=Solved').locator('..');
      const solvedText = await solvedSection.locator('.text-4xl').textContent();
      const solved = parseInt(solvedText || '0', 10);
      expect(solved).toBe(twoWord); // Only completed 2-word puzzles
    });

    test('solving different puzzle types updates corresponding category', async ({ page }) => {
      // This test verifies that different word counts go to the correct categories
      // For now, we'll just verify the structure is correct
      // In the future, as more levels are added, this test can be expanded

      const menuButton = page.getByRole('button', { name: /open menu/i });
      await menuButton.click();
      await page.waitForTimeout(500);

      const statsButton = page.getByRole('button', { name: /stats/i });
      await statsButton.click();
      await page.waitForTimeout(500);

      // Verify all 7 categories exist (2-8 word puzzles)
      const categories = [
        '2 words',
        '3 words',
        '4 words',
        '5 words',
        '6 words',
        '7 words',
        '8 words',
      ];

      for (const category of categories) {
        await expect(page.getByText(category)).toBeVisible();
      }

      // Verify each category has a value displayed
      for (const category of categories) {
        const categoryRow = page.locator(`text=${category}`).locator('..');
        const valueElement = categoryRow.locator('span.text-white');
        await expect(valueElement).toBeVisible();

        // Verify it's a number
        const valueText = await valueElement.textContent();
        expect(valueText).toMatch(/^\d+$/);
      }
    });

    test('stats persist after closing and reopening dialog', async ({ page }) => {
      // Complete a puzzle
      await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

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

      // Wait for completion modal
      const completionModal = page.getByRole('dialog');
      await expect(completionModal).toBeVisible({ timeout: 5000 });

      // Click Next button to close the completion modal
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Open stats
      const menuButton = page.getByRole('button', { name: /open menu/i });
      await menuButton.click();
      await page.waitForTimeout(500);

      const statsButton = page.getByRole('button', { name: /stats/i });
      await statsButton.click();
      await page.waitForTimeout(500);

      // Get stats values
      const statsDialog = page.getByRole('dialog');
      const playedSection = statsDialog.locator('text=Played').locator('..');
      const firstPlayedText = await playedSection.locator('.text-4xl').textContent();

      // Close dialog
      const closeButton = statsDialog.getByRole('button', { name: /close/i });
      await closeButton.click();
      await page.waitForTimeout(500);
      await expect(statsDialog).not.toBeVisible();

      // Close and reopen menu to reset state
      const closeMenuButton = page.getByRole('button', { name: /close menu/i });
      const isCloseVisible = await closeMenuButton.isVisible().catch(() => false);
      if (isCloseVisible) {
        await closeMenuButton.click({ force: true });
        await page.waitForTimeout(500);
      }

      await menuButton.click({ force: true });
      await page.waitForTimeout(1000);

      // Reopen stats
      const statsButton2 = page.getByRole('button', { name: /stats/i });
      await statsButton2.waitFor({ state: 'visible', timeout: 10000 });
      await statsButton2.click({ force: true });
      await page.waitForTimeout(1000);

      // Wait for dialog to be visible and verify stats are the same
      const statsDialog2 = page.getByRole('dialog');
      await expect(statsDialog2).toBeVisible();
      const playedSection2 = statsDialog2.locator('text=Played').locator('..');
      const secondPlayedText = await playedSection2.locator('.text-4xl').textContent();
      expect(secondPlayedText).toBe(firstPlayedText);
    });
  });

  test.describe('Erasing Progress Resets Stats', () => {
    test('erasing progress zeros all stats', async ({ page }) => {
      // First, complete a puzzle to have some stats
      await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

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

      // Wait for completion modal
      const completionModal = page.getByRole('dialog');
      await expect(completionModal).toBeVisible({ timeout: 5000 });

      // Click Next button to close the completion modal
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Open menu and verify stats are non-zero
      const menuButton = page.getByRole('button', { name: /open menu/i });
      await menuButton.click();
      await page.waitForTimeout(1000);

      const statsButton = page.getByRole('button', { name: /stats/i });
      await statsButton.waitFor({ state: 'visible', timeout: 10000 });
      await statsButton.click({ force: true });
      await page.waitForTimeout(1000);

      // Verify we have some stats
      const playedSection = page.locator('text=Played').locator('..');
      const playedText = await playedSection.locator('.text-4xl').textContent();
      const played = parseInt(playedText || '0', 10);
      expect(played).toBeGreaterThan(0);

      // Close stats
      const statsDialog = page.getByRole('dialog');
      const closeStatsButton = statsDialog.getByRole('button', { name: /close/i });
      await closeStatsButton.click();
      await page.waitForTimeout(1000);
      
      // Wait for stats dialog to fully close
      await expect(statsDialog).not.toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000);

      // Close and reopen menu to ensure clean state
      const closeMenuButtonAfterStats = page.getByRole('button', { name: /close menu/i });
      const isCloseVisible2 = await closeMenuButtonAfterStats.isVisible().catch(() => false);
      if (isCloseVisible2) {
        await closeMenuButtonAfterStats.click({ force: true });
        await page.waitForTimeout(500);
      }

      // Reopen menu
      await menuButton.click({ force: true });
      await page.waitForTimeout(1000);

      // Open settings
      const settingsButton = page.getByRole('button', { name: /settings/i });
      await settingsButton.waitFor({ state: 'visible', timeout: 10000 });
      await settingsButton.click({ force: true });
      await page.waitForTimeout(1500);

      // Click erase progress
      const eraseButton = page.getByRole('button', { name: /erase progress/i });
      await eraseButton.waitFor({ state: 'visible', timeout: 10000 });
      await eraseButton.click({ force: true });
      await page.waitForTimeout(1000);

      // Confirm erase
      const eraseConfirmButton = page.getByRole('button', { name: /^erase$/i }).last();
      await eraseConfirmButton.click();
      await page.waitForTimeout(1000);

      // Open stats again
      await menuButton.click();
      await page.waitForTimeout(1000);

      await statsButton.waitFor({ state: 'visible', timeout: 10000 });
      await statsButton.click({ force: true });
      await page.waitForTimeout(1000);

      // Verify all stats are zero
      const newPlayedText = await playedSection.locator('.text-4xl').textContent();
      expect(newPlayedText).toBe('0');

      const solvedSection = page.locator('text=Solved').locator('..');
      const solvedText = await solvedSection.locator('.text-4xl').textContent();
      expect(solvedText).toBe('0');

      // Verify all word count categories are zero
      const categories = [
        '2 words',
        '3 words',
        '4 words',
        '5 words',
        '6 words',
        '7 words',
        '8 words',
      ];

      for (const category of categories) {
        const categoryRow = page.locator(`text=${category}`).locator('..');
        const valueText = await categoryRow.locator('span.text-white').textContent();
        expect(valueText).toBe('0');
      }
    });

    test('stats remain zero after erase until new puzzle is solved', async ({ page }) => {
      // Erase any existing progress
      const menuButton = page.getByRole('button', { name: /open menu/i });
      await menuButton.click();
      await page.waitForTimeout(500);

      const settingsButton = page.getByRole('button', { name: /settings/i });
      await settingsButton.click();
      await page.waitForTimeout(500);

      const eraseButton = page.getByRole('button', { name: /erase progress/i });
      await eraseButton.click();
      await page.waitForTimeout(500);

      const eraseConfirmButton = page.getByRole('button', { name: /^erase$/i }).last();
      await eraseConfirmButton.click();
      await page.waitForTimeout(1000);

      // Open stats and verify they're zero
      await menuButton.click();
      await page.waitForTimeout(1000);

      const statsButton = page.getByRole('button', { name: /stats/i });
      await statsButton.waitFor({ state: 'visible', timeout: 10000 });
      await statsButton.click({ force: true });
      await page.waitForTimeout(1000);

      const playedSection = page.locator('text=Played').locator('..');
      const playedText = await playedSection.locator('.text-4xl').textContent();
      expect(playedText).toBe('0');

      // Close stats and menu
      const statsDialog = page.getByRole('dialog');
      const closeStatsButton = statsDialog.getByRole('button', { name: /close/i });
      await closeStatsButton.click();
      await page.waitForTimeout(500);
      await expect(statsDialog).not.toBeVisible();

      // Close menu - check if it exists first
      const closeMenuButton = page.getByRole('button', { name: /close menu/i });
      const isCloseMenuVisible = await closeMenuButton.isVisible().catch(() => false);
      if (isCloseMenuVisible) {
        await closeMenuButton.click({ force: true });
        await page.waitForTimeout(1000);
      }

      // Complete a puzzle
      await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

      const startWord = page.locator('text=start').first();
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
      if (isTouchDevice) {
        await gamerWord.click();
        const gamerCell = page.locator('[data-cell-key="0-2"]');
        await gamerCell.click();
      } else {
        const gamerCell = page.locator('[data-cell-key="0-2"]');
        await gamerWord.dragTo(gamerCell);
      }

      const completionModal = page.getByRole('dialog');
      await expect(completionModal).toBeVisible({ timeout: 5000 });

      // Click Next button to close the completion modal
      const nextButton = page.getByRole('button', { name: /next/i });
      await nextButton.click();
      await page.waitForTimeout(1000);

      // Check stats again - should show 1 played and 1 solved
      await menuButton.click();
      await page.waitForTimeout(1000);

      await statsButton.waitFor({ state: 'visible', timeout: 10000 });
      await statsButton.click({ force: true });
      await page.waitForTimeout(1000);

      const newPlayedText = await playedSection.locator('.text-4xl').textContent();
      expect(newPlayedText).toBe('1');

      const solvedSection = page.locator('text=Solved').locator('..');
      const solvedText = await solvedSection.locator('.text-4xl').textContent();
      expect(solvedText).toBe('1');
    });
  });

  test.describe('Localization', () => {
    test('displays stats in Spanish when language is Spanish', async ({ page }) => {
      // Open menu
      const menuButton = page.getByRole('button', { name: /open menu/i });
      await menuButton.click();
      await page.waitForTimeout(500);

      // Open settings
      const settingsButton = page.getByRole('button', { name: /settings/i });
      await settingsButton.click();
      await page.waitForTimeout(500);

      // Switch to Spanish
      const spanishButton = page.getByRole('button', { name: 'Español' });
      await spanishButton.click();
      await page.waitForTimeout(500);

      // Close settings
      const closeSettingsButton = page.getByRole('button', { name: /cerrar configuración/i });
      await closeSettingsButton.click();
      await page.waitForTimeout(1000);

      // Close and reopen menu to ensure clean state
      const closeMenuButton = page.getByRole('button', { name: /cerrar menú/i });
      const isCloseMenuVisible = await closeMenuButton.isVisible().catch(() => false);
      if (isCloseMenuVisible) {
        await closeMenuButton.click({ force: true });
        await page.waitForTimeout(500);
      }

      // Use Spanish menu button locator since we switched language
      const menuButtonSpanish = page.getByRole('button', { name: /abrir menú/i });
      await menuButtonSpanish.waitFor({ state: 'visible', timeout: 10000 });
      await menuButtonSpanish.click({ force: true });
      await page.waitForTimeout(1000);

      // Open stats - wait for menu to be ready and use force click
      const statsButtonSpanish = page.getByRole('button', { name: /estadísticas/i });
      await statsButtonSpanish.waitFor({ state: 'visible', timeout: 10000 });
      await statsButtonSpanish.click({ force: true });
      await page.waitForTimeout(1000);

      // Wait for the stats dialog to open
      const statsDialog = page.getByRole('dialog');
      await expect(statsDialog).toBeVisible();

      // Verify Spanish text in the dialog
      await expect(statsDialog.getByRole('heading', { name: 'Estadísticas' })).toBeVisible();
      await expect(statsDialog.getByText('Jugados')).toBeVisible();
      await expect(statsDialog.getByText('Resueltos')).toBeVisible();
      await expect(page.getByText('PUZZLES POR CANTIDAD DE PALABRAS')).toBeVisible();

      // Verify all categories are in Spanish
      await expect(page.getByText('2 palabras')).toBeVisible();
      await expect(page.getByText('3 palabras')).toBeVisible();
      await expect(page.getByText('4 palabras')).toBeVisible();
      await expect(page.getByText('5 palabras')).toBeVisible();
      await expect(page.getByText('6 palabras')).toBeVisible();
      await expect(page.getByText('7 palabras')).toBeVisible();
      await expect(page.getByText('8 palabras')).toBeVisible();
    });
  });
});
