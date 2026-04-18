import { NextRequest, NextResponse } from 'next/server'

import { generateImage } from '@/lib/huggingface'

export const runtime = 'nodejs'

type GenerateImageRequest = {
  prompt?: string
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
    const result = await generateImage(prompt)
    const imageBuffer = Buffer.from(await result.blob.arrayBuffer())

    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': result.contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Public image generation failed:', error)

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Image generation failed',
      },
      { status: 500 }
    )
  }
}
