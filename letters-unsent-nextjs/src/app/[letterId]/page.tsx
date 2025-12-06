
import { Suspense } from "react";
import Spinner from "@/components/Spinner"
import { convertDate } from "@/utils/functions"

export default async function LetterPage({
  params,
}: {
  params: Promise<{ letterId: Number }>
}) {
    const letterIdString = await params

    const letterId = Number(letterIdString.letterId)

    const res = await fetch(`${process.env.SUPABASE_API_URL}/singleLetter?&letterId=${letterId}`)

    const data = await res.json()

  return (
    <>
      <div className="single-letter-container">
        <Suspense fallback={<Spinner />}>
          <div className="single-letter">
            <p className="single-letter-date">
              {convertDate(data.letter[0].created_at)}
            </p>

            {/* alternate rendering depending on whether a recipient is named  */}

            {
              ( data.letter[0].intended_recipient === "" || data.letter[0].intended_recipient === null )? (
                <p className="single-letter-content-no-recipient">
                  {data.letter[0].content}
                </p>
              ) : (
                <>
                  <h2>
                    {data.letter[0].intended_recipient}
                  </h2> 
                  <p className="single-letter-content">
                    {data.letter[0].content}
                  </p>
                </>
              )
            }

            {
              ( data.letter[0].author_name === "" || data.letter[0].author_name === null ) ? (
                <></>
              ) : (
                <p>{data.letter[0].author_name}</p>
              )
            }

          </div>
        </Suspense>
        <p className="timestamp">{data.letter[0].created_at}</p>
      </div>
    </>
  )
}