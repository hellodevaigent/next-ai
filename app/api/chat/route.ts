import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
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

    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", authData.user.id)
      .order("updated_at", { ascending: false })

    if (!data || error) {
      console.error("Failed to fetch conversation:", error)
      return NextResponse.json(
        { error: "Failed to fetch conversation" },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching conversation:", error)
    return NextResponse.json(
      { error: "Failed to fetch conversation" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
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

    const { title, model, systemPrompt } = await request.json()

    const { data, error } = await supabase
      .from("chats")
      .insert({ 
        user_id: authData.user.id, 
        title, 
        model, 
        system_prompt: systemPrompt 
      })
      .select("id")
      .single()

    if (error || !data?.id) {
      console.error("Failed to create chat:", error)
      return NextResponse.json(
        { error: "Failed to create chat" },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: data.id })
  } catch (error) {
    console.error("Error creating chat:", error)
    return NextResponse.json(
      { error: "Failed to create chat" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: Request) {
  try {
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

    const { id, title } = await request.json()

    const { error } = await supabase
      .from("chats")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) {
      console.error("Failed to update chat:", error)
      return NextResponse.json(
        { error: "Failed to update chat" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating chat:", error)
    return NextResponse.json(
      { error: "Failed to update chat" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
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

    const { id } = await request.json()

    const { error } = await supabase
      .from("chats")
      .delete()
      .eq("id", id)
      .eq("user_id", authData.user.id) // Security: ensure user owns the chat

    if (error) {
      console.error("Failed to delete chat:", error)
      return NextResponse.json(
        { error: "Failed to delete chat" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting chat:", error)
    return NextResponse.json(
      { error: "Failed to delete chat" },
      { status: 500 }
    )
  }
}
