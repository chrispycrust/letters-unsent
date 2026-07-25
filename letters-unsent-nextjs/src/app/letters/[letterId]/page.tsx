/* 
-------------------------------------------------------------------------------------------------

  IMPORTS

-------------------------------------------------------------------------------------------------
*/

import type { Metadata } from "next";

import ErrorDisplay from "@/components/ErrorDisplay";
import LetterViewWrapper from "@/components/LetterViewWrapper";
import type { Letter } from "@/types/letter";

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
    const { letterId } = await params

    const res = await fetch(
      `${process.env.SUPABASE_API_URL}/singleLetter?&letterId=${encodeURIComponent(letterId)}`,
      { cache: "no-store" },
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

    type LetterApiResponse = Omit<Letter, "id"> & { id: string | number }
    const data = (await res.json()) as { letter?: LetterApiResponse[] }

    const letterResponse = data?.letter?.[0]

    if (!letterResponse) {
      return <ErrorDisplay message="Letter not found" />;
    }

    const letter: Letter = {
      ...letterResponse,
      id: String(letterResponse.id),
    }

  /* -------------------------------------------------------------------------------- */

  return (
    <div className="page-container">
      <LetterViewWrapper letter={letter} />
    </div>
  )
}
