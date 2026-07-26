import { useLayoutEffect, useMemo, useRef, useState } from "react"

import ConfirmProtectedReleaseStep from "@/components/LetterSubmit/ReleaseFlow/ConfirmProtectedReleaseStep"
import CreatePassphraseStep from "@/components/LetterSubmit/ReleaseFlow/CreatePassphraseStep"
import { RELEASE_ERROR_MESSAGE } from "@/components/LetterSubmit/ReleaseFlow/errorMessages"
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
  const [manualSaveSelected, setManualSaveSelected] = useState(false)
  const [tokenCopied, setTokenCopied] = useState(false)
  const [savedElsewhereConfirmed, setSavedElsewhereConfirmed] = useState(false)
  const [releasedLetterId, setReleasedLetterId] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const protectionFlowRef = useRef<HTMLDivElement | null>(null)

  const selectedPassphrase = useMemo(() => {
    return passphraseMode === "custom" ? customPassphrase.trim() : generatedPassphrase
  }, [customPassphrase, generatedPassphrase, passphraseMode])

  useLayoutEffect(() => {
    function resetReleaseStepScroll() {
      const releaseActionArea = protectionFlowRef.current?.closest(".release-action-area")
      const releasePanel = protectionFlowRef.current?.querySelector(".release-panel")

      releaseActionArea?.scrollIntoView({ block: "start", behavior: "auto" })
      releaseActionArea?.scrollTo({ top: 0, left: 0, behavior: "auto" })
      releasePanel?.scrollTo({ top: 0, left: 0, behavior: "auto" })
    }

    resetReleaseStepScroll()
    requestAnimationFrame(resetReleaseStepScroll)
  }, [step])

  function resetStoreChoices() {
    setSaveOnDevice(false)
    setManualSaveSelected(false)
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
  const hasSelectedStorageMethod = saveOnDevice || manualSaveSelected
  const manualSaveComplete = !manualSaveSelected || (tokenCopied && savedElsewhereConfirmed)
  const canContinueFromStore = hasSelectedStorageMethod && manualSaveComplete

  function handleReturnToOptions() {
    setSubmitError("")
    onBackToChoice()
  }

  function handleToggleManualSave() {
    const nextManualSaveSelected = !manualSaveSelected
    setManualSaveSelected(nextManualSaveSelected)

    if (!nextManualSaveSelected) {
      setTokenCopied(false)
      setSavedElsewhereConfirmed(false)
    }
  }

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
      if (!(error instanceof Error && error.message === RELEASE_ERROR_MESSAGE)) {
        console.error("Protected letter release failed", error)
      }

      setSubmitError(RELEASE_ERROR_MESSAGE)
    } finally {
      setIsSubmitting(false)
    }
  }

  const protectionStep = (() => {
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
          onReturnToOptions={handleReturnToOptions}
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
          manualSaveSelected={manualSaveSelected}
          tokenCopied={tokenCopied}
          savedElsewhereConfirmed={savedElsewhereConfirmed}
          onToggleSaveOnDevice={() => setSaveOnDevice((current) => !current)}
          onToggleManualSave={handleToggleManualSave}
          onCopyToken={handleCopyToken}
          onToggleSavedElsewhereConfirmed={() => setSavedElsewhereConfirmed((current) => !current)}
          onReturnToOptions={handleReturnToOptions}
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
          onReturnToOptions={handleReturnToOptions}
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
  })()

  return (
    <div ref={protectionFlowRef} className="release-wrapper">
      {protectionStep}
    </div>
  )
}
