import { test, expect, type Page } from '@playwright/test';

type GuardianPostPayload = {
  updatedConversation?: Array<{
    content?: string;
  }>;
};

async function dispatchSyntheticTouchGesture(
  page: Page,
  selector: string,
  movement: { x: number; y: number },
) {
  return page.evaluate(({ selector, movement }) => {
    const target = document.querySelector(selector);

    if (!target) {
      throw new Error(`Could not find touch target: ${selector}`);
    }

    const createTouch = (clientX: number, clientY: number) => ({
      identifier: 1,
      clientX,
      clientY,
    });
    const dispatch = (
      type: 'touchstart' | 'touchmove' | 'touchend',
      touches: Array<ReturnType<typeof createTouch>>,
      changedTouches = touches,
    ) => {
      const event = new Event(type, {
        bubbles: true,
        cancelable: true,
      });

      Object.defineProperties(event, {
        touches: { value: touches },
        targetTouches: { value: touches },
        changedTouches: { value: changedTouches },
      });

      target.dispatchEvent(event);
      return event.defaultPrevented;
    };

    const startTouch = createTouch(100, 100);
    const startPrevented = dispatch('touchstart', [startTouch]);
    const movePrevented = dispatch(
      'touchmove',
      [createTouch(100 + movement.x, 100 + movement.y)],
    );
    dispatch('touchend', [], [startTouch]);

    return { startPrevented, movePrevented };
  }, { selector, movement });
}

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

    await page.getByRole('button', { name: 'Send message' }).click();

    await expect(page.getByText(followupMessage)).toBeVisible();

    await expect.poll(() => postPayload?.updatedConversation?.at(-1)?.content).toBe(
      'I need to say goodbye.',
    );

    expect(await page.evaluate(() => localStorage.getItem('visitCount'))).toBe('1');
    expect(await page.evaluate(() => localStorage.getItem('letterDraft'))).toBe('hey you');
  });

  test('supports keyboard selection and visible focus in protected release choices', async ({ page }) => {
    await page.route('**/api/guardian**', async (route) => {
      const isInitialGreeting = route.request().method() === 'GET';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(
          isInitialGreeting
            ? { output: 'Welcome.' }
            : {
                output: 'Your letter is ready.',
                releaseReady: true,
                letterPayload: {
                  content: 'A letter body',
                  intended_recipient: 'Sam',
                  author_name: 'Casey',
                  relationship_type: 'friend',
                  emotional_tone: 'reflective',
                },
              },
        ),
      });
    });

    await page.goto('/submit');
    await page.getByRole('button', { name: 'Start conversation' }).click();
    await page.getByPlaceholder('Write something').fill('Please prepare my letter.');
    await page.getByRole('button', { name: 'Send message' }).click();

    const releaseChoiceHeading = page.getByRole('heading', {
      name: 'Keep a way back to your letter',
    });

    await expect(releaseChoiceHeading).toBeFocused();
    await expect(releaseChoiceHeading).toHaveCSS('outline-style', 'none');

    await page.getByRole('button', { name: 'Protect this letter' }).click();

    await expect(page.getByRole('heading', { name: 'Protect your letter' })).toBeFocused();
    await page.keyboard.press('Tab');

    const customRadio = page.getByRole('radio', { name: 'Write my own' });
    const generatedRadio = page.getByRole('radio', { name: 'Create one for me' });

    await expect(customRadio).toBeFocused();
    await expect(customRadio).toBeChecked();
    await expect(customRadio).toHaveCSS('outline-style', 'solid');
    await expect(customRadio).toHaveCSS('outline-width', '2px');
    await expect(customRadio).toHaveCSS('outline-offset', '2px');

    await page.keyboard.press('ArrowDown');
    await expect(generatedRadio).toBeFocused();
    await expect(generatedRadio).toBeChecked();
    await expect(generatedRadio).toHaveCSS('outline-style', 'solid');

    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Keep your token somewhere safe' })).toBeFocused();
    await page.keyboard.press('Tab');

    const deviceCheckbox = page.getByRole('checkbox', { name: 'Save it on this device' });
    const manualCheckbox = page.getByRole('checkbox', { name: 'Copy it yourself' });

    await expect(deviceCheckbox).toBeFocused();
    await expect(deviceCheckbox).toHaveCSS('outline-style', 'solid');
    await expect(deviceCheckbox).toHaveCSS('outline-width', '2px');
    await expect(deviceCheckbox).toHaveCSS('outline-offset', '2px');

    await page.keyboard.press('Space');
    await expect(deviceCheckbox).toBeChecked();
    await page.keyboard.press('Tab');
    await expect(manualCheckbox).toBeFocused();
    await expect(manualCheckbox).toHaveCSS('outline-style', 'solid');
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
      const inputArea = document.querySelector('.visitor-input-area');
      const sendButton = document.querySelector('.submit-button');
      const expandButton = document.querySelector('.button-change-textarea');

      if (
        !stage ||
        !navbar ||
        !shell ||
        !guardian ||
        !message ||
        !composer ||
        !inputArea ||
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
      const inputAreaRect = inputArea.getBoundingClientRect();
      const sendRect = sendButton.getBoundingClientRect();
      const expandRect = expandButton.getBoundingClientRect();
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
        expandWidth: expandRect.width,
        expandHeight: expandRect.height,
        expandTopDelta: Math.abs(expandRect.top - inputAreaRect.top),
        sendBottomDelta: Math.abs(sendRect.bottom - inputAreaRect.bottom),
        controlGap: sendRect.top - expandRect.bottom,
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
    expect(focusedMetrics?.composerHeight).toBeLessThanOrEqual(130);
    expect(focusedMetrics?.sendWidth).toBeGreaterThanOrEqual(44);
    expect(focusedMetrics?.sendHeight).toBeGreaterThanOrEqual(44);
    expect(focusedMetrics?.expandWidth).toBeGreaterThanOrEqual(44);
    expect(focusedMetrics?.expandHeight).toBeGreaterThanOrEqual(44);
    expect(focusedMetrics?.expandTopDelta).toBeLessThanOrEqual(1);
    expect(focusedMetrics?.sendBottomDelta).toBeLessThanOrEqual(1);
    expect(focusedMetrics?.controlGap).toBeGreaterThanOrEqual(8);
    expect(focusedMetrics?.expandDisplay).not.toBe('none');

    await textarea.fill(longReply);
    const compactEditorState = await textarea.evaluate((element) => {
      const textareaElement = element as HTMLTextAreaElement;
      textareaElement.dataset.editorIdentity = 'preserved-textarea';
      textareaElement.setSelectionRange(17, 17, 'none');
      textareaElement.scrollTop = 100;

      return {
        selectionStart: textareaElement.selectionStart,
        selectionEnd: textareaElement.selectionEnd,
        scrollTop: textareaElement.scrollTop,
        clientHeight: textareaElement.clientHeight,
        scrollHeight: textareaElement.scrollHeight,
        maximumHeight: Number.parseFloat(getComputedStyle(textareaElement).maxHeight),
        overflowY: getComputedStyle(textareaElement).overflowY,
      };
    });

    expect(compactEditorState.clientHeight)
      .toBeLessThanOrEqual(compactEditorState.maximumHeight + 1);
    expect(compactEditorState.scrollHeight).toBeGreaterThan(compactEditorState.clientHeight);
    expect(compactEditorState.overflowY).toBe('auto');

    await page.getByRole('button', { name: 'Expand writing area' }).click();
    await expect(page.locator('.conversation-shell')).toHaveClass(/is-editor-expanded/);
    await expect(page.locator('.guardian-panel-container')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.guardian-panel-container')).toHaveCSS('visibility', 'hidden');
    await expect(page.getByRole('button', { name: 'Minimise writing area' }))
      .toHaveAttribute('aria-expanded', 'true');

    const expandedMetrics = await page.evaluate(() => {
      const shell = document.querySelector('.conversation-shell');
      const composer = document.querySelector('.visitor-input-container');
      const inputArea = document.querySelector('.visitor-input-area');
      const textareaElement = document.querySelector<HTMLTextAreaElement>('#VisitorInput');
      const minimiseButton = document.querySelector('.button-change-textarea');
      const sendButton = document.querySelector('.submit-button');

      if (
        !shell ||
        !composer ||
        !inputArea ||
        !textareaElement ||
        !minimiseButton ||
        !sendButton
      ) {
        return null;
      }

      const shellRect = shell.getBoundingClientRect();
      const composerRect = composer.getBoundingClientRect();
      const inputAreaRect = inputArea.getBoundingClientRect();
      const minimiseRect = minimiseButton.getBoundingClientRect();
      const sendRect = sendButton.getBoundingClientRect();

      return {
        topDelta: Math.abs(composerRect.top - shellRect.top),
        bottomDelta: Math.abs(composerRect.bottom - shellRect.bottom),
        minimiseTopDelta: Math.abs(minimiseRect.top - inputAreaRect.top),
        sendBottomDelta: Math.abs(sendRect.bottom - inputAreaRect.bottom),
        controlGap: sendRect.top - minimiseRect.bottom,
        activeTextarea: document.activeElement === textareaElement,
        editorIdentity: textareaElement.dataset.editorIdentity,
        selectionStart: textareaElement.selectionStart,
        selectionEnd: textareaElement.selectionEnd,
        scrollTop: textareaElement.scrollTop,
      };
    });

    expect(expandedMetrics?.topDelta).toBeLessThanOrEqual(1);
    expect(expandedMetrics?.bottomDelta).toBeLessThanOrEqual(1);
    expect(expandedMetrics?.minimiseTopDelta).toBeLessThanOrEqual(1);
    expect(expandedMetrics?.sendBottomDelta).toBeLessThanOrEqual(1);
    expect(expandedMetrics?.controlGap).toBeGreaterThanOrEqual(8);
    expect(expandedMetrics?.activeTextarea).toBe(true);
    expect(expandedMetrics?.editorIdentity).toBe('preserved-textarea');
    expect(expandedMetrics?.selectionStart).toBe(compactEditorState.selectionStart);
    expect(expandedMetrics?.selectionEnd).toBe(compactEditorState.selectionEnd);
    expect(expandedMetrics?.scrollTop).toBe(compactEditorState.scrollTop);

    await page.getByRole('button', { name: 'Minimise writing area' }).click();
    await expect(page.locator('.conversation-shell')).not.toHaveClass(/is-editor-expanded/);
    await expect(page.locator('.guardian-panel-container')).not.toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.guardian-panel-container')).toHaveCSS('visibility', 'visible');
    await expect(page.getByRole('button', { name: 'Expand writing area' }))
      .toHaveAttribute('aria-expanded', 'false');

    const restoredEditorState = await textarea.evaluate((element) => {
      const textareaElement = element as HTMLTextAreaElement;

      return {
        activeTextarea: document.activeElement === textareaElement,
        editorIdentity: textareaElement.dataset.editorIdentity,
        selectionStart: textareaElement.selectionStart,
        selectionEnd: textareaElement.selectionEnd,
        scrollTop: textareaElement.scrollTop,
      };
    });

    expect(restoredEditorState.activeTextarea).toBe(true);
    expect(restoredEditorState.editorIdentity).toBe('preserved-textarea');
    expect(restoredEditorState.selectionStart).toBe(compactEditorState.selectionStart);
    expect(restoredEditorState.selectionEnd).toBe(compactEditorState.selectionEnd);
    expect(restoredEditorState.scrollTop).toBe(compactEditorState.scrollTop);

    const draftThatFitsExpandedMode = Array.from(
      { length: 6 },
      (_, index) => `Short expanded line ${index + 1}.`,
    ).join('\n');
    await textarea.fill(draftThatFitsExpandedMode);
    const compactScrollBeforeSecondExpansion = await textarea.evaluate((element) => {
      const textareaElement = element as HTMLTextAreaElement;
      textareaElement.setSelectionRange(textareaElement.value.length, textareaElement.value.length);
      textareaElement.scrollTop = textareaElement.scrollHeight;
      return textareaElement.scrollTop;
    });
    expect(compactScrollBeforeSecondExpansion).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Expand writing area' }).click();
    const fittedExpandedState = await textarea.evaluate((element) => {
      const textareaElement = element as HTMLTextAreaElement;
      return {
        clientHeight: textareaElement.clientHeight,
        scrollHeight: textareaElement.scrollHeight,
        scrollTop: textareaElement.scrollTop,
      };
    });
    expect(fittedExpandedState.scrollHeight).toBeLessThanOrEqual(fittedExpandedState.clientHeight);
    expect(fittedExpandedState.scrollTop).toBe(0);

    await page.getByRole('button', { name: 'Minimise writing area' }).click();
    expect(await textarea.evaluate((element) => element.scrollTop))
      .toBe(compactScrollBeforeSecondExpansion);

    await page.getByRole('button', { name: 'Expand writing area' }).click();
    await textarea.evaluate((element) => {
      const textareaElement = element as HTMLTextAreaElement;
      textareaElement.setSelectionRange(0, 0, 'none');
      textareaElement.scrollTop = 0;
    });
    await page.getByRole('button', { name: 'Minimise writing area' }).click();

    const movedCaretState = await textarea.evaluate((element) => {
      const textareaElement = element as HTMLTextAreaElement;
      return {
        selectionStart: textareaElement.selectionStart,
        selectionEnd: textareaElement.selectionEnd,
        scrollTop: textareaElement.scrollTop,
      };
    });
    expect(movedCaretState.selectionStart).toBe(0);
    expect(movedCaretState.selectionEnd).toBe(0);
    expect(movedCaretState.scrollTop).toBe(0);

    await textarea.fill('I am ready to continue.');
    await page.getByRole('button', { name: 'Send message' }).click();
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

  test('contains mobile dragging at Guardian and textarea scroll boundaries', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 664 });
    await page.route('**/api/guardian**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ output: 'A scrollable conversation.' }),
      });
    });

    await page.goto('/submit');
    await page.getByRole('button', { name: 'Start conversation' }).click();
    await expect(page.locator('html')).toHaveClass(/conversation-viewport-active/);

    const scrollAreaStyles = await page.evaluate(() => {
      const guardian = document.querySelector('.guardian-panel');
      const textarea = document.querySelector('#VisitorInput');

      if (!guardian || !textarea) {
        return null;
      }

      const guardianStyle = getComputedStyle(guardian);
      const textareaStyle = getComputedStyle(textarea);

      return {
        guardianOverscroll: guardianStyle.overscrollBehaviorY,
        guardianTouchAction: guardianStyle.touchAction,
        textareaOverscroll: textareaStyle.overscrollBehaviorY,
        textareaTouchAction: textareaStyle.touchAction,
      };
    });

    expect(scrollAreaStyles?.guardianOverscroll).toBe('contain');
    expect(scrollAreaStyles?.guardianTouchAction).toContain('pan-y');
    expect(scrollAreaStyles?.textareaOverscroll).toBe('contain');
    expect(scrollAreaStyles?.textareaTouchAction).toContain('pan-y');

    const backgroundVertical = await dispatchSyntheticTouchGesture(
      page,
      '.conversation-shell',
      { x: 2, y: 40 },
    );
    const backgroundHorizontal = await dispatchSyntheticTouchGesture(
      page,
      '.conversation-shell',
      { x: 40, y: 2 },
    );
    await expect.poll(() => page.locator('.guardian-panel').evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    )).toBeLessThanOrEqual(1);
    await expect.poll(() => page.locator('#VisitorInput').evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    )).toBeLessThanOrEqual(1);

    const fittedGuardianVertical = await dispatchSyntheticTouchGesture(
      page,
      '.guardian-panel',
      { x: 2, y: 40 },
    );
    const fittedTextareaVertical = await dispatchSyntheticTouchGesture(
      page,
      '#VisitorInput',
      { x: 2, y: 40 },
    );

    expect(backgroundVertical.startPrevented).toBe(false);
    expect(backgroundVertical.movePrevented).toBe(true);
    expect(backgroundHorizontal.movePrevented).toBe(false);
    expect(fittedGuardianVertical.movePrevented).toBe(true);
    expect(fittedTextareaVertical.movePrevented).toBe(true);

    await page.locator('.guardian-panel').evaluate((element) => {
      const guardian = element as HTMLElement;
      const content = guardian.firstElementChild as HTMLElement | null;

      if (!content) {
        throw new Error('Guardian content was not available');
      }

      content.style.minHeight = `${guardian.clientHeight + 200}px`;
      guardian.scrollTop = 0;
    });
    await expect.poll(() => page.locator('.guardian-panel').evaluate(
      (element) => element.scrollHeight > element.clientHeight + 1,
    )).toBe(true);

    const guardianCanScrollDown = await dispatchSyntheticTouchGesture(
      page,
      '.guardian-panel',
      { x: 2, y: -40 },
    );
    const guardianCannotScrollAboveTop = await dispatchSyntheticTouchGesture(
      page,
      '.guardian-panel',
      { x: 2, y: 40 },
    );

    expect(guardianCanScrollDown.movePrevented).toBe(false);
    expect(guardianCannotScrollAboveTop.movePrevented).toBe(true);

    await page.locator('.guardian-panel').evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    const guardianCannotScrollBelowBottom =
      await dispatchSyntheticTouchGesture(
        page,
        '.guardian-panel',
        { x: 2, y: -40 },
      );
    const guardianCanScrollUp = await dispatchSyntheticTouchGesture(
      page,
      '.guardian-panel',
      { x: 2, y: 40 },
    );

    expect(guardianCannotScrollBelowBottom.movePrevented).toBe(true);
    expect(guardianCanScrollUp.movePrevented).toBe(false);

    const textarea = page.locator('#VisitorInput');
    const longDraft = Array.from(
      { length: 60 },
      (_, index) => `Scrollable visitor line ${index + 1}.`,
    ).join('\n');

    await textarea.fill(longDraft);
    await expect.poll(() => textarea.evaluate(
      (element) => element.scrollHeight > element.clientHeight + 1,
    )).toBe(true);
    await textarea.evaluate((element) => {
      element.scrollTop = 0;
    });
    expect(await textarea.evaluate(
      (element) => document.activeElement === element,
    )).toBe(true);

    const textareaCanScrollDown = await dispatchSyntheticTouchGesture(
      page,
      '#VisitorInput',
      { x: 2, y: -40 },
    );
    const textareaCannotScrollAboveTop = await dispatchSyntheticTouchGesture(
      page,
      '#VisitorInput',
      { x: 2, y: 40 },
    );

    expect(textareaCanScrollDown.movePrevented).toBe(false);
    expect(textareaCannotScrollAboveTop.movePrevented).toBe(true);

    await textarea.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    const textareaCannotScrollBelowBottom =
      await dispatchSyntheticTouchGesture(
        page,
        '#VisitorInput',
        { x: 2, y: -40 },
      );
    const textareaCanScrollUp = await dispatchSyntheticTouchGesture(
      page,
      '#VisitorInput',
      { x: 2, y: 40 },
    );

    expect(textareaCannotScrollBelowBottom.movePrevented).toBe(true);
    expect(textareaCanScrollUp.movePrevented).toBe(false);

    await page.getByRole('button', { name: 'Expand writing area' }).click();
    await textarea.fill('A short expanded draft.');
    await expect.poll(() => textarea.evaluate(
      (element) => element.scrollHeight - element.clientHeight,
    )).toBeLessThanOrEqual(1);

    const expandedBackgroundVertical = await dispatchSyntheticTouchGesture(
      page,
      '.visitor-input-container.is-expanded',
      { x: 2, y: 40 },
    );
    const expandedTextareaVertical = await dispatchSyntheticTouchGesture(
      page,
      '#VisitorInput',
      { x: 2, y: 40 },
    );

    expect(expandedBackgroundVertical.movePrevented).toBe(true);
    expect(expandedTextareaVertical.movePrevented).toBe(true);

    await page.setViewportSize({ width: 1024, height: 800 });
    const desktopViewportState = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      matchesMobileConversation: window.matchMedia(
        '(max-width: 650px), (pointer: coarse) and (max-height: 650px)',
      ).matches,
    }));
    expect(desktopViewportState).toEqual({
      innerWidth: 1024,
      innerHeight: 800,
      matchesMobileConversation: false,
    });

    const desktopBackgroundVertical = await dispatchSyntheticTouchGesture(
      page,
      '.conversation-shell',
      { x: 2, y: 40 },
    );
    expect(desktopBackgroundVertical.movePrevented).toBe(false);
  });

  test('anchors the desktop editor controls and expands over the Guardian', async ({ page }) => {
    const firstMessage = 'There is room for whatever you need to write.';
    const draft = 'This draft should remain intact while I make more room to write.';

    await page.setViewportSize({ width: 1024, height: 800 });
    await page.route('**/api/guardian**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ output: firstMessage }),
      });
    });

    await page.goto('/submit');
    await page.getByRole('button', { name: 'Start conversation' }).click();
    await expect(page.getByText(firstMessage)).toBeVisible();

    const textarea = page.getByPlaceholder('Write something');
    await textarea.fill(draft);
    await textarea.evaluate((element) => {
      const textareaElement = element as HTMLTextAreaElement;
      textareaElement.dataset.editorIdentity = 'desktop-preserved-textarea';
      textareaElement.setSelectionRange(12, 12, 'none');
    });

    const readControlMetrics = () => page.evaluate(() => {
      const inputArea = document.querySelector('.visitor-input-area');
      const resizeButton = document.querySelector('.button-change-textarea');
      const sendButton = document.querySelector('.submit-button');
      const textareaElement = document.querySelector<HTMLTextAreaElement>('#VisitorInput');

      if (!inputArea || !resizeButton || !sendButton || !textareaElement) {
        return null;
      }

      const inputAreaRect = inputArea.getBoundingClientRect();
      const resizeRect = resizeButton.getBoundingClientRect();
      const sendRect = sendButton.getBoundingClientRect();

      return {
        resizeWidth: resizeRect.width,
        resizeHeight: resizeRect.height,
        sendWidth: sendRect.width,
        sendHeight: sendRect.height,
        resizeTopDelta: Math.abs(resizeRect.top - inputAreaRect.top),
        sendBottomDelta: Math.abs(sendRect.bottom - inputAreaRect.bottom),
        controlGap: sendRect.top - resizeRect.bottom,
        textareaResize: getComputedStyle(textareaElement).resize,
      };
    });

    const compactMetrics = await readControlMetrics();
    expect(compactMetrics?.resizeWidth).toBeGreaterThanOrEqual(44);
    expect(compactMetrics?.resizeHeight).toBeGreaterThanOrEqual(44);
    expect(compactMetrics?.sendWidth).toBeGreaterThanOrEqual(44);
    expect(compactMetrics?.sendHeight).toBeGreaterThanOrEqual(44);
    expect(compactMetrics?.resizeTopDelta).toBeLessThanOrEqual(1);
    expect(compactMetrics?.sendBottomDelta).toBeLessThanOrEqual(1);
    expect(compactMetrics?.controlGap).toBeGreaterThanOrEqual(8);
    expect(compactMetrics?.textareaResize).toBe('vertical');

    await page.getByRole('button', { name: 'Expand writing area' }).click();
    await expect(page.locator('.conversation-shell')).toHaveClass(/is-editor-expanded/);
    await expect(page.locator('.guardian-panel-container')).toHaveAttribute('aria-hidden', 'true');
    await expect(page.locator('.guardian-panel-container')).toHaveCSS('visibility', 'hidden');

    const expandedMetrics = await page.evaluate(() => {
      const shell = document.querySelector('.conversation-shell');
      const composer = document.querySelector('.visitor-input-container');
      const textareaElement = document.querySelector<HTMLTextAreaElement>('#VisitorInput');

      if (!shell || !composer || !textareaElement) {
        return null;
      }

      const shellRect = shell.getBoundingClientRect();
      const composerRect = composer.getBoundingClientRect();

      return {
        topDelta: Math.abs(composerRect.top - shellRect.top),
        bottomDelta: Math.abs(composerRect.bottom - shellRect.bottom),
        activeTextarea: document.activeElement === textareaElement,
        value: textareaElement.value,
        editorIdentity: textareaElement.dataset.editorIdentity,
        selectionStart: textareaElement.selectionStart,
        resize: getComputedStyle(textareaElement).resize,
      };
    });

    expect(expandedMetrics?.topDelta).toBeLessThanOrEqual(1);
    expect(expandedMetrics?.bottomDelta).toBeLessThanOrEqual(1);
    expect(expandedMetrics?.activeTextarea).toBe(true);
    expect(expandedMetrics?.value).toBe(draft);
    expect(expandedMetrics?.editorIdentity).toBe('desktop-preserved-textarea');
    expect(expandedMetrics?.selectionStart).toBe(12);
    expect(expandedMetrics?.resize).toBe('none');

    const expandedControlMetrics = await readControlMetrics();
    expect(expandedControlMetrics?.resizeTopDelta).toBeLessThanOrEqual(1);
    expect(expandedControlMetrics?.sendBottomDelta).toBeLessThanOrEqual(1);
    expect(expandedControlMetrics?.controlGap).toBeGreaterThanOrEqual(8);

    await page.getByRole('button', { name: 'Minimise writing area' }).click();
    await expect(page.locator('.conversation-shell')).not.toHaveClass(/is-editor-expanded/);
    await expect(page.locator('.guardian-panel-container')).toHaveCSS('visibility', 'visible');
    await expect(textarea).toHaveValue(draft);
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

    const guardianAlert = page.locator('.guardian-error-container').getByRole('alert');

    await expect(guardianAlert).toHaveText(
      'We couldn’t start the conversation. Refresh the page and try again.',
    );
    await expect(page.getByText(errorMessage)).toHaveCount(0);
    await expect(guardianAlert).toHaveCount(1);
    await expect(page.locator('.spinner')).toHaveCount(0);
  });
});
