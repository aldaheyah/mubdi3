export type Artwork = {
  id: number
  title: string
  tool: string
  type: 'image' | 'video' | 'design' | 'prompt'
  level: 'beginner' | 'intermediate' | 'advanced'
  prompt: string
  prompt_ar: string
  image_url: string | null
  created_at: string
}
  
  export const artworks: Artwork[] = [
    {
      id: 1,
      title: 'قصر في الصحراء الليلية',
      tool: 'Midjourney v6',
      type: 'image',
      level: 'beginner',
      prompt: 'A magnificent Arabian palace rising from moonlit sand dunes, intricate Moorish arches, cinematic wide angle, 8k',
      prompt_ar: 'قصر عربي فخم يرتفع من كثبان رملية مضاءة بضوء القمر',
      image_url: null,
      created_at: '',
    },
    {
      id: 2,
      title: 'خط عربي متحرك',
      tool: 'Runway Gen-3',
      type: 'video',
      level: 'advanced',
      prompt: 'Cinematic animation of golden Arabic calligraphy flowing on deep black background, particle effects, 4K',
      prompt_ar: 'رسوم متحركة سينمائية لخط عربي ذهبي يتدفق على خلفية سوداء',
      image_url: null,
      created_at: '',
    },
    {
      id: 3,
      title: 'هوية بصرية خليجية',
      tool: 'Adobe Firefly',
      type: 'design',
      level: 'intermediate',
      prompt: 'Luxury restaurant logo for Gulf cuisine, calligraphic Arabic lettering, deep teal and gold palette',
      prompt_ar: 'هوية بصرية لمطعم خليجي فاخر بخط عربي وألوان ذهبية',
      image_url: null,
      created_at: '',
    },
  ]
  export type Lesson = {
    id: number
    number: string
    title: string
    description: string
    duration: string
    level: 'beginner' | 'intermediate' | 'advanced'
    tool: string
    content: string
  }
  
  export const lessons: Lesson[] = [
    {
      id: 1,
      number: '٠١',
      title: 'أساسيات كتابة البرومبت',
      description: 'تعلّم المكونات الأربعة لأي برومبت ناجح: الموضوع، الأسلوب، الإضاءة، الجودة',
      duration: '١٥ دقيقة',
      level: 'beginner',
      tool: 'الكل',
      content: `البرومبت الجيد يتكون من أربعة عناصر أساسية:
  
  ١ — الموضوع: ما تريد رؤيته بوضوح
  مثال: "قصر عربي فخم في الصحراء"
  
  ٢ — الأسلوب: كيف تريد أن يبدو
  مثال: "واقعي، سينمائي، أنيمي، مرسوم بالزيت"
  
  ٣ — الإضاءة: مصدر الضوء والمزاج
  مثال: "ضوء ذهبي عند الغروب، إضاءة درامية، ضوء القمر"
  
  ٤ — الجودة: مستوى التفاصيل
  مثال: "8k, ultra-detailed, photorealistic, cinematic"
  
  البرومبت المثالي يجمع الأربعة معاً:
  "A magnificent Arabian palace in the desert, photorealistic style, golden sunset lighting, 8k ultra-detailed"`,
    },
    {
      id: 2,
      number: '٠٢',
      title: 'البرومبت بالعربية والإنجليزية',
      description: 'متى تكتب بالعربية ومتى بالإنجليزية؟ وكيف تدمج الاثنين',
      duration: '٢٠ دقيقة',
      level: 'beginner',
      tool: 'الكل',
      content: `معظم أدوات الذكاء الاصطناعي مدربة على الإنجليزية — لكن هذا لا يعني أن العربية لا تعمل.
  
  متى تستخدم الإنجليزية؟
  - دائماً للوصف التقني والجودة: "photorealistic, 8k, cinematic"
  - للأساليب الفنية: "oil painting, watercolor, anime style"
  - لأسماء الأدوات والمعاملات
  
  متى تستخدم العربية؟
  - لأسماء الأماكن العربية: "مدينة جدة، الكعبة المشرفة"
  - للنصوص داخل الصورة: "اكتب بالعربي: مرحبا"
  - في بعض الأدوات مثل DALL-E 3 التي تدعم العربية جيداً
  
  الأفضل: ادمج الاثنين
  "Arabian palace in Riyadh مع خط عربي كلاسيكي، photorealistic، golden hour، 8k"`,
    },
    {
      id: 3,
      number: '٠٣',
      title: 'Midjourney للمشاهد العربية',
      description: 'معاملات --ar و--style و--chaos للحصول على مشاهد عربية أصيلة',
      duration: '٣٠ دقيقة',
      level: 'intermediate',
      tool: 'Midjourney',
      content: `Midjourney هو الأقوى للمشاهد الواقعية والفنية. إليك المعاملات الأهم:
  
  --ar (نسبة الأبعاد)
  --ar 16:9   ← للمشاهد السينمائية
  --ar 1:1    ← للصور المربعة
  --ar 9:16   ← للستوريز والريلز
  
  --style (الأسلوب البصري)
  --style raw         ← أقل معالجة، أكثر واقعية
  --style cute        ← أسلوب لطيف ومبسط
  
  --chaos (مقدار الإبداع)
  --chaos 0    ← نتيجة قريبة من البرومبت
  --chaos 100  ← نتائج مفاجئة وإبداعية
  
  برومبت عربي مثالي في Midjourney:
  /imagine Arabian desert palace at golden hour, intricate Islamic geometric patterns, cinematic composition --ar 16:9 --style raw --chaos 20`,
    },
    {
      id: 4,
      number: '٠٤',
      title: 'إنتاج الفيديو بـ Runway',
      description: 'من الصورة الساكنة إلى فيديو سينمائي للمحتوى العربي',
      duration: '٤٠ دقيقة',
      level: 'intermediate',
      tool: 'Runway Gen-3',
      content: `Runway Gen-3 يحول صورك إلى فيديو سينمائي. إليك الطريقة:
  
  Image to Video (الأقوى)
  ١ — أنتج صورة جيدة بـ Midjourney أو DALL-E
  ٢ — ارفعها في Runway كـ "Reference Image"
  ٣ — اكتب برومبت الحركة
  
  برومبت الحركة يصف:
  - ما يتحرك: "the fountain water flows gently"
  - حركة الكاميرا: "slow camera push in"
  - المزاج: "cinematic, dreamy atmosphere"
  
  مثال كامل:
  "Slow camera push into the Arabian palace courtyard, fountain water flows gently, golden light shifts softly, cinematic 4K"
  
  نصائح مهمة:
  - الفيديوهات القصيرة (4-8 ثواني) أفضل نتيجة
  - الحركة البطيئة دائماً أجمل من السريعة
  - ابدأ بصورة عالية الجودة للحصول على فيديو أفضل`,
    },
    {
      id: 5,
      number: '٠٥',
      title: 'الخط العربي في الذكاء الاصطناعي',
      description: 'تقنيات متقدمة لدمج الخط العربي في الفن الرقمي',
      duration: '٣٥ دقيقة',
      level: 'advanced',
      tool: 'DALL-E 3',
      content: `الخط العربي تحدٍّ حقيقي لأدوات الذكاء الاصطناعي — لكن هناك تقنيات تنجح:
  
  DALL-E 3 الأفضل للخط العربي
  يدعم النص العربي بشكل أفضل من Midjourney. استخدم:
  "Write in Arabic calligraphy style the word [الكلمة]"
  
  تقنيات تحسين النتيجة:
  ١ — حدد نوع الخط: "Thuluth calligraphy, Naskh style, Diwani script"
  ٢ — حدد الخامة: "golden ink on black, painted on marble"
  ٣ — حدد البيئة: "isolated on white background" للحصول على نص واضح
  
  برومبت ناجح للخط:
  "Elegant Arabic calligraphy of the word بسم الله in Thuluth style, golden ink, black background, ultra-detailed, isolated"
  
  تحذير مهم:
  لا تتوقع دقة 100% في الحروف — دائماً راجع النتيجة وأعد المحاولة إذا كانت الحروف خاطئة`,
    },
    {
      id: 6,
      number: '٠٦',
      title: 'بناء هوية بصرية كاملة',
      description: 'كيف تبني هوية بصرية متكاملة لعلامة تجارية عربية',
      duration: '٤٥ دقيقة',
      level: 'advanced',
      tool: 'Adobe Firefly',
      content: `الهوية البصرية تحتاج اتساقاً — إليك الخطوات الكاملة:
  
  ١ — حدد الشخصية أولاً
  قبل أي برومبت، حدد: فاخر أم شعبي؟ تقليدي أم عصري؟ للشباب أم للعائلات؟
  
  ٢ — اختر لوحة ألوان ثابتة
  مثال للعلامة الخليجية الفاخرة: ذهبي + أسود + أبيض
  اذكر الألوان في كل برومبت: "deep gold #B8892A and black color palette"
  
  ٣ — اللوغو أولاً
  "Minimalist logo for [اسم العلامة] Arabian luxury brand, geometric Islamic pattern integration, gold and black, white background, vector style"
  
  ٤ — طبّق نفس الأسلوب على كل العناصر
  - غلاف السوشيال ميديا
  - بطاقة العمل
  - التغليف
  
  ٥ — استخدم Adobe Firefly للاتساق
  Firefly يسمح لك برفع مرجع بصري والبناء عليه — مثالي لتوحيد الهوية`,
    },
  ]