import ProtectionStepShell from "@/components/LetterSubmit/ReleaseFlow/ProtectionStepShell"

interface CreatePassphraseStepProps {
  passphraseMode: "custom" | "generated"
  customPassphrase: string
  generatedPassphrase: string
  onSelectCustom: () => void
  onSelectGenerated: () => void
  onCustomPassphraseChange: (value: string) => void
  onGenerateAnother: () => void
  onBack: () => void
  onContinue: () => void
  canContinue: boolean
}

export default function CreatePassphraseStep({
  passphraseMode,
  customPassphrase,
  generatedPassphrase,
  onSelectCustom,
  onSelectGenerated,
  onCustomPassphraseChange,
  onGenerateAnother,
  onBack,
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
      stepLabel="Step 1 of 3"
      description="Choose a private token. You’ll need it later to edit or remove this letter."
      actions={
        <>
          <button type="button" className="release-secondary-button" onClick={onBack}>
            Back
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
          <div>
            <label className={`release-option-card ${passphraseMode === "custom" ? "is-selected" : ""}`}>
              <input
                type="radio"
                name="passphrase-option"
                aria-label="Write my own"
                checked={passphraseMode === "custom"}
                onChange={onSelectCustom}
              />
              <div className="release-option-content">
                <p className="release-option-title">Write my own</p>
                <p className="release-option-helper">
                  Choose a phrase you’ll remember. You can reuse one you already use for another letter, if you
                  prefer.
                </p>
              
                <div className="release-token-input-wrap">
                {/* <label htmlFor="custom-passphrase-input">Token</label> */}
                <input
                  id="custom-passphrase-input"
                  type="text"
                  value={customPassphrase}
                  onFocus={handleCustomPassphraseFocus}
                  placeholder="Enter your token here"
                  onChange={(event) => handleCustomPassphraseChange(event.target.value)}
                  className="release-token-input"
                  autoComplete="off"
                />
              </div>
            </div>
            </label>
          </div>

          <div>
            <label className={`release-option-card ${passphraseMode === "generated" ? "is-selected" : ""}`}>
              <input
                type="radio"
                name="passphrase-option"
                aria-label="Create one for me"
                checked={passphraseMode === "generated"}
                onChange={onSelectGenerated}
              />

              <div className="release-option-content">
                <p className="release-option-title">Create one for me</p>
                <p className="release-option-helper">Create a stronger phrase automatically.</p>
                <div className="release-generated-wrap">
                  <p className="release-generated-token" aria-label="Generated token">
                    {generatedPassphrase}
                  </p>
                  <button
                    type="button"
                    className="release-link-button release-inline-link"
                    onClick={handleGenerateAnother}
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            </label>
          </div>
        </div>
      </fieldset>
    </ProtectionStepShell>
  )
}
