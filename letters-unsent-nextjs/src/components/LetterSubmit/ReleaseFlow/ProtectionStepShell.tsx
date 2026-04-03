import type { ReactNode } from "react"

interface ProtectionStepShellProps {
  title: string
  stepLabel: string
  description: string
  children: ReactNode
  actions: ReactNode
  warning?: string
  errorMessage?: string
}

export default function ProtectionStepShell({
  title,
  stepLabel,
  description,
  children,
  actions,
  warning,
  errorMessage,
}: ProtectionStepShellProps) {
  return (
    <section className="release-panel release-protection-step-shell" aria-live="polite">
      <header className="release-panel-header">
        <h2>{title}</h2>
        <span className="release-step-indicator">{stepLabel}</span>
      </header>

      <p className="release-panel-body">{description}</p>

      <div className="release-step-body">{children}</div>

      {warning ? <p className="release-warning">{warning}</p> : null}
      {errorMessage ? <p className="release-error">{errorMessage}</p> : null}

      <div className="release-panel-actions">{actions}</div>
    </section>
  )
}
