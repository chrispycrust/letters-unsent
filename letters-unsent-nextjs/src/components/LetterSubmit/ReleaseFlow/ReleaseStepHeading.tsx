"use client"

import { useEffect, useRef, type ReactNode } from "react"

interface ReleaseStepHeadingProps {
  children: ReactNode
  className?: string
  ariaDescribedBy?: string
}

export default function ReleaseStepHeading({
  children,
  className,
  ariaDescribedBy,
}: ReleaseStepHeadingProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const heading = headingRef.current

    if (heading && document.activeElement !== heading) {
      heading.focus({ preventScroll: true })
    }
  }, [])

  return (
    <h2
      ref={headingRef}
      className={["release-step-heading", className].filter(Boolean).join(" ")}
      tabIndex={-1}
      aria-describedby={ariaDescribedBy}
    >
      {children}
    </h2>
  )
}
