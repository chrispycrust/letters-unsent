"use client"

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"
import type { Letter } from "@/types/letter"
import type { SubmitEvent as ReactSubmitEvent } from "react"

type EditableLetterFields = Pick<Letter, "content" | "intended_recipient" | "author_name">

interface LetterEditFormProps {
  letterId: string
  formId?: string
  ownerPassphrase: string
  initialLetter: EditableLetterFields
  onCancel?: () => void
  onSaveSuccess?: (updatedFields: EditableLetterFields & Pick<Letter, "updated_at">) => void
  initialScrollPosition: { x: number; y: number } | null
  isSaving: boolean
  onSavingChange: (isSaving: boolean) => void
  onSendingFeedback: (feedback: string | null) => void
}

const TOKEN_NOT_VERIFIED_MESSAGE = "We couldn’t verify your token."
const TOO_MANY_ATTEMPTS_MESSAGE = "Too many attempts in a short time. Please wait a moment, then try again."
const MODERATION_REJECT_MESSAGE = "We couldn’t accept these changes under the archive's safety guidelines."
                                  + " Please review the content on the about page and try again."

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
  ownerPassphrase,
  initialLetter,
  onSaveSuccess,
  initialScrollPosition,
  isSaving,
  onSavingChange,
  onSendingFeedback
}: LetterEditFormProps) {
  const router = useRouter()
  const storageKey = useMemo(() => getLetterPassphraseStorageKey(letterId), [letterId])

  const [content, setContent] = useState(initialLetter.content)
  const [intendedRecipient, setIntendedRecipient] = useState(initialLetter.intended_recipient ?? "")
  const [authorName, setAuthorName] = useState(initialLetter.author_name ?? "")

  const [isOwnerTokenRejected, setIsOwnerTokenRejected] = useState(false)
  const [moderationRejectCount, setModerationRejectCount] = useState(0)

  const initialScrollPositionRef = useRef(initialScrollPosition)

  const pendingScrollPositionRef = useRef<{ x: number; y: number } | null>(null)

  const contentTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  const resizeContentTextarea = useCallback(() => {
    const textarea = contentTextareaRef.current
    if (!textarea) {
      return
    }

    textarea.style.height = "auto"
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [])

  function restoreBodyScroll(scrollX: number, scrollY: number) {
    const previousBodyScrollBehavior = document.body.style.scrollBehavior

    document.body.style.scrollBehavior = "auto"
    document.body.scrollLeft = scrollX
    document.body.scrollTop = scrollY
    document.body.style.scrollBehavior = previousBodyScrollBehavior
  }

  function handleContentChange(event: React.ChangeEvent<HTMLTextAreaElement>) {
    pendingScrollPositionRef.current = {
      x: document.body.scrollLeft,
      y: document.body.scrollTop,
    }

    setContent(event.target.value)
  }

  useLayoutEffect(() => {

    if (initialScrollPositionRef.current) {
      restoreBodyScroll(initialScrollPositionRef.current.x, initialScrollPositionRef.current.y)
    }

    if (!contentTextareaRef.current) {
      return
    }

    const scrollPositionToRestore = 
      initialScrollPositionRef.current ?? 
      pendingScrollPositionRef.current ?? 
      {
        x: document.body.scrollLeft,
        y: document.body.scrollTop,
      }

    resizeContentTextarea()

    restoreBodyScroll(scrollPositionToRestore.x, scrollPositionToRestore.y)

    requestAnimationFrame(() => {
      restoreBodyScroll(scrollPositionToRestore.x, scrollPositionToRestore.y)
    })

    initialScrollPositionRef.current = null
    pendingScrollPositionRef.current = null

  }, [content, intendedRecipient, resizeContentTextarea])

  async function handleSubmit(event: ReactSubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!ownerPassphrase || isSaving || isOwnerTokenRejected) {
      return
    }

    onSavingChange(true)
    onSendingFeedback(null)

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
        onSavingChange(false)  
        onSendingFeedback("Your changes have been saved.")
        setModerationRejectCount(0)
        
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
        return
      }

      if (response.status === 422 || data?.code === "MODERATION_BLOCKED") {
        const nextModerationRejectCount = moderationRejectCount + 1
        setModerationRejectCount(nextModerationRejectCount)

        if (nextModerationRejectCount >= 3) {
          onSendingFeedback(
            MODERATION_REJECT_MESSAGE 
            + " If you believe this letter follows the guidelines, please email dear@letters-unsent.com."
          )
          return
        }
        onSendingFeedback(MODERATION_REJECT_MESSAGE)
        return
      }

      if (response.status === 429 || data?.code === "VERIFICATION_RATE_LIMITED") {
        onSendingFeedback(TOO_MANY_ATTEMPTS_MESSAGE)
        return
      }

      if (shouldClearStoredPassphrase(response.status, data?.code)) {
        localStorage.removeItem(storageKey)
        setIsOwnerTokenRejected(true)
        onSendingFeedback(TOKEN_NOT_VERIFIED_MESSAGE)
        return
      }

      onSendingFeedback("We couldn’t save your changes right now. Please try again.")
    } catch {
      onSendingFeedback("We couldn’t save your changes right now. Please try again.")
    } finally {
      onSavingChange(false)
    }
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
        onChange={handleContentChange}
      />

      <label htmlFor="edit-author-name" className="sr-only">
        Author name
      </label>
      <p className="sign-off letter-edit-sign-off">
        <span className="letter-edit-sign-off-mark" aria-hidden="true">—</span>
        <input
          id="edit-author-name"
          className="letter-edit-author-input"
          value={authorName}
          onChange={(event) => setAuthorName(event.target.value)}
          placeholder="Author name (optional)"
        />
      </p>

    </form>
  )
}
