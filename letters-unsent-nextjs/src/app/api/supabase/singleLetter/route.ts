import { NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message
    if (typeof error === "object" && error !== null && "message" in error) {
        return String((error as { message: unknown }).message)
    }
    return String(error)
}

function getErrorStatus(error: unknown): number {
    const message = getErrorMessage(error).toLowerCase()
    if (
        message.includes("permission denied") ||
        message.includes("not authenticated") ||
        message.includes("jwt")
    ) {
        return 403
    }
    if (message.includes("invalid payload") || message.includes("missing required field")) {
        return 400
    }
    return 500
}

// retrieves a letter based on ID
export async function GET(request: Request) {

    try {
        const supabase = await createClient()

        console.log("contacting supabase/singleLetter route ... ")

        const { searchParams } = new URL(request.url)
        const letterId = searchParams.get("letterId")
        if (!letterId) {
            return NextResponse.json(
                { success: false, error: "Invalid payload: missing required field `letterId`." },
                { status: 400 },
            )
        }

        // console.log("letterId retrieved:", letterId)

        const { data: letter, error } = await supabase
            .from("letter")
            .select()
            .eq("id", letterId)

        // console.log(letter);

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

// updates a letter based on ID
export async function PUT(request: Request) {
    try {
        const supabase = await createClient()
        const body = await request.json()
        const { letterId, content, intended_recipient, author_name } = body

        if (!letterId) {
            return NextResponse.json(
                { success: false, error: "Invalid payload: missing required field `letterId`." },
                { status: 400 },
            )
        }

        const updates = {
            ...(content !== undefined ? { content } : {}),
            ...(intended_recipient !== undefined ? { intended_recipient } : {}),
            ...(author_name !== undefined ? { author_name } : {}),
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json(
                { success: false, error: "Invalid payload: at least one updatable field is required." },
                { status: 400 },
            )
        }

        const { data, error } = await supabase
            .from("letter")
            .update(updates)
            .eq("id", letterId)
            .select()

        if (error) throw error

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
        const supabase = await createClient()
        const { searchParams } = new URL(request.url)
        const letterId = searchParams.get("letterId")

        if (!letterId) {
            return NextResponse.json(
                { success: false, error: "Invalid payload: missing required field `letterId`." },
                { status: 400 },
            )
        }

        const { data, error } = await supabase
            .from("letter")
            .delete()
            .eq("id", letterId)
            .select()

        if (error) throw error

        return NextResponse.json({ success: true, data })
    } catch (error) {
        const message = getErrorMessage(error)
        console.error("Supabase error:", message)
        return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(error) })
    }
}
