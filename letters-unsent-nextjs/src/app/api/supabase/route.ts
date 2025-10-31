import { NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'

export async function GET() {

    const supabase = await createClient()

    try {

        const { data: letters, error } = await supabase.from('letter').select()

        console.log(letters);

        if (error) {
            console.error("Supabase error:", error)
        }

        return NextResponse.json({ success: true, letters })

    } catch (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}

// insert a new row into the letters table 

export async function POST(request: Request) {

    const supabase = await createClient()

    try {

        const body = await request.json()
        const { content, intended_recipient, author_name, created_at } = body

        const { data, error } = await supabase
            .from('letter')
            .insert([ { content, intended_recipient, author_name, created_at } ])
            .select()

        if (error) throw error

        return NextResponse.json({ success: true, data })

    } catch (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}
