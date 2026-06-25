import { useRouter } from "next/navigation"

interface OwnerEditActionsProps {
  editFormId: string
  onCancel: () => void
  isSaving: boolean
}

export default function OwnerEditActions({
  editFormId,
  onCancel,
  isSaving
}: OwnerEditActionsProps) {
  
  const router = useRouter()

  return (
    <div className="owner-edit-actions">
      <p className="owner-area-title">You are editing this letter.</p>
      <div className="owner-actions owner-edit-action-buttons">
        <button
          type="submit"
          form={editFormId}
          className="owner-subtle-action"
          // disabled={isSaving || isOwnerTokenRejected}
          disabled={isSaving}
        >
          {isSaving ? "Saving changes..." : "Save changes"}
        </button>
        <span className="owner-actions-separator">or</span>
        <button
          type="button"
          className="owner-subtle-action"
          onClick={() => {
              if (onCancel) {
                onCancel()
                return
              }

              // router.push(`/letters/${letterId}`)
            }}
          disabled={isSaving}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
