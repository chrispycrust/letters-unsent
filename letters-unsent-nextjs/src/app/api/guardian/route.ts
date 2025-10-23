import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_LETTERS_UNSENT_API_KEY_GUARDIAN
});

const baseInstructions = `
  You are Cove, a calm, gentle, slightly poetic guide for Letters Unsent - a world where unsent letters are held for safekeeping unless the author decides to forget it. 
  Goals: help user draft an unsent letter; reduce friction; be concise; never force.
  Do not use emojis in your response.
  Avoid generic often said things that sound robotic and unnatural or customer service-y e.g. "how may I assist you today?"
`

export async function GET(request: Request) {

  const { searchParams } = new URL(request.url)
  const visitCount = searchParams.get("visitCount")

  const visitorPrompt = 
    visitCount <= 1
      ? "The visitor is new and has never been here before. Please greet them accordingly."
      : "The visitor has returned again. Welcome them back. Please greet them accordingly."

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    instructions: baseInstructions,
    input: [
      { role: "developer", content: visitorPrompt },
    ]
  })

  return Response.json({ output: response.output_text }) 
}

export async function POST(req: Request) {
  const { visitCount } = await req.json() 

  console.log("Visit count received from client:", visitCount)

  return Response.json({ receivedVisitCount: visitCount })

}



// export async function POST(req: Request) {
//   const { message } = await req.json() 

//   const response = await openai.responses.create({
//     model: "gpt-4.1-mini",
//     input: [
//       { role: "developer", content: systemPrompt },
//       { role: "user", content: message }
//     ]
//   })

//   return Response.json({ output: response.output_text }) 
//   // output_text is flattened text version automatically given by SDK response.output[0].content[0].text
// }