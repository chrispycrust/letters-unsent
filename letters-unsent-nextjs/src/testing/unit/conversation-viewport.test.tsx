import { act, render, screen } from "@testing-library/react";
import { useRef } from "react";
import useConversationViewport from "@/components/LetterSubmit/useConversationViewport";

type MutableVisualViewport = EventTarget & {
  height: number;
  offsetTop: number;
};

function ViewportHarness({ active }: { active: boolean }) {
  const elementRef = useRef<HTMLDivElement>(null);
  useConversationViewport(elementRef, active);

  return <div ref={elementRef} data-testid="conversation-shell" />;
}

describe("useConversationViewport", () => {
  const originalVisualViewport = Object.getOwnPropertyDescriptor(window, "visualViewport");
  const originalInnerHeight = Object.getOwnPropertyDescriptor(window, "innerHeight");
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;

  let frameId = 0;
  let frameCallbacks = new Map<number, FrameRequestCallback>();

  beforeEach(() => {
    frameId = 0;
    frameCallbacks = new Map();

    window.requestAnimationFrame = jest.fn((callback: FrameRequestCallback) => {
      frameId += 1;
      frameCallbacks.set(frameId, callback);
      return frameId;
    });
    window.cancelAnimationFrame = jest.fn((id: number) => {
      frameCallbacks.delete(id);
    });
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 844,
    });
    jest.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 100,
      top: 100,
      right: 390,
      bottom: 500,
      left: 0,
      width: 390,
      height: 400,
      toJSON: () => ({}),
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;

    if (originalVisualViewport) {
      Object.defineProperty(window, "visualViewport", originalVisualViewport);
    } else {
      Reflect.deleteProperty(window, "visualViewport");
    }

    if (originalInnerHeight) {
      Object.defineProperty(window, "innerHeight", originalInnerHeight);
    }
  });

  function flushAnimationFrames() {
    const callbacks = [...frameCallbacks.values()];
    frameCallbacks.clear();
    callbacks.forEach((callback) => callback(performance.now()));
  }

  it("publishes visual viewport measurements and restores them when inactive", () => {
    const visualViewport = Object.assign(new EventTarget(), {
      height: 500,
      offsetTop: 10,
    }) as MutableVisualViewport;
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: visualViewport,
    });

    const { rerender } = render(<ViewportHarness active />);
    const shell = screen.getByTestId("conversation-shell");

    expect(shell.style.getPropertyValue("--conversation-viewport-height")).toBe("500px");
    expect(shell.style.getPropertyValue("--conversation-viewport-offset-top")).toBe("10px");
    expect(shell.style.getPropertyValue("--conversation-viewport-bottom")).toBe("510px");
    expect(shell.style.getPropertyValue("--conversation-keyboard-inset")).toBe("334px");
    expect(shell.style.getPropertyValue("--conversation-visible-top-inset")).toBe("0px");
    expect(shell.style.getPropertyValue("--conversation-available-height")).toBe("410px");

    visualViewport.height = 400;
    visualViewport.offsetTop = 120;
    act(() => {
      visualViewport.dispatchEvent(new Event("resize"));
      flushAnimationFrames();
    });

    expect(shell.style.getPropertyValue("--conversation-visible-top-inset")).toBe("20px");
    expect(shell.style.getPropertyValue("--conversation-available-height")).toBe("400px");

    rerender(<ViewportHarness active={false} />);
    expect(shell.style.getPropertyValue("--conversation-viewport-height")).toBe("");
    expect(shell.style.getPropertyValue("--conversation-available-height")).toBe("");
  });

  it("falls back to the window height when VisualViewport is unavailable", () => {
    Object.defineProperty(window, "visualViewport", {
      configurable: true,
      value: undefined,
    });

    render(<ViewportHarness active />);
    const shell = screen.getByTestId("conversation-shell");

    expect(shell.style.getPropertyValue("--conversation-viewport-height")).toBe("844px");
    expect(shell.style.getPropertyValue("--conversation-available-height")).toBe("744px");
  });
});
