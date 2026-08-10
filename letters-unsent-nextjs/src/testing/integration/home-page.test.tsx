import { render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";

describe("Home page letter feed", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders letters returned from the API", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        letters: [
          {
            id: "10",
            content: "This is a letter that appears in the archive.",
            intended_recipient: "Sam",
            relationship_type: "Friend",
            emotional_tone: "Reflective",
          },
        ],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("Sam")).not.toBeNull();
    });
    expect(screen.getByText("AI gen")).not.toBeNull();
    expect(screen.getByText(/This is a letter that appears/i)).not.toBeNull();
  });

  it("shows an empty-state message when there are no letters", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        letters: [],
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Home />);

    await waitFor(() => {
      expect(screen.getByText("No letters")).not.toBeNull();
    });
  });

  it("surfaces API error messages", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: false,
        error: "Database timeout",
      }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Home />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load letters: Database timeout. Please try again later."),
      ).not.toBeNull();
    });
  });
});
