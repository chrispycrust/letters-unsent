/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";

import ErrorDisplay from "@/components/ErrorDisplay";
import { convertDate, tagAIGeneratedLetters } from "@/utils/functions"
import AIGenTag from "@/components/AIGenTag";
import LetterOwnerArea from "@/components/LetterManagement/LetterOwnerArea";

export const metadata: Metadata = {
    title: `Letters Unsent-Letter`,
    description: "Read a single letter",
  };

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Dynamic segment display single letter

------------------------------------------------------------------------------------------------- 
*/

export default async function LetterPage({
  params,
}: {
  params: Promise<{ letterId: string }>
}) {
    const letterIdString = await params

    const letterId = Number(letterIdString.letterId)

    const res = await fetch(
      `${process.env.SUPABASE_API_URL}/singleLetter?&letterId=${letterId}`
      ,{ cache: "no-store" }
    )

    if (!res.ok) {

      let errorMessage = "Couldn't load this letter"

      try {
        const errorData = await res.json()
        if (errorData?.error) {
          errorMessage = errorData.error
        }
      } catch {
        // response wasn't JSON — ignore and use default message
      }

      return (
        <ErrorDisplay
          message={errorMessage}
        />
      )
    }

    const data = await res.json()

    const letter = data?.letter?.[0]

    if (!letter) {
      return <ErrorDisplay message="Letter not found" />;
    }

  /* -------------------------------------------------------------------------------- */

  return (
    <>
      <div className="single-letter-container">
          <div className="single-letter-topline">
            <div className="single-letter-meta">
              {
                tagAIGeneratedLetters(letterIdString.letterId) &&
                  <AIGenTag />
              }
              {
                ( letter?.relationship_type && letter?.emotional_tone && (
                    <div
                      className="contextual-tags-container"
                      title="These are contextual tags to demonstrate the range of relationship types and emotional tones welcome on the website.
                            These are not yet a feature to be added on submission."
                    >
                      <span>{letter?.relationship_type} · <i>{letter?.emotional_tone}</i></span>
                    </div>
                ))
              }
            </div>
            <LetterOwnerArea letterId={letterIdString.letterId} />
          </div>
          <div className="single-letter"> 
            <p className="single-letter-date">
              {convertDate(letter?.created_at)}
            </p>

            {/* alternate rendering depending on whether a recipient is named  */}

            {
              ( !letter?.intended_recipient )? (
                <div className="
                  single-letter-content-no-recipient 
                  preserve-breaks"
                >
                  {letter?.content}
                </div>
              ) : (
                <>
                  <h2>
                    {letter?.intended_recipient}
                  </h2> 
                  <div className="
                    single-letter-content-container-with-recipient 
                    preserve-breaks"
                  >
                    {letter?.content}
                  </div>
                </>
              )
            }

            {
              ( !letter?.author_name ) ? (
                <></>
              ) : (
                <p className="sign-off">
                  <br></br>— {letter?.author_name}
                </p>
              )
            }

          </div>
        <p className="timestamp">{letter?.updated_at ?? letter?.created_at}</p>
      </div>
    </>
  )
}
