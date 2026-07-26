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

function renderReleaseActionArea(
  onSubmitLetter = jest.fn().mockResolvedValue({ id: "new-1" }),
) {
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

function expectFocusedStepHeading(name: string) {
  const heading = screen.getByRole("heading", { level: 2, name });

  expect(heading.getAttribute("tabindex")).toBe("-1");
  expect(document.activeElement).toBe(heading);
  expect(heading.closest(".release-panel")?.hasAttribute("aria-live")).toBe(false);

  return heading;
}

function expectFocusedHeadingContext(
  name: string,
  description: string,
  expectedDescriptionCount: number,
) {
  const heading = expectFocusedStepHeading(name);
  const descriptionIds = heading.getAttribute("aria-describedby")?.split(/\s+/) ?? [];
  const headingWithContext = screen.getByRole("heading", {
    level: 2,
    name,
    description,
  });

  expect(descriptionIds).toHaveLength(expectedDescriptionCount);
  expect(headingWithContext).toBe(heading);
}

function expectProtectedStepContext(
  name: string,
  stepLabel: string,
  description: string,
  expectedDescriptionCount = 2,
) {
  expectFocusedHeadingContext(
    name,
    `${stepLabel} ${description}`,
    expectedDescriptionCount,
  );
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("shows the release choice panel with three expected actions", () => {
    renderReleaseActionArea();

    expectFocusedHeadingContext(
      "Keep a way back to your letter",
      "Before it is published to the archive, choose how you’d like to continue.",
      1,
    );
    expect(document.querySelector("h4")).toBeNull();
    expect(screen.getByRole("button", { name: "Protect this letter" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Release without protection" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Return to conversation" })).not.toBeNull();
  });

  it("moves focus to each protected-release step heading", async () => {
    const { onSubmitLetter } = renderReleaseActionArea();

    expectFocusedStepHeading("Keep a way back to your letter");

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    expectProtectedStepContext(
      "Protect your letter",
      "Step 1 of 4",
      "Choose a private token. You’ll need it later to edit or remove this letter.",
    );

    fireEvent.click(screen.getByLabelText("Create one for me"));
    const regenerateButton = screen.getByRole("button", { name: "Regenerate" });
    regenerateButton.focus();
    fireEvent.click(regenerateButton);
    expect(document.activeElement).toBe(regenerateButton);
    const selectedToken = screen.getByLabelText("Generated token").textContent?.trim() ?? "";

    expect(selectedToken).toMatch(/^[a-z]+-[a-z]+-[a-z]+-[a-z]+$/);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expectProtectedStepContext(
      "Keep your token somewhere safe",
      "Step 2 of 4",
      `This is your token - a private key to edit or remove your letter later: Your token ${selectedToken} We won't show this token again. To store it, choose at least one storage option below and complete its required steps to continue.`,
      5,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expectFocusedStepHeading("Protect your letter");

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expectFocusedStepHeading("Keep your token somewhere safe");

    fireEvent.click(screen.getByLabelText("Save it on this device"));
    fireEvent.click(screen.getByRole("button", { name: "Review release" }));
    expectProtectedStepContext(
      "Ready to release your letter?",
      "Step 3 of 4",
      "Your token is set. When you release this letter, it will be published to the archive. Protected with a token Stored on this device Make sure your token is stored somewhere safe before releasing.",
      4,
    );

    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expectFocusedStepHeading("Keep your token somewhere safe");

    fireEvent.click(screen.getByRole("button", { name: "Review release" }));
    expectFocusedStepHeading("Ready to release your letter?");

    fireEvent.click(screen.getByRole("button", { name: "Release letter" }));

    await waitFor(() => {
      expect(onSubmitLetter).toHaveBeenCalledTimes(1);
      expectProtectedStepContext(
        "Your letter is protected",
        "Step 4 of 4",
        "Keep your token safe. You’ll need it later to edit or remove this letter. Saved on this device",
        3,
      );
    });
  });

  it("moves focus through the unprotected warning and success steps", async () => {
    renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Release without protection" }));
    expectFocusedHeadingContext(
      "Release without protection?",
      "You can still release this letter now. But without a token, you will not be able to edit or remove it later. Note: This choice cannot be added afterwards.",
      2,
    );

    fireEvent.click(screen.getByRole("button", { name: "Go back" }));
    expectFocusedStepHeading("Keep a way back to your letter");

    fireEvent.click(screen.getByRole("button", { name: "Release without protection" }));
    expectFocusedHeadingContext(
      "Release without protection?",
      "You can still release this letter now. But without a token, you will not be able to edit or remove it later. Note: This choice cannot be added afterwards.",
      2,
    );

    fireEvent.click(
      screen.getByRole("button", {
        name: "I understand, release the letter without protection",
      }),
    );

    await waitFor(() => {
      expectFocusedStepHeading("Your letter has been released");
    });
  });

  it("enters protection flow and blocks empty custom passphrase", () => {
    renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));

    expect(screen.getByRole("heading", { level: 2, name: "Protect your letter" })).not.toBeNull();
    expect(screen.getByLabelText("Write my own")).not.toBeNull();
    expect(screen.getByLabelText("Create one for me")).not.toBeNull();
    expect(screen.getByLabelText("Your token")).not.toBeNull();
    expect(document.querySelector("label button")).toBeNull();
    expect(document.querySelector("label label")).toBeNull();
    const continueButton = screen.getByRole("button", { name: "Continue" }) as HTMLButtonElement;
    expect(continueButton.disabled).toBe(true);
    expect(screen.getByLabelText("Generated token").textContent?.trim()).toMatch(
      /^[a-z]+-[a-z]+-[a-z]+-[a-z]+$/,
    );
  });

  it("keeps the non-interactive area of each option card clickable", () => {
    renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));

    const customOption = screen.getByLabelText("Write my own") as HTMLInputElement;
    const generatedOption = screen.getByLabelText("Create one for me") as HTMLInputElement;

    fireEvent.click(screen.getByText("Create a stronger phrase automatically."));
    expect(generatedOption.checked).toBe(true);

    fireEvent.click(screen.getByText(/Choose a phrase you’ll remember/));
    expect(customOption.checked).toBe(true);

    fireEvent.change(screen.getByLabelText("Your token"), {
      target: { value: "quiet-sage-morning" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const deviceOption = screen.getByLabelText("Save it on this device") as HTMLInputElement;
    const manualOption = screen.getByLabelText("Copy it yourself") as HTMLInputElement;

    fireEvent.click(screen.getByText(/Saves the token only in this browser profile/));
    expect(deviceOption.checked).toBe(true);

    fireEvent.click(screen.getByText(/Save the token somewhere safe like your notes/));
    expect(manualOption.checked).toBe(true);
  });

  it("can return from the protection flow to release options", () => {
    renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByRole("button", { name: "Return to release options" }));

    expect(screen.getByText("Keep a way back to your letter")).not.toBeNull();
    expect(screen.getByRole("button", { name: "Release without protection" })).not.toBeNull();
  });

  it("requires custom passphrases to be saved before review", async () => {
    const { onSubmitLetter } = renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.change(screen.getByPlaceholderText("Enter your token here"), {
      target: { value: "quiet-sage-morning" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByRole("heading", { level: 2, name: "Keep your token somewhere safe" })).not.toBeNull();
    expect(document.querySelector("label button")).toBeNull();
    expect(document.querySelector("label label")).toBeNull();

    const reviewButton = screen.getByRole("button", { name: "Review release" }) as HTMLButtonElement;
    expect(reviewButton.disabled).toBe(true);
    expect(onSubmitLetter).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByLabelText("Copy it yourself"));
    expect(reviewButton.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Copy token" }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });
    expect(reviewButton.disabled).toBe(true);

    fireEvent.click(screen.getByLabelText("I have saved it somewhere safe"));
    expect(reviewButton.disabled).toBe(false);
  });

  it("creates and replaces generated passphrases", () => {
    renderReleaseActionArea();
    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));

    const generatedTokenElement = screen.getByLabelText("Generated token");
    const firstGenerated = generatedTokenElement.textContent?.trim();

    expect(firstGenerated).toMatch(/^[a-z]+-[a-z]+-[a-z]+-[a-z]+$/);

    fireEvent.click(screen.getByRole("button", { name: "Regenerate" }));
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

    expect(screen.getByText("Keep your token somewhere safe")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("Protect your letter")).not.toBeNull();

    const regenerated = screen.getByLabelText("Generated token").textContent?.trim();
    expect(regenerated).toBe(generatedToken);

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => {
      expect(screen.getByText("Keep your token somewhere safe")).not.toBeNull();
    });
  });

  it("enforces generated-token durability and allows copy without implying device save", async () => {
    const { onSubmitLetter } = renderReleaseActionArea();
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Keep your token somewhere safe")).not.toBeNull();

    const reviewButton = screen.getByRole("button", { name: "Review release" }) as HTMLButtonElement;
    expect(reviewButton.disabled).toBe(true);

    fireEvent.click(screen.getByLabelText("Copy it yourself"));
    expect(reviewButton.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Copy token" }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });

    expect(reviewButton.disabled).toBe(true);
    expect(setItemSpy).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByLabelText("I have saved it somewhere safe"));
    expect(reviewButton.disabled).toBe(false);
    fireEvent.click(reviewButton);

    expect(screen.getByText("Ready to release your letter?")).not.toBeNull();
    expect(onSubmitLetter).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByRole("button", { name: "Release letter" }));

    await waitFor(() => {
      expect(onSubmitLetter).toHaveBeenCalledTimes(1);
    });

    const submitArgs = onSubmitLetter.mock.calls[0][0] as ReleaseSubmitInput;
    expect(submitArgs.ownerPassphrase).toMatch(/^[a-z]+-[a-z]+-[a-z]+-[a-z]+$/);
    expect(submitArgs.savePassphraseOnDevice).toBe(false);
    expect(submitArgs.tokenCopied).toBe(true);
  });

  it("requires every selected storage path to be complete", async () => {
    renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const reviewButton = screen.getByRole("button", { name: "Review release" }) as HTMLButtonElement;
    fireEvent.click(screen.getByLabelText("Save it on this device"));
    expect(reviewButton.disabled).toBe(false);

    fireEvent.click(screen.getByLabelText("Copy it yourself"));
    expect(reviewButton.disabled).toBe(true);

    fireEvent.click(screen.getByRole("button", { name: "Copy token" }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });
    expect(reviewButton.disabled).toBe(true);

    fireEvent.click(screen.getByLabelText("I have saved it somewhere safe"));
    expect(reviewButton.disabled).toBe(false);
  });

  it("keeps storage choices selected when returning from confirmation", async () => {
    renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const saveOnDeviceCheckbox = screen.getByLabelText("Save it on this device") as HTMLInputElement;
    const manualSaveCheckbox = screen.getByLabelText("Copy it yourself") as HTMLInputElement;
    const savedElsewhereCheckbox = screen.getByLabelText("I have saved it somewhere safe") as HTMLInputElement;

    fireEvent.click(saveOnDeviceCheckbox);
    fireEvent.click(manualSaveCheckbox);
    fireEvent.click(screen.getByRole("button", { name: "Copy token" }));
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
    });
    fireEvent.click(savedElsewhereCheckbox);
    fireEvent.click(screen.getByRole("button", { name: "Review release" }));

    expect(screen.getByText("Ready to release your letter?")).not.toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Back" }));

    expect((screen.getByLabelText("Save it on this device") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText("Copy it yourself") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText("I have saved it somewhere safe") as HTMLInputElement).checked).toBe(true);
  });

  it("writes passphrase to localStorage only when save-on-device is selected", async () => {
    const setItemSpy = jest.spyOn(Storage.prototype, "setItem");
    const { onSubmitLetter } = renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));

    const selectedToken = screen.getByLabelText("Your token").textContent?.trim();
    fireEvent.click(screen.getByLabelText("Save it on this device"));
    fireEvent.click(screen.getByRole("button", { name: "Review release" }));

    expect(screen.getByText("Ready to release your letter?")).not.toBeNull();
    expect(onSubmitLetter).toHaveBeenCalledTimes(0);

    fireEvent.click(screen.getByRole("button", { name: "Release letter" }));

    await waitFor(() => {
      expect(onSubmitLetter).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith(expect.any(String), selectedToken);
    });
  });

  it("announces protected-release errors through one scoped alert", async () => {
    const rawError = "PostgrestError: protected release failed.";
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const onSubmitLetter = jest.fn().mockRejectedValue(new Error(rawError));

    renderReleaseActionArea(onSubmitLetter);
    fireEvent.click(screen.getByRole("button", { name: "Protect this letter" }));
    fireEvent.click(screen.getByLabelText("Create one for me"));
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    fireEvent.click(screen.getByLabelText("Save it on this device"));
    fireEvent.click(screen.getByRole("button", { name: "Review release" }));
    fireEvent.click(screen.getByRole("button", { name: "Release letter" }));

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toBe("We couldn’t release your letter. Please try again.");
    expect(screen.queryByText(rawError)).toBeNull();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(document.querySelector(".release-panel[aria-live]")).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Protected letter release failed",
      expect.any(Error),
    );
  });

  it("announces unprotected-release errors through one scoped alert", async () => {
    const rawError = "DatabaseError: unprotected release failed.";
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    const onSubmitLetter = jest.fn().mockRejectedValue(new Error(rawError));

    renderReleaseActionArea(onSubmitLetter);
    fireEvent.click(screen.getByRole("button", { name: "Release without protection" }));
    fireEvent.click(
      screen.getByRole("button", {
        name: "I understand, release the letter without protection",
      }),
    );

    const alert = await screen.findByRole("alert");

    expect(alert.textContent).toBe("We couldn’t release your letter. Please try again.");
    expect(screen.queryByText(rawError)).toBeNull();
    expect(screen.getAllByRole("alert")).toHaveLength(1);
    expect(document.querySelector(".release-panel[aria-live]")).toBeNull();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Unprotected letter release failed",
      expect.any(Error),
    );
  });

  it("shows unprotected warning and submits with null passphrase after confirmation", async () => {
    const { onSubmitLetter } = renderReleaseActionArea();

    fireEvent.click(screen.getByRole("button", { name: "Release without protection" }));

    expect(screen.getByRole("heading", { level: 2, name: "Release without protection?" })).not.toBeNull();
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
