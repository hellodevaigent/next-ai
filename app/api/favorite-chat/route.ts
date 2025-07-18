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
      .from("favorite_chats")
      .select("chat_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching favorite chats:", error);
      return NextResponse.json(
        { error: "Failed to fetch favorite chats" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      favorite_chats: data.map(fav => fav.chat_id) || [],
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

    const { error: deleteError } = await supabase
      .from("favorite_chats")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting old favorite chats:", deleteError);
      return NextResponse.json(
        { error: "Failed to update favorite chats" },
        { status: 500 }
      );
    }

    if (favorite_chats.length > 0) {
      const { error: insertError } = await supabase
        .from("favorite_chats")
        .insert(favorite_chats.map(chat_id => ({ user_id: user.id, chat_id })));

      if (insertError) {
        console.error("Error inserting new favorite chats:", insertError);
        return NextResponse.json(
          { error: "Failed to update favorite chats" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      favorite_chats,
    });
  } catch (error) {
    console.error("Error in favorite-chats POST API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}