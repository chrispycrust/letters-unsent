import { render, screen } from "@testing-library/react"
import LetterPage from "@/app/[letterId]/page"

describe("Single letter page accessibility basics", () => {
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

  it("renders recipient as a heading and keeps readable metadata", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        letter: [
          {
            id: "10",
            content: "This is a single letter body.",
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

    expect(screen.getByRole("heading", { level: 2, name: "Sam" })).not.toBeNull()
    expect(screen.getByText("AI generated")).not.toBeNull()
    expect(screen.getByText("This is a single letter body.")).not.toBeNull()

    const date = document.querySelector(".single-letter-date")
    expect(Boolean(date?.textContent?.trim())).toBe(true)
  })

  it("does not render an empty heading when recipient is missing", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        letter: [
          {
            id: "30",
            content: "No recipient letter content.",
            intended_recipient: null,
            author_name: null,
            created_at: "2026-01-19T00:00:00.000Z",
            relationship_type: null,
            emotional_tone: null,
          },
        ],
      }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "30" }),
    })
    render(page)

    expect(screen.queryByRole("heading", { level: 2 })).toBeNull()
    expect(screen.getByText("No recipient letter content.")).not.toBeNull()
  })
})
