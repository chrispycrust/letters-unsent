import { useRouter } from "next/navigation"

interface OwnerEditActionsProps {
  editFormId: string
  onCancel: () => void
  isSaving: boolean
  editFeedback?: string | null
  onDismissEditFeedback: () => void
}

export default function OwnerEditActions({
  editFormId,
  onCancel,
  isSaving,
  editFeedback,
  onDismissEditFeedback,
}: OwnerEditActionsProps) {
  
  const router = useRouter()
  const hasEditFeedback = Boolean(editFeedback && editFeedback.trim() !== "")

  const stopEditingButton = (
    <button
      type="button"
      className="owner-subtle-action"
      onClick={() => {
          if (onCancel) {
            onDismissEditFeedback?.()
            onCancel()
            return
          }

          // router.push(`/letters/${letterId}`)
        }}
      disabled={isSaving}
    >
      Stop editing
    </button>
  )

  const editControls = (
    <div key="edit-controls" className="owner-actions owner-edit-action-buttons">
      <button
        type="submit"
        form={editFormId}
        className={`owner-subtle-action ${isSaving ? "is-busy" : ""}`}
        // disabled={isSaving || isOwnerTokenRejected}
        disabled={isSaving}
        aria-busy={isSaving}
      >
        {isSaving ? "Saving changes..." : "Save changes"}
      </button>

      <span className="owner-actions-separator-word">or</span>

      {stopEditingButton}
      
    </div>
  )

  const feedbackControls = (
    <div key="feedback-controls" className="owner-actions owner-edit-action-buttons">

      <button
        type="button"
        className="owner-subtle-action"
        onClick={(event) => {
          event.preventDefault()
          onDismissEditFeedback()
        }}
      >
        Keep editing
      </button>

      <span className="owner-actions-separator-word">or</span>

      {stopEditingButton}

    </div>
  )

  return (
    <>
      <i className="owner-area-title">
        {hasEditFeedback ? editFeedback : "You are editing this letter."}
      </i>

        {
          hasEditFeedback ? (
            feedbackControls
          ) : (
            editControls
          )
        }
    </>
  )
}
