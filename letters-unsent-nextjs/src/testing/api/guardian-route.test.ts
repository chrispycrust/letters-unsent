/** @jest-environment node */
import { beforeEach, afterAll, describe, expect, it, jest } from "@jest/globals"
import { POST } from "@/app/api/guardian/route"

type GuardianToolCall = {
  type: "function_call";
  name: string;
  arguments: string;
  call_id: string;
};

type GuardianResponse = {
  output_text: string;
  output: GuardianToolCall[];
};

const mockCreate = jest.fn<(...args: unknown[]) => Promise<GuardianResponse>>(
  async () => ({
    output_text: "",
    output: [],
  }),
);

jest.mock("openai", () => ({
  __esModule: true,
  default: function MockOpenAI() {
    return {
      responses: {
        create: (...args: unknown[]) => mockCreate(...args),
      },
    };
  },
}));

describe("/api/guardian route", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  it("returns release-ready payload and does not persist directly to supabase", async () => {
    const releasePayload = {
      content: "Letter content",
      intended_recipient: "Sam",
      author_name: "Casey",
    };

    mockCreate.mockResolvedValueOnce({
      output_text: "Your letter is ready.",
      output: [
        {
          type: "function_call",
          name: "prepare_letter_for_release",
          arguments: JSON.stringify(releasePayload),
          call_id: "call_1",
        },
      ],
    });

    const request = new Request("http://localhost/api/guardian/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        updatedConversation: [{ role: "user", content: "Please prepare this letter." }],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      output: "Your letter is ready.",
      releaseReady: true,
      letterPayload: releasePayload,
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it("returns releaseReady false when no release tool call is present", async () => {
    mockCreate.mockResolvedValueOnce({
      output_text: "Let's keep refining the letter.",
      output: [],
    });

    const request = new Request("http://localhost/api/guardian/", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        updatedConversation: [{ role: "user", content: "Not ready yet." }],
      }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      output: "Let's keep refining the letter.",
      releaseReady: false,
      letterPayload: null,
    });
  });
});
