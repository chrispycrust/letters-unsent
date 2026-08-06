import { useId } from "react"

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

function isInteractiveCardTarget(target: EventTarget) {
  return (
    target instanceof Element && 
    Boolean(
      target.closest("button, input, textarea, select, a, label")
    )
  )
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
  const tokenLabelId = useId()
  const tokenOutputId = useId()
  const tokenValueId = useId()
  const storageGuidanceId = useId()

  return (
    <ProtectionStepShell
      title="Keep your token somewhere safe"
      stepLabel="Step 2 of 4"
      description="This is your token - a private key to edit or remove your letter later:"
      warning="Remember: Anyone with this token can edit or remove your letter."
      additionalHeadingDescriptionIds={[tokenLabelId, tokenValueId, storageGuidanceId]}
      actions={
        <>
          <button type="button" className="release-secondary-button" onClick={onBack}>
            Back
          </button>
          <button type="button" className="release-secondary-button" onClick={onReturnToOptions}>
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
      <fieldset className="release-store-options-container release-options-fieldset">
        <legend className="sr-only">Choose how to store your token</legend>

        <div className="release-store-token-row">
          <label id={tokenLabelId} htmlFor={tokenOutputId} className="control-label">
            Your token
          </label>
          <output id={tokenOutputId} className="release-selected-token">
            <span id={tokenValueId}>{passphrase}</span>
          </output>
        </div>

        {/* --------- options for storing the token --------- */}

        <p id={storageGuidanceId}>We won&apos;t show this token again.
          To store it, choose at least one storage option below and complete its required steps to continue.
        </p>

        <div className="release-store-option-row">
          <div
            className={`release-option-card ${saveOnDevice ? "is-selected" : ""}`}
            onClick={(event) => {
              if (!isInteractiveCardTarget(event.target)) {
                onToggleSaveOnDevice()
              }
            }}
          >
            <input
              id="save-token-on-device"
              type="checkbox"
              aria-describedby="save-token-on-device-description"
              checked={saveOnDevice}
              onChange={onToggleSaveOnDevice}
            />
            <div className="release-option-content">
              <label htmlFor="save-token-on-device" className="release-option-title">
                Save it on this device
              </label>
              <span id="save-token-on-device-description" className="release-option-helper">
                Saves the token only in this browser profile on this device. 
                If you use this option you won&apos;t need to manually enter the token.
                If you use another device or browser, or clear browser storage, 
                you&apos;ll need to enter the token manually.
              </span>
            </div>
          </div>

          <div className="release-store-option-detail" aria-hidden="true" />
        </div>

        <div className="release-store-option-row">
          <div
            className={`release-option-card ${manualSaveSelected ? "is-selected" : ""}`}
            onClick={(event) => {
              if (!isInteractiveCardTarget(event.target)) {
                onToggleManualSave()
              }
            }}
          >
            <input
              id="manual-save-option"
              type="checkbox"
              aria-describedby="manual-save-option-description manual-save-option-recommended"
              checked={manualSaveSelected}
              onChange={onToggleManualSave}
            />
            <div className="release-option-content">
              <div className="release-option-title-container">
                <label htmlFor="manual-save-option" className="release-option-title">
                  Copy it yourself
                </label>
                <span id="manual-save-option-recommended" className="release-recommended-badge">
                  Recommended
                </span>
              </div>

              <span id="manual-save-option-description" className="release-option-helper">
                Save the token somewhere safe like your notes or password manager. 
                To continue with this option, copy the token and confirm you saved it somewhere safe.
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
                      checked={savedElsewhereConfirmed}
                      disabled={!manualSaveSelected}
                      onChange={onToggleSavedElsewhereConfirmed}
                    />
                    <span>I have saved it somewhere safe</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>
    </ProtectionStepShell>
  )
}
