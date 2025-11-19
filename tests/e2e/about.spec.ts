import { test, expect } from '@playwright/test';

test.describe('About Dialog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for the splash screen to finish
    await page.waitForTimeout(3000);
  });

  test('opens about dialog from menu', async ({ page }) => {
    // Open the menu
    await page.getByRole('button', { name: /open menu/i }).click();

    // Click the About menu item
    await page.getByRole('button', { name: 'About', exact: true }).click();

    // Verify About dialog is visible
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Verify title
    await expect(page.getByRole('heading', { name: /about crosswordly/i })).toBeVisible();
  });

  test('displays project description', async ({ page }) => {
    // Open menu and click About
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.getByRole('button', { name: 'About', exact: true }).click();

    // Verify description text is present
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/my attempt at developing a simple HTML game/i)).toBeVisible();
  });

  test('displays GitHub link', async ({ page }) => {
    // Open menu and click About
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.getByRole('button', { name: 'About', exact: true }).click();

    // Verify GitHub link
    const githubLink = page.getByRole('link', { name: /github/i });
    await expect(githubLink).toBeVisible();
    await expect(githubLink).toHaveAttribute('href', 'https://github.com/evgenyvinnik/crosswordly');
    await expect(githubLink).toHaveAttribute('target', '_blank');
  });

  test('displays LinkedIn link', async ({ page }) => {
    // Open menu and click About
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.getByRole('button', { name: 'About', exact: true }).click();

    // Verify LinkedIn link
    const linkedinLink = page.getByRole('link', { name: /linkedin/i });
    await expect(linkedinLink).toBeVisible();
    await expect(linkedinLink).toHaveAttribute('href', 'https://www.linkedin.com/in/evgenyvinnik/');
    await expect(linkedinLink).toHaveAttribute('target', '_blank');
  });

  test('closes about dialog when close button is clicked', async ({ page }) => {
    // Open menu and click About
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.getByRole('button', { name: 'About', exact: true }).click();

    // Verify dialog is open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Click close button within the dialog
    await dialog.getByRole('button', { name: /close/i }).click();

    // Verify dialog is closed
    await expect(dialog).not.toBeVisible();
  });

  test('closes about dialog when clicking backdrop', async ({ page }) => {
    // Open menu and click About
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.getByRole('button', { name: 'About', exact: true }).click();

    // Verify dialog is open
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Click backdrop (outside the dialog content)
    await page
      .locator('.fixed.inset-0')
      .first()
      .click({ position: { x: 10, y: 10 } });

    // Verify dialog is closed
    await expect(dialog).not.toBeVisible();
  });

  test('displays in Spanish when language is Spanish', async ({ page }) => {
    // Open settings and switch to Spanish
    await page.getByRole('button', { name: /open menu/i }).click();
    await page.getByRole('button', { name: /settings/i }).click();

    // Click the Español language button
    const spanishButton = page.getByRole('button', { name: 'Español' });
    await spanishButton.click();
    await page.waitForTimeout(500);

    // Close settings
    const closeButton = page.getByRole('button', { name: /cerrar configuración/i });
    await closeButton.click();
    await page.waitForTimeout(500);

    // Open About dialog
    await page.getByRole('button', { name: /abrir menú/i }).click();
    await page.getByRole('button', { name: /acerca de/i }).click();

    // Verify Spanish title
    await expect(page.getByRole('heading', { name: /acerca de crosswordly/i })).toBeVisible();

    // Verify Spanish description
    const dialog = page.getByRole('dialog');
    await expect(dialog.getByText(/mi intento de desarrollar/i)).toBeVisible();
  });
  test('menu shows About option on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Open mobile menu
    await page.getByRole('button', { name: /open menu/i }).click();

    // Verify About button is visible in mobile drawer
    await expect(page.getByRole('button', { name: 'About', exact: true })).toBeVisible();
  });
});
