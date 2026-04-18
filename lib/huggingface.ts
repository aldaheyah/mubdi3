import 'server-only'

import { InferenceClient } from '@huggingface/inference'

const HF_TOKEN = process.env.HF_TOKEN
const DEFAULT_MODEL = 'black-forest-labs/FLUX.1-Krea-dev'

export type GenerateImageOptions = {
  negativePrompt?: string
  aspectRatio?: '1:1' | '4:3' | '3:4' | '16:9' | '9:16'
}

const ASPECT_RATIO_DIMENSIONS: Record<NonNullable<GenerateImageOptions['aspectRatio']>, { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '4:3': { width: 1152, height: 864 },
  '3:4': { width: 864, height: 1152 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
}

function getClient() {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN is not configured')
  }

  return new InferenceClient(HF_TOKEN)
}

export async function generateImage(prompt: string, options: GenerateImageOptions = {}) {
  const normalizedPrompt = prompt.trim()

  if (!normalizedPrompt) {
    throw new Error('Prompt is required')
  }

  const aspectRatio = options.aspectRatio ?? '1:1'
  const size = ASPECT_RATIO_DIMENSIONS[aspectRatio]
  const client = getClient()

  const image = await client.textToImage({
    model: DEFAULT_MODEL,
    inputs: normalizedPrompt,
    parameters: {
      negative_prompt: options.negativePrompt?.trim() || undefined,
      width: size.width,
      height: size.height,
      num_inference_steps: 30,
      guidance_scale: 7.5,
    },
  })

  return {
    blob: image,
    model: DEFAULT_MODEL,
    contentType: 'image/png',
    aspectRatio,
  }
}