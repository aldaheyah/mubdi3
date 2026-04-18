import { randomUUID } from 'node:crypto'

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { generateImage } from '@/lib/huggingface'

export const runtime = 'nodejs'

type GenerateImageRequest = {
  prompt?: string
  negativePrompt?: string
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16'
}

// ✅ تعريف نوع واضح لنتيجة HuggingFace
type HFResult = string | Response

function getStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase environment variables are not configured')
  }

  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  const adminSecret = process.env.ADMIN_SECRET
  const token = request.cookies.get('admin_token')?.value

  if (!adminSecret || token !== adminSecret) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

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
    // ✅ هنا التايب صار واضح
    const result = (await generateImage(prompt, {
      negativePrompt: body.negativePrompt,
      aspectRatio: body.aspectRatio,
    })) as HFResult

    const filePath = `generated/${randomUUID()}.png`

    let imageBuffer: Buffer

    if (typeof result === 'string') {
      // base64 string
      const base64Data = result.split(',')[1] || result
      imageBuffer = Buffer.from(base64Data, 'base64')
    } else {
      // Response
      const arrayBuffer = await result.arrayBuffer()
      imageBuffer = Buffer.from(arrayBuffer)
    }

    const supabase = getStorageClient()

    const { error: uploadError } = await supabase.storage
      .from('artworks')
      .upload(filePath, imageBuffer, {
        contentType: 'image/png',
        upsert: false,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to upload generated image' },
        { status: 500 }
      )
    }

    const { data } = supabase.storage
      .from('artworks')
      .getPublicUrl(filePath)

    return NextResponse.json({
      imageUrl: data.publicUrl,
      tool: 'Hugging Face',
    })
  } catch (error) {
    console.error('Image generation failed:', error)

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