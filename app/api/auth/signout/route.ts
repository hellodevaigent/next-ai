import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return NextResponse.json(
        { error: "Sign out is not supported in this deployment" },
        { status: 200 }
      )
    }

    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error("Failed to sign out:", error)
      return NextResponse.json(
        { error: "Failed to sign out" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error signing out:", error)
    return NextResponse.json(
      { error: "Failed to sign out" },
      { status: 500 }
    )
  }
}