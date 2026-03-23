import { NextResponse } from 'next/server'
import { getSupabaseAdminClient } from '@/lib/supabase/admin'

const BUCKET_NAME = 'jacket-images'
const MAX_FILE_SIZE = 200 * 1024 // 200KB
const ALLOWED_TYPES = ['image/webp', 'image/avif', 'image/jpeg', 'image/png']

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 },
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { message: 'Unsupported file type. Use webp, avif, jpg, or png.' },
        { status: 400 },
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { message: 'File size exceeds 200KB limit' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseAdminClient()
    if (!supabase) {
      return NextResponse.json(
        { message: 'Storage service is not available' },
        { status: 503 },
      )
    }

    const extension = file.type === 'image/webp' ? 'webp'
      : file.type === 'image/avif' ? 'avif'
        : file.type === 'image/jpeg' ? 'jpg'
          : 'png'

    const timestamp = Date.now()
    const randomSuffix = Math.random().toString(36).slice(2, 8)
    const fileName = `${timestamp}-${randomSuffix}.${extension}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      console.error('[jacket-upload] upload failed:', uploadError.message)
      return NextResponse.json(
        { message: 'Failed to upload image' },
        { status: 500 },
      )
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    return NextResponse.json({
      url: publicUrlData.publicUrl,
      fileName,
    })
  } catch (error) {
    console.error('[jacket-upload] unexpected error:', error)
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 },
    )
  }
}
