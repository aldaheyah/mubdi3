'use client'

import { useState, useEffect, useCallback } from 'react'
import { Artwork } from '@/data/artworks'
import Image from 'next/image'
import Link from 'next/link'

export default function HomeClient({ artworks }: { artworks: Artwork[] }) {
  const [current, setCurrent] = useState(0)
  const [animating, setAnimating] = useState(false)

  const goTo = useCallback((index: number) => {
    if (animating) return
    setAnimating(true)
    setTimeout(() => {
      setCurrent(index)
      setAnimating(false)
    }, 300)
  }, [animating])

  const next = useCallback(() => {
    goTo((current + 1) % artworks.length)
  }, [current, artworks.length, goTo])

  const prev = useCallback(() => {
    goTo((current - 1 + artworks.length) % artworks.length)
  }, [current, artworks.length, goTo])

  // تشغيل تلقائي كل 4 ثواني
  useEffect(() => {
    if (artworks.length === 0) return
    const timer = setInterval(next, 4000)
    return () => clearInterval(timer)
  }, [next, artworks.length])

  if (artworks.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">لا توجد أعمال بعد</p>
      </main>
    )
  }

  const art = artworks[current]

  return (
    <main className="min-h-screen">

      {/* Hero Slider */}
      <section className="relative h-[85vh] overflow-hidden bg-[#0C0A08]">

        {/* الصورة الخلفية */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${animating ? 'opacity-0' : 'opacity-100'}`}>
          {art.image_url ? (
            <Image
              src={art.image_url}
              alt={art.title}
              fill
              className="object-cover opacity-60"
              priority
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-amber-900/30 to-black" />
          )}
          {/* تدرج من الأسفل */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0A08] via-[#0C0A08]/40 to-transparent" />
        </div>

        {/* المحتوى */}
        <div className={`absolute bottom-0 right-0 left-0 p-8 md:p-16 transition-all duration-500 ${animating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>

          {/* Tag */}
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-[#B8892A]/80 text-white text-xs px-3 py-1 rounded-full font-medium backdrop-blur">
              {art.type === 'image' ? 'صورة' : art.type === 'video' ? 'فيديو' : 'تصميم'}
            </span>
            <span className="text-gray-400 text-xs font-mono">{art.tool}</span>
          </div>

          {/* العنوان */}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 max-w-2xl leading-tight">
            {art.title}
          </h1>

          {/* البرومبت */}
          <p className="text-gray-400 text-sm font-mono max-w-xl mb-6 line-clamp-2" dir="ltr">
            {art.prompt}
          </p>

          {/* الأزرار */}
          <div className="flex gap-3 flex-wrap">
            <Link
              href={`/gallery/${art.id}`}
              className="bg-[#B8892A] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-amber-600 transition-colors"
            >
              عرض البرومبت
            </Link>
            <Link
              href="/gallery"
              className="border border-white/30 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-white/10 transition-colors backdrop-blur"
            >
              استكشف المعرض
            </Link>
          </div>

        </div>

        {/* أزرار التنقل */}
        <button
          onClick={prev}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          &#8250;
        </button>
        <button
          onClick={next}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          &#8249;
        </button>

        {/* النقاط */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {artworks.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`rounded-full transition-all ${
                i === current
                  ? 'w-6 h-2 bg-[#B8892A]'
                  : 'w-2 h-2 bg-white/30 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* العداد */}
        <div className="absolute top-6 left-8 text-white/40 text-sm font-mono">
          {String(current + 1).padStart(2, '0')} / {String(artworks.length).padStart(2, '0')}
        </div>

      </section>

      {/* Stats */}
      <section className="bg-[#FAF8F3] border-b border-[#B8892A]/10">
        <div className="max-w-4xl mx-auto px-8 py-8 grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-[#B8892A]">{artworks.length}+</div>
            <div className="text-xs text-gray-400 mt-1">عمل فني</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#B8892A]">6+</div>
            <div className="text-xs text-gray-400 mt-1">درس تعليمي</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-[#B8892A]">5+</div>
            <div className="text-xs text-gray-400 mt-1">أداة ذكاء اصطناعي</div>
          </div>
        </div>
      </section>

      {/* أحدث الأعمال */}
      <section className="max-w-6xl mx-auto px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">أحدث الأعمال</h2>
          <Link href="/gallery" className="text-sm text-[#B8892A] hover:underline">
            عرض الكل
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {artworks.slice(0, 6).map((a) => (
            <Link key={a.id} href={`/gallery/${a.id}`}>
              <div className="rounded-xl overflow-hidden border border-[#B8892A]/10 hover:shadow-lg hover:-translate-y-1 transition-all bg-white">
                <div className="aspect-[4/3] relative bg-amber-50">
                  {a.image_url ? (
                    <Image src={a.image_url} alt={a.title} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
                      لا صورة
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-gray-800 truncate">{a.title}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-0.5">{a.tool}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-[#0C0A08] py-16 text-center px-8">
      <h2 className="text-3xl font-bold text-white mb-3">
  ابدأ رحلتك مع{' '}
  <span className="text-[#B8892A] inline-flex items-center gap-1">
    <svg width="20" height="20" viewBox="0 0 28 28" fill="none" className="inline">
      <path d="M14 2L16.5 9.5L24 9.5L18 14.5L20.5 22L14 17.5L7.5 22L10 14.5L4 9.5L11.5 9.5L14 2Z" fill="#B8892A"/>
    </svg>
    مبدع
  </span>
</h2>
        <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
          تعلّم كيف تنتج أعمالاً فنية احترافية بالذكاء الاصطناعي مع هوية عربية أصيلة
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/learn" className="bg-[#B8892A] text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-amber-600 transition-colors">
            ابدأ التعلم مجاناً
          </Link>
          <Link href="/gallery" className="border border-white/20 text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
            استكشف المعرض
          </Link>
        </div>
      </section>

    </main>
  )
}