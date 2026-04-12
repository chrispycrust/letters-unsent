import { beforeEach, afterEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import LetterOwnerArea from "@/components/LetterManagement/LetterOwnerArea"
import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"

const mockPush = (globalThis as { __mockRouterPush?: jest.Mock }).__mockRouterPush as jest.Mock

type MockFetchResponse = {
  ok: boolean
  status?: number
  json: () => Promise<unknown>
}

function mockFetchSequence(...responses: MockFetchResponse[]) {
  const queue = [...responses]

  return jest.fn(async (..._args: unknown[]) => {
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

describe("Single letter owner area", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("renders subtle prompt when unverified", () => {
    render(<LetterOwnerArea letterId="10" />)
    expect(screen.getByRole("button", { name: "Do you have the token for this letter?" })).not.toBeNull()
  })

  it("auto-verifies from localStorage token and shows verified owner actions", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence({
      ok: true,
      json: async () => ({ success: true, verified: true }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<LetterOwnerArea letterId="10" />)

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/supabase/singleLetter",
        expect.objectContaining({
          method: "POST",
        }),
      )
    })

    await waitFor(() => {
      expect(screen.getByText("For this letter")).not.toBeNull()
    })
    expect(screen.getByRole("link", { name: "Edit" }).getAttribute("href")).toBe("/letters/10/edit")
    expect(screen.getByRole("button", { name: "Remove" })).not.toBeNull()
  })

  it("shows retry message after invalid token verification", async () => {
    const fetchMock = mockFetchSequence({
      ok: false,
      status: 401,
      json: async () => ({ success: false, code: "INVALID_PASSPHRASE" }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<LetterOwnerArea letterId="10" />)
    fireEvent.click(screen.getByRole("button", { name: "Do you have the token for this letter?" }))

    const input = screen.getByLabelText("Token") as HTMLInputElement
    fireEvent.change(input, { target: { value: "wrong-token" } })
    fireEvent.click(screen.getByRole("button", { name: "Confirm token" }))

    await waitFor(() => {
      expect(screen.getByText("The token doesn’t match this letter. Please try again.")).not.toBeNull()
    })

    expect(input.value).toBe("")
  })

  it("shows temporary lockout message after repeated invalid attempts", async () => {
    const fetchMock = mockFetchSequence(
      {
        ok: false,
        status: 401,
        json: async () => ({ success: false, code: "INVALID_PASSPHRASE" }),
      },
      {
        ok: false,
        status: 401,
        json: async () => ({ success: false, code: "INVALID_PASSPHRASE" }),
      },
      {
        ok: false,
        status: 401,
        json: async () => ({ success: false, code: "INVALID_PASSPHRASE" }),
      },
      {
        ok: false,
        status: 401,
        json: async () => ({ success: false, code: "INVALID_PASSPHRASE" }),
      },
      {
        ok: false,
        status: 429,
        json: async () => ({ success: false, code: "VERIFICATION_RATE_LIMITED" }),
      },
    )
    global.fetch = fetchMock as unknown as typeof fetch

    render(<LetterOwnerArea letterId="10" />)
    fireEvent.click(screen.getByRole("button", { name: "Do you have the token for this letter?" }))

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const input = screen.getByLabelText("Token")
      fireEvent.change(input, { target: { value: `wrong-token-${attempt}` } })
      fireEvent.click(screen.getByRole("button", { name: "Confirm token" }))
      await waitFor(() => {
        expect(fetchMock).toHaveBeenCalledTimes(attempt)
      })
    }

    await waitFor(() => {
      expect(
        screen.getByText("Too many attempts in a short time. Please wait a moment, then try again."),
      ).not.toBeNull()
    })
  })

  it("opens delete modal and does not dismiss on outside click", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence({
      ok: true,
      json: async () => ({ success: true, verified: true }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<LetterOwnerArea letterId="10" />)

    await waitFor(() => {
      expect(screen.getByText("For this letter")).not.toBeNull()
    })

    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    expect(screen.getByRole("heading", { name: "Remove my letter from the archive" })).not.toBeNull()

    fireEvent.click(screen.getByTestId("delete-confirmation-overlay"))
    expect(screen.getByRole("heading", { name: "Remove my letter from the archive" })).not.toBeNull()
  })

  it("shows loading and unauthorized delete message when server rejects proof", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: async () => ({ success: true, verified: true }),
      },
      {
        ok: false,
        status: 401,
        json: async () => ({ success: false, code: "INVALID_PASSPHRASE" }),
      },
    )
    global.fetch = fetchMock as unknown as typeof fetch

    render(<LetterOwnerArea letterId="10" />)

    await waitFor(() => {
      expect(screen.getByText("For this letter")).not.toBeNull()
    })

    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    fireEvent.click(screen.getByRole("button", { name: "I understand, please remove my letter" }))
    expect(screen.getByRole("button", { name: "Removing..." })).not.toBeNull()

    await waitFor(() => {
      expect(screen.getByText("We couldn’t verify your token.")).not.toBeNull()
    })
  })

  it("shows delete success then redirects home", async () => {
    jest.useFakeTimers()
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence(
      {
        ok: true,
        json: async () => ({ success: true, verified: true }),
      },
      {
        ok: true,
        json: async () => ({ success: true }),
      },
    )
    global.fetch = fetchMock as unknown as typeof fetch

    render(<LetterOwnerArea letterId="10" />)

    await waitFor(() => {
      expect(screen.getByText("For this letter")).not.toBeNull()
    })

    fireEvent.click(screen.getByRole("button", { name: "Remove" }))
    fireEvent.click(screen.getByRole("button", { name: "I understand, please remove my letter" }))

    await waitFor(() => {
      expect(screen.getByText("Your letter has been removed from the archive.")).not.toBeNull()
    })

    jest.advanceTimersByTime(1200)

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/")
    })
  })
})
