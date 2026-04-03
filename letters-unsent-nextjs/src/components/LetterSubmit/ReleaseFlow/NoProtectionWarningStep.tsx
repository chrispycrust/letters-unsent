interface NoProtectionWarningStepProps {
  onBack: () => void
  onConfirm: () => void
  isSubmitting: boolean
}

export default function NoProtectionWarningStep({
  onBack,
  onConfirm,
  isSubmitting,
}: NoProtectionWarningStepProps) {
  return (
    <section className="release-panel release-no-protection-warning" aria-live="polite">
      <h2>Release without protection?</h2>
      <p>
        You can still release this letter now. But without a token, you will not be able to edit or remove it
        later.
      </p>
      <p className="release-small-copy">This choice cannot be added afterwards.</p>

      <div className="release-choice-actions">
        <button type="button" className="release-secondary-button" onClick={onBack} disabled={isSubmitting}>
          Go back
        </button>
        <button type="button" className="release-primary-button" onClick={onConfirm} disabled={isSubmitting}>
          {isSubmitting ? "Releasing..." : "I understand, release the letter without protection"}
        </button>
      </div>
    </section>
  )
}
