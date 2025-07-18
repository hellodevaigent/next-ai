import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not available in this deployment." },
        { status: 200 }
      )
    }

    const { data: authData } = await supabase.auth.getUser()

    if (!authData?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!chatId) {
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("chats")
      .update({ public: true })
      .eq("id", chatId)
      .eq("user_id", authData.user.id)
      .select()
      .single()

    if (error) {
      console.error("Failed to publish chat:", error)
      return NextResponse.json(
        { error: "Failed to publish chat" },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: "Chat not found or unauthorized" },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error in PATCH publish chat:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}