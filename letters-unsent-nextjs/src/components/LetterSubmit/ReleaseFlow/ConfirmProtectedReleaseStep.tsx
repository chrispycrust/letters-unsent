import ProtectionStepShell from "@/components/LetterSubmit/ReleaseFlow/ProtectionStepShell"

interface ConfirmProtectedReleaseStepProps {
  savedOnDevice: boolean
  tokenCopied: boolean
  onBack: () => void
  onReturnToOptions: () => void
  onConfirm: () => void
  isSubmitting: boolean
  errorMessage?: string
}

export default function ConfirmProtectedReleaseStep({
  savedOnDevice,
  tokenCopied,
  onBack,
  onReturnToOptions,
  onConfirm,
  isSubmitting,
  errorMessage,
}: ConfirmProtectedReleaseStepProps) {
  const confirmations = [
    "Protected with a token",
    savedOnDevice ? "Stored on this device" : null,
    tokenCopied ? "Copied to your clipboard" : null,
  ].filter(Boolean)

  return (
    <ProtectionStepShell
      title="Ready to release your letter?"
      stepLabel="Step 3 of 4"
      description="Your token is set. When you release this letter, it will be published to the archive."
      warning="Make sure your token is stored somewhere safe before releasing."
      errorMessage={errorMessage}
      actions={
        <>
          <button type="button" className="release-secondary-button" onClick={onBack} disabled={isSubmitting}>
            Back
          </button>
          <button type="button" className="release-link-button" onClick={onReturnToOptions} disabled={isSubmitting}>
            Return to release options
          </button>
          <button type="button" className="release-primary-button" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Releasing..." : "Release letter"}
          </button>
        </>
      }
    >
      <ul className="release-confirmation-list">
        {confirmations.map((item) => (
          <li key={item} className="release-confirmation-item">
            {item}
          </li>
        ))}
      </ul>
    </ProtectionStepShell>
  )
}
