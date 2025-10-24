import OpenAI from "openai";
import { guardianSystemPrompt } from "@/utils/guardian/systemPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_LETTERS_UNSENT_API_KEY_GUARDIAN
});

export async function GET(request: Request) {
    
    const { searchParams } = new URL(request.url)
    const visitCount = searchParams.get("visitCount")
    
    const visitorPrompt = 
      visitCount <= 1
        ? "The visitor is new and has never been here before. Please greet them accordingly - try finding new ways to greet them. Keep it short."
        : "The visitor has returned again. Please greet them accordingly - try finding new ways to welcome them back."

    const GuardianResponse = await openai.responses.create({
        model: "gpt-4o-mini",
        instructions: guardianSystemPrompt,
        input: [
            { role: "developer", content: visitorPrompt },
        ]
    })

  return Response.json({ output: GuardianResponse.output_text }) 
}

export async function POST(request: Request) {

  try {
    const { updatedConversation } = await request.json()
    console.log("updated conversation:", updatedConversation)

    const GuardianResponse = await openai.responses.create({
        model: "gpt-4o-mini",
        input: updatedConversation,
        store: true, // disable later in prod
    });

    return Response.json({ output: GuardianResponse.output_text }) 
  } catch (error) {
    console.error("Guardian route error:", error)
    return new Response("Error generating Guardian response", { status: 500 })
  }

}