import { fireEvent, render, screen } from "@testing-library/react";
import type { FormEvent } from "react";
import VisitorPanel from "@/components/LetterSubmit/VisitorPanel";

describe("VisitorPanel", () => {
  const originalMatchMedia = window.matchMedia;

  afterEach(() => {
    jest.restoreAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  function mockMobileConversationViewport(matches: boolean) {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: jest.fn().mockImplementation((media: string) => ({
        matches,
        media,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  }

  it("updates input and submits the form", () => {
    const setVisitorInput = jest.fn();
    const handleSubmit = jest.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const { container } = render(
      <VisitorPanel
        visitorInput=""
        setVisitorInput={setVisitorInput}
        handleSubmit={handleSubmit}
      />,
    );

    const textarea = screen.getByPlaceholderText("Write something");
    fireEvent.change(textarea, { target: { value: "A new draft message" } });
    expect(setVisitorInput).toHaveBeenCalledWith("A new draft message");

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    if (form) {
      fireEvent.submit(form);
    }
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("expands and minimizes the text area", () => {
    const setVisitorInput = jest.fn();
    const handleSubmit = jest.fn();
    const { container } = render(
      <VisitorPanel
        visitorInput=""
        setVisitorInput={setVisitorInput}
        handleSubmit={handleSubmit}
      />,
    );

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form?.className.includes("vistor-input-container-expanded")).toBe(false);

    const expandButton = screen.getByRole("button", { name: /maximise/i });
    fireEvent.click(expandButton);
    expect(form?.className.includes("vistor-input-container-expanded")).toBe(true);

    const minimiseButton = screen.getByRole("button", { name: /minimise/i });
    expect(minimiseButton).not.toBeNull();
    fireEvent.click(minimiseButton);
    expect(form?.className.includes("vistor-input-container-expanded")).toBe(false);
  });

  it("reports when the visitor enters and leaves writing mode", () => {
    const onFocusChange = jest.fn();

    render(
      <VisitorPanel
        visitorInput=""
        setVisitorInput={jest.fn()}
        handleSubmit={jest.fn()}
        onFocusChange={onFocusChange}
      />,
    );

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    textarea.focus();
    textarea.blur();

    expect(onFocusChange).toHaveBeenNthCalledWith(1, true);
    expect(onFocusChange).toHaveBeenNthCalledWith(2, false);
  });

  it("focuses a mobile textarea without Safari's native touch scroll", () => {
    mockMobileConversationViewport(true);
    const onFocusChange = jest.fn();

    render(
      <VisitorPanel
        visitorInput=""
        setVisitorInput={jest.fn()}
        handleSubmit={jest.fn()}
        onFocusChange={onFocusChange}
      />,
    );

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    const focusSpy = jest.spyOn(textarea, "focus");
    const pointerEvent = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperties(pointerEvent, {
      pointerType: { value: "touch" },
      isPrimary: { value: true },
    });

    fireEvent(textarea, pointerEvent);

    expect(pointerEvent.defaultPrevented).toBe(true);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
    expect(onFocusChange).toHaveBeenCalledWith(true);
  });

  it("leaves mouse and already-focused textarea interaction native", () => {
    mockMobileConversationViewport(true);

    render(
      <VisitorPanel
        visitorInput=""
        setVisitorInput={jest.fn()}
        handleSubmit={jest.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    const focusSpy = jest.spyOn(textarea, "focus");

    fireEvent.pointerDown(textarea, {
      pointerType: "mouse",
      isPrimary: true,
    });
    expect(focusSpy).not.toHaveBeenCalled();

    textarea.focus();
    focusSpy.mockClear();

    fireEvent.pointerDown(textarea, {
      pointerType: "touch",
      isPrimary: true,
    });
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it("keeps touch handling native when positioning the caret in a draft", () => {
    mockMobileConversationViewport(true);

    render(
      <VisitorPanel
        visitorInput="A draft in progress"
        setVisitorInput={jest.fn()}
        handleSubmit={jest.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    const focusSpy = jest.spyOn(textarea, "focus");
    const pointerEvent = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperties(pointerEvent, {
      pointerType: { value: "touch" },
      isPrimary: { value: true },
    });

    fireEvent(textarea, pointerEvent);

    expect(pointerEvent.defaultPrevented).toBe(false);
    expect(focusSpy).not.toHaveBeenCalled();
  });
});
