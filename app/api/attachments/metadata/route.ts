import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return new Response(
        JSON.stringify({ error: "Supabase not available in this deployment." }),
        { status: 200 }
      )
    }

    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { chat_id, user_id, file_url, file_name, file_type, file_size } = body

    if (!chat_id || !user_id || !file_url || !file_name || !file_type || file_size === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Ensure user can only insert their own data
    if (user_id !== authData.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("chat_attachments").insert({
      chat_id,
      user_id,
      file_url,
      file_name,
      file_type,
      file_size,
    })

    if (error) {
      console.error("Failed to save attachment metadata:", error)
      return NextResponse.json({ error: "Failed to save attachment metadata" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving attachment metadata:', error)
    return NextResponse.json({ error: "Failed to save attachment metadata" }, { status: 500 })
  }
}