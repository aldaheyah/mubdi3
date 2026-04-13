import { lessons } from '@/data/artworks'
import Link from 'next/link'

type Props = {
  params: Promise<{ id: string }>
}

export default async function LessonDetail({ params }: Props) {
  const { id } = await params
  const lesson = lessons.find((l) => l.id === Number(id))

  if (!lesson) {
    return (
      <main className="min-h-screen p-8 text-center">
        <h1 className="text-2xl text-gray-400">الدرس غير موجود</h1>
        <Link href="/learn" className="inline-block mt-4 text-sm text-[#B8892A]">
          العودة للدروس
        </Link>
      </main>
    )
  }

  const levelLabel =
    lesson.level === 'beginner' ? 'مبتدئ' :
    lesson.level === 'intermediate' ? 'متوسط' : 'متقدم'

  const levelColor =
    lesson.level === 'beginner' ? 'bg-green-100 text-green-700' :
    lesson.level === 'intermediate' ? 'bg-amber-100 text-amber-700' :
    'bg-red-100 text-red-700'

  return (
    <main className="min-h-screen p-8 max-w-2xl mx-auto">

      {/* رأس الدرس */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="font-mono text-xs text-gray-300">{lesson.number}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${levelColor}`}>
            {levelLabel}
          </span>
          <span className="text-xs text-gray-300">⏱ {lesson.duration}</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">{lesson.title}</h1>
        <p className="text-gray-400">{lesson.description}</p>
      </div>

      {/* الأداة */}
      <div className="bg-amber-50 border border-[#B8892A]/20 rounded-xl px-4 py-3 mb-8 flex items-center gap-2">
        <span className="text-xs text-gray-400">الأداة المستخدمة:</span>
        <span className="text-sm font-mono font-medium text-[#B8892A]">{lesson.tool}</span>
      </div>

      {/* المحتوى */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 mb-8">
        {lesson.content.split('\n\n').map((paragraph, i) => (
          <div key={i} className="mb-5 last:mb-0">
            {paragraph.startsWith('//') ? (
              <pre className="bg-gray-50 rounded-lg p-4 text-sm font-mono text-gray-600 text-left overflow-x-auto" dir="ltr">
                {paragraph.replace('//', '').trim()}
              </pre>
            ) : (
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                {paragraph}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* التنقل بين الدروس */}
      <div className="flex justify-between items-center">
        {lesson.id > 1 ? (
          <Link href={`/learn/${lesson.id - 1}`}
            className="text-sm text-gray-400 hover:text-[#B8892A] transition-colors">
            الدرس السابق
          </Link>
        ) : <div />}

        {lesson.id < lessons.length ? (
          <Link href={`/learn/${lesson.id + 1}`}
            className="bg-[#B8892A] text-white px-5 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors">
            الدرس التالي
          </Link>
        ) : (
          <Link href="/gallery"
            className="bg-[#B8892A] text-white px-5 py-2 rounded-lg text-sm hover:bg-amber-600 transition-colors">
            اذهب للمعرض
          </Link>
        )}
      </div>

    </main>
  )
}