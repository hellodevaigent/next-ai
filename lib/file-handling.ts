import { toast } from "@/components/ui/toast"
import { DAILY_FILE_UPLOAD_LIMIT } from "./config"
import { UPLOAD_CONFIGS } from "./r2/configs"
import { r2UploadService } from "./r2/upload-service"
import { API_ROUTE_ATTACHMENTS } from "./routes"

export type Attachment = {
  name: string
  contentType: string
  url: string
}

export type UploadType = 'CHAT_ATTACHMENTS' | 'PROFILE_PICTURES' | 'DOCUMENTS' | 'MEDIA'

export async function uploadToR2(file: File, uploadType: UploadType = 'CHAT_ATTACHMENTS'): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", uploadType)

    const response = await fetch(`${API_ROUTE_ATTACHMENTS}/upload`, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result.url
  } catch (error: any) {
    console.error("Upload error:", error)
    throw new Error(`Error uploading file: ${error.message}`)
  }
}

/**
 * Delete files from R2 and database
 */
export async function deleteFilesFromR2(
  fileUrls: string[], 
  uploadType: UploadType = 'CHAT_ATTACHMENTS'
): Promise<{ success: number; failed: number }> {
  if (fileUrls.length === 0) return { success: 0, failed: 0 }

  try {
    const config = UPLOAD_CONFIGS[uploadType]
    if (!config) {
      console.error('Invalid upload type:', uploadType)
      return { success: 0, failed: fileUrls.length }
    }

    // Delete from R2
    const result = await r2UploadService.deleteFiles(fileUrls, config)
    
    return result
  } catch (error) {
    console.error("Error deleting files from R2:", error)
    return { success: 0, failed: fileUrls.length }
  }
}

/**
 * Delete attachments by chat ID
 */
export async function deleteChatAttachments(chatId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/attachments/chat/${chatId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error deleting chat attachments:', errorData.error)
      return false
    }

    const result = await response.json()    
    return result.success
  } catch (error) {
    console.error('Error deleting chat attachments:', error)
    return false
  }
}

/**
 * Delete attachments by user ID (for user deletion)
 */
export async function deleteUserAttachments(userId: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/attachments/user/${userId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error deleting user attachments:', errorData.error)
      return false
    }

    const result = await response.json()
    
    return result.success
  } catch (error) {
    console.error('Error deleting user attachments:', error)
    return false
  }
}

/**
 * Delete a single attachment
 */
export async function deleteAttachment(
  attachmentId: string, 
  fileUrl: string, 
  uploadType: UploadType = 'CHAT_ATTACHMENTS'
): Promise<boolean> {
  try {
    const response = await fetch(`/api/attachments/${attachmentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileUrl,
        uploadType,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error deleting attachment:', errorData.error)
      return false
    }

    const result = await response.json()
    return result.success
  } catch (error) {
    console.error('Error deleting attachment:', error)
    return false
  }
}

export function createAttachment(file: File, url: string): Attachment {
  return {
    name: file.name,
    contentType: file.type,
    url,
  }
}

export async function processFiles(
  files: File[],
  chatId: string,
  userId: string,
  uploadType: UploadType = 'CHAT_ATTACHMENTS'
): Promise<Attachment[]> {
  const attachments: Attachment[] = []

  for (const file of files) {
    try {
      // Upload to R2
      const url = await uploadToR2(file, uploadType)

      // Save metadata to database via API
      const response = await fetch("/api/attachments/metadata", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: chatId,
          user_id: userId,
          file_url: url,
          file_name: file.name,
          file_type: file.type,
          file_size: file.size,
        }),
      })

      if (!response.ok) {
        // If database insertion fails, try to delete the uploaded file
        await deleteFilesFromR2([url], uploadType)
        const errorData = await response.json()
        throw new Error(`Database insertion failed: ${errorData.error}`)
      }

      attachments.push(createAttachment(file, url))
    } catch (error) {
      console.error(`Error processing file ${file.name}:`, error)
      toast({
        title: "Upload failed",
        description: `Failed to upload ${file.name}`,
        status: "error",
      })
    }
  }

  return attachments
}

export class FileUploadLimitError extends Error {
  code: string
  constructor(message: string) {
    super(message)
    this.code = "DAILY_FILE_LIMIT_REACHED"
  }
}

export async function checkFileUploadLimit(userId: string) {
  try {
    const response = await fetch(`/api/attachments/check-limit/${userId}`, {
      method: "GET",
    })

    if (!response.ok) {
      const errorData = await response.json()
      if (errorData.error === "File upload is not supported in this deployment") {
        toast({
          title: "File upload is not supported in this deployment",
          status: "info",
        })
        return 0
      }
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    
    if (result.limitReached) {
      throw new FileUploadLimitError("Daily file upload limit reached.")
    }

    return result.count
  } catch (error) {
    if (error instanceof FileUploadLimitError) {
      throw error
    }
    console.error('Error checking file upload limit:', error)
    throw new Error('Failed to check file upload limit')
  }
}