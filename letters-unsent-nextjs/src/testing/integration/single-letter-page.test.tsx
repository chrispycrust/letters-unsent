import { render, screen } from "@testing-library/react"
import LetterPage from "@/app/letters/[letterId]/page"

describe("Single letter page", () => {
  const originalFetch = global.fetch
  const originalSupabaseApiUrl = process.env.SUPABASE_API_URL

  beforeEach(() => {
    jest.clearAllMocks()
    process.env.SUPABASE_API_URL = "http://localhost/api/supabase"
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  afterAll(() => {
    process.env.SUPABASE_API_URL = originalSupabaseApiUrl
  })

  it("renders a fetched letter with recipient and tags", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        letter: [
          {
            id: "10",
            content: "This is the full letter body.",
            intended_recipient: "Sam",
            author_name: "Casey",
            created_at: "2026-01-19T00:00:00.000Z",
            relationship_type: "Friend",
            emotional_tone: "Reflective",
          },
        ],
      }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost/api/supabase/singleLetter?&letterId=10",
      { cache: "no-store" },
    )
    expect(screen.getByText("Sam")).not.toBeNull()
    expect(screen.getByText("This is the full letter body.")).not.toBeNull()
    expect(screen.getByText(/Casey/)).not.toBeNull()
    expect(screen.getByText("Do you have the token for this letter?")).not.toBeNull()
    const contextualTag = document.querySelector(".contextual-tags-container")
    expect(contextualTag?.textContent?.trim()).toBe("Friend · Reflective")
    expect(screen.getByText("AI generated")).not.toBeNull()
  })

  it("shows not-found when the API returns no letter", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ letter: [] }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "999" }),
    })
    render(page)

    expect(screen.getByText("Letter not found")).not.toBeNull()
  })

  it("shows API error message when response is not ok", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => ({ error: "Database timeout" }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    expect(screen.getByText("Database timeout")).not.toBeNull()
  })

  it("shows fallback error when failed response body is not JSON", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: false,
      json: async () => {
        throw new Error("invalid json")
      },
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    expect(screen.getByText("Couldn't load this letter")).not.toBeNull()
  })
})
