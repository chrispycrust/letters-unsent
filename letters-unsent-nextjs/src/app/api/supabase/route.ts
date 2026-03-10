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
    if (error instanceof SyntaxError) {
        return 400
    }

    const message = getErrorMessage(error).toLowerCase()
    if (
        message.includes("permission denied") ||
        message.includes("not authenticated") ||
        message.includes("jwt")
    ) {
        return 403
    }
    if (message.includes("invalid payload") || message.includes("unexpected token")) {
        return 400
    }
    return 500
}

// retrieves all letters from landing page
export async function GET() {
    try {
        const supabase = await createClient()

        const { data: letters, error } = await supabase
            .from('letter').select()
            .order('created_at', { ascending: false })

        if (error) {
            throw error
        }

        return NextResponse.json({ success: true, letters: letters ?? []})

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
        const { content, intended_recipient, author_name, created_at } = body

        if (!content || !intended_recipient) {
            return NextResponse.json(
                { success: false, error: "Invalid payload: `content` and `intended_recipient` are required." },
                { status: 400 },
            )
        }

        const { data, error } = await supabase
            .from('letter')
            .insert([ { content, intended_recipient, author_name, created_at } ])
            .select()

        if (error) throw error

        return NextResponse.json({ success: true, data })

    } catch (error) {
        const message = getErrorMessage(error)
        console.error("Supabase error:", message)
        return NextResponse.json({ success: false, error: message }, { status: getErrorStatus(error) })
    }
}
