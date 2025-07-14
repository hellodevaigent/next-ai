import { NextRequest, NextResponse } from 'next/server'
import { r2UploadService } from '@/lib/r2/upload-service'
import { UPLOAD_CONFIGS } from '@/lib/r2/configs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const uploadType = formData.get('type') as string || 'CHAT_ATTACHMENTS'

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Get upload configuration
    const config = UPLOAD_CONFIGS[uploadType as keyof typeof UPLOAD_CONFIGS]
    if (!config) {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    // Validate file
    const validation = await r2UploadService.validateFile(file, config)
    if (!validation.isValid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Upload file
    const url = await r2UploadService.uploadFile(file, config)

    return NextResponse.json({ 
      url,
      filename: file.name,
      size: file.size,
      type: file.type,
      uploadType,
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}