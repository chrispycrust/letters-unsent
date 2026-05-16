interface OwnerActionsProps {
  onEdit: () => void
  onRemove: () => void
  onDismiss: () => void
}

export default function OwnerActions({ 
  onEdit, onRemove , onDismiss
}: OwnerActionsProps) {
  return (
    <div>
      <p className="owner-area-title">For this letter:</p>
      <div className="owner-actions">
        <button type="button" className="owner-subtle-action" onClick={onEdit}>
          Edit
        </button>
        <span className="owner-actions-separator">,</span>
        <button type="button" className="owner-subtle-action" onClick={onRemove}>
          Remove
        </button>
        <span className="owner-actions-separator">or</span>
        <button type="button" className="owner-subtle-action" onClick={onDismiss}>
          Cancel
        </button>
      </div>
    </div>
  )
}
