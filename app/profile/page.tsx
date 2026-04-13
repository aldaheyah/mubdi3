'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Profile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">جارٍ التحميل...</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">

      <h1 className="text-3xl font-bold text-[#B8892A] mb-8">ملفي الشخصي</h1>

      <div className="bg-white border border-[#B8892A]/20 rounded-2xl p-6">

        {/* معلومات المستخدم */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          {user?.user_metadata?.avatar_url && (
            <div className="w-16 h-16 rounded-full overflow-hidden relative flex-shrink-0">
              <Image
                src={user.user_metadata.avatar_url}
                alt="avatar"
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <h2 className="font-bold text-gray-800 text-lg">
              {user?.user_metadata?.full_name || 'مستخدم'}
            </h2>
            <p className="text-gray-400 text-sm">{user?.email}</p>
          </div>
        </div>

        {/* إحصائيات */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#B8892A]">0</div>
            <div className="text-xs text-gray-400 mt-1">برومبت محفوظ</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#B8892A]">0</div>
            <div className="text-xs text-gray-400 mt-1">درس مكتمل</div>
          </div>
          <div className="bg-amber-50 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-[#B8892A]">مجاني</div>
            <div className="text-xs text-gray-400 mt-1">نوع الحساب</div>
          </div>
        </div>

        {/* زر الخروج */}
        <button
          onClick={handleLogout}
          className="w-full border border-red-200 text-red-400 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors"
        >
          تسجيل الخروج
        </button>

      </div>

    </main>
  )
}