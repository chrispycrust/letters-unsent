import { createPortal } from "react-dom"

interface DeleteConfirmationModalProps {
  isOpen: boolean
  isDeleting: boolean
  isDeleted: boolean
  errorMessage: string
  onClose: () => void
  onConfirmDelete: () => void
}

export default function DeleteConfirmationModal({
  isOpen,
  isDeleting,
  isDeleted,
  errorMessage,
  onClose,
  onConfirmDelete,
}: DeleteConfirmationModalProps) {
  if (!isOpen) {
    return null
  }

  return createPortal(
    <div className="delete-confirmation-overlay" data-testid="delete-confirmation-overlay">
      <div
        className="delete-confirmation-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-confirmation-heading"
      >
        <button
          type="button"
          className="delete-modal-close"
          onClick={onClose}
          aria-label="Close"
          disabled={isDeleting}
        >
          ×
        </button>

        {isDeleted ? (
          <p className="delete-success-message">Your letter has been removed from the archive.</p>
        ) : (
          <> 
            <h2 id="delete-confirmation-heading">Remove this letter?</h2>
            <p>This action cannot be undone. Your letter will be permanently removed.</p>

            {errorMessage ? <p className="owner-area-error">{errorMessage}</p> : null}

            <div className="delete-confirmation-actions">
              <button
                type="button"
                onClick={onClose}
                disabled={isDeleting}
              >
                Go back
              </button>
              <button
                type="button"
                className="owner-destructive-action"
                onClick={onConfirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Removing..." : "I understand, please remove my letter"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}
