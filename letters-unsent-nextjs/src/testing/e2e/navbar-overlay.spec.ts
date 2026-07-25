import { test, expect } from '@playwright/test';

const routes = ['/', '/submit', '/about', '/changelog'];
const currentLinkNames: Record<string, string> = {
  '/': 'Home',
  '/submit': 'Release A Letter',
  '/about': 'About & Contact',
  '/changelog': 'v1.1',
};

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

      const openButton = page.getByRole('button', { name: 'Open menu' });
      await expect(openButton).toBeVisible();
      await openButton.click();

      const modal = page.getByRole('dialog', { name: 'Navigation menu' });
      await expect(modal).toBeVisible();
      await expect(modal.locator('a', { hasText: 'Home' })).toBeVisible();

      const currentLink = modal.getByRole('link', {
        name: currentLinkNames[path],
      });
      await expect(currentLink).toHaveAttribute('aria-current', 'page');
      await expect(modal.locator('a[aria-current="page"]')).toHaveCount(1);
      await expect(currentLink).toHaveCSS('text-decoration-line', 'underline');

      const zIndex = await modal.evaluate((el) => Number(getComputedStyle(el).zIndex));
      expect(zIndex).toBeGreaterThanOrEqual(999);

      const modalBounds = await modal.boundingBox();
      expect(modalBounds).toEqual({
        x: 0,
        y: 0,
        width: 400,
        height: 900,
      });

      // closing works (ensures overlay receives clicks, not background)
      await modal.getByRole('button', { name: 'Close menu' }).click();
      await expect(modal).toBeHidden();
    });
  }

  test('contains keyboard focus and restores it after Escape', async ({ page }) => {
    await page.goto('/about');

    const openButton = page.getByRole('button', { name: 'Open menu' });
    await openButton.focus();
    await openButton.press('Enter');

    const modal = page.getByRole('dialog', { name: 'Navigation menu' });
    const closeButton = modal.getByRole('button', { name: 'Close menu' });
    const lastLink = modal.locator('a[href]').last();
    const backgroundLink = page.locator('nav.navbar > a').first();

    await expect(modal).toBeVisible();
    await expect(closeButton).toBeFocused();

    await lastLink.focus();
    await page.keyboard.press('Tab');
    await expect(closeButton).toBeFocused();

    await closeButton.focus();
    await page.keyboard.press('Shift+Tab');
    await expect(lastLink).toBeFocused();

    await backgroundLink.evaluate((element) => {
      (element as HTMLElement).focus();
    });
    await expect(backgroundLink).not.toBeFocused();

    await page.keyboard.press('Escape');
    await expect(modal).toBeHidden();
    await expect(openButton).toBeFocused();
  });
});
