import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not available in this deployment." },
        { status: 200 }
      )
    }

    const { data: authData, error: authError } = await supabase.auth.getUser()

    if (authError || !authData.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authData.user.id)
      .single()

    if (userError) {
      console.error("Failed to fetch user from 'users' table:", userError)
    }

    // Don't return anonymous users
    if (userData?.anonymous) {
      return NextResponse.json({ profile: null })
    }

    const profile = {
      ...(userData || {}),
      id: authData.user.id,
      email: authData.user.email || "",
      profile_image: authData.user.user_metadata?.avatar_url || null,
      display_name: authData.user.user_metadata?.name || "",
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
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

    const updates = await request.json()

    const { error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", authData.user.id)

    if (error) {
      console.error("Failed to update user:", error)
      return NextResponse.json(
        { error: "Failed to update user profile" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating user profile:", error)
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    )
  }
}