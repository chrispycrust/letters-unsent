import { render, screen } from "@testing-library/react"
import Changelog from "@/app/changelog/page"

describe("Changelog page", () => {
  it("renders changelog heading and release entries", () => {
    render(<Changelog />)

    expect(screen.getByRole("heading", { level: 1, name: "Changelog" })).not.toBeNull()
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1)
    expect(screen.getByRole("heading", { level: 2, name: "v1.0 - opening the cove to visitors" })).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "v1.1 - helping visitors settle better" })).not.toBeNull()
    expect(screen.getByRole("heading", { level: 2, name: "v1.2 - releasing letters into the cove" })).not.toBeNull()
    expect(screen.getByText("Jan 5th 2026")).not.toBeNull()
    expect(screen.getByText("Jan 19th 2026")).not.toBeNull()
    expect(screen.getByText("Jul 26th 2026")).not.toBeNull()
  })

  it("links to About guidelines", () => {
    render(<Changelog />)

    const aboutLink = screen.getByRole("link", { name: "guidelines stated here" })
    expect(aboutLink.getAttribute("href")).toBe("/about")
  })
})
