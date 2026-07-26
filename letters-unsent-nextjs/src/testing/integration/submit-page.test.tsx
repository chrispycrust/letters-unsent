import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import Submit from "@/app/submit/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

const originalFetch = global.fetch;
const originalMatchMedia = window.matchMedia;

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

describe("Submit page flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: originalMatchMedia,
    });
  });

  it("starts the conversation and renders the first Cove message", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ output: "Welcome. I'm Cove." }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith("/api/guardian?&visitCount=1");
    });
    await waitFor(() => {
      expect(screen.getByText("Welcome. I'm Cove.")).not.toBeNull();
    });

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    const submitContainer = document.querySelector(".submit-container");
    const conversationShell = document.querySelector(".conversation-shell");

    expect(window.localStorage.getItem("visitCount")).toBe("1");
    expect(document.activeElement).not.toBe(textarea);
    expect(submitContainer?.classList.contains("conversation-active")).toBe(true);
    expect(conversationShell?.classList.contains("is-composing")).toBe(false);
    expect(document.documentElement.classList.contains("conversation-viewport-active")).toBe(true);
    expect(
      document.documentElement.style.getPropertyValue("--conversation-viewport-height"),
    ).not.toBe("");
  });

  it("tracks textarea focus without closing the conversation viewport stage", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ output: "What would you like to release?" }),
    }) as unknown as typeof fetch;

    render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    await waitFor(() => {
      expect(screen.getByText("What would you like to release?")).not.toBeNull();
    });

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    const conversationShell = document.querySelector(".conversation-shell");

    expect(document.documentElement.classList.contains("conversation-viewport-active")).toBe(true);

    act(() => textarea.focus());
    expect(conversationShell?.classList.contains("is-composing")).toBe(true);
    expect(document.documentElement.classList.contains("conversation-viewport-active")).toBe(true);

    act(() => textarea.blur());
    expect(conversationShell?.classList.contains("is-composing")).toBe(false);
    expect(document.documentElement.classList.contains("conversation-viewport-active")).toBe(true);
  });

  it("covers the Guardian in expanded writing mode and restores it on minimise", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ output: "What would you like to say?" }),
    }) as unknown as typeof fetch;

    render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    await waitFor(() => {
      expect(screen.getByText("What would you like to say?")).not.toBeNull();
    });

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    const guardianContainer = document.querySelector(".guardian-panel-container");
    const conversationShell = document.querySelector(".conversation-shell");

    fireEvent.change(textarea, { target: { value: "A draft I want to keep." } });
    fireEvent.click(screen.getByRole("button", { name: "Expand writing area" }));

    expect(conversationShell?.classList.contains("is-editor-expanded")).toBe(true);
    expect(guardianContainer?.getAttribute("aria-hidden")).toBe("true");
    expect(screen.getByText("What would you like to say?")).not.toBeNull();
    expect(screen.getByPlaceholderText("Write something")).toBe(textarea);
    expect(textarea.value).toBe("A draft I want to keep.");

    fireEvent.click(screen.getByRole("button", { name: "Minimise writing area" }));

    expect(conversationShell?.classList.contains("is-editor-expanded")).toBe(false);
    expect(guardianContainer?.hasAttribute("aria-hidden")).toBe(false);
    expect(screen.getByPlaceholderText("Write something")).toBe(textarea);
  });

  it("keeps mobile writing mode open when the response is empty", async () => {
    mockMobileConversationViewport(true);
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ output: "Take your time." }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    await waitFor(() => {
      expect(screen.getByText("Take your time.")).not.toBeNull();
    });

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    const form = textarea.closest("form");
    act(() => textarea.focus());
    fireEvent.change(textarea, { target: { value: "   " } });
    fireEvent.click(screen.getByRole("button", { name: "Expand writing area" }));
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(document.activeElement).toBe(textarea);
    expect(document.querySelector(".conversation-shell")?.classList.contains("is-composing"))
      .toBe(true);
    expect(document.querySelector(".conversation-shell")?.classList.contains("is-editor-expanded"))
      .toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("dismisses mobile writing mode immediately after a valid response", async () => {
    mockMobileConversationViewport(true);

    let resolvePost: ((value: {
      ok: boolean;
      json: () => Promise<{ output: string }>;
    }) => void) | undefined;
    const postResponse = new Promise<{
      ok: boolean;
      json: () => Promise<{ output: string }>;
    }>((resolve) => {
      resolvePost = resolve;
    });
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: "What happened?" }),
      })
      .mockReturnValueOnce(postResponse);
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    await waitFor(() => {
      expect(screen.getByText("What happened?")).not.toBeNull();
    });

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    const form = textarea.closest("form");
    act(() => textarea.focus());
    fireEvent.change(textarea, { target: { value: "I need to say goodbye." } });
    fireEvent.click(screen.getByRole("button", { name: "Expand writing area" }));
    expect(document.querySelector(".conversation-shell")?.classList.contains("is-editor-expanded"))
      .toBe(true);
    expect(form).not.toBeNull();
    fireEvent.submit(form as HTMLFormElement);

    expect(document.activeElement).not.toBe(textarea);
    expect(document.querySelector(".conversation-shell")?.classList.contains("is-composing"))
      .toBe(false);
    expect(document.querySelector(".conversation-shell")?.classList.contains("is-editor-expanded"))
      .toBe(false);
    expect(document.documentElement.classList.contains("conversation-viewport-active")).toBe(true);

    resolvePost?.({
      ok: true,
      json: async () => ({ output: "I hear you." }),
    });
    await waitFor(() => {
      expect(screen.getByText("I hear you.")).not.toBeNull();
    });
  });

  it("restores the outer page state when the submit page unmounts", async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ output: "Take your time." }),
    }) as unknown as typeof fetch;

    const { unmount } = render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    await waitFor(() => {
      expect(screen.getByText("Take your time.")).not.toBeNull();
    });

    expect(document.documentElement.classList.contains("conversation-viewport-active")).toBe(true);

    unmount();

    expect(document.documentElement.classList.contains("conversation-viewport-active")).toBe(false);
    expect(
      document.documentElement.style.getPropertyValue("--conversation-viewport-height"),
    ).toBe("");
  });

  it("shows an error if the initial guardian request fails", async () => {
    const rawError = "GuardianDatabaseError: upstream connection refused";
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 503,
      json: async () => ({ error: rawError }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toBe(
      "We couldn’t start the conversation. Refresh the page and try again.",
    );
    expect(screen.queryByText(rawError)).toBeNull();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(screen.getByRole("status").textContent).toBe("");
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Guardian greeting request failed",
      {
        status: 503,
        error: rawError,
      },
    );
  });

  it("keeps technical Guardian response errors out of the visitor alert", async () => {
    const rawError = "OpenAIError: upstream request id req_internal_123 failed";
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: "What would you like to release today?" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => ({ error: rawError }),
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    await waitFor(() => {
      expect(screen.getByText("What would you like to release today?")).not.toBeNull();
    });

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "I need to say goodbye." } });
    fireEvent.click(screen.getByRole("button", { name: "Send message" }));

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toBe(
      "We couldn’t get a response. Your message is still here—please try sending it again.",
    );
    expect(textarea.value).toBe("I need to say goodbye.");
    expect(screen.queryByText(rawError)).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Guardian response request failed",
      {
        status: 502,
        error: rawError,
      },
    );
  });

  it("submits visitor input and renders the assistant response", async () => {
    const fetchMock = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: "What would you like to release today?" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ output: "Thanks. I can help you refine that." }),
      });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    await waitFor(() => {
      expect(screen.getByText("What would you like to release today?")).not.toBeNull();
    });

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "I need to say goodbye." } });

    const submitButton = screen.getByRole("button", {
      name: "Send message",
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenNthCalledWith(
        2,
        "/api/guardian/",
        expect.objectContaining({
          method: "POST",
        }),
      );
    });

    await waitFor(() => {
      expect(screen.getByText("Thanks. I can help you refine that.")).not.toBeNull();
    });

    await waitFor(() => {
      expect((screen.getByPlaceholderText("Write something") as HTMLTextAreaElement).value).toBe("");
    });
  });
});
