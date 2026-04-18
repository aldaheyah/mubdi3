'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Artwork } from '@/data/artworks'
import Image from 'next/image'
import { useRouter } from 'next/navigation'

const defaultForm = {
  title: '',
  tool: '',
  type: 'image',
  level: 'beginner',
  prompt: '',
  prompt_ar: '',
}

type ArtworkForm = typeof defaultForm

const defaultGeneration = {
  prompt: '',
  negativePrompt: '',
  aspectRatio: '1:1',
}

export default function Admin() {
  const [tab, setTab] = useState<'list' | 'add'>('list')
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [form, setForm] = useState<ArtworkForm>(defaultForm)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generationForm, setGenerationForm] = useState(defaultGeneration)
  const [generationLoading, setGenerationLoading] = useState(false)
  const [generationError, setGenerationError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    const { data } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false })
    if (data) setArtworks(data as Artwork[])
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setGeneratedImageUrl(null)
    setGenerationError('')
    setPreview(URL.createObjectURL(file))
  }

  const handleEdit = (art: Artwork) => {
    setEditingId(art.id)
    setForm({
      title: art.title,
      tool: art.tool,
      type: art.type,
      level: art.level,
      prompt: art.prompt,
      prompt_ar: art.prompt_ar || '',
    })
    setPreview(art.image_url)
    setImageFile(null)
    setGeneratedImageUrl(art.image_url)
    setGenerationForm({
      prompt: art.prompt,
      negativePrompt: '',
      aspectRatio: '1:1',
    })
    setGenerationError('')
    setMessage('')
    setTab('add')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return
    const { error } = await supabase.from('artworks').delete().eq('id', id)
    if (error) {
      alert('خطأ في الحذف: ' + error.message)
    } else {
      setArtworks(artworks.filter((a) => a.id !== id))
    }
  }

  const handleSubmit = async () => {
    if (!form.title || !form.prompt) {
      setMessage('يرجى ملء العنوان والبرومبت')
      return
    }

    setLoading(true)
    setMessage('')

    let image_url = editingId
      ? artworks.find((a) => a.id === editingId)?.image_url || null
      : null

    if (generatedImageUrl) {
      image_url = generatedImageUrl
    }

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('artworks')
        .upload(fileName, imageFile)

      if (uploadError) {
        setMessage('خطأ في رفع الصورة: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('artworks')
        .getPublicUrl(fileName)

      image_url = urlData.publicUrl
    }

    if (editingId) {
      const { error } = await supabase
        .from('artworks')
        .update({ ...form, image_url })
        .eq('id', editingId)

      setLoading(false)

      if (error) {
        setMessage('خطأ في التعديل: ' + error.message)
      } else {
        setMessage('تم التعديل بنجاح ✓')
        setEditingId(null)
        setForm(defaultForm)
        setPreview(null)
        setImageFile(null)
        setGeneratedImageUrl(null)
        setGenerationForm(defaultGeneration)
        setGenerationError('')
        fetchArtworks()
        setTimeout(() => setTab('list'), 1000)
      }
    } else {
      const { error } = await supabase
        .from('artworks')
        .insert([{ ...form, image_url }])

      setLoading(false)

      if (error) {
        setMessage('حدث خطأ: ' + error.message)
      } else {
        setMessage('تم الإضافة بنجاح ✓')
        setForm(defaultForm)
        setImageFile(null)
        setPreview(null)
        setGeneratedImageUrl(null)
        setGenerationForm(defaultGeneration)
        setGenerationError('')
        fetchArtworks()
        setTimeout(() => setTab('list'), 1000)
      }
    }
  }

  const handleGenerate = async () => {
    const prompt = generationForm.prompt.trim()

    if (!prompt) {
      setGenerationError('أدخل وصف الصورة أولاً')
      return
    }

    setGenerationLoading(true)
    setGenerationError('')

    try {
      const response = await fetch('/api/admin/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          negativePrompt: generationForm.negativePrompt.trim() || undefined,
          aspectRatio: generationForm.aspectRatio,
        }),
      })

      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.error || 'تعذر توليد الصورة')
      }

      setGeneratedImageUrl(payload.imageUrl)
      setImageFile(null)
      setPreview(payload.imageUrl)
      setForm((current) => ({
        ...current,
        prompt,
        tool: current.tool || payload.tool,
        type: 'image',
      }))
      setMessage('')
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : 'تعذر توليد الصورة')
    } finally {
      setGenerationLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(defaultForm)
    setPreview(null)
    setImageFile(null)
    setGeneratedImageUrl(null)
    setGenerationForm(defaultGeneration)
    setGenerationError('')
    setMessage('')
    setTab('list')
  }

  const handleLogout = async () => {
    await fetch('/api/admin-logout', { method: 'POST' })
    router.push('/admin/login')
  }

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">

      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl font-bold text-[#B8892A]">لوحة التحكم</h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-red-400 transition-colors"
        >
          خروج
        </button>
      </div>

      <p className="text-gray-400 text-sm mb-6">إدارة أعمال المعرض</p>

      <div className="flex gap-3 mb-8">
        <button
          onClick={() => { setTab('list'); handleCancelEdit() }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            tab === 'list'
              ? 'bg-[#B8892A] text-white'
              : 'bg-white border border-[#B8892A]/30 text-gray-500 hover:border-[#B8892A]'
          }`}
        >
          الأعمال ({artworks.length})
        </button>
        <button
          onClick={() => {
            setTab('add')
            setEditingId(null)
            setForm(defaultForm)
            setPreview(null)
            setImageFile(null)
            setGeneratedImageUrl(null)
            setGenerationForm(defaultGeneration)
            setGenerationError('')
            setMessage('')
          }}
          className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
            tab === 'add'
              ? 'bg-[#B8892A] text-white'
              : 'bg-white border border-[#B8892A]/30 text-gray-500 hover:border-[#B8892A]'
          }`}
        >
          {editingId ? 'تعديل عمل' : 'إضافة عمل'}
        </button>
      </div>

      {/* قائمة الأعمال */}
      {tab === 'list' && (
        <div className="flex flex-col gap-4">
          {artworks.length === 0 && (
            <p className="text-gray-400 text-center py-12">لا توجد أعمال بعد</p>
          )}
          {artworks.map((art) => (
            <div key={art.id} className="bg-white border border-[#B8892A]/20 rounded-xl p-4 flex items-center gap-4">

              <div className="w-16 h-16 rounded-lg bg-amber-50 relative overflow-hidden flex-shrink-0">
                {art.image_url ? (
                  <Image src={art.image_url} alt={art.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                    لا صورة
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 truncate">{art.title}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{art.tool}</p>
                <p className="text-xs text-gray-300 mt-1 truncate" dir="ltr">{art.prompt}</p>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleEdit(art)}
                  className="px-4 py-1.5 text-xs border border-[#B8892A]/30 text-[#B8892A] rounded-lg hover:bg-amber-50 transition-colors"
                >
                  تعديل
                </button>
                <button
                  onClick={() => handleDelete(art.id)}
                  className="px-4 py-1.5 text-xs border border-red-200 text-red-400 rounded-lg hover:bg-red-50 transition-colors"
                >
                  حذف
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* نموذج الإضافة / التعديل */}
      {tab === 'add' && (
        <div className="bg-white border border-[#B8892A]/20 rounded-2xl p-6 flex flex-col gap-5">

          {editingId && (
            <div className="bg-amber-50 border border-[#B8892A]/20 rounded-lg px-4 py-2 text-sm text-[#B8892A]">
              وضع التعديل — رقم العمل: {editingId}
            </div>
          )}

          <div className="rounded-2xl border border-[#B8892A]/20 bg-amber-50/40 p-5 flex flex-col gap-4">
            <div>
              <h2 className="text-base font-semibold text-[#B8892A]">Generate with AI</h2>
              <p className="text-sm text-gray-500 mt-1">
                ولّد صورة جديدة عبر Hugging Face ثم احفظها ضمن نفس نموذج العمل.
              </p>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">AI Prompt *</label>
              <textarea
                value={generationForm.prompt}
                onChange={(e) => setGenerationForm({ ...generationForm, prompt: e.target.value })}
                rows={4}
                placeholder="A cinematic Arabian palace at sunset..."
                dir="ltr"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#B8892A] resize-none bg-white"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Negative Prompt</label>
              <textarea
                value={generationForm.negativePrompt}
                onChange={(e) => setGenerationForm({ ...generationForm, negativePrompt: e.target.value })}
                rows={2}
                placeholder="blurry, distorted, extra limbs"
                dir="ltr"
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#B8892A] resize-none bg-white"
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Aspect Ratio</label>
              <select
                value={generationForm.aspectRatio}
                onChange={(e) => setGenerationForm({ ...generationForm, aspectRatio: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8892A] bg-white"
              >
                <option value="1:1">1:1</option>
                <option value="4:3">4:3</option>
                <option value="3:4">3:4</option>
                <option value="16:9">16:9</option>
                <option value="9:16">9:16</option>
              </select>
            </div>

            {generationError && (
              <p className="text-sm font-medium text-red-500">{generationError}</p>
            )}

            <button
              onClick={handleGenerate}
              disabled={generationLoading}
              className="bg-[#0C0A08] text-white py-3 rounded-xl text-sm font-medium hover:bg-black transition-colors disabled:opacity-50"
            >
              {generationLoading ? 'جارٍ التوليد...' : 'Generate Image'}
            </button>
          </div>

          {/* رفع الصورة */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">صورة العمل</label>
            <div className="border-2 border-dashed border-[#B8892A]/30 rounded-xl p-4 text-center hover:border-[#B8892A] transition-colors">
              <input type="file" accept="image/*" onChange={handleImage} className="hidden" id="image-upload" />
              <label htmlFor="image-upload" className="cursor-pointer block">
                {preview ? (
                  <Image
                    src={preview}
                    alt="preview"
                    width={1200}
                    height={800}
                    unoptimized
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ) : (
                  <div className="py-8">
                    <div className="text-3xl mb-2">🖼️</div>
                    <p className="text-sm text-gray-400">اضغط لرفع صورة</p>
                    <p className="text-xs text-gray-300 mt-1">PNG, JPG حتى 10MB</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* العنوان */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">العنوان *</label>
            <input name="title" value={form.title} onChange={handleChange}
              placeholder="مثال: قصر في الصحراء"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8892A]" />
          </div>

          {/* الأداة */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">الأداة *</label>
            <input name="tool" value={form.tool} onChange={handleChange}
              placeholder="Midjourney v6"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8892A]" />
          </div>

          {/* النوع والمستوى */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">النوع</label>
              <select name="type" value={form.type} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8892A]">
                <option value="image">صورة</option>
                <option value="video">فيديو</option>
                <option value="design">تصميم</option>
                <option value="prompt">برومبت</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">المستوى</label>
              <select name="level" value={form.level} onChange={handleChange}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8892A]">
                <option value="beginner">مبتدئ</option>
                <option value="intermediate">متوسط</option>
                <option value="advanced">متقدم</option>
              </select>
            </div>
          </div>

          {/* البرومبت */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">البرومبت *</label>
            <textarea name="prompt" value={form.prompt} onChange={handleChange}
              rows={4} placeholder="A magnificent Arabian palace..." dir="ltr"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-mono focus:outline-none focus:border-[#B8892A] resize-none" />
          </div>

          {/* الترجمة */}
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">الترجمة العربية</label>
            <textarea name="prompt_ar" value={form.prompt_ar} onChange={handleChange}
              rows={3} placeholder="قصر عربي فخم..."
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8892A] resize-none" />
          </div>

          {message && (
            <p className={`text-sm font-medium ${message.includes('✓') ? 'text-green-600' : 'text-red-500'}`}>
              {message}
            </p>
          )}

          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={loading}
              className="flex-1 bg-[#B8892A] text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50">
              {loading ? 'جارٍ الحفظ...' : editingId ? 'حفظ التعديلات' : 'إضافة العمل'}
            </button>
            {editingId && (
              <button onClick={handleCancelEdit}
                className="px-6 py-3 rounded-xl text-sm font-medium border border-gray-200 text-gray-400 hover:bg-gray-50 transition-colors">
                إلغاء
              </button>
            )}
          </div>

        </div>
      )}

    </main>
  )
}
