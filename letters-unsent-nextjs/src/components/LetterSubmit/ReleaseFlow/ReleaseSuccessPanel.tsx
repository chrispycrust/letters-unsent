interface ReleaseSuccessPanelProps {
  onViewLetter: () => void
  onReturnToConversation: () => void
}

export default function ReleaseSuccessPanel({
  onViewLetter,
  onReturnToConversation,
}: ReleaseSuccessPanelProps) {
  return (
    <section className="release-panel release-success-panel" aria-live="polite">
      <h2>Your letter has been released</h2>
      <div className="release-choice-actions">
        <button type="button" className="release-primary-button" onClick={onViewLetter}>
          View your letter
        </button>
        <button type="button" className="release-secondary-button" onClick={onReturnToConversation}>
          Return to conversation
        </button>
      </div>
    </section>
  )
}
