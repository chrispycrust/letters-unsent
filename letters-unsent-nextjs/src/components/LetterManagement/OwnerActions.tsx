import Link from "next/link"

interface OwnerActionsProps {
  letterId: string
  onRemove: () => void
}

export default function OwnerActions({ letterId, onRemove }: OwnerActionsProps) {
  return (
    <div className="owner-actions">
      <Link href={`/letters/${letterId}/edit`} className="owner-subtle-action">
        Edit
      </Link>
      <span className="owner-actions-separator">or</span>
      <button type="button" className="owner-subtle-action" onClick={onRemove}>
        Remove
      </button>
    </div>
  )
}
