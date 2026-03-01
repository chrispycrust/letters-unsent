import { render, screen } from "@testing-library/react";
import GuardianPanel from "@/components/LetterSubmit/GuardianPanel";

describe("GuardianPanel", () => {
  it("shows a spinner while waiting for a response", () => {
    const { container } = render(<GuardianPanel message="" responseStatus={false} />);

    expect(container.querySelector(".spinner")).not.toBeNull();
  });

  it("shows the assistant message when a response arrives", () => {
    const { container } = render(<GuardianPanel message="Hello from Cove" responseStatus={true} />);

    expect(container.querySelector(".spinner")).toBeNull();
    expect(screen.getByText("Hello from Cove")).not.toBeNull();
  });
});
