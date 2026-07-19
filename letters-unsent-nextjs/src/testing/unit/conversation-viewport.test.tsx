import { act, render, screen } from "@testing-library/react";
import useConversationViewport from "@/components/LetterSubmit/useConversationViewport";

type MutableVisualViewport = EventTarget & {
  height: number;
  offsetTop: number;
  pageTop: number;
};

function ViewportHarness({ active }: { active: boolean }) {
  useConversationViewport(active);

  return (
    <div data-testid="conversation-stage">
      <div
        className="guardian-panel"
        data-conversation-scroll-region="guardian"
      >
        <span data-testid="guardian-content">Guardian content</span>
      </div>
      <textarea
        data-testid="visitor-textarea"
        data-conversation-scroll-region="visitor"
      />
    </div>
  );
}

type TestTouch = Pick<Touch, "identifier" | "clientX" | "clientY">;

function createTouch(
  identifier: number,
  clientX: number,
  clientY: number,
): TestTouch {
  return { identifier, clientX, clientY };
}

function dispatchTouchEvent(
  target: EventTarget,
  type: "touchstart" | "touchmove" | "touchend" | "touchcancel",
  touches: TestTouch[],
  changedTouches: TestTouch[] = touches,
): TouchEvent {
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
  return event as TouchEvent;
}

function setScrollMetrics(
  element: HTMLElement,
  {
    clientHeight,
    scrollHeight,
    scrollTop,
  }: {
    clientHeight: number;
    scrollHeight: number;
    scrollTop: number;
  },
) {
  Object.defineProperties(element, {
    clientHeight: {
      configurable: true,
      value: clientHeight,
    },
    scrollHeight: {
      configurable: true,
      value: scrollHeight,
    },
    scrollTop: {
      configurable: true,
      writable: true,
      value: scrollTop,
    },
  });
}

function dispatchSingleFingerGesture(
  target: EventTarget,
  identifier: number,
  movement: { x: number; y: number },
) {
  const startTouch = createTouch(identifier, 50, 50);
  const startEvent = dispatchTouchEvent(target, "touchstart", [startTouch]);
  const moveEvent = dispatchTouchEvent(
    target,
    "touchmove",
    [createTouch(identifier, 50 + movement.x, 50 + movement.y)],
  );

  dispatchTouchEvent(target, "touchend", [], [startTouch]);

  return { startEvent, moveEvent };
}

describe("useConversationViewport", () => {
  const originalVisualViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");
  const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
  const originalScrollX = Object.getOwnPropertyDescriptor(window, "scrollX");
  const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");
  const originalScrollTo = window.scrollTo;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;
  const originalMatchMedia = Object.getOwnPropertyDescriptor(window, "matchMedia");

  let frameId = 0;
  let frameCallbacks = new Map<number, FrameRequestCallback>();
  let scrollX = 0;
  let scrollY = 0;

  beforeEach(() => {
    frameId = 0;
    frameCallbacks = new Map();
    scrollX = 0;
    scrollY = 0;

    window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      frameId += 1;
      frameCallbacks.set(frameId, callback);
      return frameId;
    });
    window.cancelAnimationFrame = jest.fn((id: number) => {
      frameCallbacks.delete(id);
    });
    window.scrollTo = jest.fn((nextX: number, nextY: number) => {
      scrollX = nextX;
      scrollY = nextY;
    }) as unknown as typeof window.scrollTo;

    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 664,
    });
    Object.defineProperty(window, "scrollX", {
      configurable: true,
      get: () => scrollX,
    });
    Object.defineProperty(window, "scrollY", {
      configurable: true,
      get: () => scrollY,
    });

    document.documentElement.classList.remove("conversation-viewport-active");
    document.documentElement.style.removeProperty("--conversation-viewport-height");
    document.documentElement.style.removeProperty("--conversation-viewport-page-top");
    document.documentElement.style.removeProperty("--conversation-viewport-bottom");
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
    window.scrollTo = originalScrollTo;

    if (originalVisualViewport) {
      Object.defineProperty(window, "visualViewport", originalVisualViewport);
    } else {
      Reflect.deleteProperty(window, "visualViewport");
    }

    if (originalInnerHeight) {
      Object.defineProperty(window, "innerHeight", originalInnerHeight);
    }

    if (originalScrollX) {
      Object.defineProperty(window, "scrollX", originalScrollX);
    }

    if (originalScrollY) {
      Object.defineProperty(window, "scrollY", originalScrollY);
    }

    if (originalMatchMedia) {
      Object.defineProperty(window, "matchMedia", originalMatchMedia);
    } else {
      Reflect.deleteProperty(window, "matchMedia");
    }

    document.documentElement.classList.remove("conversation-viewport-active");
    document.documentElement.style.removeProperty("--conversation-viewport-height");
    document.documentElement.style.removeProperty("--conversation-viewport-page-top");
    document.documentElement.style.removeProperty("--conversation-viewport-bottom");
  });

  function flushAnimationFrames() {
    const callbacks = [...frameCallbacks.values()];
    frameCallbacks.clear();
    callbacks.forEach((callback) => callback(performance.now()));
  }

  function mockMobileConversationViewport(matches: boolean) {
    let currentMatches = matches;
    const listeners = new Set<() => void>();
    const mediaQueryList = {
      get matches() {
        return currentMatches;
      },
      media: "(max-width: 650px)",
      onchange: null,
      addListener: jest.fn((listener: () => void) => listeners.add(listener)),
      removeListener: jest.fn((listener: () => void) => listeners.delete(listener)),
      addEventListener: jest.fn((
        _type: string,
        listener: () => void,
      ) => listeners.add(listener)),
      removeEventListener: jest.fn((
        _type: string,
        listener: () => void,
      ) => listeners.delete(listener)),
      dispatchEvent: jest.fn(),
    };

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: jest.fn().mockReturnValue(mediaQueryList),
    });

    return {
      setMatches(nextMatches: boolean) {
        currentMatches = nextMatches;
        listeners.forEach((listener) => listener());
      },
    };
  }

  it("blocks vertical dragging when the touched area has nowhere to scroll", () => {
    mockMobileConversationViewport(true);
    render(<ViewportHarness active />);

    const background = screen.getByTestId("conversation-stage");
    const guardianContent = screen.getByTestId("guardian-content");
    const textarea = screen.getByTestId("visitor-textarea");

    const backgroundTouch = createTouch(1, 20, 20);
    const backgroundStart = dispatchTouchEvent(
      background,
      "touchstart",
      [backgroundTouch],
    );
    const belowThresholdMove = dispatchTouchEvent(
      background,
      "touchmove",
      [createTouch(1, 21, 25)],
    );
    const verticalMove = dispatchTouchEvent(
      background,
      "touchmove",
      [createTouch(1, 22, 50)],
    );

    expect(backgroundStart.defaultPrevented).toBe(false);
    expect(belowThresholdMove.defaultPrevented).toBe(false);
    expect(verticalMove.defaultPrevented).toBe(true);
    dispatchTouchEvent(background, "touchend", [], [backgroundTouch]);

    const guardianTouch = createTouch(2, 20, 20);
    dispatchTouchEvent(guardianContent, "touchstart", [guardianTouch]);
    const guardianMove = dispatchTouchEvent(
      guardianContent,
      "touchmove",
      [createTouch(2, 20, 50)],
    );
    expect(guardianMove.defaultPrevented).toBe(true);
    dispatchTouchEvent(guardianContent, "touchend", [], [guardianTouch]);

    const textareaTouch = createTouch(3, 20, 20);
    dispatchTouchEvent(textarea, "touchstart", [textareaTouch]);
    const textareaMove = dispatchTouchEvent(
      textarea,
      "touchmove",
      [createTouch(3, 20, 50)],
    );
    expect(textareaMove.defaultPrevented).toBe(true);
    dispatchTouchEvent(textarea, "touchend", [], [textareaTouch]);
  });

  it("allows each scroll area only while it has room in the gesture direction", () => {
    mockMobileConversationViewport(true);
    render(<ViewportHarness active />);

    const guardianContent = screen.getByTestId("guardian-content");
    const guardian = guardianContent.closest<HTMLElement>(
      "[data-conversation-scroll-region='guardian']",
    );
    const textarea = screen.getByTestId("visitor-textarea");

    expect(guardian).not.toBeNull();

    const scrollAreas = [
      {
        name: "Guardian",
        target: guardianContent,
        element: guardian as HTMLElement,
      },
      {
        name: "visitor textarea",
        target: textarea,
        element: textarea,
      },
    ];
    const scenarios = [
      {
        name: "without overflow, swiping up",
        scrollHeight: 100,
        scrollTop: 0,
        movementY: -30,
        prevented: true,
      },
      {
        name: "without overflow, swiping down",
        scrollHeight: 100,
        scrollTop: 0,
        movementY: 30,
        prevented: true,
      },
      {
        name: "at the top, swiping up",
        scrollHeight: 300,
        scrollTop: 0,
        movementY: -30,
        prevented: false,
      },
      {
        name: "at the top, swiping down",
        scrollHeight: 300,
        scrollTop: 0,
        movementY: 30,
        prevented: true,
      },
      {
        name: "in the middle, swiping up",
        scrollHeight: 300,
        scrollTop: 100,
        movementY: -30,
        prevented: false,
      },
      {
        name: "in the middle, swiping down",
        scrollHeight: 300,
        scrollTop: 100,
        movementY: 30,
        prevented: false,
      },
      {
        name: "at the bottom, swiping up",
        scrollHeight: 300,
        scrollTop: 200,
        movementY: -30,
        prevented: true,
      },
      {
        name: "at the bottom, swiping down",
        scrollHeight: 300,
        scrollTop: 200,
        movementY: 30,
        prevented: false,
      },
    ];
    let identifier = 10;

    for (const scrollArea of scrollAreas) {
      for (const scenario of scenarios) {
        setScrollMetrics(scrollArea.element, {
          clientHeight: 100,
          scrollHeight: scenario.scrollHeight,
          scrollTop: scenario.scrollTop,
        });

        const { startEvent, moveEvent } = dispatchSingleFingerGesture(
          scrollArea.target,
          identifier,
          { x: 0, y: scenario.movementY },
        );

        expect(startEvent.defaultPrevented).toBe(false);
        expect({
          scrollArea: scrollArea.name,
          scenario: scenario.name,
          prevented: moveEvent.defaultPrevented,
        }).toEqual({
          scrollArea: scrollArea.name,
          scenario: scenario.name,
          prevented: scenario.prevented,
        });
        identifier += 1;
      }
    }
  });

  it("preserves focused textarea taps and non-vertical editing gestures", () => {
    mockMobileConversationViewport(true);
    render(<ViewportHarness active />);

    const textarea = screen.getByTestId(
      "visitor-textarea",
    ) as HTMLTextAreaElement;

    textarea.value = "draft";
    textarea.focus();
    textarea.setSelectionRange(2, 2);

    const tapTouch = createTouch(40, 50, 50);
    const tapStart = dispatchTouchEvent(textarea, "touchstart", [tapTouch]);
    const smallMove = dispatchTouchEvent(
      textarea,
      "touchmove",
      [createTouch(40, 52, 55)],
    );
    const tapEnd = dispatchTouchEvent(textarea, "touchend", [], [tapTouch]);

    expect(tapStart.defaultPrevented).toBe(false);
    expect(smallMove.defaultPrevented).toBe(false);
    expect(tapEnd.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(textarea);
    expect(textarea.selectionStart).toBe(2);
    expect(textarea.selectionEnd).toBe(2);

    const horizontalGesture = dispatchSingleFingerGesture(
      textarea,
      41,
      { x: 30, y: 2 },
    );

    expect(horizontalGesture.moveEvent.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(textarea);
    expect(textarea.selectionStart).toBe(2);
    expect(textarea.selectionEnd).toBe(2);
  });

  it("rechecks scroll room when a vertical gesture changes direction", () => {
    mockMobileConversationViewport(true);
    render(<ViewportHarness active />);

    const guardianContent = screen.getByTestId("guardian-content");
    const guardian = guardianContent.closest<HTMLElement>(
      "[data-conversation-scroll-region='guardian']",
    );

    expect(guardian).not.toBeNull();
    setScrollMetrics(guardian as HTMLElement, {
      clientHeight: 100,
      scrollHeight: 300,
      scrollTop: 0,
    });

    const startTouch = createTouch(42, 50, 50);
    dispatchTouchEvent(guardianContent, "touchstart", [startTouch]);
    const allowedUpwardMove = dispatchTouchEvent(
      guardianContent,
      "touchmove",
      [createTouch(42, 50, 20)],
    );

    expect(allowedUpwardMove.defaultPrevented).toBe(false);

    (guardian as HTMLElement).scrollTop = 200;
    const blockedAtBottom = dispatchTouchEvent(
      guardianContent,
      "touchmove",
      [createTouch(42, 50, 10)],
    );
    const allowedAfterReversing = dispatchTouchEvent(
      guardianContent,
      "touchmove",
      [createTouch(42, 50, 30)],
    );

    expect(blockedAtBottom.defaultPrevented).toBe(true);
    expect(allowedAfterReversing.defaultPrevented).toBe(false);
    dispatchTouchEvent(guardianContent, "touchend", [], [startTouch]);
  });

  it("keeps horizontal, multi-touch, and non-mobile gestures native", () => {
    const viewportMode = mockMobileConversationViewport(true);
    render(<ViewportHarness active />);

    const background = screen.getByTestId("conversation-stage");
    const horizontalTouch = createTouch(4, 20, 20);
    dispatchTouchEvent(background, "touchstart", [horizontalTouch]);
    const horizontalMove = dispatchTouchEvent(
      background,
      "touchmove",
      [createTouch(4, 50, 22)],
    );
    expect(horizontalMove.defaultPrevented).toBe(false);
    dispatchTouchEvent(background, "touchend", [], [horizontalTouch]);

    const firstTouch = createTouch(5, 20, 20);
    const secondTouch = createTouch(6, 40, 20);
    dispatchTouchEvent(background, "touchstart", [firstTouch, secondTouch]);
    const multiTouchMove = dispatchTouchEvent(
      background,
      "touchmove",
      [
        createTouch(5, 20, 50),
        createTouch(6, 40, 50),
      ],
    );
    expect(multiTouchMove.defaultPrevented).toBe(false);
    dispatchTouchEvent(background, "touchend", [], [firstTouch, secondTouch]);

    act(() => {
      viewportMode.setMatches(false);
    });

    const desktopTouch = createTouch(7, 20, 20);
    dispatchTouchEvent(background, "touchstart", [desktopTouch]);
    const desktopMove = dispatchTouchEvent(
      background,
      "touchmove",
      [createTouch(7, 20, 50)],
    );
    expect(desktopMove.defaultPrevented).toBe(false);
    dispatchTouchEvent(background, "touchend", [], [desktopTouch]);

    act(() => {
      viewportMode.setMatches(true);
    });

    const restoredMobileGesture = dispatchSingleFingerGesture(
      background,
      8,
      { x: 0, y: 30 },
    );
    expect(restoredMobileGesture.moveEvent.defaultPrevented).toBe(true);
  });

  it("removes background touch protection when conversation mode ends", () => {
    mockMobileConversationViewport(true);
    const { rerender } = render(<ViewportHarness active />);
    const background = screen.getByTestId("conversation-stage");

    const guardedTouch = createTouch(30, 20, 20);
    dispatchTouchEvent(background, "touchstart", [guardedTouch]);
    const guardedMove = dispatchTouchEvent(
      background,
      "touchmove",
      [createTouch(30, 20, 50)],
    );
    expect(guardedMove.defaultPrevented).toBe(true);

    rerender(<ViewportHarness active={false} />);

    const unguardedTouch = createTouch(31, 20, 20);
    dispatchTouchEvent(background, "touchstart", [unguardedTouch]);
    const unguardedMove = dispatchTouchEvent(
      background,
      "touchmove",
      [createTouch(31, 20, 50)],
    );
    expect(unguardedMove.defaultPrevented).toBe(false);
  });

  it("follows Safari's staged keyboard opening and dismissal measurements directly", () => {
    const visualViewport = Object.assign(new EventTarget(), {
      height: 664,
      offsetTop: 0,
      pageTop: 0,
    }) as MutableVisualViewport;
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: visualViewport,
    });
    const geometrySpy = jest.spyOn(HTMLElement.prototype, "getBoundingClientRect");

    const { rerender } = render(<ViewportHarness active />);
    const root = document.documentElement;

    expect(root.classList.contains("conversation-viewport-active")).toBe(true);
    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("664px");
    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("0px");
    expect(root.style.getPropertyValue("--conversation-viewport-bottom")).toBe("664px");

    // Safari first shrinks the viewport and scrolls the document while its
    // VisualViewport page position is still stale.
    visualViewport.height = 345;
    scrollY = 319;
    act(() => {
      visualViewport.dispatchEvent(new Event("resize"));
      window.dispatchEvent(new Event("scroll"));
    });

    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("345px");
    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("319px");
    expect(root.style.getPropertyValue("--conversation-viewport-bottom")).toBe("664px");
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(frameCallbacks.size).toBe(1);

    act(() => {
      flushAnimationFrames();
    });

    visualViewport.offsetTop = 319;
    visualViewport.pageTop = 319;
    act(() => {
      visualViewport.dispatchEvent(new Event("scroll"));
    });

    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("319px");
    expect(root.style.getPropertyValue("--conversation-viewport-bottom")).toBe("664px");

    act(() => {
      flushAnimationFrames();
    });

    // Safari can restore the layout scroll before VisualViewport.pageTop.
    // Dismissal follows the source moving back instead of retaining the stale
    // larger value.
    scrollY = 0;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("345px");
    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("0px");
    expect(root.style.getPropertyValue("--conversation-viewport-bottom")).toBe("345px");

    // There is no app-controlled target or timer. Each restored measurement is
    // used as soon as Safari publishes it.
    visualViewport.height = 664;
    visualViewport.offsetTop = 0;
    act(() => {
      visualViewport.dispatchEvent(new Event("resize"));
    });

    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("664px");
    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("0px");
    expect(root.style.getPropertyValue("--conversation-viewport-bottom")).toBe("664px");

    visualViewport.pageTop = 0;
    act(() => {
      visualViewport.dispatchEvent(new Event("scroll"));
    });

    act(() => {
      flushAnimationFrames();
    });

    expect(root.style.getPropertyValue("--conversation-visible-top-inset")).toBe("");
    expect(root.style.getPropertyValue("--conversation-available-height")).toBe("");
    expect(geometrySpy).not.toHaveBeenCalled();

    rerender(<ViewportHarness active={false} />);

    expect(root.classList.contains("conversation-viewport-active")).toBe(false);
    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("");
    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("");
    expect(root.style.getPropertyValue("--conversation-viewport-bottom")).toBe("");
  });

  it("uses window measurements and observes ordinary page scrolling without VisualViewport", () => {
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: undefined,
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 844,
    });

    const { rerender } = render(<ViewportHarness active />);
    const root = document.documentElement;

    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("844px");
    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("0px");
    expect(root.style.getPropertyValue("--conversation-viewport-bottom")).toBe("844px");

    scrollY = 120;
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });

    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("120px");
    expect(root.style.getPropertyValue("--conversation-viewport-bottom")).toBe("964px");
    expect(window.requestAnimationFrame).toHaveBeenCalledTimes(1);
    expect(frameCallbacks.size).toBe(1);

    act(() => {
      flushAnimationFrames();
    });
    expect(frameCallbacks.size).toBe(0);

    rerender(<ViewportHarness active={false} />);
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    jest.mocked(window.requestAnimationFrame).mockClear();
    window.dispatchEvent(new Event("scroll"));
    expect(window.requestAnimationFrame).not.toHaveBeenCalled();
  });

  it("reconciles measurements that Safari refines before the follow-up frame", () => {
    const visualViewport = Object.assign(new EventTarget(), {
      height: 664,
      offsetTop: 0,
      pageTop: 0,
    }) as MutableVisualViewport;
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: visualViewport,
    });

    const { unmount } = render(<ViewportHarness active />);
    const root = document.documentElement;

    visualViewport.height = 345;
    scrollY = 319;
    act(() => {
      visualViewport.dispatchEvent(new Event("resize"));
    });

    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("345px");
    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("319px");

    // No second event is required: the queued pass picks up values Safari
    // refines between the original event and the browser's next frame.
    visualViewport.height = 344;
    visualViewport.pageTop = 320;
    act(() => {
      flushAnimationFrames();
    });

    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("344px");
    expect(root.style.getPropertyValue("--conversation-viewport-page-top")).toBe("320px");
    expect(root.style.getPropertyValue("--conversation-viewport-bottom")).toBe("664px");

    unmount();
  });

  it("restores root values that existed before the stage was activated", () => {
    const root = document.documentElement;
    root.classList.add("conversation-viewport-active");
    root.style.setProperty("--conversation-viewport-height", "777px", "important");

    const { rerender } = render(<ViewportHarness active />);

    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("664px");

    rerender(<ViewportHarness active={false} />);

    expect(root.classList.contains("conversation-viewport-active")).toBe(true);
    expect(root.style.getPropertyValue("--conversation-viewport-height")).toBe("777px");
  });
});
