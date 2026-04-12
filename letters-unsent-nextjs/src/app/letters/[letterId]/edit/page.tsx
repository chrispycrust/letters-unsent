import type { Metadata } from "next"
import ErrorDisplay from "@/components/ErrorDisplay"
import LetterEditForm from "@/components/LetterManagement/LetterEditForm"
import { convertDate } from "@/utils/functions"

export const metadata: Metadata = {
  title: "Letters Unsent—Edit letter",
  description: "Edit your published letter",
}

type LetterResponse = {
  id: string
  content: string
  intended_recipient: string | null
  author_name: string | null
  created_at: string
}

export default async function EditLetterPage({
  params,
}: {
  params: Promise<{ letterId: string }>
}) {
  const { letterId } = await params
  const response = await fetch(`${process.env.SUPABASE_API_URL}/singleLetter?&letterId=${letterId}`, {
    cache: "no-store",
  })

  if (!response.ok) {
    let errorMessage = "Couldn’t load this letter for editing."

    try {
      const errorData = (await response.json()) as { error?: unknown }
      if (typeof errorData.error === "string" && errorData.error.trim().length > 0) {
        errorMessage = errorData.error
      }
    } catch {
      // fallback message handled above
    }

    return <ErrorDisplay message={errorMessage} />
  }

  const data = (await response.json()) as { letter?: unknown[] }
  const letter = data?.letter?.[0] as LetterResponse | undefined

  if (!letter) {
    return <ErrorDisplay message="Letter not found" />
  }

  return (
    <div className="single-letter-container">
      <div className="single-letter single-letter-edit">
        <p className="single-letter-date">{convertDate(letter.created_at as unknown as Date)}</p>
        <LetterEditForm
          letterId={letterId}
          initialLetter={{
            content: letter.content,
            intended_recipient: letter.intended_recipient,
            author_name: letter.author_name,
          }}
        />
      </div>
    </div>
  )
}
