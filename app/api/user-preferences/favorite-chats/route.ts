import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("favorite_chats")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching favorite chats:", error);
      return NextResponse.json(
        { error: "Failed to fetch favorite chats" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      favorite_chats: data?.favorite_chats || [],
    });
  } catch (error) {
    console.error("Error in favorite-chats GET API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { favorite_chats } = await request.json();

    if (!Array.isArray(favorite_chats)) {
      return NextResponse.json(
        { error: "favorite_chats must be an array" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          favorite_chats: favorite_chats,
        },
        { onConflict: "user_id" }
      )
      .select("favorite_chats")
      .single();

    if (error) {
      console.error("Error updating favorite chats:", error);
      return NextResponse.json(
        { error: "Failed to update favorite chats" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      favorite_chats: data.favorite_chats,
    });
  } catch (error) {
    console.error("Error in favorite-chats POST API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}