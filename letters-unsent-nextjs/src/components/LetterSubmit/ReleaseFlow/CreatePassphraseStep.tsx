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

        <label className={`release-option-card ${passphraseMode === "custom" ? "is-selected" : ""}`}>
          <input
            type="radio"
            name="passphrase-option"
            aria-label="Write my own"
            checked={passphraseMode === "custom"}
            onChange={onSelectCustom}
          />
          <span className="release-option-title">Write my own</span>
          <span className="release-option-helper">
            Choose a phrase you’ll remember. You can reuse one you already use for another letter, if you
            prefer.
          </span>
        </label>

        {passphraseMode === "custom" ? (
          <div className="release-token-input-wrap">
            <label htmlFor="custom-passphrase-input">Token</label>
            <input
              id="custom-passphrase-input"
              type="text"
              value={customPassphrase}
              onChange={(event) => onCustomPassphraseChange(event.target.value)}
              className="release-token-input"
              autoComplete="off"
            />
          </div>
        ) : null}

        <label className={`release-option-card ${passphraseMode === "generated" ? "is-selected" : ""}`}>
          <input
            type="radio"
            name="passphrase-option"
            aria-label="Create one for me"
            checked={passphraseMode === "generated"}
            onChange={onSelectGenerated}
          />
          <span className="release-option-title">Create one for me</span>
          <span className="release-option-helper">Create a stronger phrase automatically.</span>
        </label>

        {passphraseMode === "generated" ? (
          <div className="release-generated-wrap">
            <p className="release-generated-token" aria-label="Generated token">
              {generatedPassphrase}
            </p>
            <button
              type="button"
              className="release-link-button release-inline-link"
              onClick={onGenerateAnother}
            >
              Generate another
            </button>
          </div>
        ) : null}
      </fieldset>
    </ProtectionStepShell>
  )
}
