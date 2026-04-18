import PromptEditor from '@/components/PromptEditor'

const starterPrompt =
  'Arabian courtyard at sunset, ornate geometric patterns, palm trees, warm golden light, highly detailed'

export default function StudioPage() {
  return (
    <main className="min-h-screen bg-[#FAF8F3]">
      <section className="max-w-6xl mx-auto px-6 md:px-8 py-10 md:py-14 space-y-8">
        <div className="rounded-[2rem] overflow-hidden border border-[#B8892A]/15 bg-gradient-to-br from-[#111111] via-[#1B1408] to-[#3D2A0A] text-white p-6 md:p-10">
          <div className="max-w-3xl space-y-4">
            <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-[#F3D49A]">
              مختبر البرومبتات
            </span>
            <h1 className="text-3xl md:text-5xl font-bold leading-tight">
              جرّب البرومبتات وولّد أكثر من معاينة بأسلوب يناسب فكرتك
            </h1>
            <p className="text-sm md:text-base text-white/70 leading-7 max-w-2xl">
              هذه الصفحة مخصّصة للتجربة السريعة: اكتب البرومبت، اختر النمط البصري، ثم اطلب معاينة واحدة أو عدة معاينات بدون أن تحفظ شيئًا في قاعدة البيانات.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_0.7fr] gap-6 items-start">
          <PromptEditor
            initialPrompt={starterPrompt}
            title="أداة تجربة البرومبت"
            description="عدّل البرومبت بحرية، جرّب أنماطًا مختلفة، وولّد حتى 3 معاينات من نفس النص."
          />

          <aside className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-bold text-[#B8892A] mb-3">اقتراحات سريعة</h2>
              <ul className="space-y-3 text-sm text-gray-600 leading-7">
                <li>ابدأ بوصف المشهد أولًا ثم أضف الإضاءة والأسلوب.</li>
                <li>استخدم النمط السينمائي للمشاهد الدرامية والواقعي للمخرجات الأقرب للتصوير.</li>
                <li>إذا كانت النتيجة مزدحمة، قصّر البرومبت وركّز على عنصر واحد أساسي.</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-[#B8892A]/15 bg-amber-50/50 p-5">
              <h2 className="text-sm font-bold text-[#B8892A] mb-3">أمثلة جاهزة</h2>
              <div className="space-y-3 text-xs text-gray-700 font-mono leading-6" dir="ltr">
                <p>Luxury Arabic perfume bottle, dramatic studio lighting, black marble surface</p>
                <p>Futuristic Riyadh skyline, golden dusk, cinematic atmosphere, ultra detailed</p>
                <p>Minimal Arabic calligraphy poster, elegant texture, premium editorial design</p>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  )
}
