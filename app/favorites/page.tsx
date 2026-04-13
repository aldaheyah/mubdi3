'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Artwork } from '@/data/artworks'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Favorites() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data } = await supabase
        .from('favorites')
        .select('artwork_id, artworks(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (data) {
        setArtworks(data.map((f: any) => f.artworks))
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">جارٍ التحميل...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 max-w-5xl mx-auto">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#B8892A]">المفضلة</h1>
          <p className="text-gray-400 text-sm mt-1">{artworks.length} برومبت محفوظ</p>
        </div>
        <Link href="/gallery" className="text-sm text-[#B8892A] hover:underline">
          استكشف المزيد
        </Link>
      </div>

      {artworks.length === 0 ? (
        <div className="text-center py-24">
          <div className="text-5xl mb-4">☆</div>
          <h2 className="text-xl font-semibold text-gray-600 mb-2">لا يوجد شيء هنا بعد</h2>
          <p className="text-gray-400 text-sm mb-6">احفظ البرومبتات التي تعجبك من المعرض</p>
          <Link href="/gallery"
            className="bg-[#B8892A] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-amber-600 transition-colors">
            اذهب للمعرض
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {artworks.map((art) => (
            <Link key={art.id} href={`/gallery/${art.id}`}>
              <div className="bg-white rounded-xl border border-[#B8892A]/20 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">

                <div className="aspect-[4/3] bg-amber-50 relative overflow-hidden">
                  {art.image_url ? (
                    <Image src={art.image_url} alt={art.title} fill className="object-cover" />
                  ) : art.type === 'prompt' ? (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-50 to-purple-100">
                      <span className="text-4xl text-purple-300">✦</span>
                    </div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-gray-300 text-sm">لا توجد صورة</span>
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-gray-800 truncate">{art.title}</h3>
                  <p className="text-xs text-gray-400 font-mono mt-1 line-clamp-2" dir="ltr">
                    {art.prompt}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-300 font-mono">{art.tool}</span>
                    <span className="text-xs text-[#B8892A]">★ محفوظ</span>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      )}

    </main>
  )
}