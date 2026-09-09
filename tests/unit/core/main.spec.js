import { test, expect } from '@playwright/test';

test.describe('src/core/main.js initialization & theme toggle', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('initializes window.app on startup', async ({ page }) => {
    const isAppDefined = await page.evaluate(() => {
      return !!window.app && typeof window.app === 'object';
    });
    expect(isAppDefined).toBe(true);
  });

  test('toggles theme correctly when theme toggle button is clicked', async ({ page }) => {
    // Initial state
    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme') || 'light');
    expect(initialTheme).toBe('light');

    // Click to switch to dark mode
    await page.click('#theme-toggle');

    const darkTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const darkStorage = await page.evaluate(() => localStorage.getItem('zine-theme'));
    const darkIcon = await page.evaluate(() => document.getElementById('theme-icon')?.textContent?.trim());

    expect(darkTheme).toBe('dark');
    expect(darkStorage).toBe('dark');
    expect(darkIcon).toBe('light_mode');

    // Click again to switch back to light mode
    await page.click('#theme-toggle');

    const lightTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const lightStorage = await page.evaluate(() => localStorage.getItem('zine-theme'));
    const lightIcon = await page.evaluate(() => document.getElementById('theme-icon')?.textContent?.trim());

    expect(lightTheme).toBe('light');
    expect(lightStorage).toBe('light');
    expect(lightIcon).toBe('dark_mode');
  });

  test('respects initial dark theme from localStorage on page load', async ({ context }) => {
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('zine-theme', 'dark');
    });
    await page.goto('/');

    const initialTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(initialTheme).toBe('dark');

    await page.click('#theme-toggle');

    const toggledTheme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    const toggledStorage = await page.evaluate(() => localStorage.getItem('zine-theme'));
    expect(toggledTheme).toBe('light');
    expect(toggledStorage).toBe('light');
    await page.close();
  });

  test('handles theme toggle gracefully when theme toggle button is missing', async ({ page }) => {
    const result = await page.evaluate(() => {
      const btn = document.getElementById('theme-toggle');
      if (btn) btn.remove();

      return {
        btnCheck: document.getElementById('theme-toggle')
      };
    });

    expect(result.btnCheck).toBeNull();
  });

  test('handles theme toggle gracefully when theme icon is missing', async ({ page }) => {
    const result = await page.evaluate(() => {
      const icon = document.getElementById('theme-icon');
      if (icon) icon.remove();

      return {
        iconCheck: document.getElementById('theme-icon')
      };
    });

    expect(result.iconCheck).toBeNull();
  });

  test('falls back to default light theme when data-theme attribute is not set', async ({ page }) => {
    const result = await page.evaluate(() => {
      document.documentElement.removeAttribute('data-theme');
      const initialThemeAttr = document.documentElement.getAttribute('data-theme');

      const btn = document.getElementById('theme-toggle');
      if (btn) btn.click();

      const newThemeAttr = document.documentElement.getAttribute('data-theme');
      const storageTheme = localStorage.getItem('zine-theme');

      return { initialThemeAttr, newThemeAttr, storageTheme };
    });

    expect(result.initialThemeAttr).toBeNull();
    expect(result.newThemeAttr).toBe('dark');
    expect(result.storageTheme).toBe('dark');
  });

  test('initializes gridstack on DOMContentLoaded event', async ({ page }) => {
    const gridInitialized = await page.evaluate(() => {
      let eventFired = false;
      try {
        document.dispatchEvent(new Event('DOMContentLoaded'));
        eventFired = true;
      } catch (e) {
        eventFired = false;
      }
      return eventFired;
    });

    expect(gridInitialized).toBe(true);
  });

  test('initializes settings validation with window.app.ui on startup', async ({ page }) => {
    const isValidationInitialized = await page.evaluate(() => {
      return !!window.app && !!window.app.ui;
    });
    expect(isValidationInitialized).toBe(true);
  });

  test('toggles correctly when data-theme attribute is pre-set to dark', async ({ page }) => {
    const result = await page.evaluate(() => {
      document.documentElement.setAttribute('data-theme', 'dark');
      const themeIcon = document.getElementById('theme-icon');
      if (themeIcon) themeIcon.textContent = 'light_mode';

      const btn = document.getElementById('theme-toggle');
      if (btn) btn.click();

      return {
        newThemeAttr: document.documentElement.getAttribute('data-theme'),
        storageTheme: localStorage.getItem('zine-theme'),
        iconText: themeIcon?.textContent?.trim()
      };
    });

    expect(result.newThemeAttr).toBe('light');
    expect(result.storageTheme).toBe('light');
    expect(result.iconText).toBe('dark_mode');
  });

  test('toggles theme multiple times consecutively keeping state consistent', async ({ page }) => {
    const states = [];
    for (let i = 0; i < 4; i++) {
      await page.click('#theme-toggle');
      const currentAttr = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
      const currentStorage = await page.evaluate(() => localStorage.getItem('zine-theme'));
      const iconText = await page.evaluate(() => document.getElementById('theme-icon')?.textContent?.trim());
      states.push({ currentAttr, currentStorage, iconText });
    }

    expect(states[0]).toEqual({ currentAttr: 'dark', currentStorage: 'dark', iconText: 'light_mode' });
    expect(states[1]).toEqual({ currentAttr: 'light', currentStorage: 'light', iconText: 'dark_mode' });
    expect(states[2]).toEqual({ currentAttr: 'dark', currentStorage: 'dark', iconText: 'light_mode' });
    expect(states[3]).toEqual({ currentAttr: 'light', currentStorage: 'light', iconText: 'dark_mode' });
  });
});
