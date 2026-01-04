import Link from "next/link"
import EnvelopeOpenIcon from "../../public/icons/envelope-open"

type NavigationModalProps = {
  onClose: () => void
}

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Feedback on client for user that data is loading

-------------------------------------------------------------------------------------------------
*/

export default function NavigationModal({ 
  onClose 
}: NavigationModalProps ) {
    return (
      <div className="modal">

        <div className="button-change-modal-container">
          <button
            onClick={onClose}
            className="button-change-modal"
          >
            <EnvelopeOpenIcon />
          </button>
        </div>

        <div className="modal-links">
          <p>
            <Link 
              href="/" 
              onClick={onClose}
            >
              Home
            </Link>
          </p>
          <p>
            <Link 
              href="/submit" 
              onClick={onClose}
            >
              Release A Letter
            </Link>
          </p>
          <p>
            <Link 
              href="/about" 
              onClick={onClose}
            >
              About & Contact
            </Link>
          </p>
          {/* <p>
            <Link 
              href="/about" 
              onClick={onClose}
            >
              Contact
            </Link>
          </p> */}
        </div>
          
        <div className="modal-footer">
          <p>Letters Unsent (v1.0) - 2026, <Link href="/changelog" onClick={onClose}>view changelog</Link></p>
          <p>Built with Next.js, React (with TypeScript), OpenAI&apos;s API, Supabase, Tabler</p>
        </div>
        
      </div>
    )
}