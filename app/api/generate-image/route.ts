import { NextRequest, NextResponse } from 'next/server'
import { generateImage } from '@/lib/huggingface'

export const runtime = 'nodejs'

type GenerateImageRequest = {
  prompt?: string
}

// ✅ النوع الصحيح لنتيجة HuggingFace
type HFResult = {
  blob: Blob | string
  model: string
  contentType: string
  aspectRatio?: string
}

export async function POST(request: NextRequest) {
  let body: GenerateImageRequest

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const prompt = body.prompt?.trim()

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  try {
    const result = (await generateImage(prompt)) as HFResult

    let imageBuffer: Buffer

    // 👇 الحل هنا
    if (typeof result.blob === 'string') {
      // base64
      const base64Data = result.blob.includes(',')
        ? result.blob.split(',')[1]
        : result.blob

      imageBuffer = Buffer.from(base64Data, 'base64')
    } else {
      // Blob
      const arrayBuffer = await result.blob.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      status: 200,
      headers: {
        'Content-Type': result.contentType || 'image/png',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Public image generation failed:', error)

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Image generation failed',
      },
      { status: 500 }
    )
  }
}