import { S3Client, PutObjectCommand, DeleteObjectCommand, DeleteObjectsCommand } from '@aws-sdk/client-s3'

export interface UploadConfig {
  bucket: string
  folder: string
  publicUrl?: string
  maxFileSize?: number
  allowedTypes?: string[]
}

export class R2UploadService {
  private client: S3Client
  private accountId: string

  constructor() {
    this.client = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID!,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      },
      forcePathStyle: true,
    })
    
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!
  }

  async uploadFile(file: File, config: UploadConfig): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${config.folder}/${fileName}`

    const buffer = await file.arrayBuffer()

    const command = new PutObjectCommand({
      Bucket: config.bucket,
      Key: filePath,
      Body: new Uint8Array(buffer),
      ContentType: file.type,
      ContentLength: file.size,
    })

    await this.client.send(command)

    // Generate public URL
    const publicUrl = config.publicUrl 
      ? `${config.publicUrl}/${filePath}`
      : `https://pub-${this.accountId}.r2.dev/${config.bucket}/${filePath}`

    return publicUrl
  }

  /**
   * Delete a single file from R2
   */
  async deleteFile(fileUrl: string, config: UploadConfig): Promise<boolean> {
    try {
      // Extract the file key from the URL
      const fileKey = this.extractFileKeyFromUrl(fileUrl, config)
      
      if (!fileKey) {
        console.error('Could not extract file key from URL:', fileUrl)
        return false
      }

      const command = new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: fileKey,
      })

      await this.client.send(command)
      console.log(`Successfully deleted file: ${fileKey}`)
      return true
    } catch (error) {
      console.error('Error deleting file from R2:', error)
      return false
    }
  }

  /**
   * Delete multiple files from R2
   */
  async deleteFiles(fileUrls: string[], config: UploadConfig): Promise<{ success: number; failed: number }> {
    if (fileUrls.length === 0) return { success: 0, failed: 0 }

    const fileKeys = fileUrls
      .map(url => this.extractFileKeyFromUrl(url, config))
      .filter(key => key !== null) as string[]

    if (fileKeys.length === 0) {
      console.error('No valid file keys found from URLs')
      return { success: 0, failed: fileUrls.length }
    }

    try {
      // AWS SDK supports deleting up to 1000 objects at once
      const batchSize = 1000
      let successCount = 0
      let failedCount = 0

      for (let i = 0; i < fileKeys.length; i += batchSize) {
        const batch = fileKeys.slice(i, i + batchSize)
        
        const command = new DeleteObjectsCommand({
          Bucket: config.bucket,
          Delete: {
            Objects: batch.map(key => ({ Key: key })),
            Quiet: false, // Set to true if you don't want detailed response
          },
        })

        try {
          const response = await this.client.send(command)
          successCount += response.Deleted?.length || 0
          failedCount += response.Errors?.length || 0
          
          if (response.Errors && response.Errors.length > 0) {
            console.error('Some files failed to delete:', response.Errors)
          }
        } catch (error) {
          console.error('Error deleting batch:', error)
          failedCount += batch.length
        }
      }

      console.log(`Deleted ${successCount} files, ${failedCount} failed`)
      return { success: successCount, failed: failedCount }
    } catch (error) {
      console.error('Error deleting files from R2:', error)
      return { success: 0, failed: fileUrls.length }
    }
  }

  /**
   * Extract file key from URL
   */
  private extractFileKeyFromUrl(url: string, config: UploadConfig): string | null {
    try {
      // Handle custom public URL
      if (config.publicUrl) {
        const publicUrlBase = config.publicUrl.replace(/\/$/, '') // Remove trailing slash
        if (url.startsWith(publicUrlBase)) {
          return url.replace(publicUrlBase + '/', '')
        }
      }

      // Handle default R2 public URL format
      const defaultUrlPattern = `https://pub-${this.accountId}.r2.dev/${config.bucket}/`
      if (url.startsWith(defaultUrlPattern)) {
        return url.replace(defaultUrlPattern, '')
      }

      // Try to extract from different URL formats
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      
      // Look for the folder in the path
      const folderIndex = pathParts.indexOf(config.folder)
      if (folderIndex !== -1 && folderIndex < pathParts.length - 1) {
        // Return everything from the folder onwards
        return pathParts.slice(folderIndex).join('/')
      }

      return null
    } catch (error) {
      console.error('Error extracting file key from URL:', error)
      return null
    }
  }

  async validateFile(file: File, config: UploadConfig): Promise<{ isValid: boolean; error?: string }> {
    const maxSize = config.maxFileSize || 10 * 1024 * 1024 // Default 10MB
    const allowedTypes = config.allowedTypes || [
      "image/jpeg", "image/png", "image/gif", "application/pdf",
      "text/plain", "text/markdown", "application/json"
    ]

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit`,
      }
    }

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: "File type not supported",
      }
    }

    return { isValid: true }
  }
}

// Singleton instance
export const r2UploadService = new R2UploadService()