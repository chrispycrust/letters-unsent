"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"
import type { Letter } from "@/types/letter"

type EditableLetterFields = Pick<Letter, "content" | "intended_recipient" | "author_name">

interface LetterEditFormProps {
  letterId: string
  formId?: string
  initialLetter: EditableLetterFields
  showInlineActions?: boolean
  onCancel?: () => void
  onSaveSuccess?: (updatedFields: EditableLetterFields & Pick<Letter, "updated_at">) => void
}

const TOKEN_NOT_VERIFIED_MESSAGE = "We couldn’t verify your token."
const TOO_MANY_ATTEMPTS_MESSAGE = "Too many attempts in a short time. Please wait a moment, then try again."
const MODERATION_REJECT_MESSAGE = "We couldn’t accept these changes under the archive’s safety guidelines."

function shouldClearStoredPassphrase(status: number, code?: string): boolean {
  return (
    status === 401 ||
    status === 404 ||
    code === "INVALID_PASSPHRASE" ||
    code === "MISSING_PASSPHRASE" ||
    code === "LETTER_NOT_FOUND"
  )
}

export default function LetterEditForm({
  letterId,
  formId,
  initialLetter,
  showInlineActions = true,
  onCancel,
  onSaveSuccess,
}: LetterEditFormProps) {
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
  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null)

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
          code?: string
        } | null

        if (response.ok && data?.success && data?.verified) {
          setOwnerPassphrase(storedPassphrase)
          setVerificationStatus("verified")
          return
        }

        if (shouldClearStoredPassphrase(response.status, data?.code)) {
          localStorage.removeItem(storageKey)
        }
        setOwnerPassphrase(null)
        setVerificationStatus("unverified")
      } catch {
        setOwnerPassphrase(null)
        setVerificationStatus("unverified")
      }
    }

    void verifyStoredPassphrase()
  }, [letterId, storageKey])

  useEffect(() => {
    const textarea = contentTextareaRef.current
    if (!textarea) {
      return
    }

    const resizeToContent = () => {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    resizeToContent()
    const animationFrameId = window.requestAnimationFrame(resizeToContent)

    return () => {
      window.cancelAnimationFrame(animationFrameId)
    }
  }, [content, intendedRecipient, verificationStatus])

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
        data?: Partial<Letter>[]
      } | null

      if (response.ok && data?.success) {
        setSaveMessage("Your changes have been saved.")
        setModerationRejectCount(0)
        setTimeout(() => {
          if (onSaveSuccess) {
            const savedLetter = data.data?.[0]
            onSaveSuccess({
              content: typeof savedLetter?.content === "string" ? savedLetter.content : content.trim(),
              intended_recipient:
                typeof savedLetter?.intended_recipient === "string"
                  ? savedLetter.intended_recipient
                  : intendedRecipient.trim().length > 0
                    ? intendedRecipient.trim()
                    : null,
              author_name:
                typeof savedLetter?.author_name === "string"
                  ? savedLetter.author_name
                  : authorName.trim().length > 0
                    ? authorName.trim()
                    : null,
              updated_at:
                typeof savedLetter?.updated_at === "string"
                  ? savedLetter.updated_at
                  : new Date().toISOString(),
            })
            return
          }

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
    <form id={formId} className="letter-edit-form" onSubmit={handleSubmit}>
      <label htmlFor="edit-intended-recipient" className="sr-only">
        Intended recipient
      </label>
      <h2>
        <input
          id="edit-intended-recipient"
          className="letter-edit-recipient-input"
          value={intendedRecipient}
          onChange={(event) => setIntendedRecipient(event.target.value)}
          placeholder="Intended recipient (optional)"
        />
      </h2>

      <label htmlFor="edit-letter-content" className="sr-only">
        Letter content
      </label>
      <textarea
        id="edit-letter-content"
        ref={contentTextareaRef}
        className={`letter-edit-content-input preserve-breaks ${
          intendedRecipient.trim().length > 0
            ? "single-letter-content-container-with-recipient"
            : "single-letter-content-no-recipient"
        }`}
        value={content}
        onChange={(event) => setContent(event.target.value)}
      />

      <label htmlFor="edit-author-name" className="sr-only">
        Author name
      </label>
      <p className="sign-off letter-edit-sign-off">
        <input
          id="edit-author-name"
          className="letter-edit-author-input"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Author name (optional)"
        />
      </p>

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

      {showInlineActions ? (
        <div className="letter-edit-actions">
          <p>For this letter</p>
          <button
            type="button"
            className="owner-subtle-action"
            onClick={() => {
              if (onCancel) {
                onCancel()
                return
              }

              router.push(`/letters/${letterId}`)
            }}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button type="submit" className="owner-subtle-action" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      ) : null}
    </form>
  )
}
