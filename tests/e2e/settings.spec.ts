import { test, expect } from '@playwright/test';

/**
 * Test suite for Settings Menu functionality
 *
 * This suite validates:
 * 1. Language switching between English and Spanish
 * 2. Erasing user progress with confirmation dialog
 */

test.describe('Settings Menu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    // Wait for splash screen to complete
    await page.waitForTimeout(4000);

    // Open the menu
    const menuButton = page.getByRole('button', { name: /open menu/i });
    await menuButton.click();

    // Click on Settings
    const settingsButton = page.getByRole('button', { name: /settings/i });
    await settingsButton.click();

    // Wait for settings dialog to be visible
    await page.waitForTimeout(500);
  });

  test.describe('Language Switching', () => {
    test('switches from English to Spanish', async ({ page }) => {
      // Verify we're starting in English
      const settingsTitle = page.getByRole('heading', { name: /settings/i });
      await expect(settingsTitle).toBeVisible();

      // Verify English is active (has dark background)
      const englishButton = page.getByRole('button', { name: 'English' });
      await expect(englishButton).toHaveClass(/bg-\[#1a1a1b\]/);

      // Click on Spanish button
      const spanishButton = page.getByRole('button', { name: 'Español' });
      await spanishButton.click();

      // Wait for language change to take effect
      await page.waitForTimeout(500);

      // Verify the settings title is now in Spanish
      const spanishSettingsTitle = page.getByRole('heading', { name: /configuración/i });
      await expect(spanishSettingsTitle).toBeVisible();

      // Verify Spanish button is now active
      await expect(spanishButton).toHaveClass(/bg-\[#1a1a1b\]/);

      // Verify other UI elements are in Spanish
      const languageLabel = page.getByText('Idioma', { exact: true });
      await expect(languageLabel).toBeVisible();

      const eraseProgressButton = page.getByRole('button', { name: /borrar progreso/i });
      await expect(eraseProgressButton).toBeVisible();
    });

    test('switches from Spanish to English', async ({ page }) => {
      // First switch to Spanish
      const spanishButton = page.getByRole('button', { name: 'Español' });
      await spanishButton.click();
      await page.waitForTimeout(500);

      // Verify we're in Spanish
      const spanishSettingsTitle = page.getByRole('heading', { name: /configuración/i });
      await expect(spanishSettingsTitle).toBeVisible();

      // Verify Spanish button is active
      await expect(spanishButton).toHaveClass(/bg-\[#1a1a1b\]/);

      // Switch back to English
      const englishButton = page.getByRole('button', { name: 'English' });
      await englishButton.click();
      await page.waitForTimeout(500);

      // Verify the settings title is now in English
      const englishSettingsTitle = page.getByRole('heading', { name: /settings/i });
      await expect(englishSettingsTitle).toBeVisible();

      // Verify English button is now active
      await expect(englishButton).toHaveClass(/bg-\[#1a1a1b\]/);

      // Verify other UI elements are in English
      const languageLabel = page.getByText('Language', { exact: true });
      await expect(languageLabel).toBeVisible();

      const eraseProgressButton = page.getByRole('button', { name: /erase progress/i });
      await expect(eraseProgressButton).toBeVisible();
    });

    test('persists language selection after closing and reopening settings', async ({ page }) => {
      // Switch to Spanish
      const spanishButton = page.getByRole('button', { name: 'Español' });
      await spanishButton.click();
      await page.waitForTimeout(500);

      // Close settings
      const closeButton = page.getByRole('button', { name: /cerrar configuración/i });
      await closeButton.click();
      await page.waitForTimeout(500);

      // Open menu again
      const menuButton = page.getByRole('button', { name: /abrir menú/i });
      await menuButton.click();

      // Open settings again
      const settingsButton = page.getByRole('button', { name: /configuración/i });
      await settingsButton.click();
      await page.waitForTimeout(500);

      // Verify still in Spanish
      const spanishSettingsTitle = page.getByRole('heading', { name: /configuración/i });
      await expect(spanishSettingsTitle).toBeVisible();

      // Verify Spanish button is still active
      await expect(spanishButton).toHaveClass(/bg-\[#1a1a1b\]/);
    });

    test('changes language across the entire app', async ({ page }) => {
      // Switch to Spanish
      const spanishButton = page.getByRole('button', { name: 'Español' });
      await spanishButton.click();
      await page.waitForTimeout(500);

      // Close settings
      const closeButton = page.getByRole('button', { name: /cerrar configuración/i });
      await closeButton.click();
      await page.waitForTimeout(500);

      // Verify the menu button is in Spanish
      const menuButton = page.getByRole('button', { name: /abrir menú/i });
      await expect(menuButton).toBeVisible();
    });
  });

  test.describe('Erase Progress', () => {
    test('opens confirmation dialog when erase progress is clicked', async ({ page }) => {
      // Click on Erase Progress button
      const eraseButton = page.getByRole('button', { name: /erase progress/i });
      await eraseButton.click();

      // Wait for confirmation dialog
      await page.waitForTimeout(500);

      // Verify confirmation dialog is visible - use the heading to identify the specific dialog
      const confirmTitle = page.getByRole('heading', { name: /erase progress\?/i });
      await expect(confirmTitle).toBeVisible();

      const confirmMessage = page.getByText(/this will erase your progress/i);
      await expect(confirmMessage).toBeVisible();

      // Verify buttons are present
      const cancelButton = page.getByRole('button', { name: /cancel/i }).last();
      await expect(cancelButton).toBeVisible();

      const eraseConfirmButton = page.getByRole('button', { name: /^erase$/i }).last();
      await expect(eraseConfirmButton).toBeVisible();
    });

    test('closes confirmation dialog when cancel is clicked', async ({ page }) => {
      // Click on Erase Progress button
      const eraseButton = page.getByRole('button', { name: /erase progress/i });
      await eraseButton.click();
      await page.waitForTimeout(500);

      // Verify dialog is visible
      const confirmTitle = page.getByRole('heading', { name: /erase progress\?/i });
      await expect(confirmTitle).toBeVisible();

      // Click cancel
      const cancelButton = page.getByRole('button', { name: /cancel/i }).last();
      await cancelButton.click();
      await page.waitForTimeout(500);

      // Verify dialog is no longer visible
      await expect(confirmTitle).not.toBeVisible();

      // Verify settings menu is still visible
      const settingsTitle = page.getByRole('heading', { name: /settings/i });
      await expect(settingsTitle).toBeVisible();
    });

    test('closes confirmation dialog when clicking outside', async ({ page }) => {
      // Click on Erase Progress button
      const eraseButton = page.getByRole('button', { name: /erase progress/i });
      await eraseButton.click();
      await page.waitForTimeout(500);

      // Verify dialog is visible
      const confirmTitle = page.getByRole('heading', { name: /erase progress\?/i });
      await expect(confirmTitle).toBeVisible();

      // Click outside the dialog (on the overlay)
      await page.click('body', { position: { x: 10, y: 10 } });
      await page.waitForTimeout(500);

      // Verify dialog is no longer visible
      await expect(confirmTitle).not.toBeVisible();

      // Verify settings menu is still visible
      const settingsTitle = page.getByRole('heading', { name: /settings/i });
      await expect(settingsTitle).toBeVisible();
    });

    test('erases progress when confirmed', async ({ page }) => {
      // Click on Erase Progress button
      const eraseButton = page.getByRole('button', { name: /erase progress/i });
      await eraseButton.click();
      await page.waitForTimeout(500);

      // Verify confirmation dialog appears
      const confirmTitle = page.getByRole('heading', { name: /erase progress\?/i });
      await expect(confirmTitle).toBeVisible();

      // Confirm erase
      const eraseConfirmButton = page.getByRole('button', { name: /^erase$/i }).last();
      await eraseConfirmButton.click();
      await page.waitForTimeout(500);

      // Verify confirmation dialog is closed
      await expect(confirmTitle).not.toBeVisible();

      // Verify settings menu is closed (as per the implementation)
      const settingsTitle = page.getByRole('heading', { name: /settings/i });
      await expect(settingsTitle).not.toBeVisible();

      // Verify we're back to the main screen
      await page.waitForTimeout(1000);

      // Check if menu button is available
      const menuButton = page.getByRole('button', { name: /open menu/i });
      await expect(menuButton).toBeVisible();
    });

    test('shows confirmation dialog in Spanish when language is Spanish', async ({ page }) => {
      // Switch to Spanish
      const spanishButton = page.getByRole('button', { name: 'Español' });
      await spanishButton.click();
      await page.waitForTimeout(500);

      // Click on Erase Progress button (in Spanish)
      const eraseButton = page.getByRole('button', { name: /borrar progreso/i });
      await eraseButton.click();
      await page.waitForTimeout(500);

      // Verify confirmation dialog is in Spanish
      const confirmTitle = page.getByRole('heading', { name: /¿borrar progreso\?/i });
      await expect(confirmTitle).toBeVisible();

      const confirmMessage = page.getByText(/esto borrará tu progreso/i);
      await expect(confirmMessage).toBeVisible();

      // Verify buttons are in Spanish
      const cancelButton = page.getByRole('button', { name: /cancelar/i }).last();
      await expect(cancelButton).toBeVisible();

      const eraseConfirmButton = page.getByRole('button', { name: /^borrar$/i }).last();
      await expect(eraseConfirmButton).toBeVisible();
    });
  });
});
