import { fireEvent, render, screen } from "@testing-library/react";
import type { FormEvent } from "react";
import VisitorPanel from "@/components/LetterSubmit/VisitorPanel";

describe("VisitorPanel", () => {
  it("updates input and submits the form", () => {
    const setVisitorInput = jest.fn();
    const handleSubmit = jest.fn((event: FormEvent<HTMLFormElement>) => event.preventDefault());
    const { container } = render(
      <VisitorPanel
        visitorInput=""
        setVisitorInput={setVisitorInput}
        handleSubmit={handleSubmit}
      />,
    );

    const textarea = screen.getByPlaceholderText("Write something");
    fireEvent.change(textarea, { target: { value: "A new draft message" } });
    expect(setVisitorInput).toHaveBeenCalledWith("A new draft message");

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    if (form) {
      fireEvent.submit(form);
    }
    expect(handleSubmit).toHaveBeenCalledTimes(1);
  });

  it("expands and minimizes the text area", () => {
    const setVisitorInput = jest.fn();
    const handleSubmit = jest.fn();
    const { container } = render(
      <VisitorPanel
        visitorInput=""
        setVisitorInput={setVisitorInput}
        handleSubmit={handleSubmit}
      />,
    );

    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    expect(form?.className.includes("vistor-input-container-expanded")).toBe(false);

    const expandButton = screen.getByRole("button", { name: /maximise/i });
    fireEvent.click(expandButton);
    expect(form?.className.includes("vistor-input-container-expanded")).toBe(true);

    const minimiseButton = screen.getByRole("button", { name: /minimise/i });
    expect(minimiseButton).not.toBeNull();
    fireEvent.click(minimiseButton);
    expect(form?.className.includes("vistor-input-container-expanded")).toBe(false);
  });
});
