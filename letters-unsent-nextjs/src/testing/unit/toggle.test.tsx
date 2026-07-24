import { fireEvent, render, screen } from "@testing-library/react";
import Toggle from "@/components/Toggle";

describe("Toggle", () => {
  it("renders heading and calls onToggle", () => {
    const onToggle = jest.fn();
    render(
      <Toggle
        toggleState={false}
        onToggle={onToggle}
        heading="Background"
        controlsId="background-panel"
      />,
    );

    const heading = screen.getByRole("heading", { level: 2, name: "Background" });
    const button = screen.getByRole("button", { name: "Background" });
    expect(heading.contains(button)).toBe(true);
    expect(button.querySelector("h2")).toBeNull();
    expect(button.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(button.getAttribute("aria-pressed")).toBe("false");
    expect(button.getAttribute("aria-expanded")).toBe("false");
    expect(button.getAttribute("aria-controls")).toBe("background-panel");
    expect(screen.getByText("Background")).not.toBeNull();

    fireEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("reflects expanded state through aria attributes", () => {
    const onToggle = jest.fn();
    render(
      <Toggle
        toggleState={true}
        onToggle={onToggle}
        heading="Guidelines"
        controlsId="guidelines-panel"
      />,
    );

    const button = screen.getByRole("button");
    expect(button.getAttribute("aria-pressed")).toBe("true");
    expect(button.getAttribute("aria-expanded")).toBe("true");
  });
});
