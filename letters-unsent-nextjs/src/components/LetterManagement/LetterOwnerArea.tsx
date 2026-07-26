"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"

import DeleteConfirmationModal from "@/components/LetterManagement/DeleteConfirmationModal"
import DesktopEditPocket from "@/components/LetterManagement/DesktopEditPocket"
import MobileOwnerSheet, {
  type MobileOwnerSheetMode,
  type MobileOwnerSheetSnap,
} from "@/components/LetterManagement/MobileOwnerSheet"
import OwnerActions from "@/components/LetterManagement/OwnerActions"
import OwnerEditActions from "@/components/LetterManagement/OwnerEditActions"
import OwnerVerificationPanel from "@/components/LetterManagement/OwnerVerificationPanel"
import useIsMobileOwnerSurface from "@/components/LetterManagement/useIsMobileOwnerSurface"
import useOwnerVerification from "@/components/LetterManagement/useOwnerVerification"

import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"

interface LetterOwnerAreaProps {
  letterId: string
  isEditing: boolean
  editFormId: string
  onEdit: (ownerPassphrase: string) => void
  onCancelEdit: () => void
  isDesktopOwnerRailSurface?: boolean
  showDesktopOwnerRail?: boolean
  desktopRailMountNode?: HTMLElement | null
  isSaving: boolean
  editFeedback: string | null
  onDismissEditFeedback: () => void
}

type MobileSheetPosition = "closed" | MobileOwnerSheetSnap

const TOO_MANY_ATTEMPTS_MESSAGE = "Too many attempts in a short time. Please wait a moment, then try again."
const TOKEN_NOT_VERIFIED_MESSAGE = "We couldn’t verify your token."
const DELETE_ERROR_FALLBACK = "We couldn’t remove this letter right now. Please try again."

export default function LetterOwnerArea({
  letterId,
  isEditing,
  editFormId,
  onEdit,
  onCancelEdit,
  isDesktopOwnerRailSurface = false,
  showDesktopOwnerRail = false,
  desktopRailMountNode,
  isSaving,
  editFeedback,
  onDismissEditFeedback,
}: LetterOwnerAreaProps) {
  const router = useRouter()
  const storageKey = useMemo(() => getLetterPassphraseStorageKey(letterId), [letterId])
  const isMobile = useIsMobileOwnerSurface()

  const [isExpanded, setIsExpanded] = useState(false)
  const [isManaging, setIsManaging] = useState(false)
  const [isCheckingEdit, setIsCheckingEdit] = useState(false)
  const [mobileSheetMode, setMobileSheetMode] = useState<MobileOwnerSheetMode>("open-unverified")
  const [mobileSheetPosition, setMobileSheetPosition] = useState<MobileSheetPosition>("closed")

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("")
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const {
    tokenInput,
    verificationMessage,
    isVerifying,
    isVerified,
    verifiedPassphrase,
    verifyPassphrase,
    handleTokenChange,
    confirmToken,
    clearVerificationMessage,
    resetVerificationForm,
    clearVerifiedOwnership,
  } = useOwnerVerification({ letterId, storageKey })

  const previousIsMobile = useRef(isMobile)
  const previousIsVerified = useRef(isVerified)

  useEffect(() => {
    const enteredMobileSurface = isMobile && !previousIsMobile.current
    const becameVerified = isVerified && !previousIsVerified.current

    previousIsMobile.current = isMobile
    previousIsVerified.current = isVerified

    if (!isMobile) {
      closeMobileSheet()
      return
    }

    if (isEditing) {
      openMobileSheet("editing")
      return
    }

    if (isVerified) {
      openMobileSheet(
        "open-verified-actions",
        becameVerified || enteredMobileSurface ? "full" : undefined,
      )
    }
  }, [isEditing, isMobile, isVerified])

  function openMobileSheet(mode: MobileOwnerSheetMode, snap?: MobileOwnerSheetSnap) {
    setMobileSheetMode(mode)
    setMobileSheetPosition((currentPosition) => {
      if (snap) {
        return snap
      }

      return currentPosition === "closed" ? "full" : currentPosition
    })
  }

  function closeMobileSheet() {
    setMobileSheetPosition("closed")
  }

  function revealVerificationPanel() {
    if (isMobile) {
      openMobileSheet("open-unverified", "full")
      return
    }

    setIsExpanded(true)
  }

  async function handleConfirmToken() {
    const verified = await confirmToken()
    if (!verified) {
      return
    }

    setIsExpanded(false)
    if (isMobile) {
      openMobileSheet("open-verified-actions", "full")
    }
  }

  function handleOpenVerificationPanel() {
    clearVerificationMessage()
    revealVerificationPanel()
  }

  function handleOpenManagementPanel() {
    if (isMobile) {
      openMobileSheet("open-verified-actions", "full")
      return
    }

    setIsManaging(true)
  }

  async function handleEditing() {
    if (isCheckingEdit) {
      return
    }

    const passphraseForEdit = verifiedPassphrase

    if (!passphraseForEdit) {
      clearVerifiedOwnership()
      setIsManaging(false)
      handleOpenVerificationPanel()
      return
    }

    setIsCheckingEdit(true)
    clearVerificationMessage()

    const verified = await verifyPassphrase(passphraseForEdit, { silent: false })
    setIsCheckingEdit(false)

    if (!verified) {
      setIsManaging(false)
      revealVerificationPanel()
      return
    }

    setIsManaging(false)
    onEdit(passphraseForEdit)

    if (isMobile) {
      openMobileSheet("editing")
    }
  }

  function handleMinimiseControls() {
    if (isMobile) {
      setMobileSheetPosition("compact")
      return
    }

    setIsManaging(false)
  }

  function handleCancelVerification() {
    setIsExpanded(false)
    resetVerificationForm()

    if (isMobile) {
      closeMobileSheet()
    }
  }

  function handleCancelEdit() {
    onCancelEdit()

    if (isMobile && isVerified) {
      openMobileSheet("open-verified-actions")
      return
    }

    if (isMobile) {
      closeMobileSheet()
      return
    }

    setIsManaging(true)
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
        clearVerifiedOwnership()
        setIsManaging(false)
        if (isMobile) {
          closeMobileSheet()
        }
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

  const verificationPanel = (
    <OwnerVerificationPanel
      token={tokenInput}
      isSubmitting={isVerifying}
      errorMessage={verificationMessage}
      onTokenChange={handleTokenChange}
      onConfirm={handleConfirmToken}
      onCancel={handleCancelVerification}
    />
  )

  const ownerActions = (
    <OwnerActions
      isCheckingEdit={isCheckingEdit}
      onEdit={handleEditing}
      onRemove={handleOpenDeleteModal}
      onMinimise={handleMinimiseControls}
    />
  )

  const editActions = (
    <OwnerEditActions 
      editFormId={editFormId} 
      onCancel={handleCancelEdit} 
      isSaving={isSaving}
      editFeedback={editFeedback} 
      onDismissEditFeedback={onDismissEditFeedback}
    />
  )

  const manageOwnerButton = (
    <>
      <button
        type="button"
        className="owner-subtle-action owner-question-trigger"
        onClick={handleOpenManagementPanel}
      >
        <i>You own this letter - manage it here.</i>
      </button>
    </>
  )

  function renderMobileTrigger() {
    if (isEditing) {
      return (
        <button
          type="button"
          className="owner-subtle-action owner-question-trigger"
          onClick={() => openMobileSheet("editing", "full")}
        >
          <i>You are editing this letter.</i>
        </button>
      )
    }

    if (isVerified) {
      return (
        manageOwnerButton
      )
    }

    return (
      <button
        type="button"
        className="owner-subtle-action owner-question-trigger"
        onClick={handleOpenVerificationPanel} 
      >
       <i>Is this letter yours?</i>
      </button>
    )
  }

  function renderMobileSheetContent() {
    if (mobileSheetMode === "editing") {
      return editActions
    }

    if (mobileSheetMode === "open-verified-actions") {
      return ownerActions
    }

    return verificationPanel
  }

  function renderDesktopRailContent() {
    if (!isDesktopOwnerRailSurface || isMobile || !showDesktopOwnerRail) {
      return null
    }

    return (
      <div className={`desktop-owner-rail-content ${isEditing ? "desktop-owner-rail-edit" : ""}`}>
        {
          isEditing ? (
            <DesktopEditPocket 
              editFormId={editFormId} 
              onCancel={handleCancelEdit} 
              isSaving={isSaving}
              editFeedback={editFeedback} 
              onDismissEditFeedback={onDismissEditFeedback}
            />
          ) : isManaging ? (
            ownerActions
          ) : isVerified ? (
            manageOwnerButton
          ) : null
        }
      </div>
    )
  }

  const desktopRailContent = renderDesktopRailContent()

  return (
    <>
      <aside className="letter-owner-area">
        {isMobile ? (
          renderMobileTrigger()
        ) : isEditing ? (
          editActions
        ) : isManaging ? (
          ownerActions
        ) : isVerified ? (
          manageOwnerButton
        ) : isExpanded ? (
          verificationPanel
        ) : (
          <button
            type="button"
            className={`owner-subtle-action owner-question-trigger ${isVerifying ? "is-busy" : ""}`}
            onClick={handleOpenVerificationPanel}
            disabled={isVerifying}
            aria-busy={isVerifying}
          >
            <i>{isVerifying ? "Verifying..." : "Is this letter yours?"}</i>
          </button>
        )}
      </aside>

      {desktopRailMountNode && desktopRailContent
        ? createPortal(desktopRailContent, desktopRailMountNode)
        : null}

      {isMobile && mobileSheetPosition !== "closed" ? (
        <MobileOwnerSheet
          mode={mobileSheetMode}
          snap={mobileSheetPosition}
          onSnapChange={setMobileSheetPosition}
        >
          {renderMobileSheetContent()}
        </MobileOwnerSheet>
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
