import { fireEvent, render, screen } from "@testing-library/react"
import About from "@/app/about/page"

describe("About page", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders section headings and toggles", () => {
    render(<About />)

    expect(screen.getByRole("heading", { level: 1, name: "About Letters Unsent" })).not.toBeNull()
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(screen.queryByRole("heading", { name: "A home for words never sent" })).toBeNull()
    expect(screen.getByText("A home for words never sent").tagName).toBe("P")
    expect(screen.getByRole("heading", { level: 2, name: "Background" })).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Submission Guidelines" })).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Privacy & Use" })).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Roadmap & Features" })).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "Contact" })).not.toBeNull()
    expect(document.querySelector("button h2")).toBeNull()

    const headingLevels = Array.from(document.querySelectorAll("h1, h2, h3, h4, h5, h6"))
      .map((heading) => Number(heading.tagName.slice(1)))
    expect(headingLevels.every((level, index) => index === 0 || level <= headingLevels[index - 1] + 1))
      .toBe(true)

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

    fireEvent.click(screen.getByRole("link", { name: "Learn more about ownership tokens" }))
    expect(privacyPanel.hidden).toBe(false)
  })
})
