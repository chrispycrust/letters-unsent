import { test, expect } from '@playwright/test';

type GuardianPostPayload = {
  updatedConversation?: Array<{
    content?: string;
  }>;
};

test.describe('Submit page (mocked Guardian)', () => {
  test('renders initial Guardian greeting and sends visitor reply', async ({ page }) => {
    const firstMessage = "Welcome. I'm Cove (mock)";
    const followupMessage = 'Thanks. I can help (mock).';
    let postPayload: GuardianPostPayload | null = null;

    await page.route('**/api/guardian**', async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ output: firstMessage }),
        });
        return;
      }

      postPayload = request.postDataJSON() as GuardianPostPayload;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ output: followupMessage }),
      });
    });

    await page.goto('/submit');

    await page.getByRole('button', { name: 'Start conversation' }).click();

    await expect(page.getByText(firstMessage)).toBeVisible();

    const textarea = page.getByPlaceholder('Write something');
    await textarea.fill('I need to say goodbye.');

    await page.getByRole('button', { name: /submit a response/i }).click();

    await expect(page.getByText(followupMessage)).toBeVisible();

    await expect.poll(() => postPayload?.updatedConversation?.at(-1)?.content).toBe(
      'I need to say goodbye.',
    );

    expect(await page.evaluate(() => localStorage.getItem('visitCount'))).toBe('1');
    expect(await page.evaluate(() => localStorage.getItem('letterDraft'))).toBe('hey you');
  });

  test('shows error banner when Guardian GET fails', async ({ page }) => {
    const errorMessage = 'Guardian is unavailable';

    await page.route('**/api/guardian**', async (route) => {
      const request = route.request();

      if (request.method() === 'GET') {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: errorMessage }),
        });
        return;
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ output: 'noop' }),
      });
    });

    await page.goto('/submit');

    await page.getByRole('button', { name: 'Start conversation' }).click();

    await expect(page.getByText(`Server error: ${errorMessage}`)).toBeVisible();
  });
});
