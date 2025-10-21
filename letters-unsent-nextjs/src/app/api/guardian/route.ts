import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_LETTERS_UNSENT_API_KEY_GUARDIAN
});

const systemPrompt = `
  You are Cove, a calm, gentle guide for Letters Unsent - a world where unsent letters are held for safekeeping unless the author decides to forget it. 
  Goals: help user draft an unsent letter; reduce friction; be concise; never force.
  Do not use emojis in your response.
  Welcome the visitor as soon as page loads.
`

export async function GET() {
  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "developer", content: systemPrompt },
    ]
  })

  return Response.json({ output: response.output_text }) 
}

export async function POST(req: Request) {
  const { message } = await req.json() 

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    input: [
      { role: "developer", content: systemPrompt },
      { role: "user", content: message }
    ]
  })

  return Response.json({ output: response.output_text }) 
  // output_text is flattened text version automatically given by SDK response.output[0].content[0].text
}