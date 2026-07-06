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

      <div className="owner-actions">
        <label htmlFor="owner-token-input">
        </label>
        <input
          id="owner-token-input"
          className="owner-token-input"
          aria-label="Token"
          value={token}
          onChange={(event) => onTokenChange(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          placeholder="Enter your token here"
        />

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

      {errorMessage ? <p className="owner-area-error">{errorMessage}</p> : null}
    
    </div>
  )
}
