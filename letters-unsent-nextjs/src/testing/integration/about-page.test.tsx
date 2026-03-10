import { fireEvent, render, screen } from "@testing-library/react"
import About from "@/app/about/page"

describe("About page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders section headings and toggles", () => {
    render(<About />)

    expect(screen.getByText("About Letters Unsent")).not.toBeNull()
    expect(document.querySelector('button[aria-controls="background-panel"]')).not.toBeNull()
    expect(document.querySelector('button[aria-controls="guidelines-panel"]')).not.toBeNull()
    expect(document.querySelector('button[aria-controls="privacy-panel"]')).not.toBeNull()
    expect(document.querySelector('button[aria-controls="roadmap-panel"]')).not.toBeNull()
    expect(document.querySelector('button[aria-controls="contact-panel"]')).not.toBeNull()
  })

  it("opens and closes the Background panel", () => {
    render(<About />)

    const backgroundPanel = document.getElementById("background-panel") as HTMLDivElement
    const backgroundToggle = document.querySelector(
      'button[aria-controls="background-panel"]',
    ) as HTMLButtonElement

    expect(backgroundPanel.hidden).toBe(true)

    fireEvent.click(backgroundToggle)
    expect(backgroundPanel.hidden).toBe(false)

    fireEvent.click(backgroundToggle)
    expect(backgroundPanel.hidden).toBe(true)
  })

  it("opens Privacy panel from the guidelines anchor link", () => {
    render(<About />)

    const guidelinesToggle = document.querySelector(
      'button[aria-controls="guidelines-panel"]',
    ) as HTMLButtonElement
    fireEvent.click(guidelinesToggle)

    const privacyPanel = document.getElementById("privacy-panel") as HTMLDivElement
    expect(privacyPanel.hidden).toBe(true)

    fireEvent.click(screen.getByRole("link", { name: "See why here" }))
    expect(privacyPanel.hidden).toBe(false)
  })
})
