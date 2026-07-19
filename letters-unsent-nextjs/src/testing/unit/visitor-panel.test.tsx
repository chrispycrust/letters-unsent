import { act, fireEvent, render, screen } from "@testing-library/react";
import { useState, type FormEvent } from "react";
import VisitorPanel from "@/components/LetterSubmit/VisitorPanel";

function ControlledVisitorPanel({
  visitorInput = "",
  setVisitorInput = jest.fn(),
  handleSubmit = jest.fn(),
  onFocusChange,
}: {
  visitorInput?: string;
  setVisitorInput?: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  onFocusChange?: (focused: boolean) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <VisitorPanel
      visitorInput={visitorInput}
      setVisitorInput={setVisitorInput}
      handleSubmit={handleSubmit}
      onFocusChange={onFocusChange}
      isExpanded={isExpanded}
      onExpandedChange={setIsExpanded}
    />
  );
}

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
        isExpanded={false}
        onExpandedChange={jest.fn()}
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
      <ControlledVisitorPanel
        setVisitorInput={setVisitorInput}
        handleSubmit={handleSubmit}
      />,
    );

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form?.classList.contains("is-expanded")).toBe(false);

    const expandButton = screen.getByRole("button", { name: "Expand writing area" });
    expect(expandButton.getAttribute("aria-expanded")).toBe("false");
    expect(expandButton.getAttribute("aria-controls")).toBe("VisitorInput");
    fireEvent.click(expandButton);
    expect(form?.classList.contains("is-expanded")).toBe(true);

    const minimiseButton = screen.getByRole("button", { name: "Minimise writing area" });
    expect(minimiseButton).toBe(expandButton);
    expect(minimiseButton.getAttribute("aria-expanded")).toBe("true");
    fireEvent.click(minimiseButton);
    expect(form?.classList.contains("is-expanded")).toBe(false);
  });

  it("preserves the draft, selection, scroll and focus while changing editor size", () => {
    const draft = "A longer draft with enough text to preserve an editing position.";

    render(<ControlledVisitorPanel visitorInput={draft} />);

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    const expandButton = screen.getByRole("button", { name: "Expand writing area" });
    textarea.focus();
    textarea.setSelectionRange(9, 14, "forward");
    textarea.scrollTop = 24;

    const pointerEvent = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperties(pointerEvent, {
      button: { value: 0 },
      isPrimary: { value: true },
      pointerType: { value: "touch" },
    });

    fireEvent(expandButton, pointerEvent);
    fireEvent.click(expandButton);

    expect(pointerEvent.defaultPrevented).toBe(true);
    expect(screen.getByPlaceholderText("Write something")).toBe(textarea);
    expect(textarea.value).toBe(draft);
    expect(textarea.selectionStart).toBe(9);
    expect(textarea.selectionEnd).toBe(14);
    expect(textarea.selectionDirection).toBe("forward");
    expect(textarea.scrollTop).toBe(24);
    expect(document.activeElement).toBe(textarea);

    textarea.scrollTop = 0;
    const minimisePointerEvent = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperties(minimisePointerEvent, {
      button: { value: 0 },
      isPrimary: { value: true },
      pointerType: { value: "touch" },
    });

    fireEvent(expandButton, minimisePointerEvent);
    fireEvent.click(expandButton);

    expect(minimisePointerEvent.defaultPrevented).toBe(true);
    expect(textarea.scrollTop).toBe(24);
    expect(textarea.selectionStart).toBe(9);
    expect(textarea.selectionEnd).toBe(14);
    expect(document.activeElement).toBe(textarea);

    const reexpandPointerEvent = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperties(reexpandPointerEvent, {
      button: { value: 0 },
      isPrimary: { value: true },
      pointerType: { value: "touch" },
    });
    fireEvent(expandButton, reexpandPointerEvent);
    fireEvent.click(expandButton);
    textarea.setSelectionRange(0, 0, "none");
    textarea.scrollTop = 0;

    const finalMinimisePointerEvent = new Event("pointerdown", {
      bubbles: true,
      cancelable: true,
    });
    Object.defineProperties(finalMinimisePointerEvent, {
      button: { value: 0 },
      isPrimary: { value: true },
      pointerType: { value: "touch" },
    });
    fireEvent(expandButton, finalMinimisePointerEvent);
    fireEvent.click(expandButton);

    expect(textarea.selectionStart).toBe(0);
    expect(textarea.selectionEnd).toBe(0);
    expect(textarea.scrollTop).toBe(0);
    expect(document.activeElement).toBe(textarea);
  });

  it("allows keyboard activation to move focus to the resize control", () => {
    render(<ControlledVisitorPanel visitorInput="A draft" />);

    const resizeButton = screen.getByRole("button", { name: "Expand writing area" });
    resizeButton.focus();
    fireEvent.click(resizeButton);

    expect(document.activeElement).toBe(resizeButton);
    expect(screen.getByRole("button", { name: "Minimise writing area" })).toBe(resizeButton);
  });

  it("clears compact mobile sizing after crossing into the desktop layout", () => {
    let matchesMobile = true;
    let changeHandler: (() => void) | undefined;

    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: jest.fn().mockImplementation((media: string) => ({
        get matches() {
          return matchesMobile;
        },
        media,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn((_type: string, handler: () => void) => {
          changeHandler = handler;
        }),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    render(
      <VisitorPanel
        visitorInput=""
        setVisitorInput={jest.fn()}
        handleSubmit={jest.fn()}
        isExpanded={false}
        onExpandedChange={jest.fn()}
      />,
    );

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    expect(textarea.style.height).not.toBe("");

    matchesMobile = false;
    act(() => changeHandler?.());

    expect(textarea.style.height).toBe("");
    expect(textarea.style.overflowY).toBe("");
  });

  it("reports when the visitor enters and leaves writing mode", () => {
    const onFocusChange = jest.fn();

    render(
      <VisitorPanel
        visitorInput=""
        setVisitorInput={jest.fn()}
        handleSubmit={jest.fn()}
        onFocusChange={onFocusChange}
        isExpanded={false}
        onExpandedChange={jest.fn()}
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
        isExpanded={false}
        onExpandedChange={jest.fn()}
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
        isExpanded={false}
        onExpandedChange={jest.fn()}
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
        isExpanded={false}
        onExpandedChange={jest.fn()}
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
