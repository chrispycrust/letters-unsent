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
                className="delete-confirmation-button"
                onClick={onClose}
                disabled={isDeleting}
              >
                No, I'll go back
              </button>

              <button
                type="button"
                className={`delete-confirmation-button owner-destructive-action ${isDeleting ? "is-busy" : ""}`}
                onClick={onConfirmDelete}
                disabled={isDeleting}
                aria-busy={isDeleting}
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
