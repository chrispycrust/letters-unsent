"use client"

import { useCallback, useEffect, useState } from "react"

const INVALID_TOKEN_MESSAGE = "The token doesn’t match this letter. Please try again."
const TOO_MANY_ATTEMPTS_MESSAGE = "Too many attempts in a short time. Please wait a moment, then try again."
const EMPTY_TOKEN_MESSAGE = "Enter your token first."

type VerifyOptions = {
  silent: boolean
}

interface UseOwnerVerificationOptions {
  letterId: string
  storageKey: string
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

export default function useOwnerVerification({
  letterId,
  storageKey,
}: UseOwnerVerificationOptions) {
  const [tokenInput, setTokenInput] = useState("")
  const [verificationMessage, setVerificationMessage] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isVerified, setIsVerified] = useState(false)
  const [verifiedPassphrase, setVerifiedPassphrase] = useState<string | null>(null)

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
  }, [letterId, storageKey])

  useEffect(() => {
    const storedPassphrase = localStorage.getItem(storageKey)
    if (!storedPassphrase) {
      return
    }

    void verifyToken(storedPassphrase, { silent: true })
  }, [storageKey, verifyToken])

  function handleTokenChange(value: string) {
    setTokenInput(value)
    if (verificationMessage === EMPTY_TOKEN_MESSAGE) {
      setVerificationMessage("")
    }
  }

  async function confirmToken(): Promise<boolean> {
    if (isVerifying) {
      return false
    }

    const candidatePassphrase = tokenInput.trim()
    if (!candidatePassphrase) {
      setVerificationMessage(EMPTY_TOKEN_MESSAGE)
      return false
    }

    return verifyToken(candidatePassphrase, { silent: false })
  }

  function clearVerificationMessage() {
    setVerificationMessage("")
  }

  function resetVerificationForm() {
    setTokenInput("")
    setVerificationMessage("")
  }

  function clearVerifiedOwnership() {
    setIsVerified(false)
    setVerifiedPassphrase(null)
  }

  return {
    tokenInput,
    verificationMessage,
    isVerifying,
    isVerified,
    verifiedPassphrase,
    verifyPassphrase: verifyToken,
    handleTokenChange,
    confirmToken,
    clearVerificationMessage,
    resetVerificationForm,
    clearVerifiedOwnership,
  }
}
