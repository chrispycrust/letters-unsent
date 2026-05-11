"use client"

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useEffect, useRef, useState } from "react"

/* Components */
import AIGenTag from "@/components/AIGenTag"
import DesktopEditPocket from "@/components/LetterManagement/DesktopEditPocket"
import LetterOwnerArea from "@/components/LetterManagement/LetterOwnerArea"
import LetterEditForm from "@/components/LetterManagement/LetterEditForm"
import LetterView from "@/components/LetterView"

/* Functions */
import { convertDate, tagAIGeneratedLetters } from "@/utils/functions"

/* Types */
import type { Letter } from "@/types/letter"

type EditableLetterFields = Pick<Letter, "content" | "intended_recipient" | "author_name">

interface LetterViewWrapperProps {
  letter: Letter
}

const DESKTOP_EDIT_RAIL_QUERY = "(min-width: 1280px)"
const FALLBACK_NAVBAR_OFFSET = 124

function getIsDesktopEditRailSurface(): boolean {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(DESKTOP_EDIT_RAIL_QUERY).matches
}

function getNavbarOffset(): number {
  if (typeof window === "undefined") {
    return FALLBACK_NAVBAR_OFFSET
  }

  const rawOffset = window
    .getComputedStyle(document.documentElement)
    .getPropertyValue("--navbar-offset")
    .trim()
  const parsedOffset = Number.parseInt(rawOffset, 10)

  return Number.isFinite(parsedOffset) ? parsedOffset + 14 : FALLBACK_NAVBAR_OFFSET
}

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Parent component that conditionally renders either the public view or the edit form

-------------------------------------------------------------------------------------------------
*/

export default function LetterViewWrapper({ letter }: LetterViewWrapperProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentLetter, setCurrentLetter] = useState(letter)
  const [isDesktopEditRailSurface, setIsDesktopEditRailSurface] = useState(getIsDesktopEditRailSurface)
  const [showDesktopEditRail, setShowDesktopEditRail] = useState(false)
  const topOwnerControlsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }

    const mediaQuery = window.matchMedia(DESKTOP_EDIT_RAIL_QUERY)
    const updateDesktopEditRailSurface = () => setIsDesktopEditRailSurface(mediaQuery.matches)

    updateDesktopEditRailSurface()
    mediaQuery.addEventListener("change", updateDesktopEditRailSurface)

    return () => {
      mediaQuery.removeEventListener("change", updateDesktopEditRailSurface)
    }
  }, [])

  useEffect(() => {
    if (!isEditing || !isDesktopEditRailSurface) {
      setShowDesktopEditRail(false)
      return
    }

    const topOwnerControls = topOwnerControlsRef.current
    if (
      !topOwnerControls ||
      typeof window === "undefined" ||
      typeof window.IntersectionObserver !== "function"
    ) {
      setShowDesktopEditRail(false)
      return
    }

    const navbarOffset = getNavbarOffset()
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setShowDesktopEditRail(!entry.isIntersecting)
      },
      {
        root: null,
        rootMargin: `-${navbarOffset}px 0px 0px 0px`,
        threshold: 0.01,
      },
    )

    observer.observe(topOwnerControls)

    return () => {
      observer.disconnect()
    }
  }, [isEditing, isDesktopEditRailSurface])

  function handleSavedLetter(updatedFields: EditableLetterFields & Pick<Letter, "updated_at">) {
    setCurrentLetter((existingLetter) => ({
      ...existingLetter,
      ...updatedFields,
    }))
    setIsEditing(false)
  }

  function handleCancelEditing() {
    setIsEditing(false)
  }

  const editFormId = `letter-edit-form-${currentLetter.id}`

  return (
    <div
      className={`single-letter-container ${isEditing ? "is-editing" : ""}`}
      data-testid="single-letter-layout"
    >
      {isDesktopEditRailSurface ? (
        <div
          className="single-letter-balance-rail"
          data-testid="owner-balance-rail"
          aria-hidden="true"
        />
      ) : null}

      <div className="single-letter-main-column">
        <div className="single-letter-topline">
          <div className="single-letter-meta">
            {tagAIGeneratedLetters(currentLetter.id) ? <AIGenTag /> : null}
            {currentLetter.relationship_type && currentLetter.emotional_tone ? (
              <div
                className="contextual-tags-container"
                title="These are contextual tags to demonstrate the range of relationship types and emotional tones welcome on the website.
                      These are not yet a feature to be added on submission."
              >
                <span>{currentLetter.relationship_type} · <i>{currentLetter.emotional_tone}</i></span>
              </div>
            ) : null}
          </div>

          <div ref={topOwnerControlsRef} className="single-letter-owner-top-control">
            <LetterOwnerArea
              letterId={currentLetter.id}
              isEditing={isEditing}
              editFormId={editFormId}
              onEdit={() => setIsEditing(true)}
              onCancelEdit={handleCancelEditing}
            />
          </div>
        </div>

        {isEditing ? (
          <div className="single-letter single-letter-edit">
            <p className="single-letter-date">{convertDate(currentLetter.created_at)}</p>
            <LetterEditForm
              letterId={currentLetter.id}
              formId={editFormId}
              initialLetter={{
                content: currentLetter.content,
                intended_recipient: currentLetter.intended_recipient,
                author_name: currentLetter.author_name,
              }}
              showInlineActions={false}
              onCancel={handleCancelEditing}
              onSaveSuccess={handleSavedLetter}
            />
          </div>
        ) : (
          <LetterView letter={currentLetter} />
        )}

        <p className="timestamp">{currentLetter.updated_at ?? currentLetter.created_at}</p>
      </div>

      {isDesktopEditRailSurface ? (
        <aside
          className={`single-letter-owner-rail ${showDesktopEditRail ? "is-active" : ""}`}
          data-testid="owner-side-rail"
          aria-hidden={!showDesktopEditRail}
        >
          {isEditing ? (
            <DesktopEditPocket editFormId={editFormId} onCancel={handleCancelEditing} />
          ) : null}
        </aside>
      ) : null}
    </div>
  )
}
