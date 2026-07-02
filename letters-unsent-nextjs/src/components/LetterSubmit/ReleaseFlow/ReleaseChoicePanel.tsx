interface ReleaseChoicePanelProps {
  onProtect: () => void
  onReleaseWithoutProtection: () => void
  onReturnToConversation: () => void
}

export default function ReleaseChoicePanel({
  onProtect,
  onReleaseWithoutProtection,
  onReturnToConversation,
}: ReleaseChoicePanelProps) {
  return (
    <section className="release-panel release-choice-panel" aria-live="polite">
      <h4>Keep a way back to your letter</h4>
      <p>Before it is published to the archive, choose how you’d like to continue.</p>

      <div className="release-choice-actions">
        <button type="button" className="release-primary-button" onClick={onProtect}>
          Protect this letter
        </button>
        <button type="button" className="release-secondary-button" onClick={onReleaseWithoutProtection}>
          Release without protection
        </button>
        <button type="button" className="release-link-button" onClick={onReturnToConversation}>
          Return to conversation
        </button>
      </div>
    </section>
  )
}
