import ProtectionStepShell from "@/components/LetterSubmit/ReleaseFlow/ProtectionStepShell"

interface StorePassphraseStepProps {
  passphrase: string
  saveOnDevice: boolean
  manualSaveSelected: boolean
  tokenCopied: boolean
  savedElsewhereConfirmed: boolean
  onToggleSaveOnDevice: () => void
  onToggleManualSave: () => void
  onCopyToken: () => void
  onToggleSavedElsewhereConfirmed: () => void
  onReturnToOptions: () => void
  onBack: () => void
  onContinue: () => void
  canContinue: boolean
}

export default function StorePassphraseStep({
  passphrase,
  saveOnDevice,
  manualSaveSelected,
  tokenCopied,
  savedElsewhereConfirmed,
  onToggleSaveOnDevice,
  onToggleManualSave,
  onCopyToken,
  onToggleSavedElsewhereConfirmed,
  onReturnToOptions,
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
          <button type="button" className="release-link-button" onClick={onReturnToOptions}>
            Return to release options
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
          To store it, choose at least one storage option below and complete its required steps to continue.
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
                Saves the token only in this browser profile on this device. If you use another device or browser,
                or clear browser storage, you&apos;ll need to enter the token manually. We recommend saving your own copy
                somewhere safe too.
              </span>
            </div>
          </label>

          <div className="release-store-option-detail" aria-hidden="true" />
        </div>

        <div className="release-store-option-row">
          <div className={`release-option-card ${manualSaveSelected ? "is-selected" : ""}`}>
            <input
              id="manual-save-option"
              type="checkbox"
              aria-label="Copy it yourself"
              checked={manualSaveSelected}
              onChange={onToggleManualSave}
            />
            <div className="release-option-content">
              <label htmlFor="manual-save-option" className="release-option-title">
                Copy it yourself <span className="release-recommended-badge">Recommended</span>
              
                <span className="release-option-helper">
                  Save the token somewhere safe like your notes or password manager. To continue with this option,
                  copy the token and confirm you saved it somewhere safe.
                </span>

                <div className="release-store-option-detail-container">
                  <div className="release-store-option-detail">
                    <button
                      type="button"
                      className="release-secondary-button"
                      onClick={onCopyToken}
                      disabled={!manualSaveSelected}
                    >
                      {tokenCopied ? <span className="release-copy-confirmation">Token copied to clipboard</span> : 'Copy token'}
                    </button>
                    <label className="release-confirm-checkbox">
                      <input
                        type="checkbox"
                        aria-label="I have saved it somewhere safe"
                        checked={savedElsewhereConfirmed}
                        disabled={!manualSaveSelected}
                        onChange={onToggleSavedElsewhereConfirmed}
                      />
                      <span>I have saved it somewhere safe</span>
                    </label>
                  </div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>
    </ProtectionStepShell>
  )
}
