import type { Metadata } from 'next'
import './globals.css'
import NavbarClient from '@/components/NavbarClient'

export const metadata: Metadata = {
  title: 'مبدع — معرض الذكاء الاصطناعي العربي',
  description: 'أول معرض ذكاء اصطناعي عربي',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#FAF8F3]" style={{ fontFamily: "'Cairo', sans-serif" }}>
        <nav className="sticky top-0 z-50 bg-[#FAF8F3]/90 backdrop-blur border-b border-[#B8892A]/20 px-8 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 group">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <path
                d="M14 2L16.5 9.5L24 9.5L18 14.5L20.5 22L14 17.5L7.5 22L10 14.5L4 9.5L11.5 9.5L14 2Z"
                fill="#B8892A"
                className="group-hover:fill-amber-500 transition-colors"
              />
            </svg>
            <span style={{ fontSize:"40px", fontFamily: "'Cairo', sans-serif" }} className="font-bold text-xl text-[#B8892A] tracking-wide group-hover:text-amber-500 transition-colors">
              مبدع
            </span>
          </a>
          <NavbarClient />
        </nav>
        {children}
      </body>
    </html>
  )
}