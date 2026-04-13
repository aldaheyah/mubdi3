'use client'

export default function CopyButton({ prompt }: { prompt: string }) {
  const handleCopy = () => {
    navigator.clipboard.writeText(prompt)
    alert('تم نسخ البرومبت!')
  }

  return (
    <button
      onClick={handleCopy}
      className="bg-[#B8892A] text-white px-6 py-3 rounded-xl text-sm font-medium cursor-pointer hover:bg-amber-600 transition-colors"
    >
      نسخ البرومبت
    </button>
  )
}