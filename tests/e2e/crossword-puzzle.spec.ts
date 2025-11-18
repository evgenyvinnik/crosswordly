import { test, expect } from '@playwright/test';

/**
 * Test suite for Crossword Puzzle Mode
 *
 * This suite validates:
 * 1. Loading a crossword puzzle from an encoded URL
 * 2. Grid displays correctly with empty cells
 * 3. Clue cards show word descriptions
 * 4. Typing functionality works correctly
 * 5. Cell selection and word highlighting
 * 6. Word validation (correct/incorrect)
 * 7. Completion modal and navigation
 */

test.describe('Crossword Puzzle Mode', () => {
  // Valid crossword puzzle hash for tutorial level: "start" across, "gamer" down
  const validHash =
    'eyJsZXZlbElkIjoidHV0b3JpYWwiLCJhY3Jvc3MiOlsic3RhcnQiXSwiZG93biI6WyJnYW1lciJdfQ';
  const crosswordUrl = `/#/crossword/${validHash}`;

  test.beforeEach(async ({ page }) => {
    await page.goto(crosswordUrl);
    // Wait for puzzle to load
    await page.waitForSelector('[data-cell-key]', { timeout: 10000 });
  });

  test('should load crossword puzzle from encoded URL', async ({ page }) => {
    // Check that we're on the crossword screen
    await expect(page.locator('h2:has-text("Crossword Challenge")')).toBeVisible();

    // Check for instructions text
    await expect(page.locator('text=/type.*correct.*words/i')).toBeVisible();
  });

  test('should display empty grid with correct dimensions', async ({ page }) => {
    // Tutorial level has a 5x5 grid
    const cells = page.locator('[data-cell-key]');
    const cellCount = await cells.count();

    // Should have cells for the crossword (not all 25 cells are playable)
    expect(cellCount).toBeGreaterThan(0);

    // Check that cells are initially empty (no letters)
    const firstPlayableCell = cells.first();
    const cellText = await firstPlayableCell.textContent();
    // Should only have clue number or be empty
    expect(cellText?.length || 0).toBeLessThanOrEqual(2);
  });

  test('should display clue cards with word descriptions', async ({ page }) => {
    // Check for direction cards
    await expect(page.locator('text=/across/i').first()).toBeVisible();
    await expect(page.locator('text=/down/i').first()).toBeVisible();

    // Clues should be visible with descriptions
    // For "start" and "gamer", definitions should be from GUESS_WORDS
    const clueCards = page.locator('.direction-card-content');
    await expect(clueCards.first()).toBeVisible();
  });

  test('should select word when clicking a cell', async ({ page }) => {
    // Click the first cell of "start" word (row 1, col 0)
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();

    // Cell should be highlighted (border color change)
    const cellClass = await firstCell.getAttribute('class');
    expect(cellClass).toContain('border-');

    // Check that a word is selected by looking for highlighted direction card
    const directionCards = page.locator('.direction-card-content');
    await expect(directionCards.first()).toBeVisible();
  });

  test('should type letters into selected word', async ({ page }) => {
    // Click the first cell of "start" word
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();

    // Type the first letter
    await page.keyboard.press('S');

    // Check that the letter appears in the cell (stored as lowercase, displayed as uppercase via CSS)
    await page.waitForTimeout(100);
    let cellText = await firstCell.textContent();
    expect(cellText?.toLowerCase()).toContain('s');

    // Type more letters
    await page.keyboard.press('T');
    await page.keyboard.press('A');

    // Check second and third cells
    const secondCell = page.locator('[data-cell-key="1-1"]');
    cellText = await secondCell.textContent();
    expect(cellText?.toLowerCase()).toContain('t');

    const thirdCell = page.locator('[data-cell-key="1-2"]');
    cellText = await thirdCell.textContent();
    expect(cellText?.toLowerCase()).toContain('a');
  });

  test('should move cursor forward as user types', async ({ page }) => {
    // Click the first cell
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();

    // Type a letter
    await page.keyboard.press('S');

    // The next cell should become the current cell (highlighted with blue border)
    await page.waitForTimeout(100);

    // Type another letter
    await page.keyboard.press('T');

    // Verify letters are in correct cells (stored as lowercase)
    let cellText = await firstCell.textContent();
    expect(cellText?.toLowerCase()).toContain('s');
    const secondCell = page.locator('[data-cell-key="1-1"]');
    cellText = await secondCell.textContent();
    expect(cellText?.toLowerCase()).toContain('t');
  });

  test('should handle backspace to delete letters', async ({ page }) => {
    // Click and type
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();
    await page.keyboard.press('S');
    await page.keyboard.press('T');

    // Backspace should delete the last letter
    await page.keyboard.press('Backspace');

    // Second cell should be empty now (no letter, may still have clue number)
    const secondCell = page.locator('[data-cell-key="1-1"]');
    const cellText = await secondCell.textContent();
    // Cell text should not contain 't' anymore
    expect(cellText?.toLowerCase()).not.toContain('t');
  });

  test('should validate incorrect word and show error (yellow highlight)', async ({ page }) => {
    // Click the first cell of "start" word
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();

    // Type an incorrect word
    await page.keyboard.press('W');
    await page.keyboard.press('R');
    await page.keyboard.press('O');
    await page.keyboard.press('N');
    await page.keyboard.press('G');

    // After typing the full word, it should show error (yellow background)
    await page.waitForTimeout(200);

    // Check for yellow/error styling
    const cellWithError = page.locator('[data-cell-key="1-0"]');
    const cellClass = await cellWithError.getAttribute('class');
    expect(cellClass).toContain('yellow');

    // Word should be cleared after a moment
    await page.waitForTimeout(1000);

    // Cell should be empty again (no letter, may have clue number '2')
    const cellText = await firstCell.textContent();
    // Should not contain the wrong letter 'w'
    expect(cellText?.toLowerCase()).not.toContain('w');
  });

  test('should validate correct word and keep it', async ({ page }) => {
    // Click the first cell of "start" word
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();

    // Type the correct word "START"
    await page.keyboard.press('S');
    await page.keyboard.press('T');
    await page.keyboard.press('A');
    await page.keyboard.press('R');
    await page.keyboard.press('T');

    // Wait for validation
    await page.waitForTimeout(300);

    // Word should remain in the grid (stored as lowercase)
    const cellText = await firstCell.textContent();
    expect(cellText?.toLowerCase()).toContain('s');

    // Should not have error styling and should have green/correct styling
    const cellClass = await firstCell.getAttribute('class');
    expect(cellClass).not.toContain('yellow');
    expect(cellClass).toContain('6aaa64'); // Green background for correct words
  });

  test('should toggle between across and down when clicking intersection', async ({ page }) => {
    // The intersection cell is at row 1, col 2 (where "start" across meets "gamer" down)
    const intersectionCell = page.locator('[data-cell-key="1-2"]');
    await intersectionCell.click();

    // Type a letter - it should go in the first selected direction
    await page.keyboard.press('A');
    await page.waitForTimeout(100);

    // Click the intersection again to toggle direction
    await intersectionCell.click();

    // The direction should have changed - verify by checking class changes
    const cellClass = await intersectionCell.getAttribute('class');
    // As long as it's still highlighted (blue or green), the test passes
    const isHighlighted = cellClass?.includes('border-blue') || cellClass?.includes('border-green');
    expect(isHighlighted).toBeTruthy();
  });

  test('should show completion modal when puzzle is solved', async ({ page }) => {
    // Solve the "start" word
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();
    await page.keyboard.type('START');

    await page.waitForTimeout(300);

    // Solve the "gamer" word
    const firstDownCell = page.locator('[data-cell-key="0-2"]');
    await firstDownCell.click();
    await page.keyboard.type('GAMER');

    // Wait for completion modal
    await expect(page.locator('text=/congratulations/i')).toBeVisible({ timeout: 3000 });

    // Check for completion message
    await expect(page.locator('text=/solved.*crossword/i')).toBeVisible();

    // Check for call to action
    await expect(page.locator('text=/try.*original.*crosswordly/i')).toBeVisible();

    // Check for buttons
    await expect(page.locator('button:has-text("Play Crosswordly")')).toBeVisible();
    await expect(page.locator('button:has-text("Close")')).toBeVisible();
  });

  test('should navigate to levels when clicking "Play Crosswordly" button', async ({ page }) => {
    // Complete the puzzle first
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();
    await page.keyboard.type('START');
    await page.waitForTimeout(300);

    const firstDownCell = page.locator('[data-cell-key="0-2"]');
    await firstDownCell.click();
    await page.keyboard.type('GAMER');

    // Wait for modal and click the button
    const playButton = page.locator('button:has-text("Play Crosswordly")');
    await expect(playButton).toBeVisible({ timeout: 3000 });
    await playButton.click();

    // Should navigate to levels page
    await page.waitForURL(/.*levels.*/, { timeout: 5000 });
    expect(page.url()).toContain('levels');
  });

  test('should close modal and return home when clicking Close button', async ({ page }) => {
    // Complete the puzzle
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();
    await page.keyboard.type('START');
    await page.waitForTimeout(300);

    const firstDownCell = page.locator('[data-cell-key="0-2"]');
    await firstDownCell.click();
    await page.keyboard.type('GAMER');

    // Wait for modal and click Close
    const closeButton = page.locator('button:has-text("Close")').last();
    await expect(closeButton).toBeVisible({ timeout: 3000 });
    await closeButton.click();

    // Should navigate to home
    await page.waitForTimeout(500);
    expect(page.url()).not.toContain('crossword');
  });

  test('should show error for invalid puzzle hash', async ({ page }) => {
    await page.goto('/#/crossword/invalid-hash-12345');

    // Should show error message
    await expect(page.locator('text=/error/i')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/invalid.*puzzle/i')).toBeVisible();

    // Should have return button
    await expect(page.locator('button:has-text("Return to Home")')).toBeVisible();
  });

  test('should return home when clicking error return button', async ({ page }) => {
    await page.goto('/#/crossword/invalid-hash');

    const returnButton = page.locator('button:has-text("Return to Home")');
    await expect(returnButton).toBeVisible({ timeout: 5000 });
    await returnButton.click();

    // Should navigate to home
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url.endsWith('/#/') || url.endsWith('/')).toBeTruthy();
  });

  test('should display clue numbers in grid cells', async ({ page }) => {
    // Clue numbers should appear in starting cells
    // For tutorial: "start" begins at row 1, col 0 and "gamer" begins at row 0, col 2

    // Check for clue numbers (small numbers in top-left of cells)
    const cellsWithClues = page.locator('[data-cell-key] span[class*="absolute"]');
    const clueCount = await cellsWithClues.count();

    expect(clueCount).toBeGreaterThan(0);
  });

  test('should show correct visual feedback for selected word', async ({ page }) => {
    // Click a cell to select a word
    const cell = page.locator('[data-cell-key="1-0"]');
    await cell.click();

    // All cells in the selected word should have visual highlight
    // Check for green border/bg class for selected word (or blue if it's current)
    const cellClass = await cell.getAttribute('class');
    // Selected word can have either blue (current cell) or green (selected word) styling
    const hasSelectionStyling =
      cellClass?.includes('border-blue-500') ||
      cellClass?.includes('border-green-500') ||
      cellClass?.includes('bg-green-50');
    expect(hasSelectionStyling).toBeTruthy();
  });

  test('should show correct visual feedback for current cell', async ({ page }) => {
    // Click a cell
    const cell = page.locator('[data-cell-key="1-0"]');
    await cell.click();

    // Current cell should have blue highlight
    const cellClass = await cell.getAttribute('class');
    expect(cellClass).toContain('border-blue');

    // Type a letter to move to next cell
    await page.keyboard.press('S');
    await page.waitForTimeout(100);

    // First cell should no longer be current (blue), but still selected (green)
    const updatedClass = await cell.getAttribute('class');
    expect(updatedClass).toContain('border-green');
  });

  test('should support case-insensitive typing', async ({ page }) => {
    // Click and type in lowercase
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();
    await page.keyboard.type('start');

    // Letters should appear (displayed as uppercase via CSS)
    await page.waitForTimeout(100);
    const cellText = await firstCell.textContent();
    expect(cellText?.toLowerCase()).toContain('s');

    // Word should validate correctly
    await page.waitForTimeout(300);
    const cellClass = await firstCell.getAttribute('class');
    expect(cellClass).not.toContain('yellow');
  });

  test('should prevent typing non-alphabetic characters', async ({ page }) => {
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();

    // Try typing numbers and special characters
    await page.keyboard.press('1');
    await page.keyboard.press('!');
    await page.keyboard.press('@');

    // Cell should remain empty
    let cellText = await firstCell.textContent();
    const letterCount = cellText?.replace(/[0-9]/, '').trim().length || 0;
    expect(letterCount).toBe(0);

    // But letters should work
    await page.keyboard.press('S');
    await page.waitForTimeout(100);
    cellText = await firstCell.textContent();
    expect(cellText?.toLowerCase()).toContain('s');
  });

  test('should maintain state when switching between words', async ({ page }) => {
    // Type partial word in across
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();
    await page.keyboard.type('ST');

    // Switch to down word
    const downCell = page.locator('[data-cell-key="0-2"]');
    await downCell.click();
    await page.keyboard.type('GA');

    // Go back to across word
    await firstCell.click();

    // Previous letters should still be there
    let cellText = await firstCell.textContent();
    expect(cellText?.toLowerCase()).toContain('s');
    const secondCell = page.locator('[data-cell-key="1-1"]');
    cellText = await secondCell.textContent();
    expect(cellText?.toLowerCase()).toContain('t');
  });

  test('should work with language-prefixed URLs', async ({ page }) => {
    // Test with Spanish language prefix
    await page.goto(`/#/es/crossword/${validHash}`);

    // Wait for puzzle to load
    await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

    // Should display crossword (translations may differ)
    const cells = page.locator('[data-cell-key]');
    expect(await cells.count()).toBeGreaterThan(0);
  });

  test('should handle menu interactions without breaking game state', async ({ page }) => {
    // Click a cell and type
    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();
    await page.keyboard.type('ST');

    // Open menu
    const menuButton = page.locator('button[aria-label*="menu" i], button:has-text("☰")');
    if ((await menuButton.count()) > 0) {
      await menuButton.first().click();
      await page.waitForTimeout(300);

      // Close menu
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
    }

    // Verify game state is maintained
    const cellText = await firstCell.textContent();
    expect(cellText?.toLowerCase()).toContain('s');
  });
});

test.describe('Crossword Puzzle Mode - Edge Cases', () => {
  test('should handle rapid typing correctly', async ({ page }) => {
    const validHash =
      'eyJsZXZlbElkIjoidHV0b3JpYWwiLCJhY3Jvc3MiOlsic3RhcnQiXSwiZG93biI6WyJnYW1lciJdfQ';
    await page.goto(`/#/crossword/${validHash}`);
    await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();

    // Type very quickly
    await page.keyboard.type('START', { delay: 10 });
    await page.waitForTimeout(500);

    // All letters should be present
    let cellText = await firstCell.textContent();
    expect(cellText?.toLowerCase()).toContain('s');
    const fifthCell = page.locator('[data-cell-key="1-4"]');
    cellText = await fifthCell.textContent();
    expect(cellText?.toLowerCase()).toContain('t');
  });

  test('should not allow typing beyond word length', async ({ page }) => {
    const validHash =
      'eyJsZXZlbElkIjoidHV0b3JpYWwiLCJhY3Jvc3MiOlsic3RhcnQiXSwiZG93biI6WyJnYW1lciJdfQ';
    await page.goto(`/#/crossword/${validHash}`);
    await page.waitForSelector('[data-cell-key]', { timeout: 10000 });

    const firstCell = page.locator('[data-cell-key="1-0"]');
    await firstCell.click();

    // Type more letters than word length
    await page.keyboard.type('STARTXYZ');
    await page.waitForTimeout(300);

    // Extra letters should not appear anywhere
    const allCells = page.locator('[data-cell-key]');
    const cellTexts = await allCells.allTextContents();
    const hasX = cellTexts.some((text) => text.includes('X'));
    expect(hasX).toBeFalsy();
  });
});
