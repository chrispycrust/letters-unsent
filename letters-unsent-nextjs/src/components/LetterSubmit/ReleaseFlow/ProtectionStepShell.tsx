import { useId, type ReactNode } from "react"

import ReleaseStepHeading from "@/components/LetterSubmit/ReleaseFlow/ReleaseStepHeading"

interface ProtectionStepShellProps {
  title: string
  stepLabel: string
  description: string
  children: ReactNode
  actions: ReactNode
  warning?: string
  errorMessage?: string
  additionalHeadingDescriptionIds?: string[]
  includeWarningInHeadingDescription?: boolean
}

export default function ProtectionStepShell({
  title,
  stepLabel,
  description,
  children,
  actions,
  warning,
  errorMessage,
  additionalHeadingDescriptionIds = [],
  includeWarningInHeadingDescription = false,
}: ProtectionStepShellProps) {
  const stepLabelId = useId()
  const descriptionId = useId()
  const warningId = useId()
  const headingDescriptionIds = [
    stepLabelId,
    descriptionId,
    ...additionalHeadingDescriptionIds,
    ...(warning && includeWarningInHeadingDescription ? [warningId] : []),
  ].join(" ")

  return (
    <section className="release-panel release-protection-step-shell">
      <header className="release-panel-header">
        <ReleaseStepHeading
          className="release-panel-title"
          ariaDescribedBy={headingDescriptionIds}
        >
          {title}
        </ReleaseStepHeading>
        <span id={stepLabelId} className="release-step-indicator">
          {stepLabel}
        </span>
      </header>

      <p id={descriptionId} className="release-panel-body">
        {description}
      </p>

      <div className="release-step-body">{children}</div>

      {warning ? <p id={warningId} className="release-warning">{warning}</p> : null}
      {errorMessage ? <p className="release-error" role="alert">{errorMessage}</p> : null}

      <div className="release-panel-actions">{actions}</div>
    </section>
  )
}
