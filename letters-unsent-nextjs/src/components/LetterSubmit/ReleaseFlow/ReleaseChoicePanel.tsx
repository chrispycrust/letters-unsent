import { useId } from "react"

import ReleaseStepHeading from "@/components/LetterSubmit/ReleaseFlow/ReleaseStepHeading"

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
  const descriptionId = useId()

  return (
    <section className="release-panel release-choice-panel">
      <ReleaseStepHeading
        className="release-panel-title"
        ariaDescribedBy={descriptionId}
      >
        Keep a way back to your letter
      </ReleaseStepHeading>
      <p id={descriptionId}>Before it is published to the archive, choose how you’d like to continue.</p>

      <div className="release-choice-actions">
        <button type="button" className="release-primary-button" onClick={onProtect}>
          Protect this letter
        </button>
        <button type="button" className="release-secondary-button" onClick={onReleaseWithoutProtection}>
          Release without protection
        </button>
        <button type="button" className="release-secondary-button" onClick={onReturnToConversation}>
          Return to conversation
        </button>
      </div>
    </section>
  )
}
