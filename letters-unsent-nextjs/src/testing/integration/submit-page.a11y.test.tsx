import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import Submit from "@/app/submit/page"

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe("Submit page accessibility basics", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.localStorage.clear()
  })

  it("renders a keyboard-focusable start button", () => {
    render(<Submit />)

    const startButton = screen.getByRole("button", { name: "Start conversation" })
    startButton.focus()

    expect(document.activeElement).toBe(startButton)
  })

  it("exposes labelled controls when conversation starts", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ output: "Welcome. I'm Cove." }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<Submit />)
    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }))

    await waitFor(() => {
      expect(screen.getByText("Welcome. I'm Cove.")).not.toBeNull()
    })

    const textarea = screen.getByLabelText("Message to Cove") as HTMLTextAreaElement
    const submitButton = screen.getByRole("button", {
      name: "click to submit a response to Cove (AI presence)",
    })
    const resizeButton = screen.getByRole("button", {
      name: "Expand writing area",
    })

    expect(textarea.required).toBe(true)
    expect(textarea.placeholder).toBe("Write something")
    expect(submitButton).not.toBeNull()
    expect(resizeButton).not.toBeNull()
    expect(resizeButton.getAttribute("aria-controls")).toBe(textarea.id)
    expect(resizeButton.getAttribute("aria-expanded")).toBe("false")

    fireEvent.click(resizeButton)

    expect(screen.getByRole("button", {
      name: "Minimise writing area",
    }).getAttribute("aria-expanded")).toBe("true")
  })
})
