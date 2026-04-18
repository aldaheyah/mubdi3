import { NextRequest, NextResponse } from 'next/server'
import { generatePreviewImage } from '@/lib/image-generation'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

  if (typeof prompt !== 'string' || !prompt.trim()) {
    return NextResponse.json(
      { error: 'البرومبت مطلوب لتوليد المعاينة.' },
      { status: 400 }
    )
  }

  try {
    const result = await generatePreviewImage({ prompt: prompt.trim() })

    return new Response(result.bytes, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': 'no-store',
        'X-Image-Provider': result.provider,
        'X-Image-Model': result.model,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'تعذر توليد الصورة من المزود الحالي.',
      },
      { status: 502 }
    )
  }
}
