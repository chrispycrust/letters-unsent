/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { convertDate } from "@/utils/functions"
import type { Letter } from "@/types/letter"

interface LetterViewProps {
  letter: Letter
}

/* 
-------------------------------------------------------------------------------------------------

  PURPOSE
  Displays public view of letter

-------------------------------------------------------------------------------------------------
*/

export default function LetterView({ letter }: LetterViewProps) {
  return (
    <div className="single-letter">
      <p className="single-letter-date">
        {convertDate(letter.created_at)}
      </p>

      {/* alternate rendering depending on whether a recipient is named  */}
      {!letter.intended_recipient ? (
        <div className="
          single-letter-content-no-recipient
          preserve-breaks"
        >
          {letter.content}
        </div>
      ) : (
        <>
          <h2>{letter.intended_recipient}</h2>
          <div className="
            single-letter-content-container-with-recipient
            preserve-breaks"
          >
            {letter.content}
          </div>
        </>
      )}

      {letter.author_name ? (
        <p className="sign-off">
          — {letter.author_name}
        </p>
      ) : null}
    </div>
  )
}
