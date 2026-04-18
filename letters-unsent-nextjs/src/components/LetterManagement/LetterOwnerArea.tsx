"use client"

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useEffect, useMemo, useState } from "react"
import { useCallback } from "react"
import { useRouter } from "next/navigation"

import DeleteConfirmationModal from "@/components/LetterManagement/DeleteConfirmationModal"
import OwnerActions from "@/components/LetterManagement/OwnerActions"
import OwnerVerificationPanel from "@/components/LetterManagement/OwnerVerificationPanel" 

import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"

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

type VerifyOptions = {
  silent: boolean
}

export default function LetterOwnerArea({ letterId }: { letterId: string }) {
  const router = useRouter()
  const storageKey = useMemo(() => getLetterPassphraseStorageKey(letterId), [letterId])

  const [isExpanded, setIsExpanded] = useState(false)
  const [tokenInput, setTokenInput] = useState("")
  const [verificationMessage, setVerificationMessage] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedPassphrase, setVerifiedPassphrase] = useState<string | null>(null)
  const [isManaging, setIsManaging] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteErrorMessage, setDeleteErrorMessage] = useState("")
  const [deleteSuccess, setDeleteSuccess] = useState(false)

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
        localStorage.setItem(storageKey, passphrase)
        return true
      }

      setIsVerified(false)
      setVerifiedPassphrase(null)
      localStorage.removeItem(storageKey)

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
  }, [letterId, storageKey])

  useEffect(() => {
    const storedPassphrase = localStorage.getItem(storageKey)
    if (!storedPassphrase) {
      return
    }

    void verifyToken(storedPassphrase, { silent: true })
  }, [storageKey, verifyToken])

  async function handleConfirmToken() {
    if (isVerifying) {
      return
    }

    const candidatePassphrase = tokenInput.trim()
    if (!candidatePassphrase) {
      return
    }

    await verifyToken(candidatePassphrase, { silent: false })
  }

  function handleOpenVerificationPanel() {
    setIsExpanded(true)
    setVerificationMessage("")
  }
  
  function handleOpenManagementPanel() {
    setIsManaging(true)
    setVerificationMessage("")
  }
  
  function handleDismiss() {
    setIsManaging(false)
    setVerificationMessage("")
  }

  function handleCancel() {
    setIsExpanded(false)
    setTokenInput("")
    setVerificationMessage("")
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

  /* -------------------------------------------------------------------------------- */

  return (
    <>
      <aside className="letter-owner-area" aria-live="polite">
        { isManaging ? (
          <OwnerActions 
            letterId={letterId} 
            onRemove={handleOpenDeleteModal} 
            onDismiss={handleDismiss} 
          />
        ) : isVerified ? (
            <button
              type="button"
              className="owner-area-title owner-subtle-action owner-question-trigger"
              onClick={handleOpenManagementPanel}
            >
              You own this letter - manage it here.            
            </button>
        ) : isExpanded ? (
          <OwnerVerificationPanel
            token={tokenInput}
            isSubmitting={isVerifying}
            errorMessage={verificationMessage}
            onTokenChange={setTokenInput}
            onConfirm={handleConfirmToken}
            onCancel={handleCancel}
          />
        ) : (
          <div>
            <button
              type="button"
              className="owner-subtle-action owner-question-trigger"
              onClick={handleOpenVerificationPanel}
            >
              Is this letter yours?            
            </button>
          </div>
        )}
      </aside>

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
