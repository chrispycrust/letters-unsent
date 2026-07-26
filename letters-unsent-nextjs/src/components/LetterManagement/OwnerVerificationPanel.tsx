interface OwnerVerificationPanelProps {
  token: string
  isSubmitting: boolean
  errorMessage: string
  onTokenChange: (value: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export default function OwnerVerificationPanel({
  token,
  isSubmitting,
  errorMessage,
  onTokenChange,
  onConfirm,
  onCancel
}: OwnerVerificationPanelProps) {
  return (
    <div className="owner-verification-panel">

      <div className="owner-actions owner-verification-actions">
        <div className="owner-token-field">
          <label htmlFor="owner-token-input" className="control-label">
            Token
          </label>
          <input
            id="owner-token-input"
            className="owner-token-input"
            value={token}
            onChange={(event) => onTokenChange(event.target.value)}
            autoComplete="off"
            spellCheck={false}
            placeholder="Enter your token here"
            aria-invalid={errorMessage ? true : undefined}
            aria-describedby={errorMessage ? "owner-token-error" : undefined}
          />
        </div>

        <div className="owner-verification-controls">
          <button
            type="button"
            className="owner-subtle-action"
            onClick={onCancel}
          >
            Cancel
          </button>

          <span className="owner-actions-separator-word">or</span>

          <button
            type="button"
            className={`owner-subtle-action ${isSubmitting ? "is-busy" : ""}`}
            onClick={onConfirm}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Checking..." : "Confirm"}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <p id="owner-token-error" className="owner-area-error" role="alert">
          {errorMessage}
        </p>
      ) : null}
    
    </div>
  )
}
