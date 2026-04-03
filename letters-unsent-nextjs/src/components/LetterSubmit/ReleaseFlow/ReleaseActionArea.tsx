import { useState } from "react"

import NoProtectionWarningStep from "@/components/LetterSubmit/ReleaseFlow/NoProtectionWarningStep"
import ProtectionFlow from "@/components/LetterSubmit/ReleaseFlow/ProtectionFlow"
import ReleaseChoicePanel from "@/components/LetterSubmit/ReleaseFlow/ReleaseChoicePanel"
import ReleaseSuccessPanel from "@/components/LetterSubmit/ReleaseFlow/ReleaseSuccessPanel"
import type { ReadyLetterPayload, ReleaseSubmitInput, ReleaseSubmitResult } from "@/components/LetterSubmit/ReleaseFlow/types"

interface ReleaseActionAreaProps {
  letterPayload: ReadyLetterPayload
  onSubmitLetter: (input: ReleaseSubmitInput) => Promise<ReleaseSubmitResult>
  onReturnToConversation: () => void
  onViewLetter: (letterId: string) => void
}

export default function ReleaseActionArea({
  letterPayload,
  onSubmitLetter,
  onReturnToConversation,
  onViewLetter,
}: ReleaseActionAreaProps) {
  const [mode, setMode] = useState<"idle" | "protect" | "warn-unprotected" | "released">("idle")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [releasedLetterId, setReleasedLetterId] = useState<string | null>(null)

  if (!letterPayload.content.trim()) {
    return (
      <div className="release-action-area">
        <section className="release-panel">
          <p className="release-error">This letter is missing content and cannot be released yet.</p>
          <div className="release-panel-actions">
            <button type="button" className="release-secondary-button" onClick={onReturnToConversation}>
              Return to conversation
            </button>
          </div>
        </section>
      </div>
    )
  }

  async function handleSubmitUnprotected() {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setErrorMessage("")

    try {
      const result = await onSubmitLetter({
        ownerPassphrase: null,
        savePassphraseOnDevice: false,
        tokenCopied: false,
      })
      setReleasedLetterId(result.id)
      setMode("released")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while releasing your letter."
      setErrorMessage(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (mode === "idle") {
    return (
      <div className="release-action-area">
        <ReleaseChoicePanel
          onProtect={() => setMode("protect")}
          onReleaseWithoutProtection={() => setMode("warn-unprotected")}
          onReturnToConversation={onReturnToConversation}
        />
      </div>
    )
  }

  if (mode === "warn-unprotected") {
    return (
      <div className="release-action-area">
        <NoProtectionWarningStep
          onBack={() => {
            setErrorMessage("")
            setMode("idle")
          }}
          onConfirm={handleSubmitUnprotected}
          isSubmitting={isSubmitting}
        />
        {errorMessage ? <p className="release-error release-error-standalone">{errorMessage}</p> : null}
      </div>
    )
  }

  if (mode === "released") {
    return (
      <div className="release-action-area">
        <ReleaseSuccessPanel
          onViewLetter={() => {
            if (releasedLetterId) {
              onViewLetter(releasedLetterId)
            }
          }}
          onReturnToConversation={onReturnToConversation}
        />
      </div>
    )
  }

  return (
    <div className="release-action-area">
      <ProtectionFlow
        onBackToChoice={() => setMode("idle")}
        onSubmitProtected={onSubmitLetter}
        onViewLetter={onViewLetter}
        onClose={onReturnToConversation}
      />
    </div>
  )
}
