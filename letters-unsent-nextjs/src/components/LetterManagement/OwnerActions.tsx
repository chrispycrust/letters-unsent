interface OwnerActionsProps {
  isCheckingEdit?: boolean
  onEdit: () => void | Promise<void>
  onRemove: () => void
  onDismiss: () => void
  isMobile: boolean
}

export default function OwnerActions({ 
  isCheckingEdit = false,
  onEdit,
  onRemove,
  onDismiss,
  isMobile
}: OwnerActionsProps) {
  return (
    <div>
      <p className="owner-area-title">For this letter:</p>
      <div
        className={`owner-actions ${isMobile ? "" : "is-desktop"}`}
      >
        <button
          type="button"
          className="owner-subtle-action"
          onClick={onEdit}
          disabled={isCheckingEdit}
          aria-busy={isCheckingEdit}
        >
          {isCheckingEdit ? "Checking your token..." : "Edit"}
        </button>
        <span className="owner-actions-separator">,</span>
        <button type="button" className="owner-subtle-action" onClick={onRemove} disabled={isCheckingEdit}>
          Remove
        </button>
        <span className="owner-actions-separator">or</span>
        <button type="button" className="owner-subtle-action" onClick={onDismiss} disabled={isCheckingEdit}>
          Cancel
        </button>
      </div>
    </div>
  )
}
