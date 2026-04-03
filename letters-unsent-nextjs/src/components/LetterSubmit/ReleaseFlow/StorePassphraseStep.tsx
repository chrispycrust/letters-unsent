import ProtectionStepShell from "@/components/LetterSubmit/ReleaseFlow/ProtectionStepShell"

interface StorePassphraseStepProps {
  passphrase: string
  isGeneratedPassphrase: boolean
  saveOnDevice: boolean
  tokenCopied: boolean
  savedElsewhereConfirmed: boolean
  onToggleSaveOnDevice: () => void
  onCopyToken: () => void
  onToggleSavedElsewhereConfirmed: () => void
  onBack: () => void
  onContinue: () => void
  canContinue: boolean
  isSubmitting: boolean
  errorMessage?: string
}

export default function StorePassphraseStep({
  passphrase,
  isGeneratedPassphrase,
  saveOnDevice,
  tokenCopied,
  savedElsewhereConfirmed,
  onToggleSaveOnDevice,
  onCopyToken,
  onToggleSavedElsewhereConfirmed,
  onBack,
  onContinue,
  canContinue,
  isSubmitting,
  errorMessage,
}: StorePassphraseStepProps) {
  return (
    <ProtectionStepShell
      title="Keep it somewhere safe"
      stepLabel="Step 2 of 3"
      description="We won’t show your token again. Choose how you’d like to keep it."
      warning="Anyone with this token can edit or remove your letter."
      errorMessage={errorMessage}
      actions={
        <>
          <button type="button" className="release-secondary-button" onClick={onBack} disabled={isSubmitting}>
            Back
          </button>
          <button
            type="button"
            className="release-primary-button"
            onClick={onContinue}
            disabled={!canContinue || isSubmitting}
          >
            {isSubmitting ? "Releasing..." : "Continue"}
          </button>
        </>
      }
    >
      <p className="release-selected-token" aria-label="Selected token">
        {passphrase}
      </p>

      <div className="release-store-options">
        <label className={`release-option-card ${saveOnDevice ? "is-selected" : ""}`}>
          <input
            type="checkbox"
            aria-label="Save it on this device"
            checked={saveOnDevice}
            onChange={onToggleSaveOnDevice}
          />
          <span className="release-option-title">Save it on this device</span>
          <span className="release-option-helper">
            Store it on this device. If local storage is cleared, the token will be removed.
          </span>
        </label>

        <div className="release-option-card release-copy-option">
          <span className="release-option-title">Copy it yourself</span>
          <span className="release-option-helper">Save the token in your notes or password manager.</span>
          <button type="button" className="release-secondary-button" onClick={onCopyToken}>
            Copy token
          </button>
          {tokenCopied ? <span className="release-copy-confirmation">Token copied</span> : null}

          {isGeneratedPassphrase ? (
            <label className="release-confirm-checkbox">
              <input
                type="checkbox"
                aria-label="I have saved it somewhere safe"
                checked={savedElsewhereConfirmed}
                onChange={onToggleSavedElsewhereConfirmed}
              />
              <span>I have saved it somewhere safe</span>
            </label>
          ) : null}
        </div>
      </div>
    </ProtectionStepShell>
  )
}
