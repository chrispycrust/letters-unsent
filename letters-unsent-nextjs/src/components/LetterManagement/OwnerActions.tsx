interface OwnerActionsProps {
  isCheckingEdit?: boolean
  onEdit: () => void | Promise<void>
  onRemove: () => void
  onDismiss: () => void
}

export default function OwnerActions({ 
  isCheckingEdit = false,
  onEdit,
  onRemove,
  onDismiss,
}: OwnerActionsProps) {
  return (
    <>
      <i className="owner-area-title">For this letter:</i>
      <div>
        <button
          type="button"
          className={`owner-subtle-action ${isCheckingEdit ? "is-busy" : ""}`}
          onClick={onEdit}
          disabled={isCheckingEdit}
          aria-busy={isCheckingEdit}
        >
          {isCheckingEdit ? "Checking your token..." : "Edit"}
        </button>
        <span className="owner-actions-separator-comma">,</span>
        <button 
          type="button" 
          className="owner-subtle-action"
          onClick={onRemove} 
          disabled={isCheckingEdit}
        >
          Remove
        </button>
        <span className="owner-actions-separator-word">or</span>
        <button type="button" className="owner-subtle-action" onClick={onDismiss} disabled={isCheckingEdit}>
          Cancel
        </button>
      </div>
    </>
  )
}
