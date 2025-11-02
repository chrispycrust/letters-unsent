import { NextResponse } from "next/server"
import { createClient } from '@/utils/supabase/server'

// retrieves a letter based on ID
export async function GET(request: Request) {

    const supabase = await createClient()

    try {

        console.log("contacting supabase/singleLetter route ... ")

        const { searchParams } = new URL(request.url)
        const letterId = searchParams.get("letterId")

        console.log("letterId retrieved:", letterId)

        const { data: letter, error } = await supabase
            .from("letter")
            .select()
            .eq("id", letterId)

        console.log(letter);

        if (error) {
            console.error("Supabase error:", error)
        }

        return NextResponse.json({ success: true, letter })

    } catch (error) {
        console.error("Supabase error:", error)
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
    }
}