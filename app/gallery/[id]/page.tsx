import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Artwork } from '@/data/artworks'
import CopyButton from '@/components/CopyButton'
import FavoriteButton from '@/components/FavoriteButton'


type Props = {
  params: Promise<{ id: string }>
}

export default async function ArtworkDetail({ params }: Props) {
  const { id } = await params

  const { data, error } = await supabase
    .from('artworks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !data) {
    return (
      <main className="min-h-screen p-8 text-center">
        <h1 className="text-2xl text-gray-400">العمل غير موجود</h1>
        <a href="/gallery" className="inline-block mt-4 text-sm text-[#B8892A]">
          العودة للمعرض
        </a>
      </main>
    )
  }

  const art = data as Artwork

  const levelLabel =
    art.level === 'beginner' ? 'مبتدئ' :
    art.level === 'intermediate' ? 'متوسط' : 'متقدم'

  const levelColor =
    art.level === 'beginner' ? 'bg-green-100 text-green-700' :
    art.level === 'intermediate' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700'

  return (
    <main className="min-h-screen p-8 max-w-3xl mx-auto">

      {/* الصورة أو بديلها حسب النوع */}
      {art.type === 'prompt' ? (
        <div className="w-full aspect-[16/9] bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl flex flex-col items-center justify-center mb-8 border border-purple-200">
          <span className="text-6xl text-purple-300 mb-3">✦</span>
          <span className="text-sm text-purple-400 font-mono uppercase tracking-widest">Prompt Guide</span>
        </div>
      ) : (
        <div className="w-full aspect-[16/9] bg-amber-50 rounded-2xl relative overflow-hidden mb-8">
          {art.image_url ? (
            <Image
              src={art.image_url}
              alt={art.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-300">لا توجد صورة</span>
            </div>
          )}
        </div>
      )}

      {/* العنوان والمستوى */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-3xl font-bold text-gray-800">{art.title}</h1>
        <span className={`text-sm px-3 py-1 rounded-full font-medium ${levelColor}`}>
          {levelLabel}
        </span>
      </div>

      {/* الأداة والنوع */}
      <div className="flex items-center gap-3 mb-8">
        <p className="text-gray-400 font-mono text-sm">{art.tool}</p>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          art.type === 'image' ? 'bg-amber-100 text-amber-700' :
          art.type === 'video' ? 'bg-green-100 text-green-700' :
          art.type === 'design' ? 'bg-blue-100 text-blue-700' :
          'bg-purple-100 text-purple-700'
        }`}>
          {art.type === 'image' ? 'صورة' :
           art.type === 'video' ? 'فيديو' :
           art.type === 'design' ? 'تصميم' : 'برومبت'}
        </span>
      </div>

      {/* البرومبت */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mb-4">
        <h2 className="text-xs font-bold text-[#B8892A] uppercase tracking-widest mb-3">
          البرومبت
        </h2>
        <p className="text-gray-600 leading-relaxed font-mono text-sm text-left" dir="ltr">
          {art.prompt}
        </p>
      </div>

      {/* الترجمة */}
      {art.prompt_ar && (
        <div className="bg-amber-50 border border-[#B8892A]/20 rounded-xl p-6 mb-8">
          <h2 className="text-xs font-bold text-[#B8892A] uppercase tracking-widest mb-3">
            الترجمة
          </h2>
          <p className="text-gray-600 leading-relaxed text-sm">
            {art.prompt_ar}
          </p>
        </div>
      )}
<div className="flex gap-3 flex-wrap">
  <CopyButton prompt={art.prompt} />
  <FavoriteButton artworkId={art.id} />
</div>

    </main>
  )
}