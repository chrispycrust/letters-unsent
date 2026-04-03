import OpenAI from "openai";
import { guardianSystemPrompt } from "@/utils/guardian/systemPrompt";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_LETTERS_UNSENT_API_KEY_GUARDIAN,
});

type PrepareLetterForReleaseArgs = {
  content: string
  intended_recipient: string | null
  author_name: string | null
}

const tools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "prepare_letter_for_release",
    description: "Prepare the final letter payload when the visitor has clearly consented to release.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        content: {
          type: "string",
          description: "Contents of the final letter.",
        },
        intended_recipient: {
          type: "string",
          nullable: true,
          description: "Name or phrase for who the letter is addressed to.",
        },
        author_name: {
          type: "string",
          nullable: true,
          description: "Optional sign-off name from the author.",
        }
      },
      required: ["content", "intended_recipient", "author_name"],
      additionalProperties: false,
    },
  },
];

function normaliseOptionalString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

function normaliseReleasePayload(value: unknown): PrepareLetterForReleaseArgs | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  if (typeof record.content !== "string" || record.content.trim().length === 0) {
    return null;
  }

  return {
    content: record.content.trim(),
    intended_recipient: normaliseOptionalString(record.intended_recipient),
    author_name: normaliseOptionalString(record.author_name)
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const visitCount = searchParams.get("visitCount");
  const visitCountNumber = Number(visitCount ?? "1");

  const visitorPrompt =
    visitCountNumber <= 1
      ? "The visitor is new and has never been here before. Please greet them accordingly - try finding new ways to greet them. Keep it short."
      : "The visitor has returned again. Please greet them accordingly - try finding new ways to welcome them back.";

  const guardianResponse = await openai.responses.create({
    model: "gpt-4.1",
    instructions: guardianSystemPrompt,
    input: [{ role: "developer", content: visitorPrompt }],
  });

  return Response.json({ output: guardianResponse.output_text });
}

export async function POST(request: Request) {
  try {
    const { updatedConversation } = await request.json();

    const guardianResponse = await openai.responses.create({
      model: "gpt-4.1",
      input: updatedConversation,
      tools,
      store: false,
    });

    let releasePayload: PrepareLetterForReleaseArgs | null = null;

    for (const toolCall of guardianResponse.output) {
      if (toolCall.type !== "function_call") {
        continue;
      }

      if (toolCall.name !== "prepare_letter_for_release") {
        continue;
      }

      try {
        const parsedArguments = JSON.parse(toolCall.arguments);
        releasePayload = normaliseReleasePayload(parsedArguments);
      } catch (error) {
        console.error("Guardian tool parsing error:", error);
      }
    }

    const fallbackOutput = releasePayload ? "Your letter is ready to be released." : "";
    const outputText = guardianResponse.output_text || fallbackOutput;

    return Response.json({
      output: outputText,
      releaseReady: Boolean(releasePayload),
      letterPayload: releasePayload,
    });
  } catch (error) {
    console.error("Guardian route error:", error);
    return new Response("Error generating Guardian response", { status: 500 });
  }
}
