import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { r2UploadService } from "@/lib/r2/upload-service"
import { UPLOAD_CONFIGS } from "@/lib/r2/configs"

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    // Get all attachments for this user
    const { data: attachments, error: fetchError } = await supabase
      .from("chat_attachments")
      .select("file_url, file_name")
      .eq("user_id", authData.user.id)

    if (fetchError) {
      console.error('Error fetching user attachments:', fetchError)
      return NextResponse.json({ error: "Failed to fetch user attachments" }, { status: 500 })
    }

    if (!attachments || attachments.length === 0) {
      return NextResponse.json({ success: true, deletedFiles: { success: 0, failed: 0 }, deletedRecords: 0 })
    }

    // Group by upload type if needed (assuming all are CHAT_ATTACHMENTS for now)
    const fileUrls = attachments.map(att => att.file_url)
    
    // Delete files from R2
    const deleteResult = await r2UploadService.deleteFiles(fileUrls, UPLOAD_CONFIGS['CHAT_ATTACHMENTS'])
    
    // Delete records from database
    const { error: deleteError } = await supabase
      .from("chat_attachments")
      .delete()
      .eq("user_id", authData.user.id)

    if (deleteError) {
      console.error('Error deleting user attachment records:', deleteError)
      return NextResponse.json({ error: "Failed to delete user attachment records" }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      deletedFiles: deleteResult,
      deletedRecords: attachments.length
    })
  } catch (error) {
    console.error('Error deleting user attachments:', error)
    return NextResponse.json({ error: "Failed to delete user attachments" }, { status: 500 })
  }
}