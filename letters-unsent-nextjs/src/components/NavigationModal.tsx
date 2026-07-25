import { useEffect, useRef, type KeyboardEvent } from "react"
import Link from "next/link"
import EnvelopeOpenIcon from "../../public/icons/envelope-open"

const focusableElementSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",")

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
    const dialogRef = useRef<HTMLDialogElement>(null)
    const closeButtonRef = useRef<HTMLButtonElement>(null)

    useEffect(() => {
      const dialog = dialogRef.current

      if (!dialog) {
        return
      }

      if (!dialog.open) {
        dialog.showModal()
      }

      closeButtonRef.current?.focus({ preventScroll: true })
    }, [])

    function closeDialog() {
      dialogRef.current?.close()
    }

    function containKeyboardFocus(event: KeyboardEvent<HTMLDialogElement>) {
      if (event.key !== "Tab") {
        return
      }

      const dialog = dialogRef.current

      if (!dialog) {
        return
      }

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(focusableElementSelector),
      )
      const firstFocusableElement = focusableElements[0]
      const lastFocusableElement = focusableElements.at(-1)

      if (!firstFocusableElement || !lastFocusableElement) {
        event.preventDefault()
        return
      }

      if (event.shiftKey && document.activeElement === firstFocusableElement) {
        event.preventDefault()
        lastFocusableElement.focus()
      } else if (
        !event.shiftKey
        && document.activeElement === lastFocusableElement
      ) {
        event.preventDefault()
        firstFocusableElement.focus()
      }
    }

    return (
      <dialog
        ref={dialogRef}
        className="modal"
        aria-label="Navigation menu"
        onClose={onClose}
        onKeyDown={containKeyboardFocus}
      >
        <div className="button-change-modal-container">
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeDialog}
            className="button-change-modal"
          >
            <EnvelopeOpenIcon />
          </button>
        </div>

        <div className="modal-links">
          <p>
            <Link 
              href="/" 
              onClick={closeDialog}
            >
              Home
            </Link>
          </p>
          <p>
            <Link 
              href="/submit" 
              onClick={closeDialog}
            >
              Release A Letter
            </Link>
          </p>
          <p>
            <Link 
              href="/about" 
              onClick={closeDialog}
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
          <p>Letters Unsent (<Link href="/changelog" onClick={closeDialog}>v1.1</Link>). Released 2026</p>
          <p>Built with Next.js, React (with TypeScript), OpenAI&apos;s API, Supabase, Tabler</p>
        </div>
        
      </dialog>
    )
}