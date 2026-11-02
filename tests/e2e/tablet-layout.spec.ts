import { test, expect, type Page } from '@playwright/test';

/**
 * Test suite for the iPad layout
 *
 * This suite validates:
 * 1. The board grows on iPad screens instead of keeping its phone size
 * 2. In portrait the word bank stacks under the board and both fit on one screen
 * 3. In landscape the word bank sits beside the board
 * 4. Nothing overflows sideways in narrow Split View windows, including the completion modal
 */

const IPAD_PORTRAIT = { width: 820, height: 1180 };
const IPAD_LANDSCAPE = { width: 1180, height: 820 };
const IPAD_PRO_13_PORTRAIT = { width: 1024, height: 1366 };
const SPLIT_VIEW_NARROW = { width: 320, height: 1024 };

const openLevel = async (page: Page, levelId: string) => {
  await page.goto(`/#/level/${levelId}`);
  // The board appears once the splash screen has finished
  await page.locator('main [data-cell-key]').first().waitFor({ timeout: 15000 });
};

const getBoardBox = async (page: Page) => {
  const box = await page.locator('main [role="img"]').boundingBox();
  expect(box).not.toBeNull();
  return box!;
};

const getWordBankBoxes = async (page: Page) => {
  const left = await page.getByRole('navigation', { name: 'Available words' }).boundingBox();
  const right = await page.getByRole('navigation', { name: 'Additional words' }).boundingBox();
  expect(left).not.toBeNull();
  expect(right).not.toBeNull();
  return [left!, right!];
};

const expectNoHorizontalOverflow = async (page: Page) => {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
};

test.describe('iPad layout', () => {
  test.describe('portrait', () => {
    test.use({ viewport: IPAD_PORTRAIT, hasTouch: true });

    test('grows the board and keeps it and the word bank on one screen', async ({ page }) => {
      await openLevel(page, 'orbital-triad');

      const cell = await page.locator('main button[data-cell-key]').first().boundingBox();
      expect(cell!.width).toBeGreaterThan(64);

      const board = await getBoardBox(page);
      const banks = await getWordBankBoxes(page);
      for (const bank of banks) {
        expect(bank.y).toBeGreaterThanOrEqual(board.y + board.height);
        expect(bank.y + bank.height).toBeLessThanOrEqual(IPAD_PORTRAIT.height);
      }
      await expectNoHorizontalOverflow(page);
    });

    test('places words by tapping', async ({ page }) => {
      await openLevel(page, 'tutorial');

      await page.getByRole('button', { name: 'Select word start' }).tap();
      await page.locator('main [data-cell-key="1-0"]').tap();
      await expect(page.locator('main [data-cell-key="1-4"]')).toHaveText('t');

      await page.getByRole('button', { name: 'Select word gamer' }).tap();
      await page.locator('main [data-cell-key="0-2"]').tap();
      await expect(page.getByText('Level complete!')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('13-inch portrait', () => {
    test.use({ viewport: IPAD_PRO_13_PORTRAIT, hasTouch: true });

    test('stacks the word bank under the board', async ({ page }) => {
      await openLevel(page, 'radial-burst');

      const board = await getBoardBox(page);
      const banks = await getWordBankBoxes(page);
      for (const bank of banks) {
        expect(bank.y).toBeGreaterThanOrEqual(board.y + board.height);
      }
      // An 11-column grid gets most of the width instead of being squeezed between word columns
      expect(board.width).toBeGreaterThan(IPAD_PRO_13_PORTRAIT.width * 0.75);
      await expectNoHorizontalOverflow(page);
    });
  });

  test.describe('landscape', () => {
    test.use({ viewport: IPAD_LANDSCAPE, hasTouch: true });

    test('puts the word bank beside a board that fits the screen height', async ({ page }) => {
      await openLevel(page, 'orbital-triad');

      const board = await getBoardBox(page);
      const [left, right] = await getWordBankBoxes(page);
      expect(left.x + left.width).toBeLessThanOrEqual(board.x);
      expect(right.x).toBeGreaterThanOrEqual(board.x + board.width);
      expect(board.y + board.height).toBeLessThanOrEqual(IPAD_LANDSCAPE.height);
      expect(board.height).toBeGreaterThan(IPAD_LANDSCAPE.height / 2);
      await expectNoHorizontalOverflow(page);
    });
  });

  test.describe('narrow Split View', () => {
    test.use({ viewport: SPLIT_VIEW_NARROW, hasTouch: true });

    test('fits wide grids and the completion modal on screen', async ({ page }) => {
      await openLevel(page, 'radial-burst');
      await expectNoHorizontalOverflow(page);

      await openLevel(page, 'tutorial');
      await page.getByRole('button', { name: 'Select word start' }).click();
      await page.locator('main [data-cell-key="1-0"]').click();
      await page.getByRole('button', { name: 'Select word gamer' }).click();
      await page.locator('main [data-cell-key="0-2"]').click();

      const dialog = page.getByRole('dialog');
      await expect(dialog.getByText('Level complete!')).toBeVisible({ timeout: 5000 });
      for (const name of ['Download', 'Share', 'Next']) {
        const button = await dialog.getByRole('button', { name, exact: true }).boundingBox();
        expect(button!.x).toBeGreaterThanOrEqual(0);
        expect(button!.x + button!.width).toBeLessThanOrEqual(SPLIT_VIEW_NARROW.width);
      }
    });
  });
});
