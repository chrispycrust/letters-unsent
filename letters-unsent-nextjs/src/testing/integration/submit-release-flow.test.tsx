import { beforeEach, describe, expect, it } from "@jest/globals"
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Submit from "@/app/submit/page";

const mockPush = jest.fn();

type MockFetchResponse = {
  ok: boolean
  json: () => Promise<unknown>
}

function mockFetchSequence(...responses: MockFetchResponse[]) {
  const queue = [...responses]

  return jest.fn(async (...args: [RequestInfo | URL, RequestInit?]) => {
    void args

    const nextResponse = queue.shift()
    if (!nextResponse) {
      throw new Error("No mocked fetch response left in queue.")
    }
    return nextResponse
  })
}

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

const readyLetterPayload = {
  content: "A final letter body.",
  intended_recipient: "Sam",
  author_name: "Casey",
  relationship_type: "friend",
  emotional_tone: "reflective",
};

describe("Submit page release flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
  });

  it("enters ready-to-release state without persisting directly", async () => {
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: async () => ({ output: "Welcome. I'm Cove." }),
      },
      {
        ok: true,
        json: async () => ({
          output: "Your letter is ready.",
          releaseReady: true,
          letterPayload: readyLetterPayload,
        }),
      },
    );

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);

    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));
    await waitFor(() => {
      expect(screen.getByText("Welcome. I'm Cove.")).not.toBeNull();
    });

    fireEvent.change(screen.getByPlaceholderText("Write something"), {
      target: { value: "Please help me finish this letter." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit a response/i }));

    await waitFor(() => {
      expect(screen.getByText("Keep a way back to your letter")).not.toBeNull();
    });

    expect(screen.getByRole("button", { name: "Protect this letter" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Release without protection" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Return to conversation" })).not.toBeNull();

    const supabaseCalls = fetchMock.mock.calls.filter((call) => String(call[0]).includes("/api/supabase"));
    expect(supabaseCalls.length).toBe(0);
  });

  it("submits protected flow only after completion and routes using returned id", async () => {
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: async () => ({ output: "Welcome. I'm Cove." }),
      },
      {
        ok: true,
        json: async () => ({
          output: "Your letter is ready.",
          releaseReady: true,
          letterPayload: readyLetterPayload,
        }),
      },
      {
        ok: true,
        json: async () => ({
          success: true,
          id: "new-99",
          data: [{ id: "new-99" }],
        }),
      },
    );

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);

    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));
    await waitFor(() => {
      expect(screen.getByText("Welcome. I'm Cove.")).not.toBeNull();
    });

    fireEvent.change(screen.getByPlaceholderText("Write something"), {
      target: { value: "Please help me finish this letter." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit a response/i }));

    await waitFor(() => {
      expect(screen.getByText("Keep a way back to your letter")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    const tokenInput = screen.getByPlaceholderText("Enter your token here");
    fireEvent.change(tokenInput, { target: { value: "quiet-sage-morning" } });

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(screen.getByText("Keep your token somewhere safe")).not.toBeNull();
    });

    const supabaseCallsBeforeSubmit = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("/api/supabase"),
    );
    expect(supabaseCallsBeforeSubmit.length).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Review release" }));

    expect(screen.getByText("Ready to release your letter?")).not.toBeNull();

    const supabaseCallsBeforeConfirm = fetchMock.mock.calls.filter((call) =>
      String(call[0]).includes("/api/supabase"),
    );
    expect(supabaseCallsBeforeConfirm.length).toBe(0);

    fireEvent.click(screen.getByRole("button", { name: "Release letter" }));

    await waitFor(() => {
      const call = fetchMock.mock.calls.find((entry) => entry[0] === "/api/supabase");
      expect(call).not.toBeUndefined();
    });

    const supabaseCall = fetchMock.mock.calls.find((entry) => entry[0] === "/api/supabase");
    expect(supabaseCall).toBeDefined();
    const supabaseBody = JSON.parse(String(supabaseCall?.[1]?.body));
    expect(supabaseBody.owner_passphrase).toBe("quiet-sage-morning");

    await waitFor(() => {
      expect(screen.getByText("Your letter is protected")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "View my letter" }));
    expect(mockPush).toHaveBeenCalledWith("/letters/new-99");
  });

  it("submits null passphrase for unprotected flow and allows returning to conversation", async () => {
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: async () => ({ output: "Welcome. I'm Cove." }),
      },
      {
        ok: true,
        json: async () => ({
          output: "Your letter is ready.",
          releaseReady: true,
          letterPayload: readyLetterPayload,
        }),
      },
      {
        ok: true,
        json: async () => ({
          success: true,
          id: "new-100",
          data: [{ id: "new-100" }],
        }),
      },
    );

    global.fetch = fetchMock as unknown as typeof fetch;

    render(<Submit />);

    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }));
    await waitFor(() => {
      expect(screen.getByText("Welcome. I'm Cove.")).not.toBeNull();
    });

    fireEvent.change(screen.getByPlaceholderText("Write something"), {
      target: { value: "Please help me finish this letter." },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit a response/i }));

    await waitFor(() => {
      expect(screen.getByText("Keep a way back to your letter")).not.toBeNull();
    });

    fireEvent.click(screen.getByRole("button", { name: "Release without protection" }));
    await waitFor(() => {
      expect(screen.getByText("Release without protection?")).not.toBeNull();
    });

    fireEvent.click(
      screen.getByRole("button", {
        name: "I understand, release the letter without protection",
      }),
    );

    await waitFor(() => {
      expect(screen.getByText("Your letter has been released")).not.toBeNull();
    });

    const supabaseCall = fetchMock.mock.calls.find((entry) => entry[0] === "/api/supabase");
    expect(supabaseCall).toBeDefined();
    const supabaseBody = JSON.parse(String(supabaseCall?.[1]?.body));
    expect(supabaseBody.owner_passphrase).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Return to conversation" }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Write something")).not.toBeNull();
    });
  });
});
