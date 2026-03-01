import { test, expect } from '@playwright/test';

test('home page loads and navigation is visible', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/Letters Unsent/);
  await expect(page.getByRole('link', { name: 'Letters Unsent' })).toBeVisible();

  const aboutLink = page.getByRole('link', { name: 'About & Contact' });
  if (await aboutLink.count()) {
    await expect(aboutLink).toBeVisible();
  }
});
