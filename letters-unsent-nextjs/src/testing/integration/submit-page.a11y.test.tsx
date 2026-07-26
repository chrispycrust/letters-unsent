import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import SubmitLayout from "@/app/submit/layout"
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

  function renderSubmitRoute() {
    return render(
      <SubmitLayout>
        <Submit />
      </SubmitLayout>,
    )
  }

  it("renders a keyboard-focusable start button", () => {
    renderSubmitRoute()

    expect(screen.getByRole("heading", { level: 1, name: "Release a letter" })).not.toBeNull()
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)

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

    renderSubmitRoute()
    const coveStatus = screen.getByRole("status")
    expect(screen.getAllByRole("status")).toHaveLength(1)
    expect(coveStatus.textContent).toBe("")

    fireEvent.click(screen.getByRole("button", { name: "Start conversation" }))
    expect(coveStatus.textContent).toBe("Preparing a response.")

    await waitFor(() => {
      expect(coveStatus.textContent).toBe("Response ready.")
    })
    expect(
      document.querySelector(".guardian-panel .preserve-breaks")?.textContent
    ).toBe("Welcome. I'm Cove.")

    const textarea = screen.getByLabelText("Your message") as HTMLTextAreaElement
    const submitButton = screen.getByRole("button", {
      name: "Send message",
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
