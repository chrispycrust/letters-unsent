import { useId } from "react"

import ReleaseStepHeading from "@/components/LetterSubmit/ReleaseFlow/ReleaseStepHeading"

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
  const descriptionId = useId()
  const noteId = useId()

  return (
    <section className="release-panel release-no-protection-warning">
      <ReleaseStepHeading
        className="release-panel-title"
        ariaDescribedBy={`${descriptionId} ${noteId}`}
      >
        Release without protection?
      </ReleaseStepHeading>
      <p id={descriptionId}>
        You can still release this letter now. But without a token, you will not be able to edit or remove it
        later.
      </p>
      <p id={noteId} className="release-small-copy">
        <strong>Note: </strong>This choice cannot be added afterwards.
      </p>

      <div className="release-choice-actions">
        <button type="button" className="release-primary-button" onClick={onBack} disabled={isSubmitting}>
          Go back
        </button>
        <button
          type="button"
          className={`release-secondary-button ${isSubmitting ? "is-busy" : ""}`}
          onClick={onConfirm}
          disabled={isSubmitting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? "Releasing..." : "I understand, release the letter without protection"}
        </button>
      </div>
    </section>
  )
}
