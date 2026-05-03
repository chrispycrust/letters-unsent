import { render, screen } from "@testing-library/react"
import { fireEvent, waitFor } from "@testing-library/react"
import LetterPage from "@/app/letters/[letterId]/page"
import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"

describe("Single letter page", () => {
  const originalFetch = global.fetch
  const originalSupabaseApiUrl = process.env.SUPABASE_API_URL
  const originalMatchMedia = window.matchMedia

  function mockViewport({ isMobile }: { isMobile: boolean }) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: jest.fn().mockImplementation((query: string) => ({
        matches: isMobile ? query.includes("max-width") : !query.includes("max-width"),
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    })
  }

  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
    process.env.SUPABASE_API_URL = "http://localhost/api/supabase"
  })

  afterEach(() => {
    global.fetch = originalFetch
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: originalMatchMedia,
    })
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
    expect(screen.getByText("Is this letter yours?")).not.toBeNull()
    const contextualTag = document.querySelector(".contextual-tags-container")
    expect(contextualTag?.textContent?.trim()).toBe("Friend · Reflective")
    expect(screen.getByText("AI generated")).not.toBeNull()
  })

  it("switches from the letter view to the inline edit form after owner edit", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          letter: [
            {
              id: "10",
              content: "This is the full letter body.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
              updated_at: null,
              relationship_type: "Friend",
              emotional_tone: "Reflective",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "You own this letter - manage it here." })).not.toBeNull()
    })

    fireEvent.click(screen.getByRole("button", { name: "You own this letter - manage it here." }))
    fireEvent.click(screen.getByRole("button", { name: "Edit" }))

    await waitFor(() => {
      expect(screen.getByLabelText("Letter content")).not.toBeNull()
    })

    const letterBody = screen.getByLabelText("Letter content") as HTMLTextAreaElement
    const recipientInput = screen.getByLabelText("Intended recipient") as HTMLInputElement
    const authorInput = screen.getByLabelText("Author name") as HTMLInputElement

    expect(letterBody.value).toBe(
      "This is the full letter body.",
    )
    expect(recipientInput.value).toBe("Sam")
    expect(authorInput.value).toBe("Casey")
    expect(recipientInput.className).toContain("letter-edit-recipient-input")
    expect(authorInput.className).toContain("letter-edit-author-input")
    expect(letterBody.className).toContain("letter-edit-content-input")
    expect(letterBody.className).not.toContain("dashed")

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))

    expect(screen.queryByText("You are editing this letter.")).toBeNull()
    expect(screen.getByRole("button", { name: "You own this letter - manage it here." })).not.toBeNull()
  })

  it("keeps desktop edit controls reachable in a sticky anchored pocket", async () => {
    mockViewport({ isMobile: false })
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          letter: [
            {
              id: "10",
              content: "This is the full letter body.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
              updated_at: null,
              relationship_type: "Friend",
              emotional_tone: "Reflective",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    const manageButton = await screen.findByRole("button", { name: "You own this letter - manage it here." })
    fireEvent.click(manageButton)
    fireEvent.click(screen.getByRole("button", { name: "Edit" }))

    const pocket = await screen.findByTestId("desktop-edit-pocket")
    expect(pocket.className).toContain("owner-edit-pocket")
    expect(pocket.className).toContain("is-sticky")
    expect(pocket.getAttribute("data-pocket-state")).toBe("expanded")
    expect(screen.queryByTestId("owner-side-rail")).toBeNull()
    expect(screen.getByRole("button", { name: "Save changes" })).not.toBeNull()
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeNull()
  })

  it("opens the mobile bottom sheet from the unverified owner trigger", async () => {
    mockViewport({ isMobile: true })
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
            updated_at: null,
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

    fireEvent.click(screen.getByRole("button", { name: "Is this letter yours?" }))

    const sheet = screen.getByRole("dialog", { name: "Owner actions" })
    expect(sheet.getAttribute("data-sheet-mode")).toBe("open-unverified")
    expect(screen.getByLabelText("Token")).not.toBeNull()
  })

  it("lets the mobile bottom sheet snap fuller and dismiss", async () => {
    mockViewport({ isMobile: true })
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
            updated_at: null,
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

    fireEvent.click(screen.getByRole("button", { name: "Is this letter yours?" }))
    const sheet = screen.getByRole("dialog", { name: "Owner actions" })

    fireEvent.click(screen.getByRole("button", { name: "Expand or collapse owner actions" }))
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("dialog", { name: "Owner actions" })).toBeNull()
  })

  it("opens verified mobile owner actions after auto-verification", async () => {
    mockViewport({ isMobile: true })
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          letter: [
            {
              id: "10",
              content: "This is the full letter body.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
              updated_at: null,
              relationship_type: "Friend",
              emotional_tone: "Reflective",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    const manageButton = await screen.findByRole("button", { name: "You own this letter - manage it here." })
    fireEvent.click(manageButton)

    const sheet = screen.getByRole("dialog", { name: "Owner actions" })
    expect(sheet.getAttribute("data-sheet-mode")).toBe("open-verified")
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull()
    expect(screen.getByRole("button", { name: "Remove" })).not.toBeNull()
  })

  it("updates mobile sheet content in place after token verification", async () => {
    mockViewport({ isMobile: true })
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          letter: [
            {
              id: "10",
              content: "This is the full letter body.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
              updated_at: null,
              relationship_type: "Friend",
              emotional_tone: "Reflective",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    fireEvent.click(screen.getByRole("button", { name: "Is this letter yours?" }))
    fireEvent.change(screen.getByLabelText("Token"), {
      target: { value: "quiet-sage-morning" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))

    await waitFor(() => {
      expect(screen.getByRole("dialog", { name: "Owner actions" }).getAttribute("data-sheet-mode")).toBe(
        "open-verified",
      )
    })
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull()
  })

  it("shows mobile Save and Cancel actions only during edit mode", async () => {
    mockViewport({ isMobile: true })
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          letter: [
            {
              id: "10",
              content: "This is the full letter body.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
              updated_at: null,
              relationship_type: "Friend",
              emotional_tone: "Reflective",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    const manageButton = await screen.findByRole("button", { name: "You own this letter - manage it here." })
    fireEvent.click(manageButton)
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Edit" }))
    const sheet = await screen.findByRole("dialog", { name: "Owner actions" })

    expect(sheet.getAttribute("data-sheet-mode")).toBe("editing")
    expect(screen.getByRole("button", { name: "Save changes" })).not.toBeNull()
    expect(screen.getByRole("button", { name: "Cancel" })).not.toBeNull()
  })

  it("normalises numeric API ids before auto-verifying the stored token", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          letter: [
            {
              id: 10,
              content: "This is the full letter body.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
              updated_at: null,
              relationship_type: "Friend",
              emotional_tone: "Reflective",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    const verificationBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body))
    expect(verificationBody.letterId).toBe("10")
    expect(window.localStorage.getItem(getLetterPassphraseStorageKey("10"))).toBe("saved-token")
  })

  it("normalises numeric API ids before manually verifying a typed token", async () => {
    const fetchMock = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          letter: [
            {
              id: 10,
              content: "This is the full letter body.",
              intended_recipient: "Sam",
              author_name: "Casey",
              created_at: "2026-01-19T00:00:00.000Z",
              updated_at: null,
              relationship_type: "Friend",
              emotional_tone: "Reflective",
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    fireEvent.click(screen.getByRole("button", { name: "Is this letter yours?" }))
    fireEvent.change(screen.getByLabelText("Token"), {
      target: { value: "quiet-sage-morning" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
    })

    const verificationBody = JSON.parse(String(fetchMock.mock.calls[1][1]?.body))
    expect(verificationBody).toEqual({
      letterId: "10",
      owner_passphrase: "quiet-sage-morning",
    })
    expect(window.localStorage.getItem(getLetterPassphraseStorageKey("10"))).toBe("quiet-sage-morning")
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
