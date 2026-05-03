interface OwnerEditActionsProps {
  editFormId: string
  onCancel: () => void
}

export default function OwnerEditActions({
  editFormId,
  onCancel,
}: OwnerEditActionsProps) {
  return (
    <div className="owner-edit-actions">
      <p className="owner-area-title">You are editing this letter.</p>
      <div className="owner-actions owner-edit-action-buttons">
        <button
          type="submit"
          form={editFormId}
          className="owner-subtle-action"
        >
          Save changes
        </button>
        <span className="owner-actions-separator">or</span>
        <button
          type="button"
          className="owner-subtle-action"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
