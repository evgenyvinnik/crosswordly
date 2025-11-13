import { test, expect } from '@playwright/test';

test.describe('Tutorial onboarding', () => {
  test('reveals the tutorial board after the splash animation', async ({ page }) => {
    await page.goto('/');

    const heading = page.getByRole('heading', { name: 'Learn the basics' });
    await expect(heading).toBeVisible();

    const firstWordTile = page.getByRole('button', { name: /Drag word/i }).first();
    await expect(firstWordTile).toBeVisible();
  });
});
