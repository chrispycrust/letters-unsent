import Link from "next/link"

export default function NavigationModal({ onClose } ) {
    return (
      <div className="modal">
        <button
          onClick={onClose}
        >
          Close
        </button>
        <div>
          <Link href="/submit">Release A Letter</Link>
        </div><div>
          <Link href="/about">About</Link>
        </div>
        <p>Letters Unsent (v1.0)</p>
      </div>
    )
}