import {
  deleteAttachment,
  deleteChatAttachments,
  deleteFilesFromR2,
  deleteUserAttachments,
} from "@/lib/file-handling"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  try {
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

        const chatResult = await deleteChatAttachments(chatId)
        if (!chatResult) {
          return NextResponse.json(
            { error: "Failed to delete chat attachments" },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: "Chat attachments deleted",
        })

      case "delete_user_attachments":
        if (!userId) {
          return NextResponse.json(
            { error: "User ID is required" },
            { status: 400 }
          )
        }

        const userResult = await deleteUserAttachments(userId)
        if (!userResult) {
          return NextResponse.json(
            { error: "Failed to delete user attachments" },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: "User attachments deleted",
        })

      case "delete_single_attachment":
        if (!attachmentId || !fileUrl) {
          return NextResponse.json(
            { error: "Attachment ID and file URL are required" },
            { status: 400 }
          )
        }

        const singleResult = await deleteAttachment(
          attachmentId,
          fileUrl,
          uploadType
        )
        if (!singleResult) {
          return NextResponse.json(
            { error: "Failed to delete attachment" },
            { status: 500 }
          )
        }

        return NextResponse.json({
          success: true,
          message: "Attachment deleted",
        })

      case "delete_files_by_urls":
        if (!body.fileUrls || !Array.isArray(body.fileUrls)) {
          return NextResponse.json(
            { error: "File URLs array is required" },
            { status: 400 }
          )
        }

        const filesResult = await deleteFilesFromR2(
          body.fileUrls,
          uploadType || "CHAT_ATTACHMENTS"
        )

        return NextResponse.json({
          success: true,
          message: `${filesResult.success} files deleted, ${filesResult.failed} failed`,
          result: filesResult,
        })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json(
      { error: "Delete operation failed" },
      { status: 500 }
    )
  }
}
