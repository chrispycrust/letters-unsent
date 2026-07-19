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

  test('lays out the mobile conversation in a reduced viewport', async ({ page }) => {
    const firstMessage = 'What are the words you have been carrying?';
    const longReply = Array.from(
      { length: 30 },
      (_, index) => `Line ${index + 1}: You can take this one thought at a time.`,
    ).join('\n');

    await page.setViewportSize({ width: 390, height: 664 });
    await page.route('**/api/guardian**', async (route) => {
      const request = route.request();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          output: request.method() === 'GET' ? firstMessage : longReply,
        }),
      });
    });

    await page.goto('/submit');
    await page.getByRole('button', { name: 'Start conversation' }).click();
    await expect(page.getByText(firstMessage)).toBeVisible();
    await expect(page.locator('html')).toHaveClass(/conversation-viewport-active/);

    const textarea = page.getByPlaceholder('Write something');
    expect(await textarea.evaluate((element) => document.activeElement === element)).toBe(false);

    await textarea.focus();
    await expect(page.locator('.conversation-shell')).toHaveClass(/is-composing/);
    await page.setViewportSize({ width: 390, height: 345 });

    const readFocusedMetrics = () => page.evaluate(() => {
      const stage = document.querySelector('main');
      const navbar = document.querySelector('.navbar');
      const shell = document.querySelector('.conversation-shell');
      const guardian = document.querySelector('.guardian-panel');
      const message = document.querySelector('.preserve-breaks');
      const composer = document.querySelector('.visitor-input-container');
      const sendButton = document.querySelector('.submit-button');
      const expandButton = document.querySelector('.button-change-textarea');

      if (
        !stage ||
        !navbar ||
        !shell ||
        !guardian ||
        !message ||
        !composer ||
        !sendButton ||
        !expandButton
      ) {
        return null;
      }

      const stageRect = stage.getBoundingClientRect();
      const navbarRect = navbar.getBoundingClientRect();
      const shellRect = shell.getBoundingClientRect();
      const guardianRect = guardian.getBoundingClientRect();
      const messageRect = message.getBoundingClientRect();
      const composerRect = composer.getBoundingClientRect();
      const sendRect = sendButton.getBoundingClientRect();
      const visualViewport = window.visualViewport;
      const visibleTop = visualViewport?.offsetTop ?? 0;
      const visibleBottom = visualViewport
        ? visualViewport.offsetTop + visualViewport.height
        : window.innerHeight;

      return {
        stageTopDelta: Math.abs(stageRect.top - visibleTop),
        stageBottomDelta: Math.abs(stageRect.bottom - visibleBottom),
        navbarShellGap: Math.abs(navbarRect.bottom - shellRect.top),
        shellBottomDelta: Math.abs(shellRect.bottom - visibleBottom),
        shellTransform: getComputedStyle(shell).transform,
        messageComposerOverlap: Math.max(0, messageRect.bottom - composerRect.top),
        messageCenterDelta: Math.abs(
          (messageRect.top + messageRect.bottom) / 2 -
          (guardianRect.top + guardianRect.bottom) / 2,
        ),
        composerHeight: composerRect.height,
        sendWidth: sendRect.width,
        sendHeight: sendRect.height,
        expandDisplay: getComputedStyle(expandButton).display,
      };
    });

    await expect.poll(async () => {
      const metrics = await readFocusedMetrics();
      return metrics?.stageBottomDelta ?? Number.POSITIVE_INFINITY;
    }).toBeLessThanOrEqual(2);
    const focusedMetrics = await readFocusedMetrics();

    expect(focusedMetrics?.stageTopDelta).toBeLessThanOrEqual(2);
    expect(focusedMetrics?.stageBottomDelta).toBeLessThanOrEqual(2);
    expect(focusedMetrics?.navbarShellGap).toBeLessThanOrEqual(2);
    expect(focusedMetrics?.shellBottomDelta).toBeLessThanOrEqual(2);
    expect(focusedMetrics?.shellTransform).toBe('none');
    expect(focusedMetrics?.messageComposerOverlap).toBe(0);
    expect(focusedMetrics?.messageCenterDelta).toBeLessThanOrEqual(4);
    expect(focusedMetrics?.composerHeight).toBeLessThanOrEqual(90);
    expect(focusedMetrics?.sendWidth).toBeGreaterThanOrEqual(44);
    expect(focusedMetrics?.sendHeight).toBeGreaterThanOrEqual(44);
    expect(focusedMetrics?.expandDisplay).toBe('none');

    await textarea.fill('I am ready to continue.');
    await page.getByRole('button', { name: /submit a response/i }).click();
    await expect(page.locator('.preserve-breaks')).toContainText('Line 30:');
    expect(await textarea.evaluate((element) => document.activeElement === element)).toBe(false);
    await expect(page.locator('.conversation-shell')).not.toHaveClass(/is-composing/);

    await textarea.focus();
    await expect.poll(async () => page.locator('.guardian-panel').evaluate((guardian) => {
      const message = guardian.querySelector('.preserve-breaks');

      if (!message) {
        return false;
      }

      return guardian.scrollHeight > guardian.clientHeight &&
        guardian.scrollTop === 0 &&
        message.getBoundingClientRect().top >= guardian.getBoundingClientRect().top - 1;
    })).toBe(true);
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
