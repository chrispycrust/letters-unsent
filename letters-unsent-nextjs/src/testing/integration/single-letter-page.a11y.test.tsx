import { beforeEach, afterEach, afterAll, describe, expect, it, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import SingleLetterLayout from "@/app/letters/[letterId]/layout"
import LetterPage from "@/app/letters/[letterId]/page"
import LetterEditForm from "@/components/LetterManagement/LetterEditForm"

type MockFetchResponse = {
  ok: boolean
  json: () => Promise<unknown>
}

function mockFetchOnce(response: MockFetchResponse) {
  return jest.fn(async () => response)
}

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
    const fetchMock = mockFetchOnce({
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
    render(<SingleLetterLayout>{page}</SingleLetterLayout>)

    expect(screen.getByRole("heading", { level: 1, name: "Letter" })).not.toBeNull()
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 2, name: "Sam" })).not.toBeNull()
    expect(screen.getByText("AI generated")).not.toBeNull()
    expect(screen.getByText("This is a single letter body.")).not.toBeNull()

    const date = document.querySelector(".single-letter-date")
    expect(Boolean(date?.textContent?.trim())).toBe(true)
  })

  it("does not render an empty heading when recipient is missing", async () => {
    const fetchMock = mockFetchOnce({
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
    render(<SingleLetterLayout>{page}</SingleLetterLayout>)

    expect(screen.getByRole("heading", { level: 1, name: "Letter" })).not.toBeNull()
    expect(screen.queryByRole("heading", { level: 2 })).toBeNull()
    expect(screen.getByText("No recipient letter content.")).not.toBeNull()
  })

  it("keeps the editable recipient field out of the heading structure", () => {
    render(
      <LetterEditForm
        letterId="10"
        formId="letter-edit-form-10"
        ownerPassphrase="saved-token"
        initialLetter={{
          content: "This is a single letter body.",
          intended_recipient: "Sam",
          author_name: "Casey",
        }}
        initialScrollPosition={null}
        isSaving={false}
        onSavingChange={jest.fn()}
        onSendingFeedback={jest.fn()}
      />,
    )

    const recipientInput = screen.getByLabelText("Intended recipient")
    expect(recipientInput.closest("h1, h2, h3, h4, h5, h6")).toBeNull()
    expect(recipientInput.parentElement?.className).toContain("letter-edit-recipient-heading")
  })
})
