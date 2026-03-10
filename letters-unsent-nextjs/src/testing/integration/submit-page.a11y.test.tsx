import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import Submit from "@/app/submit/page"

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

    const textarea = screen.getByPlaceholderText("Write something") as HTMLTextAreaElement
    const submitButton = screen.getByRole("button", {
      name: "click to submit a response to Cove (AI presence)",
    })
    const resizeButton = screen.getByRole("button", {
      name: "click to maximise the text area",
    })

    expect(textarea.required).toBe(true)
    expect(submitButton).not.toBeNull()
    expect(resizeButton).not.toBeNull()
  })
})
