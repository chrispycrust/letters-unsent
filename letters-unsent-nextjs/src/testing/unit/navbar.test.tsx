import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import NavBar from "@/components/NavBar";

const originalShowModal = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "showModal",
);
const originalClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "close",
);

function setViewportWidth(width: number) {
  Object.defineProperty(window, "innerWidth", {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event("resize"));
}

describe("NavBar", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function showModal(this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: function close(this: HTMLDialogElement) {
        this.removeAttribute("open");
        this.dispatchEvent(new Event("close"));
      },
    });
  });

  afterAll(() => {
    if (originalShowModal) {
      Object.defineProperty(
        HTMLDialogElement.prototype,
        "showModal",
        originalShowModal,
      );
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
    }

    if (originalClose) {
      Object.defineProperty(
        HTMLDialogElement.prototype,
        "close",
        originalClose,
      );
    } else {
      Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
    }
  });

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

    let openButton: HTMLButtonElement | null = null;
    await waitFor(() => {
      openButton = container.querySelector<HTMLButtonElement>(".button-change-modal");
      expect(openButton).not.toBeNull();
    });

    if (openButton) {
      openButton.focus();
      fireEvent.click(openButton);
    }

    const dialog = await screen.findByRole("dialog", { name: "Navigation menu" });
    const closeButton = dialog.querySelector<HTMLButtonElement>(
      "button.button-change-modal",
    );

    expect(dialog.hasAttribute("open")).toBe(true);
    expect(document.activeElement).toBe(closeButton);
    expect(screen.getByRole("link", { name: "Home" })).not.toBeNull();
    expect(screen.getByText(/Built with Next\.js/i)).not.toBeNull();

    const aboutLink = screen.getByRole("link", { name: "About & Contact" });
    aboutLink.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    fireEvent.click(aboutLink);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Navigation menu" })).toBeNull();
    });
    expect(document.activeElement).toBe(openButton);
  });
});
