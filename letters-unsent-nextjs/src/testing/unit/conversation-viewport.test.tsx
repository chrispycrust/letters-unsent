import { act, render } from "@testing-library/react";
import useConversationViewport from "@/components/LetterSubmit/useConversationViewport";

type MutableVisualViewport = EventTarget & {
  height: number;
  offsetTop: number;
  pageTop: number;
};

function ViewportHarness({ active }: { active: boolean }) {
  useConversationViewport(active);

  return <div data-testid="conversation-stage" />;
}

describe("useConversationViewport", () => {
  const originalVisualViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");
  const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
  const originalScrollX = Object.getOwnPropertyDescriptor(window, "scrollX");
  const originalScrollY = Object.getOwnPropertyDescriptor(window, "scrollY");
  const originalScrollTo = window.scrollTo;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

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
