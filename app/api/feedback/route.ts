import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Feedback is not supported in this deployment" },
        { status: 200 }
      )
    }

    const { data: authData } = await supabase.auth.getUser()

    if (!authData?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { message } = body

    if (!message || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      )
    }

    const { error } = await supabase.from("feedback").insert({
      message: message.trim(),
      user_id: authData.user.id,
    })

    if (error) {
      console.error("Failed to submit feedback:", error)
      return NextResponse.json(
        { error: "Failed to submit feedback" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in POST feedback:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}
