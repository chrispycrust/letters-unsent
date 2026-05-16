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

  return jest.fn(async () => {
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

function renderOwnerArea({
  isEditing = false,
  onEdit = jest.fn(),
  onCancelEdit = jest.fn(),
}: {
  isEditing?: boolean
  onEdit?: () => void
  onCancelEdit?: () => void
} = {}) {
  return render(
    <LetterOwnerArea
      letterId="10"
      isEditing={isEditing}
      editFormId="test-letter-edit-form"
      onEdit={onEdit}
      onCancelEdit={onCancelEdit}
    />,
  )
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
    renderOwnerArea()
    expect(screen.getByRole("button", { name: "Is this letter yours?" })).not.toBeNull()
  })

  it("renders editing status when parent edit state is active", () => {
    renderOwnerArea({ isEditing: true })
    expect(screen.getByText("You are editing this letter.")).not.toBeNull()
  })

  it("auto-verifies from localStorage token and shows verified owner actions", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence({
      ok: true,
      json: async () => ({ success: true, verified: true }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    renderOwnerArea()

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/supabase/singleLetter",
        expect.objectContaining({
          method: "POST",
        }),
      )
    })

    const manageButton = await screen.findByRole("button", { name: "You own this letter - manage it here." })
    fireEvent.click(manageButton)

    expect(screen.getByText(/For this letter/)).not.toBeNull()
    expect(screen.getByRole("button", { name: "Edit" })).not.toBeNull()
    expect(screen.getByRole("button", { name: "Remove" })).not.toBeNull()
  })

  it("passes edit intent to the parent when an edit handler is provided", async () => {
    window.localStorage.setItem(getLetterPassphraseStorageKey("10"), "saved-token")
    const fetchMock = mockFetchSequence({
      ok: true,
      json: async () => ({ success: true, verified: true }),
    })
    const onEdit = jest.fn()
    global.fetch = fetchMock as unknown as typeof fetch

    renderOwnerArea({ onEdit })

    const manageButton = await screen.findByRole("button", { name: "You own this letter - manage it here." })
    fireEvent.click(manageButton)
    fireEvent.click(screen.getByRole("button", { name: "Edit" }))

    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it("shows retry message after invalid token verification", async () => {
    const fetchMock = mockFetchSequence({
      ok: false,
      status: 401,
      json: async () => ({ success: false, code: "INVALID_PASSPHRASE" }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    renderOwnerArea()
    fireEvent.click(screen.getByRole("button", { name: "Is this letter yours?" }))

    const input = screen.getByLabelText("Token") as HTMLInputElement
    fireEvent.change(input, { target: { value: "wrong-token" } })
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))

    await waitFor(() => {
      expect(screen.getByText("The token doesn’t match this letter. Please try again.")).not.toBeNull()
    })

    expect(input.value).toBe("")
  })

  it("shows immediate feedback when confirming an empty token", () => {
    renderOwnerArea()
    fireEvent.click(screen.getByRole("button", { name: "Is this letter yours?" }))
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }))

    expect(screen.getByText("Enter your token first.")).not.toBeNull()
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

    renderOwnerArea()
    fireEvent.click(screen.getByRole("button", { name: "Is this letter yours?" }))

    for (let attempt = 1; attempt <= 5; attempt += 1) {
      const input = screen.getByLabelText("Token")
      fireEvent.change(input, { target: { value: `wrong-token-${attempt}` } })
      fireEvent.click(screen.getByRole("button", { name: "Confirm" }))
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

    renderOwnerArea()

    const manageButton = await screen.findByRole("button", { name: "You own this letter - manage it here." })
    fireEvent.click(manageButton)

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

    renderOwnerArea()

    const manageButton = await screen.findByRole("button", { name: "You own this letter - manage it here." })
    fireEvent.click(manageButton)

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

    renderOwnerArea()

    const manageButton = await screen.findByRole("button", { name: "You own this letter - manage it here." })
    fireEvent.click(manageButton)

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
