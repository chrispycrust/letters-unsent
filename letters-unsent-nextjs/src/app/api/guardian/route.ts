import OpenAI from "openai";
import { guardianSystemPrompt } from "@/utils/guardian/systemPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_LETTERS_UNSENT_API_KEY_GUARDIAN
});

const tools = [
  {
    type: "function",
    name: "submit_to_supabase",
    description: "Submit final letter object to Supabase at RELEASE stage of conversation",
    parameters: {
      type: "object",
      properties: {
        content: {
          "type": "string",
          "description": "contents of the visitor's letter",
        },
        intended_recipient: {
          type: "string",
          description: "name of the recipient of the letter",
        },
        author_name: {
          type: "string",
          description: "name of the author of the letter",
        }
      },
      required: ["content"],
      additionalProperties: false // not sure what this is 
    },
    // strict: true // also not sure what this is
  }
];

async function submit_to_supabase(args) {

  console.log("Object received from model:", args);

  args.created_at = new Date().toISOString();

  console.log("Submitting to Supabase:", args);

  try {
    
    const res = await fetch(process.env.SUPABASE_API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(args)
    });

    if (!res.ok) {
      const errorBody = await res.text()

      console.error("Supabase route error:", errorBody)
      return "Error saving letter."
    }

    const data = await res.json()

    console.log("✅ Supabase response:", data)
    
    return "Letter successfully saved."

  } catch (err) {
    console.error("Fetch failed:", err)
    return "Error saving letter."
  }
  
}

async function callFunction(name, args) {
  if (name === "submit_to_supabase") {
    return await submit_to_supabase(args)
  }
  return null
}
  
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
        tools,
        store: true, // disable later in prod
      });

    let finalText = GuardianResponse.output_text

    for (const toolCall of GuardianResponse.output) {
      if (toolCall.type === "function_call") {
  
      const name = toolCall.name;
      const args = JSON.parse(toolCall.arguments);
  
      const result =  await callFunction(name, args);
      
      updatedConversation.push(
        {
          type: "function_call",
          name: name,
          call_id: toolCall.call_id,
          arguments: toolCall.arguments
        },
        {
          type: "function_call_output",
          call_id: toolCall.call_id,
          output: JSON.stringify(result)
        }
      );
    
      const GuardianResponseAfterSubmission = await openai.responses.create({
        model: "gpt-4o-mini",
        input: updatedConversation,
        tools,
        store: true, // disable later in prod
      });

      finalText = GuardianResponseAfterSubmission.output_text
      
      }
    }
    
    // console.log("Guardian Response", finalText)

    return Response.json({ output: finalText }) 

  } catch (error) {

    console.error("Guardian route error:", error)
    return new Response("Error generating Guardian response", { status: 500 })

  }

}