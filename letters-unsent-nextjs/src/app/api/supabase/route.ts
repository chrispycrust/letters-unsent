import argon2 from "argon2"
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export const runtime = "nodejs"

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error !== null && "message" in error) {
    return String((error as { message: unknown }).message)
  }
  return String(error)
}

function getErrorStatus(error: unknown): number {
  if (error instanceof SyntaxError) {
    return 400
  }

  const message = getErrorMessage(error).toLowerCase()
  if (message.includes("permission denied") || message.includes("not authenticated") || message.includes("jwt")) {
    return 403
  }
  if (message.includes("invalid payload") || message.includes("unexpected token")) {
    return 400
  }
  return 500
}

function normaliseNullableText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

function resolveInsertedId(data: unknown): string | null {
  if (!Array.isArray(data) || data.length === 0) {
    return null
  }

  const row = data[0] as { id?: unknown }
  if (typeof row.id === "string") {
    return row.id
  }

  if (typeof row.id === "number") {
    return String(row.id)
  }

  return null
}

// retrieves all letters from landing page
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: letters, error } = await supabase
      .from("letter")
      .select()
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, letters: letters ?? [] })
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Supabase error:", message)
    return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(error) })
  }
}

// insert a new row into the letters table
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    let body: Record<string, unknown>

    try {
      body = await request.json()
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid payload: malformed JSON body." },
        { status: 400 },
      )
    }

    const {
      content,
      intended_recipient,
      author_name,
      created_at,
      owner_passphrase,
    } = body

    if (typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: `content` is required." },
        { status: 400 },
      )
    }

    if (
      owner_passphrase !== null &&
      owner_passphrase !== undefined &&
      typeof owner_passphrase !== "string"
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: `owner_passphrase` must be a string or null." },
        { status: 400 },
      )
    }

    const normalisedContent = content.trim()
    const normalisedCreatedAt =
      typeof created_at === "string" && created_at.trim().length > 0
        ? created_at
        : new Date().toISOString()

    const passphrase = typeof owner_passphrase === "string" ? owner_passphrase.trim() : null
    const owner_passphrase_hash =
      passphrase && passphrase.length > 0
        ? await argon2.hash(passphrase, { type: argon2.argon2id })
        : null

    const { data, error } = await supabase
      .from("letter")
      .insert([
        {
          content: normalisedContent,
          intended_recipient: normaliseNullableText(intended_recipient),
          author_name: normaliseNullableText(author_name),
          created_at: normalisedCreatedAt,
          owner_passphrase_hash,
        },
      ])
      .select()

    if (error) throw error

    return NextResponse.json({
      success: true,
      id: resolveInsertedId(data),
      data,
    })
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Supabase error:", message)
    return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(error) })
  }
}
