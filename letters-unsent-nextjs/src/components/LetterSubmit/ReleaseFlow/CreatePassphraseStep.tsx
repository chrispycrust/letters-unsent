import ProtectionStepShell from "@/components/LetterSubmit/ReleaseFlow/ProtectionStepShell"

interface CreatePassphraseStepProps {
  passphraseMode: "custom" | "generated"
  customPassphrase: string
  generatedPassphrase: string
  onSelectCustom: () => void
  onSelectGenerated: () => void
  onCustomPassphraseChange: (value: string) => void
  onGenerateAnother: () => void
  onReturnToOptions: () => void
  onContinue: () => void
  canContinue: boolean
}

function isInteractiveCardTarget(target: EventTarget) {
  return (
    target instanceof Element && 
    Boolean(
      target.closest("button, input, textarea, select, a, label")
    )
  )
}

export default function CreatePassphraseStep({
  passphraseMode,
  customPassphrase,
  generatedPassphrase,
  onSelectCustom,
  onSelectGenerated,
  onCustomPassphraseChange,
  onGenerateAnother,
  onReturnToOptions,
  onContinue,
  canContinue,
}: CreatePassphraseStepProps) {
  function handleCustomPassphraseFocus() {
    if (passphraseMode !== "custom") {
      onSelectCustom()
    }
  }

  function handleCustomPassphraseChange(value: string) {
    if (passphraseMode !== "custom") {
      onSelectCustom()
    }

    onCustomPassphraseChange(value)
  }

  function handleGenerateAnother() {
    if (passphraseMode !== "generated") {
      onSelectGenerated()
    }

    onGenerateAnother()
  }

  return (
    <ProtectionStepShell
      title="Protect your letter"
      stepLabel="Step 1 of 4"
      description="Choose a private token. You’ll need it later to edit or remove this letter."
      actions={
        <>
          <button type="button" className="release-secondary-button" onClick={onReturnToOptions}>
            Return to release options
          </button>
          <button type="button" className="release-primary-button" onClick={onContinue} disabled={!canContinue}>
            Continue
          </button>
        </>
      }
    >
      <fieldset className="release-options-fieldset">
        <legend className="sr-only">Choose token method</legend>

        <div className="release-action-options-container">
          <div
            className={`release-option-card ${passphraseMode === "custom" ? "is-selected" : ""}`}
            onClick={(event) => {
              if (!isInteractiveCardTarget(event.target)) {
                onSelectCustom()
              }
            }}
          >
            <input
              id="passphrase-option-custom"
              type="radio"
              name="passphrase-option"
              aria-describedby="passphrase-option-custom-description"
              checked={passphraseMode === "custom"}
              onChange={onSelectCustom}
            />
            <div className="release-option-content">
              <label htmlFor="passphrase-option-custom" className="release-option-title">
                Write my own
              </label>
              <p id="passphrase-option-custom-description" className="release-option-helper">
                Choose a phrase you’ll remember. You can reuse one you already use for another letter, if you
                prefer.
              </p>

              <div className="release-token-input-wrap">
                <label htmlFor="custom-passphrase-input" className="control-label">
                  Your token
                </label>
                <input
                  id="custom-passphrase-input"
                  type="text"
                  value={customPassphrase}
                  onFocus={handleCustomPassphraseFocus}
                  placeholder="Enter your token here"
                  onChange={(event) => handleCustomPassphraseChange(event.target.value)}
                  className="release-token-input"
                  autoComplete="off"
                  aria-describedby="custom-passphrase-guidance"
                />
              </div>
              <span
                id="custom-passphrase-guidance"
                className="release-option-helper release-token-guidance"
              >
                Longer phrases are harder to guess. Avoid names, birthdays, or very short tokens.
              </span>
            </div>
          </div>

          <div
            className={`release-option-card ${passphraseMode === "generated" ? "is-selected" : ""}`}
            onClick={(event) => {
              if (!isInteractiveCardTarget(event.target)) {
                onSelectGenerated()
              }
            }}
          >
            <input
              id="passphrase-option-generated"
              type="radio"
              name="passphrase-option"
              aria-describedby="passphrase-option-generated-description"
              checked={passphraseMode === "generated"}
              onChange={onSelectGenerated}
            />

            <div className="release-option-content">
              <label htmlFor="passphrase-option-generated" className="release-option-title">
                Create one for me
              </label>
              <p id="passphrase-option-generated-description" className="release-option-helper">
                Create a stronger phrase automatically.
              </p>
              <div className="release-generated-wrap">
                <label htmlFor="generated-passphrase-output" className="sr-only">
                  Generated token
                </label>
                <output id="generated-passphrase-output" className="release-generated-token">
                  {generatedPassphrase}
                </output>
                <button
                  type="button"
                  className="release-link-button release-inline-link"
                  onClick={handleGenerateAnother}
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
    </ProtectionStepShell>
  )
}
