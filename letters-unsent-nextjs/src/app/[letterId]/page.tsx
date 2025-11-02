import NavBar from "@/components/NavBar"

export default async function LetterPage({
  params,
}: {
  params: Promise<{ letterId: Number }>
}) {
    const letterIdString = await params

    const letterId = Number(letterIdString.letterId)
    console.log(typeof(letterId)) // this is confirmed to be a number

    const res = await fetch(`${process.env.SUPABASE_API_URL}/singleLetter?&letterId=${letterId}`)
    const data = await res.json()

    console.log("letter return on client side: ", data)
 
  return (
    <div>
        <NavBar />

        <button>
          Update letter
        </button>

        <div>
            <h2>{data.letter[0].intended_recipient}</h2>
            <p>{data.letter[0].created_at}</p>
            <p>{data.letter[0].content}</p>
            <p>{data.letter[0].author_name}</p>
        </div>
    </div>
  )
}