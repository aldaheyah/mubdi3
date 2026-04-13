import Image from 'next/image'

type ArtCardProps = {
  id: number
  title: string
  tool: string
  type: 'image' | 'video' | 'design' | 'prompt'
  image_url: string | null
}

export default function ArtCard({ id, title, tool, type, image_url }: ArtCardProps) {
  const typeLabel =
    type === 'image' ? 'صورة' :
    type === 'video' ? 'فيديو' :
    type === 'design' ? 'تصميم' : 'برومبت'

  const typeColor =
    type === 'image' ? 'bg-amber-100 text-amber-700' :
    type === 'video' ? 'bg-green-100 text-green-700' :
    type === 'design' ? 'bg-blue-100 text-blue-700' :
    'bg-purple-100 text-purple-700'

  return (
    <a href={`/gallery/${id}`} className="block">
      <div className="bg-white rounded-xl border border-[#B8892A]/20 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all">

        <div className="aspect-[4/3] bg-amber-50 relative overflow-hidden">
          {image_url ? (
            <Image src={image_url} alt={title} fill className="object-cover" />
          ) : type === 'prompt' ? (
            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-50 to-purple-100">
              <span className="text-4xl">✦</span>
              <span className="text-xs text-purple-400 font-mono">prompt</span>
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <span className="text-gray-300 text-sm">لا توجد صورة</span>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400 font-mono">{tool}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${typeColor}`}>{typeLabel}</span>
          </div>
        </div>

      </div>
    </a>
  )
}