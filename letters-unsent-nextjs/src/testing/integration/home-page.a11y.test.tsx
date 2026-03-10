import { render, screen, waitFor } from "@testing-library/react"
import Home from "@/app/page"

describe("Home page accessibility basics", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("renders accessible footer navigation and letter links", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        letters: [
          {
            id: "10",
            content: "This is a letter that appears in the archive.",
            intended_recipient: "Sam",
            relationship_type: null,
            emotional_tone: null,
          },
        ],
      }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByRole("link", { name: /Sam/i })).not.toBeNull()
    })

    expect(screen.getByRole("contentinfo")).not.toBeNull()

    const releaseLink = screen.getByRole("link", { name: "Release A Letter" })
    const aboutLink = screen.getByRole("link", { name: "About & Contact" })
    const letterLink = screen.getByRole("link", { name: /Sam/i })

    expect(releaseLink.getAttribute("href")).toBe("/submit")
    expect(aboutLink.getAttribute("href")).toBe("/about")
    expect(letterLink.getAttribute("href")).toBe("/10")
  })

  it("keeps empty state text visible to users and screen readers", async () => {
    const fetchMock = jest.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        letters: [],
      }),
    })
    global.fetch = fetchMock as unknown as typeof fetch

    render(<Home />)

    await waitFor(() => {
      expect(screen.getByText("No letters")).not.toBeNull()
    })
  })
})
