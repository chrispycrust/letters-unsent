/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import { convertDate } from "@/utils/functions"

// import type { Metadata } from "next";

// export const metadata: Metadata = {
//     title: `Letters Unsent-Letter ${letterId}`,
//     description: "Write and submit your own letter",
//   };

/* 
-------------------------------------------------------------------------------------------------
  
  PURPOSE 
  Dynamic segment display single letter

------------------------------------------------------------------------------------------------- 
*/

export default async function LetterPage({
  params,
}: {
  params: Promise<{ letterId: number }>
}) {
    const letterIdString = await params

    const letterId = Number(letterIdString.letterId)

    const res = await fetch(`${process.env.SUPABASE_API_URL}/singleLetter?&letterId=${letterId}`)

    const data = await res.json()

  return (
    <>
      <div className="single-letter-container">
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