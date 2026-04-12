"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"

interface LetterEditFormProps {
  letterId: string
  initialLetter: {
    content: string
    intended_recipient: string | null
    author_name: string | null
  }
}

const TOKEN_NOT_VERIFIED_MESSAGE = "We couldn’t verify your token."
const TOO_MANY_ATTEMPTS_MESSAGE = "Too many attempts in a short time. Please wait a moment, then try again."
const MODERATION_REJECT_MESSAGE = "We couldn’t accept these changes under the archive’s safety guidelines."

export default function LetterEditForm({ letterId, initialLetter }: LetterEditFormProps) {
  const router = useRouter()
  const storageKey = useMemo(() => getLetterPassphraseStorageKey(letterId), [letterId])

  const [verificationStatus, setVerificationStatus] = useState<"checking" | "verified" | "unverified">("checking")
  const [ownerPassphrase, setOwnerPassphrase] = useState<string | null>(null)

  const [content, setContent] = useState(initialLetter.content)
  const [intendedRecipient, setIntendedRecipient] = useState(initialLetter.intended_recipient ?? "")
  const [authorName, setAuthorName] = useState(initialLetter.author_name ?? "")

  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isModerationError, setIsModerationError] = useState(false)
  const [moderationRejectCount, setModerationRejectCount] = useState(0)

  useEffect(() => {
    const storedPassphrase = localStorage.getItem(storageKey)
    if (!storedPassphrase) {
      setVerificationStatus("unverified")
      return
    }

    async function verifyStoredPassphrase() {
      try {
        const response = await fetch("/api/supabase/singleLetter", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            letterId,
            owner_passphrase: storedPassphrase,
          }),
        })

        const data = (await response.json().catch(() => null)) as {
          success?: boolean
          verified?: boolean
        } | null

        if (response.ok && data?.success && data?.verified) {
          setOwnerPassphrase(storedPassphrase)
          setVerificationStatus("verified")
          return
        }

        localStorage.removeItem(storageKey)
        setOwnerPassphrase(null)
        setVerificationStatus("unverified")
      } catch {
        setOwnerPassphrase(null)
        setVerificationStatus("unverified")
      }
    }

    void verifyStoredPassphrase()
  }, [letterId, storageKey])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (verificationStatus !== "verified" || !ownerPassphrase || isSaving) {
      return
    }

    setIsSaving(true)
    setSaveMessage("")
    setErrorMessage("")
    setIsModerationError(false)

    try {
      const response = await fetch("/api/supabase/singleLetter", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          letterId,
          owner_passphrase: ownerPassphrase,
          content,
          intended_recipient: intendedRecipient,
          author_name: authorName,
        }),
      })

      const data = (await response.json().catch(() => null)) as {
        success?: boolean
        code?: string
      } | null

      if (response.ok && data?.success) {
        setSaveMessage("Your changes have been saved.")
        setModerationRejectCount(0)
        setTimeout(() => {
          router.push(`/letters/${letterId}`)
        }, 900)
        return
      }

      if (response.status === 422 || data?.code === "MODERATION_BLOCKED") {
        setIsModerationError(true)
        setErrorMessage(MODERATION_REJECT_MESSAGE)
        setModerationRejectCount((current) => current + 1)
        return
      }

      if (response.status === 429 || data?.code === "VERIFICATION_RATE_LIMITED") {
        setErrorMessage(TOO_MANY_ATTEMPTS_MESSAGE)
        return
      }

      if (response.status === 401 || data?.code === "INVALID_PASSPHRASE" || data?.code === "MISSING_PASSPHRASE") {
        localStorage.removeItem(storageKey)
        setVerificationStatus("unverified")
        setOwnerPassphrase(null)
        setErrorMessage(TOKEN_NOT_VERIFIED_MESSAGE)
        return
      }

      setErrorMessage("We couldn’t save your changes right now. Please try again.")
    } catch {
      setErrorMessage("We couldn’t save your changes right now. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (verificationStatus === "checking") {
    return <p className="letter-edit-status">Checking your token...</p>
  }

  if (verificationStatus === "unverified") {
    return (
      <div className="letter-edit-locked">
        <p>{TOKEN_NOT_VERIFIED_MESSAGE}</p>
        <p>Please return to the letter page and verify it before editing.</p>
        <Link href={`/letters/${letterId}`} className="owner-subtle-action">
          Return to this letter
        </Link>
      </div>
    )
  }

  return (
    <form className="letter-edit-form" onSubmit={handleSubmit}>
      <div className="letter-edit-field">
        <label htmlFor="edit-intended-recipient">Intended recipient</label>
        <input
          id="edit-intended-recipient"
          value={intendedRecipient}
          onChange={(event) => setIntendedRecipient(event.target.value)}
        />
      </div>

      <div className="letter-edit-field">
        <label htmlFor="edit-letter-content">Letter content</label>
        <textarea
          id="edit-letter-content"
          className="letter-edit-content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
      </div>

      <div className="letter-edit-field">
        <label htmlFor="edit-author-name">Author name</label>
        <input
          id="edit-author-name"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
        />
      </div>

      {saveMessage ? <p className="letter-edit-success">{saveMessage}</p> : null}

      {errorMessage ? (
        <div className="letter-edit-error-block">
          <p className="owner-area-error">{errorMessage}</p>
          {isModerationError ? (
            <>
              <p>
                <Link href="/about#submission-guidelines" className="owner-subtle-action">
                  Read the submission guidelines
                </Link>
              </p>
              {moderationRejectCount >= 2 ? (
                <p>
                  If you believe this letter follows the guidelines, please email dear@letters-unsent.com for review.
                </p>
              ) : null}
            </>
          ) : null}
        </div>
      ) : null}

      <div className="letter-edit-actions">
        <button
          type="button"
          className="owner-subtle-action"
          onClick={() => router.push(`/letters/${letterId}`)}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button type="submit" className="owner-subtle-action" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  )
}
