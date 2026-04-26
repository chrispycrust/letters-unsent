"use client"

/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { useState } from "react"

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

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Parent component that conditionally renders either the public view or the edit form

-------------------------------------------------------------------------------------------------
*/

export default function LetterViewWrapper({ letter }: LetterViewWrapperProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [currentLetter, setCurrentLetter] = useState(letter)

  function handleSavedLetter(updatedFields: EditableLetterFields & Pick<Letter, "updated_at">) {
    setCurrentLetter((existingLetter) => ({
      ...existingLetter,
      ...updatedFields,
    }))
    setIsEditing(false)
  }

  return (
    <div className="single-letter-container">
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

        <LetterOwnerArea
          letterId={currentLetter.id}
          isEditing={isEditing}
          onEdit={() => setIsEditing(true)}
        />
      </div>

      {isEditing ? (
        <div className="single-letter single-letter-edit">
          <p className="single-letter-date">{convertDate(currentLetter.created_at)}</p>
          <LetterEditForm
            letterId={currentLetter.id}
            initialLetter={{
              content: currentLetter.content,
              intended_recipient: currentLetter.intended_recipient,
              author_name: currentLetter.author_name,
            }}
            onCancel={() => setIsEditing(false)}
            onSaveSuccess={handleSavedLetter}
          />
        </div>
      ) : (
        <LetterView letter={currentLetter} />
      )}

      <p className="timestamp">{currentLetter.updated_at ?? currentLetter.created_at}</p>
    </div>
  )
}
