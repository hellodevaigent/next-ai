import { UploadType } from "@/lib/file-handling"
import { UPLOAD_CONFIGS } from "@/lib/r2/configs"
import { r2UploadService } from "@/lib/r2/upload-service"
import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    if (!supabase) {
      return NextResponse.json({ error: "Supabase not available" }, { status: 200 })
    }

    const body = await request.json()
    const { action, chatId, userId, attachmentId, fileUrl, uploadType } = body

    switch (action) {
      case "delete_chat_attachments":
        if (!chatId) {
          return NextResponse.json(
            { error: "Chat ID is required" },
            { status: 400 }
          )
        }

        try {
          // Get all attachments for this chat
          const { data: attachments, error: fetchError } = await supabase
            .from("chat_attachments")
            .select("file_url, file_name")
            .eq("chat_id", chatId)

          if (fetchError) {
            return NextResponse.json(
              { error: "Failed to fetch attachments" },
              { status: 500 }
            )
          }

          if (!attachments || attachments.length === 0) {
            return NextResponse.json({
              success: true,
              message: "No attachments found for chat",
            })
          }

          // Extract file URLs and delete from R2
          const fileUrls = attachments.map(att => att.file_url)
          const config = UPLOAD_CONFIGS.CHAT_ATTACHMENTS
          
          await r2UploadService.deleteFiles(fileUrls, config)

          // Delete records from database
          const { error: deleteError } = await supabase
            .from("chat_attachments")
            .delete()
            .eq("chat_id", chatId)

          if (deleteError) {
            return NextResponse.json(
              { error: "Failed to delete attachment records" },
              { status: 500 }
            )
          }

          return NextResponse.json({
            success: true,
            message: `Deleted ${attachments.length} chat attachments`,
          })
        } catch (error) {
          return NextResponse.json(
            { error: "Failed to delete chat attachments" },
            { status: 500 }
          )
        }

      case "delete_user_attachments":
        if (!userId) {
          return NextResponse.json(
            { error: "User ID is required" },
            { status: 400 }
          )
        }

        try {
          // Get all attachments for this user
          const { data: attachments, error: fetchError } = await supabase
            .from("chat_attachments")
            .select("file_url, file_name")
            .eq("user_id", userId)

          if (fetchError) {
            return NextResponse.json(
              { error: "Failed to fetch user attachments" },
              { status: 500 }
            )
          }

          if (!attachments || attachments.length === 0) {
            return NextResponse.json({
              success: true,
              message: "No attachments found for user",
            })
          }

          // Extract file URLs and delete from R2
          const fileUrls = attachments.map(att => att.file_url)
          const config = UPLOAD_CONFIGS.CHAT_ATTACHMENTS
          
          await r2UploadService.deleteFiles(fileUrls, config)

          // Delete records from database
          const { error: deleteError } = await supabase
            .from("chat_attachments")
            .delete()
            .eq("user_id", userId)

          if (deleteError) {
            return NextResponse.json(
              { error: "Failed to delete user attachment records" },
              { status: 500 }
            )
          }

          return NextResponse.json({
            success: true,
            message: `Deleted ${attachments.length} user attachments`,
          })
        } catch (error) {
          return NextResponse.json(
            { error: "Failed to delete user attachments" },
            { status: 500 }
          )
        }

      case "delete_single_attachment":
        if (!attachmentId || !fileUrl) {
          return NextResponse.json(
            { error: "Attachment ID and file URL are required" },
            { status: 400 }
          )
        }

        try {
          // Delete from R2
          const type = (uploadType as UploadType) || 'CHAT_ATTACHMENTS'
          const config = UPLOAD_CONFIGS[type]
          
          if (!config) {
            return NextResponse.json(
              { error: "Invalid upload type" },
              { status: 400 }
            )
          }

          const deleted = await r2UploadService.deleteFile(fileUrl, config)
          
          if (deleted) {
            // Delete from database
            const { error: deleteError } = await supabase
              .from("chat_attachments")
              .delete()
              .eq("id", attachmentId)

            if (deleteError) {
              return NextResponse.json(
                { error: "Failed to delete attachment record" },
                { status: 500 }
              )
            }

            return NextResponse.json({
              success: true,
              message: "Attachment deleted successfully",
            })
          }

          return NextResponse.json(
            { error: "Failed to delete file from R2" },
            { status: 500 }
          )
        } catch (error) {
          return NextResponse.json(
            { error: "Failed to delete attachment" },
            { status: 500 }
          )
        }

      case "delete_files_by_urls":
        if (!body.fileUrls || !Array.isArray(body.fileUrls)) {
          return NextResponse.json(
            { error: "File URLs array is required" },
            { status: 400 }
          )
        }

        if (body.fileUrls.length === 0) {
          return NextResponse.json({
            success: true,
            message: "No files to delete",
            result: { success: 0, failed: 0 },
          })
        }

        try {
          const type = (uploadType as UploadType) || 'CHAT_ATTACHMENTS'
          const config = UPLOAD_CONFIGS[type]
          
          if (!config) {
            return NextResponse.json(
              { error: "Invalid upload type" },
              { status: 400 }
            )
          }

          // Delete from R2
          const result = await r2UploadService.deleteFiles(body.fileUrls, config)
          
          return NextResponse.json({
            success: true,
            message: `${result.success} files deleted, ${result.failed} failed`,
            result: result,
          })
        } catch (error) {
          return NextResponse.json(
            { error: "Failed to delete files" },
            { status: 500 }
          )
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Delete operation failed" },
      { status: 500 }
    )
  }
}