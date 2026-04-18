type GenerateImageArgs = {
  prompt: string
}

type GenerateImageResult = {
  bytes: ArrayBuffer
  contentType: string
  provider: 'openai' | 'huggingface'
  model: string
}

const OPENAI_API_URL = 'https://api.openai.com/v1/images/generations'
const OPENAI_IMAGE_MODEL = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-1.5'

const HF_MODEL = process.env.HF_IMAGE_MODEL || 'black-forest-labs/FLUX.1-schnell'
const HF_API_URL = `https://router.huggingface.co/hf-inference/models/${HF_MODEL}`
const HF_NEGATIVE_PROMPT =
  process.env.HF_NEGATIVE_PROMPT ||
  'blurry, low quality, low resolution, distorted, deformed, bad anatomy, extra fingers, extra limbs, duplicate, cropped, watermark, logo, text'
const HF_NUM_INFERENCE_STEPS = Number(process.env.HF_NUM_INFERENCE_STEPS || 8)
const HF_GUIDANCE_SCALE = Number(process.env.HF_GUIDANCE_SCALE || 3.5)

function normalizeProvider(value: string | undefined) {
  if (value === 'openai' || value === 'huggingface' || value === 'auto') {
    return value
  }

  return 'auto'
}

function getConfiguredProviders() {
  const preferredProvider = normalizeProvider(process.env.IMAGE_PROVIDER)
  const providers =
    preferredProvider === 'auto'
      ? ['openai', 'huggingface']
      : [preferredProvider]

  return providers as Array<'openai' | 'huggingface'>
}

async function generateWithOpenAI(prompt: string): Promise<GenerateImageResult> {
  const openAiToken = process.env.OPENAI_API_KEY

  if (!openAiToken) {
    throw new Error('OPENAI_API_KEY غير موجود على الخادم.')
  }

  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${openAiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_IMAGE_MODEL,
      prompt,
      size: '1024x1024',
    }),
  })

  if (!response.ok) {
    let message = 'فشل توليد الصورة من OpenAI.'

    try {
      const data = await response.json()
      if (typeof data?.error?.message === 'string') {
        message = data.error.message
      }
    } catch {}

    throw new Error(message)
  }

  const data = await response.json()
  const imageBase64 = data?.data?.[0]?.b64_json

  if (typeof imageBase64 !== 'string') {
    throw new Error('OpenAI لم يُرجع صورة قابلة للمعاينة.')
  }

  return {
    bytes: Buffer.from(imageBase64, 'base64'),
    contentType: 'image/png',
    provider: 'openai',
    model: OPENAI_IMAGE_MODEL,
  }
}

async function generateWithHuggingFace(prompt: string): Promise<GenerateImageResult> {
  const hfToken = process.env.HF_TOKEN

  if (!hfToken) {
    throw new Error('HF_TOKEN غير موجود على الخادم.')
  }

  const response = await fetch(HF_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${hfToken}`,
      Accept: 'image/png',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: {
        negative_prompt: HF_NEGATIVE_PROMPT,
        num_inference_steps: HF_NUM_INFERENCE_STEPS,
        guidance_scale: HF_GUIDANCE_SCALE,
        width: 1024,
        height: 1024,
      },
    }),
  })

  if (!response.ok) {
    let message = 'فشل توليد الصورة من Hugging Face.'

    try {
      const errorText = await response.text()
      if (errorText) {
        message = errorText
      }
    } catch {}

    throw new Error(message)
  }

  return {
    bytes: await response.arrayBuffer(),
    contentType: response.headers.get('content-type') || 'image/png',
    provider: 'huggingface',
    model: HF_MODEL,
  }
}

export async function generatePreviewImage({
  prompt,
}: GenerateImageArgs): Promise<GenerateImageResult> {
  const providers = getConfiguredProviders()
  const errors: string[] = []

  for (const provider of providers) {
    try {
      if (provider === 'openai') {
        return await generateWithOpenAI(prompt)
      }

      return await generateWithHuggingFace(prompt)
    } catch (error) {
      errors.push(error instanceof Error ? error.message : 'Unknown provider error')
    }
  }

  throw new Error(errors[0] || 'تعذر توليد الصورة من جميع المزودين المتاحين.')
}
