import { NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'



export async function GET(request: Request) {

    try {

        const supabase = await createClient()

        const { data: letters, error } = await supabase.from('letter').select()

        if (error) {
            console.error("Supabase error:", error)
        }

    } catch {

    }
}

// insert a new row into the letters table 

export async function POST(request: Request) {

    const supabase = await createClient()

    try {

        const body = await request.json()
        const { content, intended_recipient, author_name, created_at } = body

        // minimal test setup to make api call to supabase
        // console.log("📩 Letter received on server:", letter)

        const { data, error } = await supabase
            .from('letter')
            .insert([ { content, intended_recipient, author_name, created_at } ])
            .select()

        if (error) throw error

        return NextResponse.json({ success: true, data })

        // return new Response(JSON.stringify({ ok: true, received: letter }), {
        //     headers: { "Content-Type": "application/json" },
    } catch (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
