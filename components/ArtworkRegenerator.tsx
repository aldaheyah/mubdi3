'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

type ArtworkRegeneratorProps = {
  initialPrompt: string
  title: string
}

export default function ArtworkRegenerator({
  initialPrompt,
  title,
}: ArtworkRegeneratorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [prompt, setPrompt] = useState(initialPrompt)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const toggleOpen = () => {
    setIsOpen((current) => !current)
    setError('')
  }

  const handleGenerate = async () => {
    const normalizedPrompt = prompt.trim()

    if (!normalizedPrompt) {
      setError('أدخل وصفاً صالحاً قبل التوليد')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: normalizedPrompt }),
      })

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || ''

        if (contentType.includes('application/json')) {
          const payload = await response.json()
          throw new Error(payload.error || 'تعذر توليد الصورة')
        }

        throw new Error('تعذر توليد الصورة')
      }

      const imageBlob = await response.blob()
      const nextPreviewUrl = URL.createObjectURL(imageBlob)

      setPreviewUrl((current) => {
        if (current) {
          URL.revokeObjectURL(current)
        }

        return nextPreviewUrl
      })
    } catch (generationError) {
      setError(generationError instanceof Error ? generationError.message : 'تعذر توليد الصورة')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4 rounded-2xl border border-[#B8892A]/20 bg-[#FAF8F3] p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-[#B8892A] uppercase tracking-widest">
            إعادة التوليد
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            عدّل البرومبت الحالي وولّد نسخة جديدة من العمل داخل الصفحة.
          </p>
        </div>
        <button
          onClick={toggleOpen}
          className="shrink-0 rounded-full border border-[#B8892A]/30 px-4 py-2 text-sm font-medium text-[#B8892A] transition-colors hover:bg-amber-50"
        >
          {isOpen ? 'إخفاء التعديل' : 'تعديل العمل'}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-4 border-t border-[#B8892A]/10 pt-4">
          <div>
            <label className="mb-2 block text-xs font-medium text-gray-500">
              Prompt المعدل
            </label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              rows={6}
              dir="ltr"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-mono text-gray-700 focus:border-[#B8892A] focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="rounded-xl bg-[#B8892A] px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? 'جارٍ التوليد...' : 'Generate'}
            </button>
            <span className="text-xs text-gray-400">
              تستخدم هذه المعاينة Hugging Face دون تعديل العمل الأصلي.
            </span>
          </div>

          {error && (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <div className="overflow-hidden rounded-2xl border border-dashed border-[#B8892A]/20 bg-white">
            {previewUrl ? (
              <div className="space-y-3 p-3">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#0C0A08]">
                  <Image
                    src={previewUrl}
                    alt={`نسخة مولدة من ${title}`}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <p className="text-xs text-gray-400">
                  هذه معاينة مؤقتة ناتجة عن البرومبت المعدل.
                </p>
              </div>
            ) : (
              <div className="flex min-h-56 items-center justify-center px-6 py-10 text-center">
                <div>
                  <div className="mb-3 text-4xl text-[#B8892A]/50">✦</div>
                  <p className="text-sm font-medium text-gray-500">
                    ستظهر المعاينة هنا بعد التوليد
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    يمكنك تعديل الوصف الحالي ثم إنشاء نسخة جديدة فوراً.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
