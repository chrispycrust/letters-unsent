import { useId } from "react"

import ProtectionStepShell from "@/components/LetterSubmit/ReleaseFlow/ProtectionStepShell"

interface ProtectionConfirmedStepProps {
  savedOnDevice: boolean
  tokenCopied: boolean
  onViewLetter: () => void
  onClose: () => void
}

export default function ProtectionConfirmedStep({
  savedOnDevice,
  tokenCopied,
  onViewLetter,
  onClose,
}: ProtectionConfirmedStepProps) {
  const confirmations = [
    savedOnDevice ? "Saved on this device" : null,
    tokenCopied ? "Token copied" : null,
  ].filter(Boolean)
  const confirmationListId = useId()

  return (
    <ProtectionStepShell
      title="Your letter is protected"
      stepLabel="Step 4 of 4"
      description="Keep your token safe. You’ll need it later to edit or remove this letter."
      additionalHeadingDescriptionIds={[confirmationListId]}
      actions={
        <>
          <button type="button" className="release-primary-button" onClick={onViewLetter}>
            View my letter
          </button>
          <button type="button" className="release-secondary-button" onClick={onClose}>
            Close
          </button>
        </>
      }
    >
      <ul id={confirmationListId} className="release-confirmation-list">
        {confirmations.length > 0 ? (
          confirmations.map((item) => (
            <li key={item} className="release-confirmation-item">
              {item}
            </li>
          ))
        ) : (
          <li className="release-confirmation-item">Kept by you</li>
        )}
      </ul>
    </ProtectionStepShell>
  )
}
