import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ReleaseActionArea from "@/components/LetterSubmit/ReleaseFlow/ReleaseActionArea";

type ReleaseSubmitInput = {
  ownerPassphrase: string | null;
  savePassphraseOnDevice: boolean;
  tokenCopied: boolean;
};

const baseLetterPayload = {
  content: "A letter body",
  intended_recipient: "Sam",
  author_name: "Casey",
  relationship_type: "friend",
  emotional_tone: "reflective",
};

function renderReleaseActionArea() {
  const onSubmitLetter = jest.fn().mockResolvedValue({ id: "new-1" });
  const onReturnToConversation = jest.fn();
  const onViewLetter = jest.fn();

  render(
    <ReleaseActionArea
      letterPayload={baseLetterPayload}
      onSubmitLetter={onSubmitLetter}
      onReturnToConversation={onReturnToConversation}
      onViewLetter={onViewLetter}
    />,
  );

  return {
    onSubmitLetter,
    onReturnToConversation,
    onViewLetter,
  };
}

describe("ReleaseActionArea", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.clear();
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  it("shows the release choice panel with three expected actions", () => {
    renderReleaseActionArea();

    expect(screen.getByText("Your letter is ready to be released.")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Protect this letter" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Release without protection" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Return to conversation" })).not.toBeNull();
  });

  it("enters protection flow and blocks empty custom passphrase", () => {
    renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));

    expect(screen.getByText("Protect your letter")).not.toBeNull();
    const continueButton = screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(true);
  });

  it("creates and replaces generated passphrases", () => {
    renderReleaseActionArea();
    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));

    const generatedTokenElement = screen.getByLabelText("Generated token");
    const firstGenerated = generatedTokenElement.textContent?.trim();

    expect(firstGenerated).toMatch(/^[a-z]+-[a-z]+-[a-z]+-[a-z]+$/);

    fireEvent.click(screen.getByRole("button", { name: "Generate another" }));
    const secondGenerated = screen.getByLabelText("Generated token").textContent?.trim();

    expect(secondGenerated).toMatch(/^[a-z]+-[a-z]+-[a-z]+-[a-z]+$/);
    expect(secondGenerated).not.toBe(firstGenerated);
  });

  it("keeps generated passphrase stable when moving back and forward unless regenerated", async () => {
    renderReleaseActionArea();
    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));

    const generatedToken = screen.getByLabelText("Generated token").textContent?.trim();
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Keep it somewhere safe")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Protect your letter")).not.toBeNull();

    const regenerated = screen.getByLabelText("Generated token").textContent?.trim();
    expect(regenerated).toBe(generatedToken);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(screen.getByText("Keep it somewhere safe")).not.toBeNull();
    });
  });

  it("enforces generated-token durability and allows copy without implying device save", async () => {
    const { onSubmitLetter } = renderReleaseActionArea();
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Keep it somewhere safe")).not.toBeNull();

    const continueButton = screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Copy token" }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    expect(continueButton.disabled).toBe(true);
    expect(setItemSpy).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByLabelText("I have saved it somewhere safe"));
    expect(continueButton.disabled).toBe(false);
    fireEvent.click(continueButton);

    await waitFor(() => {
      expect(onSubmitLetter).toHaveBeenCalledTimes(1);
    });

    const submitArgs = onSubmitLetter.mock.calls[0][0] as ReleaseSubmitInput;
    expect(submitArgs.ownerPassphrase).toMatch(/^[a-z]+-[a-z]+-[a-z]+-[a-z]+$/);
    expect(submitArgs.savePassphraseOnDevice).toBe(false);
    expect(submitArgs.tokenCopied).toBe(true);
  });

  it("writes passphrase to localStorage only when save-on-device is selected", async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");
    const { onSubmitLetter } = renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const selectedToken = screen.getByLabelText("Selected token").textContent?.trim();
    fireEvent.click(screen.getByLabelText("Save it on this device"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    await waitFor(() => {
      expect(onSubmitLetter).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(expect.any(String), selectedToken);
    });
  });

  it("shows unprotected warning and submits with null passphrase after confirmation", async () => {
    const { onSubmitLetter } = renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Release without protection" }));

    expect(screen.getByText("Release without protection?")).not.toBeNull();
    fireEvent.click(
      screen.getByRole("button", {
        name: "I understand, release the letter without protection",
      }),
    );

    await waitFor(() => {
      expect(onSubmitLetter).toHaveBeenCalledTimes(1);
    });

    const submitArgs = onSubmitLetter.mock.calls[0][0] as ReleaseSubmitInput;
    expect(submitArgs.ownerPassphrase).toBeNull();
    expect(submitArgs.savePassphraseOnDevice).toBe(false);
  });
});
