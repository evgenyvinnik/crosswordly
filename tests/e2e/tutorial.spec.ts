import { test, expect } from '@playwright/test';

test.describe('Tutorial onboarding', () => {
  test('reveals the tutorial board after the splash animation', async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete (typically 3-4 seconds)
    await page.waitForTimeout(4000);

    // Check for tutorial heading or word cards
    const heading = page.getByRole('heading', { name: /learn/i });
    const hasHeading = await heading.isVisible({ timeout: 5000 }).catch(() => false);

    // Alternative: check for word cards which are always present in tutorial
    const wordCards = page.locator('.word-card');
    const hasWordCards = (await wordCards.count()) > 0;

    // At least one should be visible
    expect(hasHeading || hasWordCards).toBeTruthy();

    // Verify word cards are present (tutorial always has word cards)
    await expect(wordCards.first()).toBeVisible({ timeout: 5000 });
  });
});
