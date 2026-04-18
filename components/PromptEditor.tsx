'use client'

import { useEffect, useState } from 'react'

type PromptEditorProps = {
  artworkId?: number
  initialPrompt: string
  title?: string
  description?: string
}

type StylePreset = {
  id: string
  label: string
  suffix: string
}

const STYLE_PRESETS: StylePreset[] = [
  { id: 'original', label: 'النمط الأصلي', suffix: '' },
  { id: 'realistic', label: 'واقعي', suffix: 'photorealistic, realistic lighting, highly detailed, premium composition' },
  { id: 'cinematic', label: 'سينمائي', suffix: 'cinematic frame, dramatic lighting, rich atmosphere, ultra detailed, film still' },
  { id: 'anime', label: 'أنيمي', suffix: 'anime style, expressive details, vibrant colors, stylized lighting, clean lines' },
  { id: 'artistic', label: 'فني', suffix: 'fine art, painterly texture, elegant composition, rich tones, gallery quality' },
]

function getStorageKey(scope: string) {
  return `prompt-studio-${scope}`
}

function mapErrorMessage(message: string) {
  const normalized = message.toLowerCase()

  if (normalized.includes('billing hard limit')) {
    return 'تعذر استخدام OpenAI لأن حد الفوترة في الحساب تم تجاوزه.'
  }

  if (normalized.includes('inference providers')) {
    return 'رمز Hugging Face الحالي لا يملك صلاحية Inference Providers.'
  }

  if (normalized.includes('deprecated')) {
    return 'النموذج المستخدم لم يعد مدعومًا من المزود الحالي.'
  }

  if (normalized.includes('timed out') || normalized.includes('timeout')) {
    return 'استغرق التوليد وقتًا أطول من المتوقع. حاول مرة أخرى.'
  }

  return message || 'تعذر توليد المعاينة الآن. حاول مرة أخرى بعد قليل.'
}

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }

      reject(new Error('تعذر تجهيز المعاينة الجديدة.'))
    }
    reader.onerror = () => reject(new Error('تعذر تجهيز المعاينة الجديدة.'))
    reader.readAsDataURL(blob)
  })
}

export default function PromptEditor({
  artworkId,
  initialPrompt,
  title = 'تعديل البرومبت',
  description = 'يمكنك تعديل النص ثم توليد معاينة جديدة بدون حفظ، وسيبقى آخر تعديل داخل الجلسة الحالية.',
}: PromptEditorProps) {
  const storageScope = artworkId ? `artwork-${artworkId}` : 'studio'

  const [prompt, setPrompt] = useState(initialPrompt)
  const [selectedStyle, setSelectedStyle] = useState<string>('original')
  const [previewCount, setPreviewCount] = useState<number>(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')
  const [previewImageUrls, setPreviewImageUrls] = useState<string[]>([])
  const [copyFeedback, setCopyFeedback] = useState('')
  const [lastProvider, setLastProvider] = useState('')
  const [lastModel, setLastModel] = useState('')

  const isDirty =
    prompt !== initialPrompt || selectedStyle !== 'original' || previewCount !== 1

  useEffect(() => {
    const savedState = sessionStorage.getItem(getStorageKey(storageScope))

    if (!savedState) {
      return
    }

    try {
      const parsed = JSON.parse(savedState) as {
        prompt?: string
        selectedStyle?: string
        previewCount?: number
      }

      if (typeof parsed.prompt === 'string') {
        setPrompt(parsed.prompt)
      }

      if (
        typeof parsed.selectedStyle === 'string' &&
        STYLE_PRESETS.some((preset) => preset.id === parsed.selectedStyle)
      ) {
        setSelectedStyle(parsed.selectedStyle)
      }

      if (
        typeof parsed.previewCount === 'number' &&
        [1, 2, 3].includes(parsed.previewCount)
      ) {
        setPreviewCount(parsed.previewCount)
      }
    } catch {
      sessionStorage.removeItem(getStorageKey(storageScope))
    }
  }, [storageScope])

  useEffect(() => {
    sessionStorage.setItem(
      getStorageKey(storageScope),
      JSON.stringify({ prompt, selectedStyle, previewCount })
    )
  }, [previewCount, prompt, selectedStyle, storageScope])

  useEffect(() => {
    if (!copyFeedback) {
      return
    }

    const timeout = window.setTimeout(() => setCopyFeedback(''), 1600)
    return () => window.clearTimeout(timeout)
  }, [copyFeedback])

  const selectedStylePreset =
    STYLE_PRESETS.find((preset) => preset.id === selectedStyle) || STYLE_PRESETS[0]

  const effectivePrompt = selectedStylePreset.suffix
    ? `${prompt.trim()}, ${selectedStylePreset.suffix}`
    : prompt.trim()

  const handleReset = () => {
    setPrompt(initialPrompt)
    setSelectedStyle('original')
    setPreviewCount(1)
    setError('')
    setPreviewImageUrls([])
    setLastProvider('')
    setLastModel('')
    sessionStorage.removeItem(getStorageKey(storageScope))
  }

  const handleCopyModifiedPrompt = async () => {
    await navigator.clipboard.writeText(effectivePrompt)
    setCopyFeedback('تم نسخ البرومبت المستخدم للتوليد')
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError('')

    try {
      const requests = Array.from({ length: previewCount }, () =>
        fetch('/api/generate-preview', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: effectivePrompt }),
        })
      )

      const responses = await Promise.all(requests)

      for (const response of responses) {
        if (!response.ok) {
          let message = 'تعذر توليد المعاينة الآن'

          try {
            const data = await response.json()
            if (typeof data?.error === 'string') {
              message = data.error
            }
          } catch {}

          throw new Error(message)
        }
      }

      const nextPreviewUrls = await Promise.all(
        responses.map(async (response) => blobToDataUrl(await response.blob()))
      )

      const provider = responses[0]?.headers.get('x-image-provider') || ''
      const model = responses[0]?.headers.get('x-image-model') || ''

      setLastProvider(provider)
      setLastModel(model)
      setPreviewImageUrls(nextPreviewUrls)
    } catch (err) {
      setPreviewImageUrls([])
      setLastProvider('')
      setLastModel('')
      setError(
        mapErrorMessage(
          err instanceof Error ? err.message : 'تعذر توليد المعاينة الآن.'
        )
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-sm font-bold text-[#B8892A]">{title}</h2>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          disabled={!isDirty && previewImageUrls.length === 0}
          className="px-3 py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#B8892A] hover:text-[#B8892A] transition-colors"
        >
          إعادة ضبط
        </button>
      </div>

      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        rows={8}
        dir="ltr"
        className="w-full min-h-48 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 font-mono leading-relaxed outline-none focus:border-[#B8892A] focus:ring-2 focus:ring-[#B8892A]/10 resize-y"
      />

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="text-xs font-bold text-gray-500">أنماط جاهزة</h3>

          <label className="flex items-center gap-2 text-xs text-gray-500">
            <span>عدد المعاينات</span>
            <select
              value={previewCount}
              onChange={(event) => setPreviewCount(Number(event.target.value))}
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-gray-700 outline-none focus:border-[#B8892A]"
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </label>
        </div>

        {lastProvider ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">آخر توليد عبر</span>
            <span className="inline-flex items-center rounded-full bg-amber-50 border border-[#B8892A]/20 px-3 py-1 text-xs font-medium text-[#B8892A]">
              {lastProvider === 'openai' ? 'OpenAI' : 'Hugging Face'}
            </span>
            {lastModel ? (
              <span className="inline-flex items-center rounded-full bg-gray-50 border border-gray-200 px-3 py-1 text-xs font-mono text-gray-600">
                {lastModel}
              </span>
            ) : null}
          </div>
        ) : null}

        <div className="flex gap-2 flex-wrap">
          {STYLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => setSelectedStyle(preset.id)}
              className={`px-3 py-2 rounded-full text-xs font-medium transition-colors ${
                selectedStyle === preset.id
                  ? 'bg-[#B8892A] text-white'
                  : 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-[#B8892A] hover:text-[#B8892A]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {isDirty ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <h3 className="text-xs font-bold text-gray-500 mb-2">البرومبت الأصلي</h3>
            <p className="text-xs text-gray-700 font-mono leading-relaxed text-left" dir="ltr">
              {initialPrompt}
            </p>
          </div>

          <div className="rounded-xl border border-[#B8892A]/20 bg-amber-50/50 p-4">
            <h3 className="text-xs font-bold text-[#B8892A] mb-2">البرومبت المستخدم للتوليد</h3>
            <p className="text-xs text-gray-700 font-mono leading-relaxed text-left" dir="ltr">
              {effectivePrompt}
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !effectivePrompt.trim()}
          className="w-full sm:w-auto bg-[#B8892A] text-white px-5 py-3 rounded-xl text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed hover:bg-amber-600 transition-colors"
        >
          {isGenerating ? 'جاري توليد المعاينات...' : `توليد ${previewCount} معاينة`}
        </button>

        <button
          type="button"
          onClick={handleCopyModifiedPrompt}
          disabled={!effectivePrompt.trim()}
          className="w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 disabled:opacity-60 disabled:cursor-not-allowed hover:border-[#B8892A] hover:text-[#B8892A] transition-colors"
        >
          نسخ البرومبت المستخدم
        </button>

        <p className="text-xs text-gray-500">
          يتم التوليد من نفس الواجهة بدون حفظ الأعمال في القاعدة.
        </p>
      </div>

      {copyFeedback ? (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {copyFeedback}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {isGenerating ? (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-[#B8892A]">جاري تجهيز المعاينات</h3>
          <div className={`grid gap-3 ${previewCount > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {Array.from({ length: previewCount }).map((_, index) => (
              <div
                key={index}
                className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 p-4"
              >
                <div className="aspect-square w-full rounded-lg bg-gradient-to-br from-amber-100 via-amber-50 to-white animate-pulse" />
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            نولّد {previewCount} معاينة بناءً على البرومبت الحالي والنمط المختار.
          </p>
        </div>
      ) : null}

      {previewImageUrls.length > 0 ? (
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <h3 className="text-sm font-bold text-[#B8892A]">المعاينات الجديدة</h3>
            <p className="text-xs text-gray-500">{previewImageUrls.length} نتيجة</p>
          </div>

          <div className={`grid gap-3 ${previewImageUrls.length > 1 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            {previewImageUrls.map((previewUrl, index) => (
              <div
                key={`${previewUrl}-${index}`}
                className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50"
              >
                <img
                  src={previewUrl}
                  alt={`معاينة مولدة رقم ${index + 1}`}
                  className="w-full h-auto object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
