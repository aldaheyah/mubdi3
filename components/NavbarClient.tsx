'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function NavbarClient() {
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <div className="flex items-center gap-6">
      <a href="/studio" className="text-sm text-gray-500 hover:text-[#B8892A] transition-colors font-medium">
        جرّب
      </a>
      <a href="/gallery" className="text-sm text-gray-500 hover:text-[#B8892A] transition-colors font-medium">
        المعرض
      </a>
      <a href="/learn" className="text-sm text-gray-500 hover:text-[#B8892A] transition-colors font-medium">
        تعلّم
      </a>

      {user ? (
        <>
          <a href="/favorites" className="text-sm text-gray-500 hover:text-[#B8892A] transition-colors font-medium">
            ★ المفضلة
          </a>
          <a href="/profile" className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#B8892A] transition-colors">
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="avatar"
                className="w-7 h-7 rounded-full border border-[#B8892A]/30"
              />
            )}
            <span className="font-medium">
              {user.user_metadata?.full_name?.split(' ')[0] || 'حسابي'}
            </span>
          </a>
        </>
      ) : (
        
        <a
          href="/login"
          className="bg-[#B8892A] text-white text-sm px-5 py-1.5 rounded-full hover:bg-amber-600 transition-colors font-medium"
        >
          دخول
        </a>
      )}
    </div>
  )
}
