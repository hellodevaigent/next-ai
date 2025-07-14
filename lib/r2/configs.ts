// lib/r2/configs.ts
import { UploadConfig } from './upload-service'

export const UPLOAD_CONFIGS = {
  CHAT_ATTACHMENTS: {
    bucket: process.env.R2_CHAT_BUCKET || "chat-attachments",
    folder: "uploads",
    publicUrl: process.env.R2_CHAT_PUBLIC_URL,
    maxFileSize: 3 * 1024 * 1024, // 3MB
    allowedTypes: [
      "image/jpeg", "image/png", "image/gif", "application/pdf",
      "text/plain", "text/markdown", "application/json", "text/csv"
    ]
  } as UploadConfig,

  PROFILE_PICTURES: {
    bucket: process.env.R2_PROFILE_BUCKET || "user-profiles",
    folder: "avatars",
    publicUrl: process.env.R2_PROFILE_PUBLIC_URL,
    maxFileSize: 2 * 1024 * 1024, // 2MB
    allowedTypes: ["image/jpeg", "image/png", "image/gif"]
  } as UploadConfig,

  DOCUMENTS: {
    bucket: process.env.R2_DOCS_BUCKET || "documents",
    folder: "files",
    publicUrl: process.env.R2_DOCS_PUBLIC_URL,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      "application/pdf", "text/plain", "text/markdown",
      "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
  } as UploadConfig,

  MEDIA: {
    bucket: process.env.R2_MEDIA_BUCKET || "media-files",
    folder: "uploads",
    publicUrl: process.env.R2_MEDIA_PUBLIC_URL,
    maxFileSize: 50 * 1024 * 1024, // 50MB
    allowedTypes: [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "video/mp4", "video/webm", "audio/mpeg", "audio/wav"
    ]
  } as UploadConfig,
}