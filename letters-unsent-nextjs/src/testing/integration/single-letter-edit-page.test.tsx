import { afterAll, afterEach, beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import EditLetterPage from "@/app/letters/[letterId]/edit/page"
import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"

const mockPush = (globalThis as { __mockRouterPush?: jest.Mock }).__mockRouterPush as jest.Mock

type MockFetchResponse = {
  ok: boolean
  status?: number
  json: () => Promise<unknown>
}

type MockFetchCallArgs = [input: RequestInfo | URL, init?: RequestInit]

function mockFetchSequence(...responses: MockFetchResponse[]) {
  const queue = [...responses]

  return jest.fn(async (..._args: MockFetchCallArgs) => {
    const next = queue.shift()
    if (!next) {
      throw new Error("No mocked fetch response left in queue.")
    }

    return {
      ok: next.ok,
      status: next.status ?? (next.ok ? 200 : 500),
      json: next.json,
    }
  })
}

describe("Single letter edit page", () => {
  const originalFetch = global.fetch
  const originalSupabaseApiUrl = process.env.SUPABASE_API_URL

  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
    process.env.SUPABASE_API_URL = "http://localhost/api/supabase"
  })

  afterEach(() => {
    jest.useRealTimers()
    global.fetch = originalFetch
  })

  afterAll(() => {
    process.env.SUPABASE_API_URL = originalSupabaseApiUrl
  })

  it("renders editable fields with existing values after verification", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: async () => ({
          letter: [
            {
              id: "10",
              content: "Existing letter content.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
            },
          ],
        }),
      },
      {
        ok: true,
        json: async () => ({ success: true, verified: true }),
      },
    )
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await EditLetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    await waitFor(() => {
      expect(screen.getByLabelText("Letter content")).not.toBeNull()
    })

    expect((screen.getByLabelText("Letter content") as HTMLTextAreaElement).value).toBe(
      "Existing letter content.",
    )
    expect((screen.getByLabelText("Intended recipient") as HTMLInputElement).value).toBe("Sam")
    expect((screen.getByLabelText("Author name") as HTMLInputElement).value).toBe("Casey")
    expect(screen.getByRole("button", { name: "Save changes" })).not.toBeNull()
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeNull()
  })

  it("shows moderation rejection with guidelines link", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: async () => ({
          letter: [
            {
              id: "10",
              content: "Existing letter content.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
            },
          ],
        }),
      },
      {
        ok: true,
        json: async () => ({ success: true, verified: true }),
      },
      {
        ok: false,
        status: 422,
        json: async () => ({ success: false, code: "MODERATION_BLOCKED" }),
      },
    )
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await EditLetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    await waitFor(() => {
      expect(screen.getByLabelText("Letter content")).not.toBeNull()
    })

    fireEvent.change(screen.getByLabelText("Letter content"), {
      target: { value: "Updated content that should be rejected." },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))

    await waitFor(() => {
      expect(
        screen.getByText(
          "We couldn’t accept these changes under the archive’s safety guidelines.",
        ),
      ).not.toBeNull()
    })

    expect(
      screen.getByRole("link", {
        name: "Read the submission guidelines",
      }).getAttribute("href"),
    ).toBe("/about#submission-guidelines")
  })

  it("shows human review email guidance after repeated moderation rejection", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: async () => ({
          letter: [
            {
              id: "10",
              content: "Existing letter content.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
            },
          ],
        }),
      },
      {
        ok: true,
        json: async () => ({ success: true, verified: true }),
      },
      {
        ok: false,
        status: 422,
        json: async () => ({ success: false, code: "MODERATION_BLOCKED" }),
      },
      {
        ok: false,
        status: 422,
        json: async () => ({ success: false, code: "MODERATION_BLOCKED" }),
      },
    )
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await EditLetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    await waitFor(() => {
      expect(screen.getByLabelText("Letter content")).not.toBeNull()
    })

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
    await waitFor(() => {
      expect(
        screen.getByText(
          "We couldn’t accept these changes under the archive’s safety guidelines.",
        ),
      ).not.toBeNull()
    })

    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))
    await waitFor(() => {
      expect(
        screen.getByText(
          "If you believe this letter follows the guidelines, please email dear@letters-unsent.com for review.",
        ),
      ).not.toBeNull()
    })
  })

  it("shows success then routes back to single-letter page", async () => {
    jest.useFakeTimers()
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: async () => ({
          letter: [
            {
              id: "10",
              content: "Existing letter content.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
            },
          ],
        }),
      },
      {
        ok: true,
        json: async () => ({ success: true, verified: true }),
      },
      {
        ok: true,
        json: async () => ({
          success: true,
          data: [{ id: "10", content: "Updated content.", updated_at: "2026-04-03T00:00:00.000Z" }],
        }),
      },
    )
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await EditLetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    await waitFor(() => {
      expect(screen.getByLabelText("Letter content")).not.toBeNull()
    })

    fireEvent.change(screen.getByLabelText("Letter content"), {
      target: { value: "Updated content." },
    })
    fireEvent.click(screen.getByRole("button", { name: "Save changes" }))

    await waitFor(() => {
      expect(screen.getByText("Your changes have been saved.")).not.toBeNull()
    })

    jest.advanceTimersByTime(950)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/letters/10")
    })
  })
})
