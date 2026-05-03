"use client"

import { useEffect, useRef, useState, type FocusEvent, type PointerEvent, type ReactNode } from "react"

export type MobileOwnerSheetMode = "open-unverified" | "open-verified" | "editing"

type MobileOwnerSheetSnap = "compact" | "full"

interface MobileOwnerSheetProps {
  mode: MobileOwnerSheetMode
  children: ReactNode
  onClose: () => void
}

export default function MobileOwnerSheet({
  mode,
  children,
  onClose,
}: MobileOwnerSheetProps) {
  const [snap, setSnap] = useState<MobileOwnerSheetSnap>("compact")
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const dragStartY = useRef<number | null>(null)

  useEffect(() => {
    dragStartY.current = null
    setSnap("compact")
    setDragOffset(0)
    setIsDragging(false)
  }, [mode])

  function handlePointerDown(event: PointerEvent<HTMLButtonElement>) {
    dragStartY.current = event.clientY
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    if (dragStartY.current === null) {
      return
    }

    const nextOffset = event.clientY - dragStartY.current
    setDragOffset(Math.max(-140, Math.min(180, nextOffset)))
  }

  function handlePointerUp(event: PointerEvent<HTMLButtonElement>) {
    if (dragStartY.current === null) {
      return
    }

    const finalOffset = event.clientY - dragStartY.current

    if (finalOffset > 80) {
      onClose()
    } else if (finalOffset < -60) {
      setSnap("full")
    } else {
      setSnap("compact")
    }

    dragStartY.current = null
    setDragOffset(0)
    setIsDragging(false)
  }

  function handleFocusCapture(event: FocusEvent<HTMLDivElement>) {
    if (
      event.target instanceof HTMLInputElement ||
      event.target instanceof HTMLTextAreaElement
    ) {
      setSnap("full")
    }
  }

  return (
    <div
      className={`owner-sheet-overlay ${isDragging ? "is-dragging" : ""}`}
      data-testid="mobile-owner-sheet-overlay"
    >
      <div
        role="dialog"
        aria-label="Owner actions"
        className={`owner-bottom-sheet is-${snap}`}
        data-sheet-mode={mode}
        data-sheet-snap={snap}
        style={{ transform: `translateY(${dragOffset}px)` }}
        onFocusCapture={handleFocusCapture}
      >
        <button
          type="button"
          className="owner-sheet-handle"
          aria-label="Expand or collapse owner actions"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onClick={() => {
            setSnap((currentSnap) => currentSnap === "compact" ? "full" : "compact")
          }}
        />
        <div className="owner-bottom-sheet-content">
          {children}
        </div>
      </div>
    </div>
  )
}
