'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function FavoriteButton({ artworkId }: { artworkId: number }) {
  const [isFav, setIsFav] = useState(false)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)

      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('artwork_id', artworkId)
        .single()

      setIsFav(!!data)
    }
    init()
  }, [artworkId])

  const toggle = async () => {
    if (!userId) {
      window.location.href = '/login'
      return
    }

    setLoading(true)

    if (isFav) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', userId)
        .eq('artwork_id', artworkId)
      setIsFav(false)
    } else {
      await supabase
        .from('favorites')
        .insert([{ user_id: userId, artwork_id: artworkId }])
      setIsFav(true)
    }

    setLoading(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${
        isFav
          ? 'bg-amber-50 border-[#B8892A] text-[#B8892A]'
          : 'bg-white border-gray-200 text-gray-400 hover:border-[#B8892A] hover:text-[#B8892A]'
      }`}
    >
      {isFav ? '★ محفوظ' : '☆ حفظ في المفضلة'}
    </button>
  )
}