import { render, screen } from "@testing-library/react"
import Changelog from "@/app/changelog/page"

describe("Changelog page", () => {
  it("renders changelog heading and release entries", () => {
    render(<Changelog />)

    expect(screen.getByText("Changelog")).not.toBeNull()
    expect(screen.getByText("v1.0 - opening the cove to visitors")).not.toBeNull()
    expect(screen.getByText("v1.1 - helping visitors settle better")).not.toBeNull()
    expect(screen.getByText("Jan 5th 2026")).not.toBeNull()
    expect(screen.getByText("Jan 19th 2026")).not.toBeNull()
  })

  it("links to About guidelines", () => {
    render(<Changelog />)

    const aboutLink = screen.getByRole("link", { name: "guidelines stated here" })
    expect(aboutLink.getAttribute("href")).toBe("/about")
  })
})
