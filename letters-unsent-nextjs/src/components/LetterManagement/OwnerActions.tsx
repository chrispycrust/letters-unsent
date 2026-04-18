import Link from "next/link"

interface OwnerActionsProps {
  letterId: string
  onRemove: () => void
  onDismiss: () => void
}

export default function OwnerActions({ 
  letterId, onRemove , onDismiss
}: OwnerActionsProps) {
  return (
    <div>
      <p>For this letter:</p>
      <div className="owner-actions">
        <Link href={`/letters/${letterId}/edit`} className="owner-subtle-action">
          Edit
        </Link>
        <span className="owner-actions-separator">or</span>
        <button type="button" className="owner-subtle-action" onClick={onRemove}>
          Remove
        </button>
        <button type="button" className="owner-subtle-action" onClick={onDismiss}>
          Cancel
        </button>
      </div>
    </div>
  )
}
