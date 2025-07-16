import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("favorite_projects")
      .select("project_id")
      .eq("user_id", user.id);

    if (error) {
      console.error("Error fetching favorite projects:", error);
      return NextResponse.json({ error: "Failed to fetch favorite projects" }, { status: 500 });
    }

    return NextResponse.json({
      favorite_projects: data.map(fav => fav.project_id) || [],
    });
  } catch (error) {
    console.error("Error in favorite-projects GET API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    if (!supabase) {
      return NextResponse.json({ error: "Database connection failed" }, { status: 500 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { favorite_projects } = await request.json();

    if (!Array.isArray(favorite_projects)) {
      return NextResponse.json({ error: "favorite_projects must be an array" }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from("favorite_projects")
      .delete()
      .eq("user_id", user.id);

    if (deleteError) {
      console.error("Error deleting old favorite projects:", deleteError);
      return NextResponse.json({ error: "Failed to update favorite projects" }, { status: 500 });
    }

    if (favorite_projects.length > 0) {
      const { error: insertError } = await supabase
        .from("favorite_projects")
        .insert(favorite_projects.map(project_id => ({ user_id: user.id, project_id })));

      if (insertError) {
        console.error("Error inserting new favorite projects:", insertError);
        return NextResponse.json({ error: "Failed to update favorite projects" }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      favorite_projects,
    });
  } catch (error) {
    console.error("Error in favorite-projects POST API:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}