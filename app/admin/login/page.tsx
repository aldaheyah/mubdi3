'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLogin() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async () => {
    if (!password) { setError('أدخل كلمة المرور'); return }

    setLoading(true)
    setError('')

    const res = await fetch('/api/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    setLoading(false)

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('كلمة المرور غير صحيحة')
    }
  }

  return (
    <main className="min-h-screen bg-[#FAF8F3] flex items-center justify-center p-8">
      <div className="bg-white border border-[#B8892A]/20 rounded-2xl p-8 w-full max-w-sm">

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#B8892A]">✦ مبدع</h1>
          <p className="text-gray-400 text-sm mt-1">لوحة التحكم</p>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-1">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#B8892A]"
              dir="ltr"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="bg-[#B8892A] text-white py-3 rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors disabled:opacity-50 mt-2"
          >
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </div>

      </div>
    </main>
  )
}