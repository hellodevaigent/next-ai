import { APP_DOMAIN, APP_NAME } from "@/lib/config"
import { isSupabaseEnabled } from "@/lib/supabase/config"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    if (!isSupabaseEnabled) {
      return NextResponse.json(
        { error: "Supabase is not enabled" },
        { status: 404 }
      )
    }

    const { chatId } = await params
    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json(
        { error: "Failed to create Supabase client" },
        { status: 500 }
      )
    }

    // Fetch chat data
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("id, title, created_at")
      .eq("id", chatId)
      .single()

    if (chatError || !chatData) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 })
    }

    // Fetch messages data
    const { data: messagesData, error: messagesError } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    if (messagesError || !messagesData) {
      return NextResponse.json({ error: "Messages not found" }, { status: 404 })
    }

    // Return the chat data and messages
    return NextResponse.json({
      chat: {
        id: chatData.id,
        title: chatData.title || "Chat",
        created_at: chatData.created_at || "",
        subtitle: `A conversation in ${APP_NAME}`,
      },
      messages: messagesData,
      metadata: {
        title: chatData.title || "Chat",
        description: `A chat in ${APP_NAME}`,
        url: `${APP_DOMAIN}/share/${chatId}`,
        openGraph: {
          title: chatData.title || "Chat",
          description: `A chat in ${APP_NAME}`,
          type: "article",
          url: `${APP_DOMAIN}/share/${chatId}`,
        },
        twitter: {
          card: "summary_large_image",
          title: chatData.title || "Chat",
          description: `A chat in ${APP_NAME}`,
        },
      },
    })
  } catch (error) {
    console.error("Error in share chat API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
