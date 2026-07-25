import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { usePathname } from "next/navigation";
import NavBar from "@/components/NavBar";

jest.mock("next/navigation", () => ({
  usePathname: jest.fn(),
}));

const mockUsePathname = usePathname as jest.MockedFunction<typeof usePathname>;

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
  beforeEach(() => {
    mockUsePathname.mockReturnValue("/");
  });

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
    mockUsePathname.mockReturnValue("/about");
    setViewportWidth(900);
    render(<NavBar />);

    await waitFor(() => {
      expect(screen.getByRole("link", { name: "Release A Letter" })).not.toBeNull();
    });
    const releaseLink = screen.getByRole("link", { name: "Release A Letter" });
    const aboutLink = screen.getByRole("link", { name: "About & Contact" });

    expect(releaseLink.hasAttribute("aria-current")).toBe(false);
    expect(aboutLink.getAttribute("aria-current")).toBe("page");
  });

  it("uses modal navigation on mobile and closes after selection", async () => {
    mockUsePathname.mockReturnValue("/submit");
    setViewportWidth(400);
    render(<NavBar />);

    const openButton = await screen.findByRole("button", { name: "Open menu" });
    const openIcon = openButton.querySelector("svg");

    expect(openButton.getAttribute("aria-expanded")).toBe("false");
    expect(openIcon?.getAttribute("aria-hidden")).toBe("true");
    expect(openIcon?.getAttribute("focusable")).toBe("false");

    openButton.focus();
    fireEvent.click(openButton);

    const dialog = await screen.findByRole("dialog", { name: "Navigation menu" });
    const closeButton = screen.getByRole("button", { name: "Close menu" });
    const closeIcon = closeButton.querySelector("svg");

    expect(openButton.getAttribute("aria-expanded")).toBe("true");
    expect(dialog.hasAttribute("open")).toBe(true);
    expect(document.activeElement).toBe(closeButton);
    expect(closeIcon?.getAttribute("aria-hidden")).toBe("true");
    expect(closeIcon?.getAttribute("focusable")).toBe("false");
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByRole("link", { name: "Home" })).not.toBeNull();
    expect(
      screen.getByRole("link", { name: "Release A Letter" }).getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getByRole("link", { name: "Home" }).hasAttribute("aria-current")).toBe(false);
    expect(screen.getByText(/Built with Next\.js/i)).not.toBeNull();

    const aboutLink = screen.getByRole("link", { name: "About & Contact" });
    aboutLink.addEventListener("click", (event) => event.preventDefault(), {
      once: true,
    });
    fireEvent.click(aboutLink);

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Navigation menu" })).toBeNull();
    });
    expect(openButton.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(openButton);
  });
});
