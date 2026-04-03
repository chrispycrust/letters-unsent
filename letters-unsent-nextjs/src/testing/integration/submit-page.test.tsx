import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Submit from "@/app/submit/page";

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Submit page flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
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

    expect(window.localStorage.getItem("visitCount")).toBe("1");
    expect(screen.getByPlaceholderText("Write something")).not.toBeNull();
  });

  it("shows an error if the initial guardian request fails", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Guardian is unavailable" }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));

    await waitFor(() => {
      expect(screen.getByText("Server error: Guardian is unavailable")).not.toBeNull();
    });
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
      name: "click to submit a response to Cove (AI presence)",
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
