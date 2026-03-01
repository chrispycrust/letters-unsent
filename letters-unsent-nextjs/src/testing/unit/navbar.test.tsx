import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NavBar from "@/components/NavBar";

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("NavBar", () => {
  it("shows desktop navigation links on wide screens", async () => {
    setViewportWidth(900);
    render(<NavBar />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Release A Letter" })).not.toBeNull();
    });
    expect(screen.getByRole("link", { name: "About & Contact" })).not.toBeNull();
  });

  it("uses modal navigation on mobile and closes after selection", async () => {
    setViewportWidth(400);
    const { container } = render(<NavBar />);

    let openButton: Element | null = null;
    await waitFor(() => {
      openButton = container.querySelector(".button-change-modal");
      expect(openButton).not.toBeNull();
    });

    if (openButton) {
      fireEvent.click(openButton);
    }

    expect(screen.getByRole("link", { name: "Home" })).not.toBeNull();
    expect(screen.getByText(/Built with Next\.js/i)).not.toBeNull();

    const aboutLink = screen.getByRole("link", { name: "About & Contact" });
    fireEvent.click(aboutLink);
    expect(screen.queryByText(/Built with Next\.js/i)).toBeNull();
  });
});
