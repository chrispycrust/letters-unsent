"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"

import DeleteConfirmationModal from "@/components/LetterManagement/DeleteConfirmationModal"
import DesktopEditPocket from "@/components/LetterManagement/DesktopEditPocket"
import MobileOwnerSheet, { type MobileOwnerSheetMode } from "@/components/LetterManagement/MobileOwnerSheet"
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

type MobileSheetMode = "closed" | MobileOwnerSheetMode

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
  const [mobileSheetMode, setMobileSheetMode] = useState<MobileSheetMode>("closed")

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

  function openMobileSheet(mode: MobileOwnerSheetMode) {
    setMobileSheetMode(mode)
  }

  function closeMobileSheet() {
    setMobileSheetMode("closed")
  }

  function revealVerificationPanel() {
    if (isMobile) {
      openMobileSheet("open-unverified")
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
      openMobileSheet("open-verified")
    }
  }

  function handleOpenVerificationPanel() {
    clearVerificationMessage()
    revealVerificationPanel()
  }

  function handleOpenManagementPanel() {
    if (isMobile) {
      openMobileSheet("open-verified")
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

  function handleDismiss() {
    setIsManaging(false)

    if (isMobile) {
      closeMobileSheet()
    }
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
        clearVerifiedOwnership()
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
      onDismiss={handleDismiss}
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
    <button
      type="button"
      className="owner-subtle-action owner-question-trigger"
      onClick={handleOpenManagementPanel}
    >
      You own this letter - manage it here.
    </button>
  )

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
        manageOwnerButton
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
      <aside className="letter-owner-area" aria-live="polite">
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
            className="owner-subtle-action owner-question-trigger"
            onClick={handleOpenVerificationPanel}
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Is this letter yours?"}
          </button>
        )}
      </aside>

      {desktopRailMountNode && desktopRailContent
        ? createPortal(desktopRailContent, desktopRailMountNode)
        : null}

      {isMobile && mobileSheetMode !== "closed" ? (
        <MobileOwnerSheet mode={mobileSheetMode} onClose={closeMobileSheet}>
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
