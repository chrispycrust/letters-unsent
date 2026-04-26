import argon2 from "argon2"
import { NextResponse } from "next/server"
import { moderateLetterForArchive } from "@/utils/guardian/moderateLetterForArchive"
import { createClient } from "@/utils/supabase/server"
import type { Letter } from "@/types/letter"

export const runtime = "nodejs"

const VERIFICATION_RATE_LIMIT_MESSAGE =
  "Too many attempts in a short time. Please wait a moment, then try again."
const TOKEN_VERIFICATION_FAILED_MESSAGE = "We couldn’t verify your token."
const EDIT_MODERATION_REJECT_MESSAGE =
  "We couldn’t accept this updated version under the archive’s safety guidelines."

const VERIFICATION_WINDOW_MS = 90_000
const FAILED_ATTEMPTS_BEFORE_LOCK = 5
const BASE_LOCK_MS = 8_000
const MAX_LOCK_MS = 120_000

type VerificationState = {
  failedAttempts: number
  windowStartedAt: number
  lockedUntil: number
}

type VerifyOwnershipResult =
  | { ok: true }
  | {
      ok: false
      status: number
      code:
        | "MISSING_PASSPHRASE"
        | "INVALID_PASSPHRASE"
        | "VERIFICATION_RATE_LIMITED"
        | "LETTER_NOT_FOUND"
      error: string
    }

type EditLetterRow = Pick<Letter, "content" | "intended_recipient" | "author_name">

const verificationStateByKey = new Map<string, VerificationState>()

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
  if (message.includes("invalid payload") || message.includes("missing required field")) {
    return 400
  }
  return 500
}

function hasNoRows(data: unknown): boolean {
  return !Array.isArray(data) || data.length === 0
}

function normaliseNonEmptyText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

function normaliseNullableText(value: unknown): string | null {
  if (value === null) {
    return null
  }

  if (typeof value !== "string") {
    return null
  }

  const trimmedValue = value.trim()
  return trimmedValue.length > 0 ? trimmedValue : null
}

function getRequesterIdentity(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for")
  if (!forwardedFor) {
    return "anonymous"
  }

  const firstIp = forwardedFor.split(",")[0]?.trim()
  return firstIp && firstIp.length > 0 ? firstIp : "anonymous"
}

function getVerificationStateKey(letterId: string, request: Request): string {
  return `${letterId}:${getRequesterIdentity(request)}`
}

function getVerificationState(stateKey: string, now: number): VerificationState {
  const existingState = verificationStateByKey.get(stateKey)
  if (!existingState || now - existingState.windowStartedAt > VERIFICATION_WINDOW_MS) {
    const resetState: VerificationState = {
      failedAttempts: 0,
      windowStartedAt: now,
      lockedUntil: 0,
    }
    verificationStateByKey.set(stateKey, resetState)
    return resetState
  }

  return existingState
}

function isStateLocked(state: VerificationState, now: number): boolean {
  return state.lockedUntil > now
}

function registerVerificationFailure(stateKey: string, now: number): VerificationState {
  const state = getVerificationState(stateKey, now)
  state.failedAttempts += 1

  if (state.failedAttempts >= FAILED_ATTEMPTS_BEFORE_LOCK) {
    const lockTier = state.failedAttempts - FAILED_ATTEMPTS_BEFORE_LOCK
    const lockDuration = Math.min(BASE_LOCK_MS * 2 ** lockTier, MAX_LOCK_MS)
    state.lockedUntil = now + lockDuration
  }

  verificationStateByKey.set(stateKey, state)
  return state
}

function clearVerificationFailures(stateKey: string) {
  verificationStateByKey.delete(stateKey)
}

async function readJsonBody(
  request: Request,
): Promise<{ ok: true; body: Record<string, unknown> } | { ok: false }> {
  try {
    const parsedBody = (await request.json()) as Record<string, unknown>
    return { ok: true, body: parsedBody }
  } catch {
    return { ok: false }
  }
}

async function verifyOwnership({
  request,
  letterId,
  ownerPassphrase,
}: {
  request: Request
  letterId: string
  ownerPassphrase: unknown
}): Promise<VerifyOwnershipResult> {
  const passphrase = normaliseNonEmptyText(ownerPassphrase)
  if (!passphrase) {
    return {
      ok: false,
      status: 401,
      code: "MISSING_PASSPHRASE",
      error: TOKEN_VERIFICATION_FAILED_MESSAGE,
    }
  }

  const stateKey = getVerificationStateKey(letterId, request)
  const now = Date.now()
  const verificationState = getVerificationState(stateKey, now)

  if (isStateLocked(verificationState, now)) {
    return {
      ok: false,
      status: 429,
      code: "VERIFICATION_RATE_LIMITED",
      error: VERIFICATION_RATE_LIMIT_MESSAGE,
    }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("letter")
    .select("id, owner_passphrase_hash")
    .eq("id", letterId)

  if (error) {
    throw error
  }

  if (hasNoRows(data)) {
    return {
      ok: false,
      status: 404,
      code: "LETTER_NOT_FOUND",
      error: "Letter not found.",
    }
  }

  const row = data[0] as { owner_passphrase_hash?: unknown }
  const passphraseHash = typeof row.owner_passphrase_hash === "string" ? row.owner_passphrase_hash : null

  if (!passphraseHash) {
    const failedState = registerVerificationFailure(stateKey, now)
    if (isStateLocked(failedState, now)) {
      return {
        ok: false,
        status: 429,
        code: "VERIFICATION_RATE_LIMITED",
        error: VERIFICATION_RATE_LIMIT_MESSAGE,
      }
    }

    return {
      ok: false,
      status: 401,
      code: "INVALID_PASSPHRASE",
      error: TOKEN_VERIFICATION_FAILED_MESSAGE,
    }
  }

  const isMatch = await argon2.verify(passphraseHash, passphrase)
  if (!isMatch) {
    const failedState = registerVerificationFailure(stateKey, now)
    if (isStateLocked(failedState, now)) {
      return {
        ok: false,
        status: 429,
        code: "VERIFICATION_RATE_LIMITED",
        error: VERIFICATION_RATE_LIMIT_MESSAGE,
      }
    }

    return {
      ok: false,
      status: 401,
      code: "INVALID_PASSPHRASE",
      error: TOKEN_VERIFICATION_FAILED_MESSAGE,
    }
  }

  clearVerificationFailures(stateKey)
  return { ok: true }
}

// retrieves a letter based on ID
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const letterId = searchParams.get("letterId")

    if (!letterId) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: missing required field `letterId`." },
        { status: 400 },
      )
    }

    const { data: letter, error } = await supabase
      .from("letter")
      .select("id, content, intended_recipient, author_name, relationship_type, emotional_tone, created_at, updated_at")
      .eq("id", letterId)

    if (error) {
      throw error
    }

    return NextResponse.json({ success: true, letter: letter ?? [] })
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Supabase error:", message)
    return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(error) })
  }
}

// verifies passphrase ownership for a single letter
export async function POST(request: Request) {
  try {
    const bodyResult = await readJsonBody(request)
    if (!bodyResult.ok) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: malformed JSON body." },
        { status: 400 },
      )
    }

    const { letterId, owner_passphrase } = bodyResult.body
    if (typeof letterId !== "string" || letterId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: missing required field `letterId`." },
        { status: 400 },
      )
    }

    const verificationResult = await verifyOwnership({
      request,
      letterId: letterId.trim(),
      ownerPassphrase: owner_passphrase,
    })

    if (!verificationResult.ok) {
      return NextResponse.json(
        {
          success: false,
          code: verificationResult.code,
          error: verificationResult.error,
        },
        { status: verificationResult.status },
      )
    }

    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Supabase error:", message)
    return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(error) })
  }
}

// updates a letter based on ID
export async function PUT(request: Request) {
  try {
    const bodyResult = await readJsonBody(request)
    if (!bodyResult.ok) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: malformed JSON body." },
        { status: 400 },
      )
    }

    const {
      letterId,
      owner_passphrase,
      content,
      intended_recipient,
      author_name,
    } = bodyResult.body

    if (typeof letterId !== "string" || letterId.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: missing required field `letterId`." },
        { status: 400 },
      )
    }

    const hasAnyUpdateField =
      content !== undefined || intended_recipient !== undefined || author_name !== undefined
    if (!hasAnyUpdateField) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: at least one updatable field is required." },
        { status: 400 },
      )
    }

    const verificationResult = await verifyOwnership({
      request,
      letterId: letterId.trim(),
      ownerPassphrase: owner_passphrase,
    })
    if (!verificationResult.ok) {
      return NextResponse.json(
        {
          success: false,
          code: verificationResult.code,
          error: verificationResult.error,
        },
        { status: verificationResult.status },
      )
    }

    const supabase = await createClient()
    const { data: currentRows, error: currentRowError } = await supabase
      .from("letter")
      .select("content, intended_recipient, author_name")
      .eq("id", letterId)

    if (currentRowError) {
      throw currentRowError
    }

    if (hasNoRows(currentRows)) {
      return NextResponse.json(
        { success: false, error: "Letter not found." },
        { status: 404 },
      )
    }

    const currentRow = currentRows[0] as EditLetterRow

    const nextContent =
      content === undefined ? currentRow.content : normaliseNonEmptyText(content)
    if (!nextContent) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: `content` must be a non-empty string." },
        { status: 400 },
      )
    }

    const nextRecipient =
      intended_recipient === undefined
        ? normaliseNullableText(currentRow.intended_recipient)
        : normaliseNullableText(intended_recipient)
    const nextAuthorName =
      author_name === undefined
        ? normaliseNullableText(currentRow.author_name)
        : normaliseNullableText(author_name)

    const moderationResult = await moderateLetterForArchive({
      content: nextContent,
      intended_recipient: nextRecipient,
      author_name: nextAuthorName,
    })

    if (!moderationResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          code: "MODERATION_BLOCKED",
          error: EDIT_MODERATION_REJECT_MESSAGE,
        },
        { status: 422 },
      )
    }

    const updates = {
      ...(content !== undefined ? { content: nextContent } : {}),
      ...(intended_recipient !== undefined ? { intended_recipient: nextRecipient } : {}),
      ...(author_name !== undefined ? { author_name: nextAuthorName } : {}),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from("letter")
      .update(updates)
      .eq("id", letterId)
      .select()

    if (error) {
      throw error
    }

    if (hasNoRows(data)) {
      return NextResponse.json(
        { success: false, error: "Letter not found." },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Supabase error:", message)
    return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(error) })
  }
}

// deletes a letter based on ID
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const letterId = searchParams.get("letterId")

    if (!letterId) {
      return NextResponse.json(
        { success: false, error: "Invalid payload: missing required field `letterId`." },
        { status: 400 },
      )
    }

    const bodyResult = await readJsonBody(request)
    const ownerPassphrase = bodyResult.ok ? bodyResult.body.owner_passphrase : undefined
    const verificationResult = await verifyOwnership({
      request,
      letterId,
      ownerPassphrase,
    })

    if (!verificationResult.ok) {
      return NextResponse.json(
        {
          success: false,
          code: verificationResult.code,
          error: verificationResult.error,
        },
        { status: verificationResult.status },
      )
    }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from("letter")
      .delete()
      .eq("id", letterId)
      .select()

    if (error) {
      throw error
    }

    if (hasNoRows(data)) {
      return NextResponse.json(
        { success: false, error: "Letter not found." },
        { status: 404 },
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    const message = getErrorMessage(error)
    console.error("Supabase error:", message)
    return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(error) })
  }
}
