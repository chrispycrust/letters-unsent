import { render, screen } from "@testing-library/react";
import RouteLoading from "@/components/RouteLoading";
import SingleLetterLoading from "@/app/letters/[letterId]/loading";
import SubmitLoading from "@/app/submit/loading";

describe("RouteLoading", () => {
  it("exposes a contextual loading message without announcing the visual spinner", () => {
    const { container } = render(<RouteLoading message="Loading letters." />);

    const status = screen.getByRole("status");

    expect(screen.getAllByRole("status")).toHaveLength(1);
    expect(status.textContent).toBe("Loading letters.");
    expect(container.querySelector(".spinner")?.getAttribute("aria-hidden")).toBe("true");
  });

  it.each([
    {
      route: "single-letter route",
      LoadingComponent: SingleLetterLoading,
      message: "Loading letter.",
    },
    {
      route: "submit route",
      LoadingComponent: SubmitLoading,
      message: "Loading conversation.",
    },
  ])("announces the $route loading state", ({ LoadingComponent, message }) => {
    render(<LoadingComponent />);

    expect(screen.getByRole("status").textContent).toBe(message);
  });
});
