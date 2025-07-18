import { DAILY_FILE_UPLOAD_LIMIT } from "@/lib/config"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
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

    const now = new Date()
    const startOfToday = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    )

    const { count, error } = await supabase
      .from("chat_attachments")
      .select("*", { count: "exact", head: true })
      .eq("user_id", authData.user.id)
      .gte("created_at", startOfToday.toISOString())

    if (error) {
      console.error("Failed to check upload limit:", error)
      return NextResponse.json(
        { error: "Failed to check limit" },
        { status: 500 }
      )
    }

    const limitReached = count && count >= DAILY_FILE_UPLOAD_LIMIT

    return NextResponse.json({
      count: count || 0,
      limit: DAILY_FILE_UPLOAD_LIMIT,
      limitReached,
    })
  } catch (error) {
    console.error("Error checking file upload limit:", error)
    return NextResponse.json(
      { error: "Failed to check limit" },
      { status: 500 }
    )
  }
}
