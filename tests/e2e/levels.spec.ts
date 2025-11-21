import { test, expect } from '@playwright/test';
import { LEVEL_CONFIGS } from '../../src/components/levels/levelConfigs';
import type { LevelDefinition } from '../../src/components/levels/levelUtils';

/**
 * Comprehensive test suite to verify all levels are well-configured and passable.
 *
 * This suite validates:
 * 1. Level configuration structure and validity
 * 2. Grid dimensions and word placement correctness
 * 3. Word intersections and constraints
 * 4. Level count and organization
 */

/**
 * Validates that a level definition is well-formed
 */
function validateLevelDefinition(levelDef: LevelDefinition): string[] {
  const errors: string[] = [];

  if (!levelDef.id) {
    errors.push('Level must have an id');
  }

  if (!levelDef.title) {
    errors.push('Level must have a title');
  }

  if (!levelDef.puzzle) {
    errors.push('Level must have a puzzle');
    return errors; // Can't validate further without puzzle
  }

  const { puzzle } = levelDef;

  if (!puzzle.grid || !puzzle.grid.width || !puzzle.grid.height) {
    errors.push('Puzzle must have valid grid dimensions');
  }

  if (!puzzle.words || puzzle.words.length === 0) {
    errors.push('Puzzle must have at least one word');
  }

  // Validate each word
  puzzle.words.forEach((word, index) => {
    if (!word.word || word.word.length === 0) {
      errors.push(`Word ${index} must have a non-empty word property`);
    }

    if (!word.direction || !['across', 'down'].includes(word.direction)) {
      errors.push(`Word ${index} (${word.word}) must have direction 'across' or 'down'`);
    }

    if (word.startRow < 0 || word.startCol < 0) {
      errors.push(`Word ${index} (${word.word}) must have non-negative start position`);
    }

    // Check if word fits in grid
    const wordLength = word.word.length;
    if (word.direction === 'across') {
      if (word.startCol + wordLength > puzzle.grid.width) {
        errors.push(
          `Word ${index} (${word.word}) extends beyond grid width (start: ${word.startCol}, length: ${wordLength}, grid width: ${puzzle.grid.width})`,
        );
      }
    } else if (word.direction === 'down') {
      if (word.startRow + wordLength > puzzle.grid.height) {
        errors.push(
          `Word ${index} (${word.word}) extends beyond grid height (start: ${word.startRow}, length: ${wordLength}, grid height: ${puzzle.grid.height})`,
        );
      }
    }
  });

  // Validate intersections
  if (puzzle.words.length > 1) {
    const cellMap = new Map<string, { word: string; letter: string; direction: string }[]>();

    puzzle.words.forEach((word) => {
      const letters = word.word.split('');
      letters.forEach((letter, index) => {
        const row = word.startRow + (word.direction === 'down' ? index : 0);
        const col = word.startCol + (word.direction === 'across' ? index : 0);
        const key = `${row}-${col}`;

        if (!cellMap.has(key)) {
          cellMap.set(key, []);
        }
        cellMap.get(key)!.push({
          word: word.word,
          letter,
          direction: word.direction,
        });
      });
    });

    // Check for letter conflicts at intersections
    cellMap.forEach((entries, key) => {
      if (entries.length > 1) {
        const letters = entries.map((e) => e.letter);
        const uniqueLetters = new Set(letters);
        if (uniqueLetters.size > 1) {
          errors.push(
            `Conflicting letters at position ${key}: ${entries.map((e) => `${e.word}[${e.letter}]`).join(' vs ')}`,
          );
        }

        // Check that intersections are across-down pairs
        const directions = new Set(entries.map((e) => e.direction));
        if (directions.size > 1 && !directions.has('across')) {
          errors.push(`Invalid intersection at ${key}: missing across word`);
        }
        if (directions.size > 1 && !directions.has('down')) {
          errors.push(`Invalid intersection at ${key}: missing down word`);
        }
      }
    });
  }

  // Validate intersections array if present
  if (puzzle.intersections) {
    puzzle.intersections.forEach((intersection, index) => {
      if (intersection.row < 0 || intersection.row >= puzzle.grid.height) {
        errors.push(`Intersection ${index} has invalid row: ${intersection.row}`);
      }
      if (intersection.col < 0 || intersection.col >= puzzle.grid.width) {
        errors.push(`Intersection ${index} has invalid col: ${intersection.col}`);
      }
    });
  }

  return errors;
}

test.describe('Level Configuration Validation', () => {
  test('should have at least one level configuration', () => {
    expect(LEVEL_CONFIGS.length).toBeGreaterThan(0);
  });

  test('should have valid configuration structure', () => {
    LEVEL_CONFIGS.forEach((config) => {
      expect(config.key).toBeTruthy();
      expect(config.label).toBeTruthy();
      expect(config.levels).toBeDefined();
      expect(Array.isArray(config.levels)).toBe(true);
      expect(config.levels.length).toBeGreaterThan(0);
    });
  });

  // Generate a test for each level configuration group
  for (const config of LEVEL_CONFIGS) {
    test.describe(`${config.label} Configuration`, () => {
      for (const levelDef of config.levels) {
        test(`${levelDef.title} (${levelDef.id}) should be valid`, () => {
          const errors = validateLevelDefinition(levelDef);

          if (errors.length > 0) {
            console.error(`Validation errors for ${levelDef.id}:`);
            errors.forEach((error) => console.error(`  - ${error}`));
          }

          expect(errors).toEqual([]);
        });
      }
    });
  }

  test('should have correct total number of levels', () => {
    const totalLevels = LEVEL_CONFIGS.reduce((sum, config) => sum + config.levels.length, 0);
    console.log(`Total levels configured: ${totalLevels}`);
    expect(totalLevels).toBeGreaterThan(0);
  });

  test('all level IDs should be unique', () => {
    const ids: string[] = [];
    LEVEL_CONFIGS.forEach((config) => {
      config.levels.forEach((level) => {
        ids.push(level.id);
      });
    });

    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  test('all levels should have non-empty titles', () => {
    LEVEL_CONFIGS.forEach((config) => {
      config.levels.forEach((level) => {
        expect(level.title).toBeTruthy();
        expect(level.title.length).toBeGreaterThan(0);
      });
    });
  });

  test('all levels should have descriptions', () => {
    LEVEL_CONFIGS.forEach((config) => {
      config.levels.forEach((level) => {
        expect(level.description).toBeTruthy();
        expect(level.description.length).toBeGreaterThan(0);
      });
    });
  });

  test('all levels should have word counts > 0', () => {
    LEVEL_CONFIGS.forEach((config) => {
      config.levels.forEach((level) => {
        expect(level.puzzle.words.length).toBeGreaterThan(0);
      });
    });
  });

  test('all words should fit within their respective grids', () => {
    LEVEL_CONFIGS.forEach((config) => {
      config.levels.forEach((level) => {
        level.puzzle.words.forEach((word) => {
          const endRow = word.startRow + (word.direction === 'down' ? word.word.length - 1 : 0);
          const endCol = word.startCol + (word.direction === 'across' ? word.word.length - 1 : 0);

          expect(endRow).toBeLessThan(level.puzzle.grid.height);
          expect(endCol).toBeLessThan(level.puzzle.grid.width);
          expect(word.startRow).toBeGreaterThanOrEqual(0);
          expect(word.startCol).toBeGreaterThanOrEqual(0);
        });
      });
    });
  });
});

test.describe('Level Accessibility', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.clearCookies();
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  });

  test('tutorial level should exist and be accessible', async ({ page }) => {
    // Wait for splash to complete
    await page.waitForTimeout(5000);

    // Check for any game screen or word cards (tutorial starts automatically)
    const hasWordCards =
      (await page.locator('.word-card').count()) > 0 ||
      (await page
        .getByRole('heading', { name: /learn/i })
        .isVisible()
        .catch(() => false)) ||
      (await page
        .getByText(/drag.*word|word.*bank/i)
        .isVisible()
        .catch(() => false));

    expect(hasWordCards).toBeTruthy();
  });

  test('app should load successfully', async ({ page }) => {
    // Just verify the app loads without errors
    await page.waitForTimeout(5000);

    // Check that we're not on an error page
    const hasError = await page
      .getByText(/error|404|not found/i)
      .isVisible()
      .catch(() => false);
    expect(hasError).toBe(false);
  });
});

test.describe('Level Passability Summary', () => {
  test('should generate a complete report of all levels', () => {
    console.log('\n=== LEVEL PASSABILITY REPORT ===\n');

    let totalLevels = 0;
    let validLevels = 0;
    let invalidLevels = 0;

    LEVEL_CONFIGS.forEach((config) => {
      console.log(`\n${config.label}:`);
      config.levels.forEach((levelDef) => {
        totalLevels++;
        const errors = validateLevelDefinition(levelDef);

        if (errors.length === 0) {
          validLevels++;
          console.log(
            `  ✓ ${levelDef.title} (${levelDef.id}) - ${levelDef.puzzle.words.length} words`,
          );
        } else {
          invalidLevels++;
          console.log(`  ✗ ${levelDef.title} (${levelDef.id}) - ERRORS:`);
          errors.forEach((error) => console.log(`      - ${error}`));
        }
      });
    });

    console.log(`\n=== SUMMARY ===`);
    console.log(`Total Levels: ${totalLevels}`);
    console.log(`Valid Levels: ${validLevels}`);
    console.log(`Invalid Levels: ${invalidLevels}`);
    console.log(`================\n`);

    expect(invalidLevels).toBe(0);
    expect(validLevels).toBe(totalLevels);
  });
});

test.describe('Level Playthrough (UI)', () => {
  const tutorialLevelDefinition = LEVEL_CONFIGS.find((config) => config.key === 'tutorial')?.levels.find(
    (level) => level.id === 'tutorial',
  );

  test('should allow dragging words onto the board and completing the level', async ({
    page,
    context,
  }) => {
    const tutorialLevel = tutorialLevelDefinition;
    test.skip(!tutorialLevel, 'Tutorial level definition not found');

    const levelUrl = `/#/level/${tutorialLevel!.id}`;

    await context.clearCookies();
    await page.goto(levelUrl);
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });

    try {
      // Wait for splash animation and level setup
      await page.waitForTimeout(5000);
      await page.waitForSelector('[data-cell-key]', { timeout: 15000 });

      const isTouchDevice = await page.evaluate(() => 'ontouchstart' in window);

      for (const word of tutorialLevel!.puzzle.words) {
        const wordButton = page
          .getByRole('button', { name: new RegExp(`word ${word.word}`, 'i') })
          .first();
        await wordButton.scrollIntoViewIfNeeded();
        await expect(wordButton).toBeVisible({ timeout: 5000 });

        const targetCell = page.locator(`[data-cell-key="${word.startRow}-${word.startCol}"]`);
        await expect(targetCell).toBeVisible({ timeout: 5000 });

        if (isTouchDevice) {
          await wordButton.click();
          await targetCell.click();
        } else {
          await wordButton.dragTo(targetCell);
        }

        // Give the app a moment to validate and lock the word
        await page.waitForTimeout(300);
      }

      // After placing all words, the completion modal should appear
      const completionModal = page.getByRole('dialog');
      await expect(completionModal).toBeVisible({ timeout: 5000 });
      await expect(completionModal.getByText(/level complete/i)).toBeVisible();
      await expect(completionModal.getByRole('button', { name: /next/i })).toBeVisible();
    } finally {
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await context.clearCookies();
    }
  });
});
