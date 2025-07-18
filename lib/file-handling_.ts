// import { toast } from "@/components/ui/toast"
// import { DAILY_FILE_UPLOAD_LIMIT } from "./config"
// import { createClient } from "./supabase/client"
// import { isSupabaseEnabled } from "./supabase/config"
// import { r2UploadService } from "@/lib/r2/upload-service"
// import { UPLOAD_CONFIGS } from "@/lib/r2/configs"

// export type Attachment = {
//   name: string
//   contentType: string
//   url: string
// }

// export type UploadType = 'CHAT_ATTACHMENTS' | 'PROFILE_PICTURES' | 'DOCUMENTS' | 'MEDIA'

// export async function uploadToR2(file: File, uploadType: UploadType = 'CHAT_ATTACHMENTS'): Promise<string> {
//   try {
//     const formData = new FormData()
//     formData.append("file", file)
//     formData.append("type", uploadType)

//     const response = await fetch("/api/upload", {
//       method: "POST",
//       body: formData,
//     })

//     if (!response.ok) {
//       const errorData = await response.json()
//       throw new Error(errorData.error || `HTTP error! status: ${response.status}`)
//     }

//     const result = await response.json()
//     return result.url
//   } catch (error: any) {
//     console.error("Upload error:", error)
//     throw new Error(`Error uploading file: ${error.message}`)
//   }
// }

// /**
//  * Delete files from R2 and database
//  */
// export async function deleteFilesFromR2(
//   fileUrls: string[], 
//   uploadType: UploadType = 'CHAT_ATTACHMENTS'
// ): Promise<{ success: number; failed: number }> {
//   if (fileUrls.length === 0) return { success: 0, failed: 0 }

//   try {
//     const config = UPLOAD_CONFIGS[uploadType]
//     if (!config) {
//       console.error('Invalid upload type:', uploadType)
//       return { success: 0, failed: fileUrls.length }
//     }

//     // Delete from R2
//     const result = await r2UploadService.deleteFiles(fileUrls, config)
    
//     return result
//   } catch (error) {
//     console.error("Error deleting files from R2:", error)
//     return { success: 0, failed: fileUrls.length }
//   }
// }

// /**
//  * Delete attachments by chat ID
//  */
// export async function deleteChatAttachments(chatId: string): Promise<boolean> {
//   if (!isSupabaseEnabled) {
//     console.log('Supabase not enabled, skipping attachment deletion')
//     return true
//   }

//   const supabase = createClient()
//   if (!supabase) {
//     console.error('Supabase client not available')
//     return false
//   }

//   try {
//     // Get all attachments for this chat
//     const { data: attachments, error: fetchError } = await supabase
//       .from("chat_attachments")
//       .select("file_url, file_name")
//       .eq("chat_id", chatId)

//     if (fetchError) {
//       console.error('Error fetching attachments:', fetchError)
//       return false
//     }

//     if (!attachments || attachments.length === 0) {
//       console.log('No attachments found for chat:', chatId)
//       return true
//     }

//     // Extract file URLs
//     const fileUrls = attachments.map(att => att.file_url)
    
//     // Delete files from R2
//     const deleteResult = await deleteFilesFromR2(fileUrls, 'CHAT_ATTACHMENTS')
    
//     // Delete records from database
//     const { error: deleteError } = await supabase
//       .from("chat_attachments")
//       .delete()
//       .eq("chat_id", chatId)

//     if (deleteError) {
//       console.error('Error deleting attachment records:', deleteError)
//       return false
//     }

//     console.log(`Deleted ${deleteResult.success} files from R2, ${deleteResult.failed} failed`)
//     console.log(`Deleted ${attachments.length} attachment records from database`)
    
//     return true
//   } catch (error) {
//     console.error('Error deleting chat attachments:', error)
//     return false
//   }
// }

// /**
//  * Delete attachments by user ID (for user deletion)
//  */
// export async function deleteUserAttachments(userId: string): Promise<boolean> {
//   if (!isSupabaseEnabled) {
//     console.log('Supabase not enabled, skipping attachment deletion')
//     return true
//   }

//   const supabase = createClient()
//   if (!supabase) {
//     console.error('Supabase client not available')
//     return false
//   }

//   try {
//     // Get all attachments for this user
//     const { data: attachments, error: fetchError } = await supabase
//       .from("chat_attachments")
//       .select("file_url, file_name")
//       .eq("user_id", userId)

//     if (fetchError) {
//       console.error('Error fetching user attachments:', fetchError)
//       return false
//     }

//     if (!attachments || attachments.length === 0) {
//       console.log('No attachments found for user:', userId)
//       return true
//     }

//     // Group by upload type if needed (assuming all are CHAT_ATTACHMENTS for now)
//     const fileUrls = attachments.map(att => att.file_url)
    
//     // Delete files from R2
//     const deleteResult = await deleteFilesFromR2(fileUrls, 'CHAT_ATTACHMENTS')
    
//     // Delete records from database
//     const { error: deleteError } = await supabase
//       .from("chat_attachments")
//       .delete()
//       .eq("user_id", userId)

//     if (deleteError) {
//       console.error('Error deleting user attachment records:', deleteError)
//       return false
//     }

//     console.log(`Deleted ${deleteResult.success} files from R2, ${deleteResult.failed} failed`)
//     console.log(`Deleted ${attachments.length} attachment records from database`)
    
//     return true
//   } catch (error) {
//     console.error('Error deleting user attachments:', error)
//     return false
//   }
// }

// /**
//  * Delete a single attachment
//  */
// export async function deleteAttachment(
//   attachmentId: string, 
//   fileUrl: string, 
//   uploadType: UploadType = 'CHAT_ATTACHMENTS'
// ): Promise<boolean> {
//   if (!isSupabaseEnabled) {
//     console.log('Supabase not enabled, skipping attachment deletion')
//     return true
//   }

//   const supabase = createClient()
//   if (!supabase) {
//     console.error('Supabase client not available')
//     return false
//   }

//   try {
//     // Delete from R2
//     const config = UPLOAD_CONFIGS[uploadType]
//     if (!config) {
//       console.error('Invalid upload type:', uploadType)
//       return false
//     }

//     const deleted = await r2UploadService.deleteFile(fileUrl, config)
    
//     if (deleted) {
//       // Delete from database
//       const { error: deleteError } = await supabase
//         .from("chat_attachments")
//         .delete()
//         .eq("id", attachmentId)

//       if (deleteError) {
//         console.error('Error deleting attachment record:', deleteError)
//         return false
//       }

//       console.log(`Successfully deleted attachment: ${attachmentId}`)
//       return true
//     }

//     return false
//   } catch (error) {
//     console.error('Error deleting attachment:', error)
//     return false
//   }
// }

// export function createAttachment(file: File, url: string): Attachment {
//   return {
//     name: file.name,
//     contentType: file.type,
//     url,
//   }
// }

// export async function processFiles(
//   files: File[],
//   chatId: string,
//   userId: string,
//   uploadType: UploadType = 'CHAT_ATTACHMENTS'
// ): Promise<Attachment[]> {
//   const supabase = isSupabaseEnabled ? createClient() : null
//   const attachments: Attachment[] = []

//   for (const file of files) {
//     try {
//       // Upload to R2
//       const url = await uploadToR2(file, uploadType)

//       // Save metadata to Supabase database
//       if (supabase) {
//         const { error } = await supabase.from("chat_attachments").insert({
//           chat_id: chatId,
//           user_id: userId,
//           file_url: url,
//           file_name: file.name,
//           file_type: file.type,
//           file_size: file.size,
//         })

//         if (error) {
//           // If database insertion fails, try to delete the uploaded file
//           await deleteFilesFromR2([url], uploadType)
//           throw new Error(`Database insertion failed: ${error.message}`)
//         }
//       }

//       attachments.push(createAttachment(file, url))
//     } catch (error) {
//       console.error(`Error processing file ${file.name}:`, error)
//       toast({
//         title: "Upload failed",
//         description: `Failed to upload ${file.name}`,
//         status: "error",
//       })
//     }
//   }

//   return attachments
// }

// // Rest of your existing code...
// export class FileUploadLimitError extends Error {
//   code: string
//   constructor(message: string) {
//     super(message)
//     this.code = "DAILY_FILE_LIMIT_REACHED"
//   }
// }

// export async function checkFileUploadLimit(userId: string) {
//   if (!isSupabaseEnabled) return 0

//   const supabase = createClient()

//   if (!supabase) {
//     toast({
//       title: "File upload is not supported in this deployment",
//       status: "info",
//     })
//     return 0
//   }

//   const now = new Date()
//   const startOfToday = new Date(
//     Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
//   )

//   const { count, error } = await supabase
//     .from("chat_attachments")
//     .select("*", { count: "exact", head: true })
//     .eq("user_id", userId)
//     .gte("created_at", startOfToday.toISOString())

//   if (error) throw new Error(error.message)
//   if (count && count >= DAILY_FILE_UPLOAD_LIMIT) {
//     throw new FileUploadLimitError("Daily file upload limit reached.")
//   }

//   return count
// }