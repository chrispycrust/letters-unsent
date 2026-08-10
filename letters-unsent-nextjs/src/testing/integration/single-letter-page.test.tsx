import { act, render, screen, within } from "@testing-library/react"
import { fireEvent, waitFor } from "@testing-library/react"
import LetterPage from "@/app/letters/[letterId]/page"
import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"

describe("Single letter page", () => {
  const originalFetch = global.fetch
  const originalSupabaseApiUrl = process.env.SUPABASE_API_URL
  const originalMatchMedia = window.matchMedia
  const originalIntersectionObserver = window.IntersectionObserver
  let intersectionObserverCallback: IntersectionObserverCallback | null = null

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

  function mockIntersectionObserver() {
    intersectionObserverCallback = null

    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: jest.fn((callback: IntersectionObserverCallback) => {
        intersectionObserverCallback = callback

        return {
          observe: jest.fn(),
          unobserve: jest.fn(),
          disconnect: jest.fn(),
          takeRecords: jest.fn(),
        }
      }),
    })
  }

  function setTopOwnerControlsIntersecting(isIntersecting: boolean) {
    if (!intersectionObserverCallback) {
      throw new Error("IntersectionObserver callback was not registered.")
    }

    act(() => {
      intersectionObserverCallback!(
        [{ isIntersecting } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
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
    Object.defineProperty(window, "IntersectionObserver", {
      writable: true,
      value: originalIntersectionObserver,
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
    expect(screen.getByText("AI gen")).not.toBeNull()
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

    fireEvent.click(screen.getByRole("button", { name: "Stop editing" }))

    expect(screen.queryByText("You are editing this letter.")).toBeNull()
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull()
    expect(screen.getByRole("button", { name: "Remove" })).not.toBeNull()
    expect(screen.getByRole("button", { name: "Hide controls" })).not.toBeNull()
  })

  it("keeps scroll stable when typing in a focused long edit textarea", async () => {
    const originalBodyScrollLeft = Object.getOwnPropertyDescriptor(document.body, "scrollLeft")
    const originalBodyScrollTop = Object.getOwnPropertyDescriptor(document.body, "scrollTop")
    Object.defineProperty(document.body, "scrollLeft", {
      configurable: true,
      writable: true,
      value: 0,
    })
    Object.defineProperty(document.body, "scrollTop", {
      configurable: true,
      writable: true,
      value: 1200,
    })

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

    try {
      const page = await LetterPage({
        params: Promise.resolve({ letterId: "10" }),
      })
      render(page)

      await waitFor(() => {
        expect(screen.getByRole("button", { name: "You own this letter - manage it here." })).not.toBeNull()
      })

      fireEvent.click(screen.getByRole("button", { name: "You own this letter - manage it here." }))
      fireEvent.click(screen.getByRole("button", { name: "Edit" }))

      const letterBody = await screen.findByLabelText("Letter content") as HTMLTextAreaElement
      Object.defineProperty(letterBody, "offsetHeight", {
        configurable: true,
        value: 2400,
      })
      Object.defineProperty(letterBody, "scrollHeight", {
        configurable: true,
        value: 2600,
      })

      letterBody.focus()
      fireEvent.change(letterBody, {
        target: { value: `${letterBody.value}\nA small edit.` },
      })

      await waitFor(() => {
        expect(letterBody.style.height).toBe("2600px")
      })
      expect(document.body.scrollLeft).toBe(0)
      expect(document.body.scrollTop).toBe(1200)
    } finally {
      if (originalBodyScrollLeft) {
        Object.defineProperty(document.body, "scrollLeft", originalBodyScrollLeft)
      } else {
        delete (document.body as HTMLElement & { scrollLeft?: number }).scrollLeft
      }

      if (originalBodyScrollTop) {
        Object.defineProperty(document.body, "scrollTop", originalBodyScrollTop)
      } else {
        delete (document.body as HTMLElement & { scrollTop?: number }).scrollTop
      }
    }
  })

  it("keeps the letter view visible while edit token verification is pending", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    let resolveEditVerification: ((response: { ok: boolean; json: () => Promise<unknown> }) => void) | undefined
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
      .mockImplementationOnce(async () => new Promise((resolve) => {
        resolveEditVerification = resolve as (response: { ok: boolean; json: () => Promise<unknown> }) => void
      }))
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    const manageButton = await screen.findByRole("button", { name: "You own this letter - manage it here." })
    fireEvent.click(manageButton)
    fireEvent.click(screen.getByRole("button", { name: "Edit" }))

    expect(screen.getByRole("button", { name: "Checking your token..." })).not.toBeNull()
    expect(screen.getByText("This is the full letter body.")).not.toBeNull()
    expect(screen.queryByLabelText("Letter content")).toBeNull()

    await act(async () => {
      resolveEditVerification?.({
        ok: true,
        json: async () => ({ success: true, verified: true }),
      })
    })

    await waitFor(() => {
      expect(screen.getByLabelText("Letter content")).not.toBeNull()
    })
  })

  it("keeps top controls and activates duplicate desktop owner rail actions after scroll", async () => {
    mockViewport({ isMobile: false })
    mockIntersectionObserver()
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

    const sideRail = await screen.findByTestId("owner-side-rail")
    const topControlsBeforeManaging = document.querySelector(".single-letter-owner-top-control")
    expect(topControlsBeforeManaging).not.toBeNull()
    await waitFor(() => {
      expect(
        within(topControlsBeforeManaging as HTMLElement).getByRole("button", {
          name: "You own this letter - manage it here.",
        }),
      ).not.toBeNull()
    })
    expect(
      within(sideRail).queryByRole("button", {
        name: "You own this letter - manage it here.",
      }),
    ).toBeNull()

    setTopOwnerControlsIntersecting(false)

    const manageButton = await within(sideRail).findByRole("button", {
      name: "You own this letter - manage it here.",
    })

    fireEvent.click(manageButton)
    expect(within(topControlsBeforeManaging as HTMLElement).getByRole("button", { name: "Edit" })).not.toBeNull()
    expect(within(topControlsBeforeManaging as HTMLElement).getByRole("button", { name: "Remove" })).not.toBeNull()
    expect(within(topControlsBeforeManaging as HTMLElement).getByRole("button", { name: "Hide controls" })).not.toBeNull()
    expect(within(sideRail).getByRole("button", { name: "Edit" })).not.toBeNull()
    expect(within(sideRail).getByRole("button", { name: "Remove" })).not.toBeNull()
    expect(within(sideRail).getByRole("button", { name: "Hide controls" })).not.toBeNull()

    fireEvent.click(within(sideRail).getByRole("button", { name: "Edit" }))

    await waitFor(() => {
      expect(within(topControlsBeforeManaging as HTMLElement).getByText("You are editing this letter.")).not.toBeNull()
    })

    const layout = screen.getByTestId("single-letter-layout")
    const balanceRail = screen.getByTestId("owner-balance-rail")

    expect(layout.className).toContain("single-letter-container")
    expect(balanceRail.getAttribute("aria-hidden")).toBe("true")
    const topControls = document.querySelector(".single-letter-owner-top-control")
    expect(topControls).not.toBeNull()
    expect(within(topControls as HTMLElement).getByText("You are editing this letter.")).not.toBeNull()
    expect(within(topControls as HTMLElement).getByRole("button", { name: "Save changes" })).not.toBeNull()
    expect(within(topControls as HTMLElement).getByRole("button", { name: "Stop editing" })).not.toBeNull()

    await waitFor(() => {
      expect(within(sideRail).getByTestId("desktop-edit-pocket")).not.toBeNull()
    })

    const pocket = within(sideRail).getByTestId("desktop-edit-pocket")
    expect(pocket.className).toContain("owner-edit-pocket")
    expect(pocket.className).toContain("is-sticky")
    expect(pocket.getAttribute("data-pocket-state")).toBe("visible")
    expect(within(sideRail).getByText("You are editing this letter.")).not.toBeNull()
    expect(within(sideRail).getByRole("button", { name: "Save changes" })).not.toBeNull()
    expect(within(sideRail).getByRole("button", { name: "Stop editing" })).not.toBeNull()
    expect(within(sideRail).queryByRole("button", { name: "Editing" })).toBeNull()
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
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")
    expect(screen.getByRole("button", { name: "Minimise owner controls" }).getAttribute("aria-expanded")).toBe("true")
    expect(screen.getByLabelText("Token")).not.toBeNull()
  })

  it("preserves a manual token while minimised and resets it when verification is cancelled", async () => {
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
    const tokenInput = screen.getByLabelText("Token") as HTMLInputElement
    fireEvent.change(tokenInput, { target: { value: "draft-token" } })

    fireEvent.click(screen.getByRole("button", { name: "Minimise owner controls" }))
    expect(sheet.getAttribute("data-sheet-snap")).toBe("compact")

    fireEvent.click(screen.getByRole("button", { name: "Expand owner controls" }))
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")
    expect(tokenInput.value).toBe("draft-token")

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }))
    expect(screen.queryByRole("dialog", { name: "Owner actions" })).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Is this letter yours?" }))
    expect((screen.getByLabelText("Token") as HTMLInputElement).value).toBe("")
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

    const sheet = await screen.findByRole("dialog", { name: "Owner actions" })
    expect(sheet.getAttribute("data-sheet-mode")).toBe("open-verified-actions")
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull()
    expect(screen.getByRole("button", { name: "Remove" })).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Hide controls" }))

    expect(sheet.getAttribute("data-sheet-snap")).toBe("compact")
    expect(screen.getByRole("button", { name: "Expand owner controls" })).not.toBeNull()
    expect(screen.queryByRole("button", { name: "Edit" })).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Expand owner controls" }))
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull()
  })

  it("keeps the mobile sheet closed when a stored token fails automatic verification", async () => {
    mockViewport({ isMobile: true })
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "expired-token")
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
        ok: false,
        status: 401,
        json: async () => ({ success: false, code: "INVALID_PASSPHRASE" }),
      })
    global.fetch = fetchMock as unknown as typeof fetch

    const page = await LetterPage({
      params: Promise.resolve({ letterId: "10" }),
    })
    render(page)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2)
      expect(window.localStorage.getItem(getLetterPassphraseStorageKey("10"))).toBeNull()
    })

    expect(screen.queryByRole("dialog", { name: "Owner actions" })).toBeNull()
    expect(screen.getByRole("button", { name: "Is this letter yours?" })).not.toBeNull()
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
    const sheet = screen.getByRole("dialog", { name: "Owner actions" })
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")
    fireEvent.change(screen.getByLabelText("Token"), {
      target: { value: "quiet-sage-morning" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))

    await waitFor(() => {
      expect(sheet.getAttribute("data-sheet-mode")).toBe("open-verified-actions")
    })
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull()
  })

  it("keeps the mobile sheet full while entering and leaving edit mode", async () => {
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

    const sheet = await screen.findByRole("dialog", { name: "Owner actions" })
    expect(sheet.getAttribute("data-sheet-mode")).toBe("open-verified-actions")
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull()

    fireEvent.click(screen.getByRole("button", { name: "Edit" }))

    await waitFor(() => {
      expect(sheet.getAttribute("data-sheet-mode")).toBe("editing")
    })
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")
    expect(screen.getByRole("button", { name: "Save changes" })).not.toBeNull()
    fireEvent.click(screen.getByRole("button", { name: "Stop editing" }))

    await waitFor(() => {
      expect(sheet.getAttribute("data-sheet-mode")).toBe("open-verified-actions")
    })
    expect(sheet.getAttribute("data-sheet-snap")).toBe("full")
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull()
    expect(screen.queryByRole("button", { name: "Save changes" })).toBeNull()
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
