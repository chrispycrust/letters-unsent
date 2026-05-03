"use client"

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useEffect, useMemo, useRef, useState, type FocusEvent, type PointerEvent } from "react"
import { useCallback } from "react"
import { useRouter } from "next/navigation"

import DeleteConfirmationModal from "@/components/LetterManagement/DeleteConfirmationModal"
import OwnerActions from "@/components/LetterManagement/OwnerActions"
import OwnerVerificationPanel from "@/components/LetterManagement/OwnerVerificationPanel" 

import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"

interface LetterOwnerAreaProps {
  letterId: string
  isEditing: boolean
  editFormId: string
  onEdit: () => void
  onCancelEdit: () => void
}

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Defines the area on single letter page for letter owners to verify ownership and access owner actions

------------------------------------------------------------------------------------------------- 
*/

const INVALID_TOKEN_MESSAGE = "The token doesn’t match this letter. Please try again."
const TOO_MANY_ATTEMPTS_MESSAGE = "Too many attempts in a short time. Please wait a moment, then try again."
const TOKEN_NOT_VERIFIED_MESSAGE = "We couldn’t verify your token."
const DELETE_ERROR_FALLBACK = "We couldn’t remove this letter right now. Please try again."
const EMPTY_TOKEN_MESSAGE = "Enter your token first."
const MOBILE_OWNER_SURFACE_QUERY = "(max-width: 700px)"

type MobileSheetMode = "closed" | "open-unverified" | "open-verified" | "editing"
type MobileSheetSnap = "compact" | "full"

type VerifyOptions = {
  silent: boolean
}

function shouldClearStoredPassphrase(status: number, code?: string): boolean {
  return (
    status === 401 ||
    status === 404 ||
    code === "INVALID_PASSPHRASE" ||
    code === "MISSING_PASSPHRASE" ||
    code === "LETTER_NOT_FOUND"
  )
}

function getIsMobileOwnerSurface(): boolean {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(MOBILE_OWNER_SURFACE_QUERY).matches
}

function useIsMobileOwnerSurface() {
  const [isMobile, setIsMobile] = useState(getIsMobileOwnerSurface)

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }

    const mediaQuery = window.matchMedia(MOBILE_OWNER_SURFACE_QUERY)
    const updateIsMobile = () => setIsMobile(mediaQuery.matches)

    updateIsMobile()
    mediaQuery.addEventListener("change", updateIsMobile)

    return () => {
      mediaQuery.removeEventListener("change", updateIsMobile)
    }
  }, [])

  return isMobile
}

export default function LetterOwnerArea({
  letterId,
  isEditing,
  editFormId,
  onEdit,
  onCancelEdit,
}: LetterOwnerAreaProps) {

  const router = useRouter()
  const storageKey = useMemo(() => getLetterPassphraseStorageKey(letterId), [letterId])
  const isMobile = useIsMobileOwnerSurface()

  const [isExpanded, setIsExpanded] = useState(false)
  const [tokenInput, setTokenInput] = useState("")
  const [verificationMessage, setVerificationMessage] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedPassphrase, setVerifiedPassphrase] = useState<string | null>(null)
  const [isManaging, setIsManaging] = useState(false)
  const [mobileSheetMode, setMobileSheetMode] = useState<MobileSheetMode>("closed")
  const [mobileSheetSnap, setMobileSheetSnap] = useState<MobileSheetSnap>("compact")
  const [sheetDragOffset, setSheetDragOffset] = useState(0)
  const [isDraggingSheet, setIsDraggingSheet] = useState(false)
  const [isEditPocketExpanded, setIsEditPocketExpanded] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("")
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const sheetDragStartY = useRef<number | null>(null)
  const editPocketCollapseTimer = useRef<number | null>(null)
  const editPocketHasFocus = useRef(false)


  useEffect(() => {
    if (!isMobile) {
      closeMobileSheet()
    }
  }, [isMobile])

  useEffect(() => {
    if (isEditing && isMobile) {
      openMobileSheet("editing")
      return
    }

    if (!isEditing && mobileSheetMode === "editing") {
      if (isMobile && isVerified) {
        openMobileSheet("open-verified")
        return
      }
      closeMobileSheet()
    }
  }, [isEditing, isMobile, isVerified, mobileSheetMode])

  useEffect(() => {
    if (isEditing && !isMobile) {
      expandEditPocket()
      scheduleEditPocketCollapse(2400)
      return
    }

    clearEditPocketCollapseTimer()
    setIsEditPocketExpanded(false)
  }, [isEditing, isMobile])

  useEffect(() => {
    return () => clearEditPocketCollapseTimer()
  }, [])

  const verifyToken = useCallback(async (passphrase: string, options: VerifyOptions): Promise<boolean> => {
    setIsVerifying(true)

    try {
      const response = await fetch("/api/supabase/singleLetter", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          letterId,
          owner_passphrase: passphrase,
        }),
      })

      const data = (await response.json().catch(() => null)) as {
        success?: boolean
        verified?: boolean
        code?: string
      } | null

      if (response.ok && data?.success && data?.verified) {
        setIsVerified(true)
        setVerifiedPassphrase(passphrase)
        setTokenInput("")
        setVerificationMessage("")
        setIsExpanded(false)
        if (!options.silent && isMobile) {
          openMobileSheet("open-verified")
        }
        localStorage.setItem(storageKey, passphrase)
        return true
      }

      setIsVerified(false)
      setVerifiedPassphrase(null)
      if (shouldClearStoredPassphrase(response.status, data?.code)) {
        localStorage.removeItem(storageKey)
      }

      if (!options.silent) {
        if (response.status === 429 || data?.code === "VERIFICATION_RATE_LIMITED") {
          setVerificationMessage(TOO_MANY_ATTEMPTS_MESSAGE)
        } else {
          setVerificationMessage(INVALID_TOKEN_MESSAGE)
        }
        setTokenInput("")
      }

      return false
    } catch {
      if (!options.silent) {
        setVerificationMessage("We couldn’t verify your token right now. Please try again.")
      }
      return false
    } finally {
      setIsVerifying(false)
    }
  }, [isMobile, letterId, storageKey])

  useEffect(() => {
    const storedPassphrase = localStorage.getItem(storageKey)
    if (!storedPassphrase) {
      return
    }

    void verifyToken(storedPassphrase, { silent: true })
  }, [storageKey, verifyToken])

  function clearEditPocketCollapseTimer() {
    if (editPocketCollapseTimer.current) {
      window.clearTimeout(editPocketCollapseTimer.current)
      editPocketCollapseTimer.current = null
    }
  }

  function scheduleEditPocketCollapse(delay = 1800) {
    clearEditPocketCollapseTimer()
    if (editPocketHasFocus.current) {
      return
    }

    editPocketCollapseTimer.current = window.setTimeout(() => {
      setIsEditPocketExpanded(false)
    }, delay)
  }

  function expandEditPocket() {
    clearEditPocketCollapseTimer()
    setIsEditPocketExpanded(true)
  }

  function openMobileSheet(mode: Exclude<MobileSheetMode, "closed">) {
    setMobileSheetMode(mode)
    setMobileSheetSnap("compact")
    setSheetDragOffset(0)
  }

  function closeMobileSheet() {
    setMobileSheetMode("closed")
    setMobileSheetSnap("compact")
    setSheetDragOffset(0)
  }

  async function handleConfirmToken() {
    if (isVerifying) {
      return
    }

    const candidatePassphrase = tokenInput.trim()
    if (!candidatePassphrase) {
      setVerificationMessage(EMPTY_TOKEN_MESSAGE)
      return
    }

    await verifyToken(candidatePassphrase, { silent: false })
  }

  function handleOpenVerificationPanel() {
    if (isMobile) {
      setVerificationMessage("")
      openMobileSheet("open-unverified")
      return
    }

    setIsExpanded(true)
    setVerificationMessage("")
  }
  
  function handleOpenManagementPanel() {
    if (isMobile) {
      openMobileSheet("open-verified")
      return
    }

    setIsManaging(true)
  }

  function handleEditing() {
    setIsManaging(false)
    onEdit()
    if (isMobile) {
      openMobileSheet("editing")
    }
  }
  
  function handleDismiss() {
    setIsManaging(false)
    if (isMobile) {
      closeMobileSheet()
    }
  }

  function handleCancel() {
    setIsExpanded(false)
    setTokenInput("")
    setVerificationMessage("")
    if (isMobile) {
      closeMobileSheet()
    }
  }

  function handleCancelEdit() {
    onCancelEdit()
    if (isMobile && isVerified) {
      openMobileSheet("open-verified")
      return
    }

    closeMobileSheet()
  }

  function handleOpenDeleteModal() {
    setDeleteErrorMessage("")
    setDeleteSuccess(false)
    setIsDeleteModalOpen(true)
  }

  function handleCloseDeleteModal() {
    if (isDeleting) {
      return
    }

    setIsDeleteModalOpen(false)
    setDeleteErrorMessage("")
    setDeleteSuccess(false)
  }

  async function handleConfirmDelete() {
    if (!verifiedPassphrase) {
      setDeleteErrorMessage(TOKEN_NOT_VERIFIED_MESSAGE)
      return
    }

    setIsDeleting(true)
    setDeleteErrorMessage("")

    try {
      const response = await fetch(`/api/supabase/singleLetter?letterId=${letterId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          owner_passphrase: verifiedPassphrase,
        }),
      })

      const data = (await response.json().catch(() => null)) as {
        success?: boolean
        code?: string
      } | null

      if (response.ok && data?.success) {
        setDeleteSuccess(true)
        setDeleteErrorMessage("")
        localStorage.removeItem(storageKey)
        setTimeout(() => {
          router.push("/")
        }, 1000)
        return
      }

      if (response.status === 401 || data?.code === "INVALID_PASSPHRASE" || data?.code === "MISSING_PASSPHRASE") {
        setDeleteErrorMessage(TOKEN_NOT_VERIFIED_MESSAGE)
        setIsVerified(false)
        setVerifiedPassphrase(null)
        return
      }

      if (response.status === 429 || data?.code === "VERIFICATION_RATE_LIMITED") {
        setDeleteErrorMessage(TOO_MANY_ATTEMPTS_MESSAGE)
        return
      }

      setDeleteErrorMessage(DELETE_ERROR_FALLBACK)
    } catch {
      setDeleteErrorMessage(DELETE_ERROR_FALLBACK)
    } finally {
      setIsDeleting(false)
    }
  }

  function handleSheetPointerDown(event: PointerEvent<HTMLButtonElement>) {
    sheetDragStartY.current = event.clientY
    setIsDraggingSheet(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function handleSheetPointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (sheetDragStartY.current === null) {
      return
    }

    const nextOffset = event.clientY - sheetDragStartY.current
    setSheetDragOffset(Math.max(-140, Math.min(180, nextOffset)))
  }

  function handleSheetPointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (sheetDragStartY.current === null) {
      return
    }

    const finalOffset = event.clientY - sheetDragStartY.current

    if (finalOffset > 80) {
      closeMobileSheet()
    } else if (finalOffset < -60) {
      setMobileSheetSnap("full")
    } else {
      setMobileSheetSnap("compact")
    }

    sheetDragStartY.current = null
    setSheetDragOffset(0)
    setIsDraggingSheet(false)
  }

  function handleSheetFocusCapture(event: FocusEvent<HTMLDivElement>) {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      setMobileSheetSnap("full")
    }
  }

  const verificationPanel = (
    <OwnerVerificationPanel
      token={tokenInput}
      isSubmitting={isVerifying}
      errorMessage={verificationMessage}
      onTokenChange={(value) => {
        setTokenInput(value)
        if (verificationMessage === EMPTY_TOKEN_MESSAGE) {
          setVerificationMessage("")
        }
      }}
      onConfirm={handleConfirmToken}
      onCancel={handleCancel}
    />
  )

  const ownerActions = (
    <OwnerActions
      onEdit={handleEditing}
      onRemove={handleOpenDeleteModal}
      onDismiss={handleDismiss}
    />
  )

  const editActions = (
    <div className="owner-edit-actions">
      <p className="owner-area-title">You are editing this letter.</p>
      <div className="owner-actions owner-edit-action-buttons">
        <button
          type="submit"
          form={editFormId}
          className="owner-subtle-action"
        >
          Save changes
        </button>
        <span className="owner-actions-separator">or</span>
        <button
          type="button"
          className="owner-subtle-action"
          onClick={handleCancelEdit}
        >
          Cancel
        </button>
      </div>
    </div>
  )

  function renderDesktopEditPocket() {
    return (
      <div
        data-testid="desktop-edit-pocket"
        className={`owner-edit-pocket is-sticky ${isEditPocketExpanded ? "is-expanded" : "is-collapsed"}`}
        data-pocket-state={isEditPocketExpanded ? "expanded" : "collapsed"}
        onPointerEnter={expandEditPocket}
        onPointerLeave={() => scheduleEditPocketCollapse()}
        onFocusCapture={() => {
          editPocketHasFocus.current = true
          expandEditPocket()
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) {
            editPocketHasFocus.current = false
            scheduleEditPocketCollapse()
          }
        }}
        onClick={() => {
          expandEditPocket()
          scheduleEditPocketCollapse()
        }}
      >
        {isEditPocketExpanded ? (
          editActions
        ) : (
          <button
            type="button"
            className="owner-subtle-action owner-edit-collapsed-trigger"
            onClick={expandEditPocket}
          >
            Editing
          </button>
        )}
      </div>
    )
  }

  function renderMobileTrigger() {
    if (isEditing) {
      return (
        <button
          type="button"
          className="owner-subtle-action owner-question-trigger"
          onClick={() => openMobileSheet("editing")}
        >
          You are editing this letter.
        </button>
      )
    }

    if (isVerified) {
      return (
        <button
          type="button"
          className="owner-subtle-action owner-question-trigger"
          onClick={handleOpenManagementPanel}
        >
          You own this letter - manage it here.
        </button>
      )
    }

    return (
      <button
        type="button"
        className="owner-subtle-action owner-question-trigger"
        onClick={handleOpenVerificationPanel}
      >
        Is this letter yours?
      </button>
    )
  }

  function renderMobileSheetContent() {
    if (mobileSheetMode === "editing") {
      return editActions
    }

    if (mobileSheetMode === "open-verified") {
      return ownerActions
    }

    return verificationPanel
  }

  /* -------------------------------------------------------------------------------- */

  return (
    <>
      <aside className={`letter-owner-area ${isEditing ? "is-editing" : ""}`} aria-live="polite">
        {isMobile ? (
          renderMobileTrigger()
        ) : isEditing ? (
          renderDesktopEditPocket()
        ) : isManaging ? (
          ownerActions
        ) : isVerified ? (
          <button
            type="button"
            className="owner-subtle-action owner-question-trigger"
            onClick={handleOpenManagementPanel}
          >
            You own this letter - manage it here.
          </button>
        ) : isExpanded ? (
          verificationPanel
        ) : (
          <button
            type="button"
            className="owner-subtle-action owner-question-trigger"
            onClick={handleOpenVerificationPanel}
          >
            Is this letter yours?
          </button>
        )}
      </aside>

      {isMobile && mobileSheetMode !== "closed" ? (
        <div
          className={`owner-sheet-overlay ${isDraggingSheet ? "is-dragging" : ""}`}
          data-testid="mobile-owner-sheet-overlay"
        >
          <div
            role="dialog"
            aria-label="Owner actions"
            className={`owner-bottom-sheet is-${mobileSheetSnap}`}
            data-sheet-mode={mobileSheetMode}
            data-sheet-snap={mobileSheetSnap}
            style={{ transform: `translateY(${sheetDragOffset}px)` }}
            onFocusCapture={handleSheetFocusCapture}
          >
            <button
              type="button"
              className="owner-sheet-handle"
              aria-label="Expand or collapse owner actions"
              onPointerDown={handleSheetPointerDown}
              onPointerMove={handleSheetPointerMove}
              onPointerUp={handleSheetPointerUp}
              onPointerCancel={handleSheetPointerUp}
              onClick={() => {
                setMobileSheetSnap((currentSnap) => currentSnap === "compact" ? "full" : "compact")
              }}
            />
            <div className="owner-bottom-sheet-content">
              {renderMobileSheetContent()}
            </div>
          </div>
        </div>
      ) : null}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        isDeleting={isDeleting}
        isDeleted={deleteSuccess}
        errorMessage={deleteErrorMessage}
        onClose={handleCloseDeleteModal}
        onConfirmDelete={handleConfirmDelete}
      />
    </>
  )
}
