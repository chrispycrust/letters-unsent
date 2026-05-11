"use client"

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useEffect, useRef, useState } from "react"

/* Components */
import AIGenTag from "@/components/AIGenTag"
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

const DESKTOP_OWNER_RAIL_QUERY = "(min-width: 1280px)"
const FALLBACK_NAVBAR_OFFSET = 124

function getIsDesktopOwnerRailSurface(): boolean {
  return typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia(DESKTOP_OWNER_RAIL_QUERY).matches
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
  const [isDesktopOwnerRailSurface, setIsDesktopOwnerRailSurface] = useState(getIsDesktopOwnerRailSurface)
  const [showDesktopOwnerRail, setShowDesktopOwnerRail] = useState(false)
  const [desktopRailMountNode, setDesktopRailMountNode] = useState<HTMLElement | null>(null)
  const topOwnerControlsRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return
    }

    const mediaQuery = window.matchMedia(DESKTOP_OWNER_RAIL_QUERY)
    const updateDesktopOwnerRailSurface = () => setIsDesktopOwnerRailSurface(mediaQuery.matches)

    updateDesktopOwnerRailSurface()
    mediaQuery.addEventListener("change", updateDesktopOwnerRailSurface)

    return () => {
      mediaQuery.removeEventListener("change", updateDesktopOwnerRailSurface)
    }
  }, [])

  useEffect(() => {
    if (!isDesktopOwnerRailSurface) {
      setShowDesktopOwnerRail(false)
      return
    }

    const topOwnerControls = topOwnerControlsRef.current
    if (
      !topOwnerControls ||
      typeof window === "undefined" ||
      typeof window.IntersectionObserver !== "function"
    ) {
      setShowDesktopOwnerRail(false)
      return
    }

    const navbarOffset = getNavbarOffset()
    const observer = new window.IntersectionObserver(
      ([entry]) => {
        setShowDesktopOwnerRail(!entry.isIntersecting)
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
  }, [isDesktopOwnerRailSurface])

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
      {isDesktopOwnerRailSurface ? (
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
              isDesktopOwnerRailSurface={isDesktopOwnerRailSurface}
              showDesktopOwnerRail={showDesktopOwnerRail}
              desktopRailMountNode={desktopRailMountNode}
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

      {isDesktopOwnerRailSurface ? (
        <aside
          ref={setDesktopRailMountNode}
          className="single-letter-owner-rail"
          data-testid="owner-side-rail"
        />
      ) : null}
    </div>
  )
}
