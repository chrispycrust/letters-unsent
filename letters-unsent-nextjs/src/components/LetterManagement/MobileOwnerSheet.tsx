"use client"

import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from "react"

export type MobileOwnerSheetMode = "open-unverified" | "open-verified-actions" | "editing"

export type MobileOwnerSheetSnap = "compact" | "full"

const TAP_MOVEMENT_THRESHOLD = 8

interface DragStart {
  pointerId: number
  startY: number
  startSnap: MobileOwnerSheetSnap
  travelDistance: number
  startedOnHandle: boolean
}

interface MobileOwnerSheetProps {
  mode: MobileOwnerSheetMode
  snap: MobileOwnerSheetSnap
  children: ReactNode
  onSnapChange: (snap: MobileOwnerSheetSnap) => void
}

export default function MobileOwnerSheet({
  mode,
  snap,
  children,
  onSnapChange,
}: MobileOwnerSheetProps) {
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const contentId = useId()

  const dragStart = useRef<DragStart | null>(null)
  const handleRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)
  const previousSnap = useRef(snap)

  const sheetStyle: CSSProperties & { "--owner-sheet-drag-offset": string } = {
    "--owner-sheet-drag-offset": `${dragOffset}px`,
  }

  function isInsideNoDragRegion(target: EventTarget | null) {
    return target instanceof Element && target.closest("[data-owner-sheet-no-drag]") !== null
  }

  useEffect(() => {
    if (
      previousSnap.current === "full" &&
      snap === "compact" &&
      contentRef.current?.contains(document.activeElement)
    ) {
      handleRef.current?.focus()
    }

    previousSnap.current = snap
  }, [snap])

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (
      dragStart.current !== null ||
      event.button !== 0 ||
      event.isPrimary === false ||
      isInsideNoDragRegion(event.target)
    ) {
      return
    }

    const handle = event.currentTarget.querySelector<HTMLElement>(".owner-sheet-handle")
    const travelDistance = Math.max(0, event.currentTarget.offsetHeight - (handle?.offsetHeight ?? 0))

    dragStart.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startSnap: snap,
      travelDistance,
      startedOnHandle: event.target instanceof Element && event.target.closest(".owner-sheet-handle") !== null,
    }
    setIsDragging(true)
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current?.pointerId !== event.pointerId) {
      return
    }

    const delta = event.clientY - dragStart.current.startY
    const startPosition = dragStart.current.startSnap === "full" ? 0 : dragStart.current.travelDistance
    const nextPosition = Math.max(
      0,
      Math.min(dragStart.current.travelDistance, startPosition + delta),
    )

    setDragOffset(nextPosition - startPosition)
  }

  function resetDrag(event: PointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture?.(event.pointerId)) {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    }

    dragStart.current = null
    setDragOffset(0)
    setIsDragging(false)
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current?.pointerId !== event.pointerId) {
      return
    }

    const { startY, startedOnHandle } = dragStart.current
    const finalOffset = event.clientY - startY
    resetDrag(event)

    if (Math.abs(finalOffset) < TAP_MOVEMENT_THRESHOLD) {
      if (startedOnHandle) {
        onSnapChange(snap === "compact" ? "full" : "compact")
      }
    } else if (finalOffset < 0) {
      onSnapChange("full")
    } else {
      onSnapChange("compact")
    }
  }

  function handlePointerCancel(event: PointerEvent<HTMLDivElement>) {
    if (dragStart.current?.pointerId !== event.pointerId) {
      return
    }

    resetDrag(event)
  }

  function handleHandleClick(event: MouseEvent<HTMLButtonElement>) {
    // Pointer gestures are settled in handlePointerUp. A click with no pointer
    // detail comes from keyboard or assistive technology and still toggles.
    if (event.detail === 0) {
      onSnapChange(snap === "compact" ? "full" : "compact")
    }
  }

  function handleFocusCapture(event: FocusEvent<HTMLDivElement>) {
    if (
      snap === "compact" &&
      (event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement)
    ) {
      onSnapChange("full")
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
        style={sheetStyle}
        onFocusCapture={handleFocusCapture}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
      >
        <button
          ref={handleRef}
          type="button"
          className="owner-sheet-handle"
          aria-label={snap === "compact" ? "Expand owner controls" : "Minimise owner controls"}
          aria-expanded={snap === "full"}
          aria-controls={contentId}
          onClick={handleHandleClick}
        />
        <div
          ref={contentRef}
          id={contentId}
          className="owner-bottom-sheet-content"
          data-owner-sheet-no-drag
          aria-hidden={snap === "compact"}
          inert={snap === "compact" ? true : undefined}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
