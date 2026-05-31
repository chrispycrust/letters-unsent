import ProtectionStepShell from "@/components/LetterSubmit/ReleaseFlow/ProtectionStepShell"

interface StorePassphraseStepProps {
  passphrase: string
  saveOnDevice: boolean
  tokenCopied: boolean
  savedElsewhereConfirmed: boolean
  onToggleSaveOnDevice: () => void
  onCopyToken: () => void
  onToggleSavedElsewhereConfirmed: () => void
  onBack: () => void
  onContinue: () => void
  canContinue: boolean
}

export default function StorePassphraseStep({
  passphrase,
  saveOnDevice,
  tokenCopied,
  savedElsewhereConfirmed,
  onToggleSaveOnDevice,
  onCopyToken,
  onToggleSavedElsewhereConfirmed,
  onBack,
  onContinue,
  canContinue,
}: StorePassphraseStepProps) {
  return (
    <ProtectionStepShell
      title="Keep your token somewhere safe"
      stepLabel="Step 2 of 4"
      description="This is your token - a private key to edit or remove your letter later:"
      warning="Remember: Anyone with this token can edit or remove your letter."
      actions={
        <>
          <button type="button" className="release-secondary-button" onClick={onBack}>
            Back
          </button>
          <button
            type="button"
            className="release-primary-button"
            onClick={onContinue}
            disabled={!canContinue}
          >
            Review release
          </button>
        </>
      }
    >
      <div className="release-store-options-container">
        <div className="release-store-token-row">
          {/* <p className="release-store-token-label">Your token</p> */}
          <p className="release-selected-token" aria-label="Selected token">
            {passphrase}
          </p>
        </div>

        {/* --------- options for storing the token --------- */}

        <p>We won&apos;t show this token again.
          To store it, you can choose one or both options below:
        </p>

        <div className="release-store-option-row">
          <label className={`release-option-card ${saveOnDevice ? "is-selected" : ""}`}>
            <input
              type="checkbox"
              aria-label="Save it on this device"
              checked={saveOnDevice}
              onChange={onToggleSaveOnDevice}
            />
            <div className="release-option-content">
              <p className="release-option-title">Store it on this device</p>
              <span className="release-option-helper">
                Anyone with access to this browser profile may be able to use it.
                If local storage is cleared, the token will be removed.
              </span>
            </div>
          </label>

          <div className="release-store-option-detail" aria-hidden="true" />
        </div>

        <div className="release-store-option-row">
          <label className="release-option-card">
            <input
              type="checkbox"
              aria-label="checkbox"
            />
            <div className="release-option-content">
                <p className="release-option-title">Copy it yourself</p>
                <span className="release-option-helper">
                  Save the token somewhere safe like your notes or password manager.
                  You must check the box below to move to the next stage.
                </span>
              <div className="release-store-option-detail">
                <button type="button" className="release-secondary-button" onClick={onCopyToken}>
                  {tokenCopied ? <span className="release-copy-confirmation">Token copied to clipboard</span> : 'Copy token'}
                </button>
                
                <label className="release-confirm-checkbox">
                  <input
                    type="checkbox"
                    aria-label="I have saved it somewhere safe"
                    checked={savedElsewhereConfirmed}
                    onChange={onToggleSavedElsewhereConfirmed}
                  />
                  <span>I have saved it somewhere safe</span>
                </label>
              </div>
            </div>
          </label>
        </div>
      </div>
    </ProtectionStepShell>
  )
}
