interface OwnerVerificationPanelProps {
  token: string
  isSubmitting: boolean
  errorMessage: string
  onTokenChange: (value: string) => void
  onConfirm: () => void
}

export default function OwnerVerificationPanel({
  token,
  isSubmitting,
  errorMessage,
  onTokenChange,
  onConfirm,
}: OwnerVerificationPanelProps) {
  return (
    <div className="owner-verification-panel">
      <p className="owner-panel-title">Please enter your token</p>

      <label htmlFor="owner-token-input" className="owner-token-label">
      </label>
      <input
        id="owner-token-input"
        className="owner-token-input"
        value={token}
        onChange={(event) => onTokenChange(event.target.value)}
        autoComplete="off"
        spellCheck={false}
        placeholder="Enter your token here"
      />

      <button
        type="button"
        className="owner-subtle-action"
        // onClick={onCancel}
      >
        Cancel
      </button>

      <button
        type="button"
        className="owner-subtle-action"
        onClick={onConfirm}
        disabled={isSubmitting}
      >
        {isSubmitting ? "Checking..." : "Confirm token"}
      </button>

      {errorMessage ? <p className="owner-area-error">{errorMessage}</p> : null}
    </div>
  )
}
