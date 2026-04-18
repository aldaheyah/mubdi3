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
      <main className="min-h-screen p-8 text-center flex items-center justify-center bg-gray-50">
        <div>
          <h1 className="text-2xl text-gray-400 mb-4">العمل غير موجود</h1>
          <a href="/gallery" className="inline-block text-sm text-[#B8892A] hover:underline">
            العودة للمعرض
          </a>
        </div>
      </main>
    )
  }

  const art = data as Artwork

  // تجهيز النصوص والألوان
  const levelLabel =
    art.level === 'beginner' ? 'مبتدئ' :
    art.level === 'intermediate' ? 'متوسط' : 'متقدم'

  const levelColor =
    art.level === 'beginner' ? 'bg-green-100 text-green-700' :
    art.level === 'intermediate' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700'

  const typeLabel = 
    art.type === 'image' ? 'صورة' :
    art.type === 'video' ? 'فيديو' :
    art.type === 'design' ? 'تصميم' : 'برومبت'

  const typeColor = 
    art.type === 'image' ? 'bg-amber-100 text-amber-700' :
    art.type === 'video' ? 'bg-green-100 text-green-700' :
    art.type === 'design' ? 'bg-blue-100 text-blue-700' :
    'bg-purple-100 text-purple-700'

  return (
    // الحاوية الرئيسية: شاشة كاملة، توزيع أفقي على الشاشات الكبيرة
    <main className="flex flex-col-reverse md:flex-row h-screen w-full bg-white overflow-hidden" dir="rtl">
      
      {/* --- القسم الأيسر: التفاصيل (يأخذ ثلث المساحة) --- */}
      <div className="w-full md:w-1/3 h-full overflow-y-auto bg-white border-r border-gray-100 z-10 shadow-xl md:shadow-none">
        <div className="p-6 md:p-8 space-y-6 min-h-full flex flex-col">
          
          {/* رأس البطاقة: العنوان والمستوى */}
          <div className="space-y-4">
             <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 leading-tight">
                {art.title}
              </h1>
              <span className={`shrink-0 text-xs px-3 py-1 rounded-full font-medium ${levelColor}`}>
                {levelLabel}
              </span>
            </div>

            {/* الأداة والنوع */}
            <div className="flex items-center gap-3 text-sm flex-wrap">
              <p className="text-gray-500 font-mono bg-gray-100 px-2 py-1 rounded">{art.tool}</p>
              <span className={`px-2 py-1 rounded-md font-medium text-xs ${typeColor}`}>
                {typeLabel}
              </span>
            </div>
          </div>

          <hr className="border-gray-100 my-2" />

          {/* محتوى البرومبت */}
          <div className="flex-1 space-y-6">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <h2 className="text-xs font-bold text-[#B8892A] uppercase tracking-widest mb-3">
                البرومبت (Prompt)
              </h2>
              <p className="text-gray-700 leading-relaxed font-mono text-sm text-left" dir="ltr">
                {art.prompt}
              </p>
            </div>

            {/* الترجمة */}
            {art.prompt_ar && (
              <div className="bg-amber-50/50 border border-[#B8892A]/10 rounded-xl p-5">
                <h2 className="text-xs font-bold text-[#B8892A] uppercase tracking-widest mb-3">
                  الترجمة
                </h2>
                <p className="text-gray-700 leading-relaxed text-sm">
                  {art.prompt_ar}
                </p>
              </div>
            )}
          </div>

          {/* الأزرار في الأسفل */}
          <div className="pt-4 mt-auto flex gap-3">
            <CopyButton prompt={art.prompt} />
            <FavoriteButton artworkId={art.id} />
          </div>
        </div>
      </div>

      {/* --- القسم الأيمن: الوسائط (يأخذ ثلثي المساحة) --- */}
      <div className="w-full md:w-2/3 h-[50vh] md:h-full bg-[#0a0a0a] relative flex items-center justify-center order-1 md:order-2">
        
        {/* 
           الإطار الداخلي:
           يأخذ 90% من العرض و 90% من الارتفاع المتاحين.
           هذا يضمن وجود هامز (Padding) حول الصورة دائماً.
        */}
        <div className="relative w-[90%] h-[90%] flex items-center justify-center">
          
          {/* حالة الفيديو */}
          {art.type === 'video' && art.image_url ? (
            <video 
              src={art.image_url} 
              controls 
              className="max-w-full max-h-full w-auto h-auto object-contain rounded-lg shadow-2xl"
            />
          ) : null}

          {/* حالة الصورة */}
          {art.type !== 'video' && art.image_url ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={art.image_url}
                alt={art.title}
                fill
                className="object-contain" // يضمن ظهور الصورة كاملة داخل الـ 90%
                sizes="(max-width: 768px) 100vw, 66vw"
                priority
              />
            </div>
          ) : null}

          {/* حالة عدم وجود وسائط (Prompt Only) */}
          {!art.image_url && art.type === 'prompt' && (
             <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 text-center border border-slate-700">
               <span className="text-6xl text-[#B8892A] mb-4 opacity-80 animate-pulse">✦</span>
               <span className="text-sm text-gray-400 font-mono uppercase tracking-widest">Prompt Only</span>
             </div>
          )}

          {/* رسالة خطأ أو تحميل */}
          {!art.image_url && art.type !== 'prompt' && (
             <div className="text-gray-500 font-mono text-sm">لا توجد وسائط متاحة</div>
          )}

        </div>
      </div>

    </main>
  )
}