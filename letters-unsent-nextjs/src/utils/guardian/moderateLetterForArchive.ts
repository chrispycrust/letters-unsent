import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_LETTERS_UNSENT_API_KEY_GUARDIAN,
})

export type LetterModerationPayload = {
  content: string
  intended_recipient: string | null
  author_name: string | null
}

export type LetterModerationResult = {
  allowed: boolean
  reason: string
}

const moderationTools: OpenAI.Responses.Tool[] = [
  {
    type: "function",
    name: "classify_letter_safety",
    description: "Classify whether a letter update can be accepted for public archive release.",
    strict: true,
    parameters: {
      type: "object",
      properties: {
        allowed: {
          type: "boolean",
          description: "Whether the edited letter is safe to accept.",
        },
        reason: {
          type: "string",
          description: "Short reason for allow or reject decision.",
        },
      },
      required: ["allowed", "reason"],
      additionalProperties: false,
    },
  },
]
const moderationInstructions = `
You are a safety reviewer for Letters Unsent, a public archive for anonymous letters.
Classify whether the submission is acceptable.

Reject if content includes:
- identifying sensitive details (for example: full names, addresses, phone numbers, place of work/school visited frequently)
- pornographic or explicit sexual content with anatomical detail intended to arouse
- harmful intention (revenge, humiliation, vindication, harassment)
- doxxing
- targeted abuse
- graphic violent or traumatic detail
- hate speech
- praise of extremist ideology
- self-harm instructions
- suicidal intent or thoughts
- any of the above involving minors

Only call classify_letter_safety once with:
- allowed=true when acceptable
- allowed=false when unacceptable
- reason in concise plain language
`

function parseToolResult(output: OpenAI.Responses.ResponseOutputItem[]): LetterModerationResult | null {
  for (const item of output) {
    if (item.type !== "function_call" || item.name !== "classify_letter_safety") {
      continue
    }

    try {
      const parsed = JSON.parse(item.arguments) as {
        allowed?: unknown
        reason?: unknown
      }

      if (typeof parsed.allowed !== "boolean" || typeof parsed.reason !== "string") {
        return null
      }

      const reason = parsed.reason.trim()
      return {
        allowed: parsed.allowed,
        reason: reason.length > 0 ? reason : "Safety review did not provide a reason.",
      }
    } catch {
      return null
    }
  }

  return null
}

export async function moderateLetterForArchive(
  payload: LetterModerationPayload,
): Promise<LetterModerationResult> {
  const response = await openai.responses.create({
    model: "gpt-4.1",
    instructions: moderationInstructions,
    input: [
      {
        role: "developer",
        content: JSON.stringify(payload),
      },
    ],
    tools: moderationTools,
    store: false,
  })

  const parsedResult = parseToolResult(response.output)
  if (parsedResult) {
    return parsedResult
  }

  return {
    allowed: false,
    reason: "Safety review could not be completed.",
  }
}
