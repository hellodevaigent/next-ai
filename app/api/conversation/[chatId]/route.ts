import { createClient } from "@/lib/supabase/server"
import type { Message as MessageAISDK } from "ai"
import { NextRequest, NextResponse } from "next/server"

// Helper function to safely convert to ISO string
function toISOString(date: any): string {
  if (!date) return new Date().toISOString()
  
  // If it's already a string, return it
  if (typeof date === 'string') return date
  
  // If it's a Date object, convert to ISO string
  if (date instanceof Date) return date.toISOString()
  
  // If it's a number (timestamp), convert to Date first
  if (typeof date === 'number') return new Date(date).toISOString()
  
  // Fallback to current date
  return new Date().toISOString()
}

// GET /api/messages/[chatId] - Get messages for specific chat
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  try {
    const { chatId } = await params
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

    if (!chatId) {
      return NextResponse.json({ error: "Missing chatId" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("messages")
      .select(
        "id, content, role, experimental_attachments, created_at, parts, message_group_id, model"
      )
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true })

    if (!data || error) {
      console.error("Failed to fetch messages:", error)
      return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
    }

    const messages = (data || []).map((message: any) => ({
      ...message,
      id: String(message.id),
      content: message.content ?? "",
      createdAt: new Date(message.created_at || ""),
      parts: (message?.parts as MessageAISDK["parts"]) || undefined,
      message_group_id: message.message_group_id,
      model: message.model,
    }))

    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    )
  }
}

// POST /api/messages/[chatId] - Add single message or multiple messages
export async function POST(
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

    const body = await request.json()
    const { message, messages } = body

    // Handle single message insert
    if (message) {
      const { error } = await supabase.from("messages").insert({
        chat_id: chatId,
        role: message.role,
        content: message.content,
        experimental_attachments: message.experimental_attachments,
        created_at: toISOString(message.createdAt),
        message_group_id: message.message_group_id || null,
        model: message.model || null,
        user_id: authData.user.id,
      })

      if (error) {
        console.error("Failed to insert message:", error)
        return NextResponse.json(
          { error: "Failed to insert message" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    // Handle multiple messages insert
    if (messages && Array.isArray(messages)) {
      const payload = messages.map((msg: MessageAISDK) => ({
        chat_id: chatId,
        role: msg.role,
        content: msg.content,
        experimental_attachments: msg.experimental_attachments,
        created_at: toISOString(msg.createdAt),
        message_group_id: (msg as any).message_group_id || null,
        model: (msg as any).model || null,
        user_id: authData.user.id,
      }))

      const { error } = await supabase.from("messages").insert(payload)

      if (error) {
        console.error("Failed to insert messages:", error)
        return NextResponse.json(
          { error: "Failed to insert messages" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  } catch (error) {
    console.error("Error in POST messages:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}

// DELETE /api/messages/[chatId] - Delete all messages for chat or from specific message
// export async function DELETE(
//   request: NextRequest,
//   { params }: { params: Promise<{ chatId: string }> }
// ) {
//   try {
//     const { chatId } = await params
//     const supabase = await createClient()

//     if (!supabase) {
//       return NextResponse.json(
//         { error: "Supabase not available in this deployment." },
//         { status: 200 }
//       )
//     }

//     const { data: authData } = await supabase.auth.getUser()

//     if (!authData?.user?.id) {
//       return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
//     }

//     if (!chatId) {
//       return NextResponse.json({ error: "Missing chatId" }, { status: 400 })
//     }

//     const url = new URL(request.url)
//     const messageId = url.searchParams.get("messageId")

//     // Delete from specific message onwards
//     if (messageId) {
//       // First, verify the chat belongs to the user
//       const { data: chatData, error: chatError } = await supabase
//         .from("chats")
//         .select("user_id")
//         .eq("id", chatId)
//         .single()

//       if (chatError || !chatData || chatData.user_id !== authData.user.id) {
//         console.error("Chat verification failed:", chatError)
//         return NextResponse.json(
//           { error: "Forbidden: Chat not found or not owned by user" },
//           { status: 403 }
//         )
//       }

//       // Get the anchor message to find the timestamp
//       const { data: anchorMessage, error: findError } = await supabase
//         .from("messages")
//         .select("created_at")
//         .eq("id", messageId)
//         .eq("chat_id", chatId)
//         .single()

//       if (findError || !anchorMessage) {
//         console.error("Anchor message not found:", findError)
//         return NextResponse.json(
//           { error: "Anchor message not found" },
//           { status: 404 }
//         )
//       }

//       // Delete all messages from the anchor timestamp onwards
//       // Use the authenticated user's ID to ensure we only delete their messages
//       const { error: deleteError } = await supabase
//         .from("messages")
//         .delete()
//         .eq("chat_id", chatId)
//         .gte("created_at", anchorMessage.created_at)

//       if (deleteError) {
//         console.error("Failed to delete messages from anchor:", deleteError)
//         return NextResponse.json(
//           { error: "Failed to delete messages from anchor" },
//           { status: 500 }
//         )
//       }

//       return NextResponse.json({ success: true })
//     }

//     // Delete all messages for chat
//     // First verify the chat belongs to the user
//     const { data: chatData, error: chatError } = await supabase
//       .from("chats")
//       .select("user_id")
//       .eq("id", chatId)
//       .single()

//     if (chatError || !chatData || chatData.user_id !== authData.user.id) {
//       console.error("Chat verification failed:", chatError)
//       return NextResponse.json(
//         { error: "Forbidden: Chat not found or not owned by user" },
//         { status: 403 }
//       )
//     }

//     const { error } = await supabase
//       .from("messages")
//       .delete()
//       .eq("chat_id", chatId)
//       .eq("user_id", authData.user.id)

//     if (error) {
//       console.error("Failed to clear messages from database:", error)
//       return NextResponse.json(
//         { error: "Failed to clear messages from database" },
//         { status: 500 }
//       )
//     }

//     return NextResponse.json({ success: true })
//   } catch (error) {
//     console.error("Error in DELETE messages:", error)
//     return NextResponse.json(
//       { error: "Failed to process request" },
//       { status: 500 }
//     )
//   }
// }
export async function DELETE(
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

    const url = new URL(request.url)
    const timestamp = url.searchParams.get("timestamp")

    // Delete from specific timestamp onwards
    if (timestamp) {
      // First, verify the chat belongs to the user
      const { data: chatData, error: chatError } = await supabase
        .from("chats")
        .select("user_id")
        .eq("id", chatId)
        .single()

      if (chatError || !chatData || chatData.user_id !== authData.user.id) {
        console.error("Chat verification failed:", chatError)
        return NextResponse.json(
          { error: "Forbidden: Chat not found or not owned by user" },
          { status: 403 }
        )
      }

      // Validate timestamp format (optional)
      const parsedTimestamp = new Date(timestamp)
      if (isNaN(parsedTimestamp.getTime())) {
        return NextResponse.json(
          { error: "Invalid timestamp format" },
          { status: 400 }
        )
      }

      // Delete all messages from the specified timestamp onwards
      const { error: deleteError } = await supabase
        .from("messages")
        .delete()
        .eq("chat_id", chatId)
        .gte("created_at", timestamp)

      if (deleteError) {
        console.error("Failed to delete messages from timestamp:", deleteError)
        return NextResponse.json(
          { error: "Failed to delete messages from timestamp" },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true })
    }

    // Delete all messages for chat (ketika tidak ada timestamp)
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("user_id")
      .eq("id", chatId)
      .single()

    if (chatError || !chatData || chatData.user_id !== authData.user.id) {
      console.error("Chat verification failed:", chatError)
      return NextResponse.json(
        { error: "Forbidden: Chat not found or not owned by user" },
        { status: 403 }
      )
    }

    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("chat_id", chatId)
      .eq("user_id", authData.user.id)

    if (error) {
      console.error("Failed to clear messages from database:", error)
      return NextResponse.json(
        { error: "Failed to clear messages from database" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in DELETE messages:", error)
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    )
  }
}