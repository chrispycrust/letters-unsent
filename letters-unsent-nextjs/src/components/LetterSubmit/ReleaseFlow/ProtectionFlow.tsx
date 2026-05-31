import { useMemo, useState } from "react"

import ConfirmProtectedReleaseStep from "@/components/LetterSubmit/ReleaseFlow/ConfirmProtectedReleaseStep"
import CreatePassphraseStep from "@/components/LetterSubmit/ReleaseFlow/CreatePassphraseStep"
import ProtectionConfirmedStep from "@/components/LetterSubmit/ReleaseFlow/ProtectionConfirmedStep"
import StorePassphraseStep from "@/components/LetterSubmit/ReleaseFlow/StorePassphraseStep"
import type { ReleaseSubmitInput, ReleaseSubmitResult } from "@/components/LetterSubmit/ReleaseFlow/types"
import { generatePassphrase } from "@/utils/passphrase/generatePassphrase"
import { getLetterPassphraseStorageKey } from "@/utils/passphrase/storage"

interface ProtectionFlowProps {
  onBackToChoice: () => void
  onSubmitProtected: (input: ReleaseSubmitInput) => Promise<ReleaseSubmitResult>
  onViewLetter: (letterId: string) => void
  onClose: () => void
}

export default function ProtectionFlow({
  onBackToChoice,
  onSubmitProtected,
  onViewLetter,
  onClose,
}: ProtectionFlowProps) {
  const [step, setStep] = useState<"create" | "store" | "confirm" | "confirmed">("create")
  const [passphraseMode, setPassphraseMode] = useState<"custom" | "generated">("custom")
  const [customPassphrase, setCustomPassphrase] = useState("")
  const [generatedPassphrase, setGeneratedPassphrase] = useState(() => generatePassphrase(4))

  const [saveOnDevice, setSaveOnDevice] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [savedElsewhereConfirmed, setSavedElsewhereConfirmed] = useState(false)
  const [releasedLetterId, setReleasedLetterId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")

  const selectedPassphrase = useMemo(() => {
    return passphraseMode === "custom" ? customPassphrase.trim() : generatedPassphrase
  }, [customPassphrase, generatedPassphrase, passphraseMode])

  function resetStoreChoices() {
    setSaveOnDevice(false)
    setTokenCopied(false)
    setSavedElsewhereConfirmed(false)
    setSubmitError("")
  }

  function handleSelectCustom() {
    setPassphraseMode("custom")
  }

  function handleSelectGenerated() {
    setPassphraseMode("generated")
  }

  function handleGenerateAnother() {
    setGeneratedPassphrase(generatePassphrase(4))
  }

  function handleContinueFromCreate() {
    if (!selectedPassphrase) {
      return
    }

    resetStoreChoices()
    setStep("store")
  }

  const canContinueFromCreate = Boolean(selectedPassphrase)
  const canContinueFromStore = saveOnDevice || savedElsewhereConfirmed

  async function handleCopyToken() {
    try {
      await navigator.clipboard.writeText(selectedPassphrase)
      setTokenCopied(true)
    } catch (error) {
      console.error("Could not copy token:", error)
    }
  }

  function handleContinueFromStore() {
    if (!selectedPassphrase || !canContinueFromStore) {
      return
    }

    setSubmitError("")
    setStep("confirm")
  }

  async function handleConfirmRelease() {
    if (!selectedPassphrase || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setSubmitError("")

    try {
      const result = await onSubmitProtected({
        ownerPassphrase: selectedPassphrase,
        savePassphraseOnDevice: saveOnDevice,
        tokenCopied,
      })

      if (saveOnDevice) {
        localStorage.setItem(getLetterPassphraseStorageKey(result.id), selectedPassphrase)
      }

      setReleasedLetterId(result.id)
      setStep("confirmed")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong while releasing your letter."
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === "create") {
    return (
      <CreatePassphraseStep
        passphraseMode={passphraseMode}
        customPassphrase={customPassphrase}
        generatedPassphrase={generatedPassphrase}
        onSelectCustom={handleSelectCustom}
        onSelectGenerated={handleSelectGenerated}
        onCustomPassphraseChange={setCustomPassphrase}
        onGenerateAnother={handleGenerateAnother}
        onBack={onBackToChoice}
        onContinue={handleContinueFromCreate}
        canContinue={canContinueFromCreate}
      />
    )
  }

  if (step === "store") {
    return (
      <StorePassphraseStep
        passphrase={selectedPassphrase}
        saveOnDevice={saveOnDevice}
        tokenCopied={tokenCopied}
        savedElsewhereConfirmed={savedElsewhereConfirmed}
        onToggleSaveOnDevice={() => setSaveOnDevice((current) => !current)}
        onCopyToken={handleCopyToken}
        onToggleSavedElsewhereConfirmed={() => setSavedElsewhereConfirmed((current) => !current)}
        onBack={() => {
          setStep("create")
          setSubmitError("")
        }}
        onContinue={handleContinueFromStore}
        canContinue={canContinueFromStore}
      />
    )
  }

  if (step === "confirm") {
    return (
      <ConfirmProtectedReleaseStep
        savedOnDevice={saveOnDevice}
        tokenCopied={tokenCopied}
        onBack={() => {
          setStep("store")
          setSubmitError("")
        }}
        onConfirm={handleConfirmRelease}
        isSubmitting={isSubmitting}
        errorMessage={submitError}
      />
    )
  }

  return (
    <ProtectionConfirmedStep
      savedOnDevice={saveOnDevice}
      tokenCopied={tokenCopied}
      onViewLetter={() => {
        if (releasedLetterId) {
          onViewLetter(releasedLetterId)
        }
      }}
      onClose={onClose}
    />
  )
}
