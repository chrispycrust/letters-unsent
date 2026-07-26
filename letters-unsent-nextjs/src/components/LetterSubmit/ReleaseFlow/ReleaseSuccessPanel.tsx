import ReleaseStepHeading from "@/components/LetterSubmit/ReleaseFlow/ReleaseStepHeading"

interface ReleaseSuccessPanelProps {
  onViewLetter: () => void
  onReturnToConversation: () => void
}

export default function ReleaseSuccessPanel({
  onViewLetter,
  onReturnToConversation,
}: ReleaseSuccessPanelProps) {
  return (
    <section className="release-panel release-success-panel">
      <ReleaseStepHeading>Your letter has been released</ReleaseStepHeading>
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
