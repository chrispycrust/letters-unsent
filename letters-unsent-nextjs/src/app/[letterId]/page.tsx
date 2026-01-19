/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";

import ErrorDisplay from "@/components/ErrorDisplay";
import { convertDate, tagAIGeneratedLetters } from "@/utils/functions"
import AIGenTag from "@/components/AIGenTag";

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

  return (
    <>
      <div className="single-letter-container">
          {
            tagAIGeneratedLetters(letterIdString.letterId) &&
              <AIGenTag />
          }
          {
            ( (data.letter[0].relationship_type !== "" || data.letter[0].relationship_type !== null)
              &&
              (data.letter[0].emotional_tone !== "" || data.letter[0].emotional_tone !== null)
            ) ? (
                <div
                  className="contextual-tags-container"
                >
                  <span>{data.letter[0].relationship_type} · <i>{data.letter[0].emotional_tone}</i></span>
                </div>
              ) : (
                <></>
              )
            }
          <br />
          <div className="single-letter"> 
            <p className="single-letter-date">
              {convertDate(data.letter[0].created_at)}
            </p>

            {/* alternate rendering depending on whether a recipient is named  */}

            {
              ( data.letter[0].intended_recipient === "" || data.letter[0].intended_recipient === null )? (
                <div className="
                  single-letter-content-no-recipient 
                  preserve-breaks"
                >
                  {data.letter[0].content}
                </div>
              ) : (
                <>
                  <h2>
                    {data.letter[0].intended_recipient}
                  </h2> 
                  <div className="
                    single-letter-content-container-with-recipient 
                    preserve-breaks"
                  >
                    {data.letter[0].content}
                  </div>
                </>
              )
            }

            {
              ( data.letter[0].author_name === "" || data.letter[0].author_name === null ) ? (
                <></>
              ) : (
                <p className="sign-off">
                  <br></br>— {data.letter[0].author_name}
                </p>
              )
            }

          </div>
        <p className="timestamp">{data.letter[0].created_at}</p>
      </div>
    </>
  )
}