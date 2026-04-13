'use client'

import { useState } from 'react'
import ArtCard from '@/components/ArtCard'
import { Artwork } from '@/data/artworks'

const filters = [
  { value: 'all',    label: 'الكل' },
  { value: 'image',  label: 'صور' },
  { value: 'video',  label: 'فيديو' },
  { value: 'design', label: 'تصاميم' },
  { value: 'prompt', label: 'برومبتات' },
]
export default function GalleryClient({ artworks }: { artworks: Artwork[] }) {
  const [activeFilter, setActiveFilter] = useState('all')

  const filtered = activeFilter === 'all'
    ? artworks
    : artworks.filter((art) => art.type === activeFilter)

  return (
    <div>
      <div className="flex gap-3 mb-8">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setActiveFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeFilter === f.value
                ? 'bg-[#B8892A] text-white'
                : 'bg-white border border-[#B8892A]/30 text-gray-500 hover:border-[#B8892A]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-400 mb-6">{filtered.length} عمل</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filtered.map((art) => (
          <ArtCard
            key={art.id}
            id={art.id}
            title={art.title}
            tool={art.tool}
            type={art.type}
            image_url={art.image_url}
          />
        ))}
      </div>
    </div>
  )
}