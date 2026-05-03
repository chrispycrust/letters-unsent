"use client"

import { useEffect, useRef, useState } from "react"

import OwnerEditActions from "@/components/LetterManagement/OwnerEditActions"

interface DesktopEditPocketProps {
  editFormId: string
  onCancel: () => void
}

export default function DesktopEditPocket({
  editFormId,
  onCancel,
}: DesktopEditPocketProps) {
  const [isExpanded, setIsExpanded] = useState(true)

  const collapseTimer = useRef<number | null>(null)
  const hasFocus = useRef(false)

  useEffect(() => {
    scheduleCollapse(2400)

    return () => clearCollapseTimer()
  }, [])

  function clearCollapseTimer() {
    if (collapseTimer.current) {
      window.clearTimeout(collapseTimer.current)
      collapseTimer.current = null
    }
  }

  function scheduleCollapse(delay = 1800) {
    clearCollapseTimer()
    if (hasFocus.current) {
      return
    }

    collapseTimer.current = window.setTimeout(() => {
      setIsExpanded(false)
    }, delay)
  }

  function expand() {
    clearCollapseTimer()
    setIsExpanded(true)
  }

  return (
    <div
      data-testid="desktop-edit-pocket"
      className={`owner-edit-pocket is-sticky ${isExpanded ? "is-expanded" : "is-collapsed"}`}
      data-pocket-state={isExpanded ? "expanded" : "collapsed"}
      onPointerEnter={expand}
      onPointerLeave={() => scheduleCollapse()}
      onFocusCapture={() => {
        hasFocus.current = true
        expand()
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          hasFocus.current = false
          scheduleCollapse()
        }
      }}
      onClick={() => {
        expand()
        scheduleCollapse()
      }}
    >
      {isExpanded ? (
        <OwnerEditActions editFormId={editFormId} onCancel={onCancel} />
      ) : (
        <button
          type="button"
          className="owner-subtle-action owner-edit-collapsed-trigger"
          onClick={expand}
        >
          Editing
        </button>
      )}
    </div>
  )
}
