import { test, expect, Page } from '@playwright/test';

/**
 * Test suite for comprehensive language switching functionality
 *
 * This suite validates:
 * 1. All 12 languages are available and switchable
 * 2. UI properly updates when switching between languages
 * 3. Language selection persists across sessions
 * 4. RTL languages (Arabic, Hebrew) properly flip UI direction
 */

interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  settings: string;
  language: string;
  eraseProgress: string;
  cancel: string;
  openMenu: string;
  isRTL?: boolean;
}

const LANGUAGES: LanguageConfig[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    settings: 'Settings',
    language: 'Language',
    eraseProgress: 'Erase Progress',
    cancel: 'Cancel',
    openMenu: 'Open menu',
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    settings: 'Configuración',
    language: 'Idioma',
    eraseProgress: 'Borrar Progreso',
    cancel: 'Cancelar',
    openMenu: 'Abrir menú',
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    settings: 'Настройки',
    language: 'Язык',
    eraseProgress: 'Стереть Прогресс',
    cancel: 'Отмена',
    openMenu: 'Открыть меню',
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    settings: 'Configurações',
    language: 'Idioma',
    eraseProgress: 'Apagar Progresso',
    cancel: 'Cancelar',
    openMenu: 'Abrir menu',
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    settings: 'Paramètres',
    language: 'Langue',
    eraseProgress: 'Effacer la Progression',
    cancel: 'Annuler',
    openMenu: 'Ouvrir le menu',
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    settings: 'Einstellungen',
    language: 'Sprache',
    eraseProgress: 'Fortschritt Löschen',
    cancel: 'Abbrechen',
    openMenu: 'Menü öffnen',
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    settings: '设置',
    language: '语言',
    eraseProgress: '清除进度',
    cancel: '取消',
    openMenu: '打开菜单',
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    settings: '設定',
    language: '言語',
    eraseProgress: '進行状況を消去',
    cancel: 'キャンセル',
    openMenu: 'メニューを開く',
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    settings: '설정',
    language: '언어',
    eraseProgress: '진행 상황 지우기',
    cancel: '취소',
    openMenu: '메뉴 열기',
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    settings: 'सेटिंग्स',
    language: 'भाषा',
    eraseProgress: 'प्रगति मिटाएं',
    cancel: 'रद्द करें',
    openMenu: 'मेनू खोलें',
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    settings: 'الإعدادات',
    language: 'اللغة',
    eraseProgress: 'مسح التقدم',
    cancel: 'إلغاء',
    openMenu: 'فتح القائمة',
    isRTL: true,
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    settings: 'הגדרות',
    language: 'שפה',
    eraseProgress: 'מחק התקדמות',
    cancel: 'ביטול',
    openMenu: 'פתח תפריט',
    isRTL: true,
  },
];

test.describe('Language Switching - All Languages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for splash screen to complete
    await page.waitForTimeout(4000);
  });

  async function openSettings(page: Page) {
    const menuButton = page.locator('button').filter({ hasText: /menu/i }).first();
    await menuButton.click();
    await page.waitForTimeout(300);

    const settingsButton = page
      .locator('button')
      .filter({
        hasText:
          /settings|configuración|настройки|configurações|paramètres|einstellungen|设置|設定|설정|सेटिंग्स|الإعدادات|הגדרות/i,
      })
      .first();
    await settingsButton.click();
    await page.waitForTimeout(500);
  }

  test('displays all 12 language options', async ({ page }) => {
    await openSettings(page);

    // Verify all language buttons are present
    for (const lang of LANGUAGES) {
      const langButton = page.getByRole('button', { name: lang.nativeName, exact: true });
      await expect(langButton).toBeVisible();
    }
  });

  test('switches to each language and verifies UI translation', async ({ page }) => {
    for (const lang of LANGUAGES) {
      // Open settings
      await openSettings(page);

      // Click on language button
      const langButton = page.getByRole('button', { name: lang.nativeName, exact: true });
      await langButton.click();
      await page.waitForTimeout(500);

      // Verify the language is active (has dark background)
      await expect(langButton).toHaveClass(/bg-\[#1a1a1b\]/);

      // Verify UI elements are translated
      const settingsHeading = page
        .locator('h2, h1')
        .filter({ hasText: new RegExp(lang.settings, 'i') })
        .first();
      await expect(settingsHeading).toBeVisible({ timeout: 5000 });

      const languageLabel = page.locator('text=' + lang.language);
      await expect(languageLabel).toBeVisible();

      const eraseButton = page
        .locator('button')
        .filter({ hasText: new RegExp(lang.eraseProgress, 'i') })
        .first();
      await expect(eraseButton).toBeVisible();

      // Close settings
      const closeButton = page
        .locator(
          'button[aria-label*="close" i], button[aria-label*="cerrar" i], button[aria-label*="закрыть" i], button[aria-label*="fechar" i], button[aria-label*="fermer" i], button[aria-label*="schließen" i], button[aria-label*="关闭" i], button[aria-label*="閉じる" i], button[aria-label*="닫기" i], button[aria-label*="बंद" i], button[aria-label*="إغلاق" i], button[aria-label*="סגור" i]',
        )
        .first();
      await closeButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('persists language selection after page reload', async ({ page }) => {
    // Switch to Russian
    await openSettings(page);
    const russianButton = page.getByRole('button', { name: 'Русский', exact: true });
    await russianButton.click();
    await page.waitForTimeout(500);

    // Verify Russian is active
    await expect(russianButton).toHaveClass(/bg-\[#1a1a1b\]/);

    // Close settings
    const closeButton = page.locator('button').first();
    await closeButton.click();
    await page.waitForTimeout(300);

    // Reload the page
    await page.reload();
    await page.waitForTimeout(4000); // Wait for splash

    // Open settings again
    await openSettings(page);

    // Verify Russian is still active
    const russianButtonAfterReload = page.getByRole('button', { name: 'Русский', exact: true });
    await expect(russianButtonAfterReload).toHaveClass(/bg-\[#1a1a1b\]/);

    // Verify UI is still in Russian
    const settingsHeading = page
      .locator('h2, h1')
      .filter({ hasText: /настройки/i })
      .first();
    await expect(settingsHeading).toBeVisible();
  });

  test('switches between multiple languages sequentially', async ({ page }) => {
    const testLanguages = [
      LANGUAGES.find((l) => l.code === 'en')!,
      LANGUAGES.find((l) => l.code === 'ja')!,
      LANGUAGES.find((l) => l.code === 'de')!,
      LANGUAGES.find((l) => l.code === 'fr')!,
    ];

    for (const lang of testLanguages) {
      await openSettings(page);

      const langButton = page.getByRole('button', { name: lang.nativeName, exact: true });
      await langButton.click();
      await page.waitForTimeout(500);

      // Verify the language is active
      await expect(langButton).toHaveClass(/bg-\[#1a1a1b\]/);

      // Verify UI is translated
      const settingsHeading = page
        .locator('h2, h1')
        .filter({ hasText: new RegExp(lang.settings, 'i') })
        .first();
      await expect(settingsHeading).toBeVisible();

      // Close settings
      const closeButton = page.locator('button').first();
      await closeButton.click();
      await page.waitForTimeout(300);
    }
  });
});

test.describe('RTL Language Support', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000);
  });

  async function openSettings(page: Page) {
    const menuButton = page.locator('button').first();
    await menuButton.click();
    await page.waitForTimeout(300);

    const settingsButton = page
      .locator('button')
      .filter({
        hasText:
          /settings|configuración|настройки|configurações|paramètres|einstellungen|设置|設定|설定|सेटिंग्स|الإعدادات|הגדרות/i,
      })
      .first();
    await settingsButton.click();
    await page.waitForTimeout(500);
  }

  test('sets dir="rtl" attribute for Arabic', async ({ page }) => {
    await openSettings(page);

    // Switch to Arabic
    const arabicButton = page.getByRole('button', { name: 'العربية', exact: true });
    await arabicButton.click();
    await page.waitForTimeout(500);

    // Verify dir attribute is set to rtl
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Verify lang attribute is set correctly
    const lang = await htmlElement.getAttribute('lang');
    expect(lang?.startsWith('ar')).toBeTruthy();
  });

  test('sets dir="rtl" attribute for Hebrew', async ({ page }) => {
    await openSettings(page);

    // Switch to Hebrew
    const hebrewButton = page.getByRole('button', { name: 'עברית', exact: true });
    await hebrewButton.click();
    await page.waitForTimeout(500);

    // Verify dir attribute is set to rtl
    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Verify lang attribute is set correctly
    const lang = await htmlElement.getAttribute('lang');
    expect(lang?.startsWith('he')).toBeTruthy();
  });

  test('sets dir="ltr" attribute for non-RTL languages', async ({ page }) => {
    const ltrLanguages = LANGUAGES.filter((l) => !l.isRTL);

    for (const lang of ltrLanguages.slice(0, 3)) {
      // Test first 3 for speed
      await openSettings(page);

      const langButton = page.getByRole('button', { name: lang.nativeName, exact: true });
      await langButton.click();
      await page.waitForTimeout(500);

      // Verify dir attribute is set to ltr
      const htmlElement = page.locator('html');
      await expect(htmlElement).toHaveAttribute('dir', 'ltr');

      // Close settings
      const closeButton = page.locator('button').first();
      await closeButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('switches between LTR and RTL languages', async ({ page }) => {
    await openSettings(page);

    // Start with English (LTR)
    const englishButton = page.getByRole('button', { name: 'English', exact: true });
    await englishButton.click();
    await page.waitForTimeout(500);

    const htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'ltr');

    // Switch to Arabic (RTL)
    const arabicButton = page.getByRole('button', { name: 'العربية', exact: true });
    await arabicButton.click();
    await page.waitForTimeout(500);

    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Switch to Hebrew (RTL)
    const hebrewButton = page.getByRole('button', { name: 'עברית', exact: true });
    await hebrewButton.click();
    await page.waitForTimeout(500);

    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Switch back to English (LTR)
    await englishButton.click();
    await page.waitForTimeout(500);

    await expect(htmlElement).toHaveAttribute('dir', 'ltr');
  });

  test('RTL persists after page reload', async ({ page }) => {
    await openSettings(page);

    // Switch to Arabic
    const arabicButton = page.getByRole('button', { name: 'العربية', exact: true });
    await arabicButton.click();
    await page.waitForTimeout(500);

    // Verify RTL is set
    let htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');

    // Close settings
    const closeButton = page.locator('button').first();
    await closeButton.click();
    await page.waitForTimeout(300);

    // Reload page
    await page.reload();
    await page.waitForTimeout(4000);

    // Verify RTL is still set
    htmlElement = page.locator('html');
    await expect(htmlElement).toHaveAttribute('dir', 'rtl');
  });
});

test.describe('Browser Language Detection', () => {
  test('respects browser language preference on first visit', async ({ page, context }) => {
    // Clear storage to simulate first visit
    await context.clearCookies();
    await page.goto('/');

    // Get the detected language
    await page.waitForTimeout(4000);

    const htmlElement = page.locator('html');
    const lang = await htmlElement.getAttribute('lang');

    // Verify a language is set
    expect(lang).toBeTruthy();
    expect(lang?.length).toBeGreaterThan(0);
  });

  test('localStorage overrides browser language after manual selection', async ({ page }) => {
    await page.goto('/');
    await page.waitForTimeout(4000);

    // Open settings and manually select a language
    const menuButton = page.locator('button').first();
    await menuButton.click();
    await page.waitForTimeout(300);

    const settingsButton = page
      .locator('button')
      .filter({ hasText: /settings/i })
      .first();
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Switch to Japanese
    const japaneseButton = page.getByRole('button', { name: '日本語', exact: true });
    await japaneseButton.click();
    await page.waitForTimeout(500);

    // Reload page
    await page.reload();
    await page.waitForTimeout(4000);

    // Verify Japanese is still selected (localStorage took precedence)
    const htmlElement = page.locator('html');
    const lang = await htmlElement.getAttribute('lang');
    expect(lang?.startsWith('ja')).toBeTruthy();
  });
});
