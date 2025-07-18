import { toast } from "@/components/ui/toast"
import { UploadType } from "@/lib/file-handling"
import { useCallback, useState } from "react"
import { API_ROUTE_ATTACHMENTS } from "../routes"

export const useFileDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteChatAttachments = useCallback(
    async (chatId: string): Promise<boolean> => {
      if (!chatId) {
        toast({
          title: "Error",
          description: "Chat ID is required",
          status: "error",
        })
        return false
      }

      setIsDeleting(true)

      try {
        const response = await fetch(`${API_ROUTE_ATTACHMENTS}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete_chat_attachments",
            chatId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          )
        }

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Success",
            description: "Chat attachments deleted successfully",
            status: "success",
          })
          return true
        } else {
          throw new Error(result.error || "Delete operation failed")
        }
      } catch (error: any) {
        console.error("Delete chat attachments error:", error)
        toast({
          title: "Delete failed",
          description: error.message || "Failed to delete chat attachments",
          status: "error",
        })
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    []
  )

  const deleteUserAttachments = useCallback(
    async (userId: string): Promise<boolean> => {
      if (!userId) {
        toast({
          title: "Error",
          description: "User ID is required",
          status: "error",
        })
        return false
      }

      setIsDeleting(true)

      try {
        const response = await fetch(`${API_ROUTE_ATTACHMENTS}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete_user_attachments",
            userId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          )
        }

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Success",
            description: "User attachments deleted successfully",
            status: "success",
          })
          return true
        } else {
          throw new Error(result.error || "Delete operation failed")
        }
      } catch (error: any) {
        console.error("Delete user attachments error:", error)
        toast({
          title: "Delete failed",
          description: error.message || "Failed to delete user attachments",
          status: "error",
        })
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    []
  )

  const deleteSingleAttachment = useCallback(
    async (
      attachmentId: string,
      fileUrl: string,
      uploadType: UploadType = "CHAT_ATTACHMENTS"
    ): Promise<boolean> => {
      if (!attachmentId || !fileUrl) {
        toast({
          title: "Error",
          description: "Attachment ID and file URL are required",
          status: "error",
        })
        return false
      }

      setIsDeleting(true)

      try {
        const response = await fetch(`${API_ROUTE_ATTACHMENTS}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete_single_attachment",
            attachmentId,
            fileUrl,
            uploadType,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          )
        }

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Success",
            description: "Attachment deleted successfully",
            status: "success",
          })
          return true
        } else {
          throw new Error(result.error || "Delete operation failed")
        }
      } catch (error: any) {
        console.error("Delete single attachment error:", error)
        toast({
          title: "Delete failed",
          description: error.message || "Failed to delete attachment",
          status: "error",
        })
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    []
  )

  const deleteFilesByUrls = useCallback(
    async (
      fileUrls: string[],
      uploadType: UploadType = "CHAT_ATTACHMENTS"
    ): Promise<{ success: number; failed: number } | null> => {
      if (!fileUrls || fileUrls.length === 0) {
        toast({
          title: "Error",
          description: "No file URLs provided",
          status: "error",
        })
        return null
      }

      setIsDeleting(true)

      try {
        const response = await fetch(`${API_ROUTE_ATTACHMENTS}/delete`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete_files_by_urls",
            fileUrls,
            uploadType,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`
          )
        }

        const result = await response.json()

        if (result.success) {
          toast({
            title: "Success",
            description: result.message,
            status: "success",
          })
          return result.result
        } else {
          throw new Error(result.error || "Delete operation failed")
        }
      } catch (error: any) {
        console.error("Delete files by URLs error:", error)
        toast({
          title: "Delete failed",
          description: error.message || "Failed to delete files",
          status: "error",
        })
        return null
      } finally {
        setIsDeleting(false)
      }
    },
    []
  )

  return {
    isDeleting,
    deleteChatAttachments,
    deleteUserAttachments,
    deleteSingleAttachment,
    deleteFilesByUrls,
  }
}
