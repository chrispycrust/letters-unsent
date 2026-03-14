import { test, expect } from '@playwright/test';

const routes = ['/', '/submit', '/about', '/changelog'];

test.describe('Navbar modal overlay on mobile', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 900 });

    await page.route('**/api/supabase', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, letters: [] }),
      });
    });

    await page.route('**/api/guardian**', async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ output: 'Hello from Cove (stub)' }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ output: 'Reply from Cove (stub)' }),
      });
    });
  });

  for (const path of routes) {
    test(`opens modal and keeps it on top at ${path}`, async ({ page }) => {
      await page.goto(path);

      const openButton = page.locator('nav.navbar .button-change-modal').first();
      await expect(openButton).toBeVisible();
      await openButton.click();

      const modal = page.locator('.modal');
      await expect(modal).toBeVisible();
      await expect(modal.locator('a', { hasText: 'Home' })).toBeVisible();

      const zIndex = await modal.evaluate((el) => Number(getComputedStyle(el).zIndex));
      expect(zIndex).toBeGreaterThanOrEqual(999);

      // closing works (ensures overlay receives clicks, not background)
      await modal.locator('button.button-change-modal').click();
      await expect(modal).toBeHidden();
    });
  }
});
