# دار داركوم – مدير جلسات تحفيظ القرآن

تطبيق ويب حديث لإدارة جلسات تحفيظ القرآن الكريم مبني بـ React و Supabase، مع واجهة عربية كاملة ونظام أدوار متقدم.

## المميزات الرئيسية

### 🔐 نظام المصادقة والأدوار
- **المعلمون**: إنشاء الجلسات، تقييم الطلاب، تصدير التقارير
- **الطلاب**: الانضمام للجلسات، تسجيل الحفظ والمراجعة
- مصادقة آمنة عبر Supabase Auth

### 📚 إدارة الجلسات
- إنشاء جلسات تحفيظ جديدة
- تتبع الحفظ والمراجعة لكل طالب
- نظام تقييم بالنجوم (1-5)
- إضافة ملاحظات تفصيلية

### 🎨 التصميم والواجهة
- واجهة عربية كاملة مع دعم RTL
- تصميم احترافي بألوان ذهبية أنيقة
- خطوط عربية مميزة (أميري، تجوال)
- تصميم متجاوب لجميع الأجهزة

### 📄 تصدير التقارير
- تصدير تقارير PDF باللغة العربية
- تضمين جميع بيانات الطلاب والتقييمات
- أسماء ملفات ذكية بالتاريخ والعنوان

## التقنيات المستخدمة

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **State Management**: Zustand
- **Routing**: React Router v6
- **PDF Export**: jsPDF + html2canvas
- **Icons**: Lucide React

## إعداد المشروع

### 1. إعداد Supabase

1. قم بإنشاء مشروع جديد على [Supabase](https://supabase.com)
2. انسخ URL المشروع و Anon Key
3. أنشئ ملف `.env` وأضف:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. إنشاء قاعدة البيانات

في SQL Editor على Supabase، قم بتشغيل الكود التالي:

```sql
-- إنشاء enum لأدوار المستخدمين
CREATE TYPE user_role AS ENUM ('teacher', 'student');

-- جدول المستخدمين
CREATE TABLE users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

-- جدول الجلسات
CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- جدول الإدخالات
CREATE TABLE entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  memorization text DEFAULT '',
  revision text DEFAULT '',
  stars integer CHECK (stars >= 1 AND stars <= 5),
  comments text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- تفعيل Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- إضافة السياسات (policies)...
```

### 3. تشغيل التطبيق محلياً

```bash
# تثبيت المتطلبات
npm install

# تشغيل الخادم المحلي
npm run dev
```

### 4. البناء للإنتاج

```bash
# بناء التطبيق
npm run build

# معاينة البناء
npm run preview
```

## النشر

### Vercel
1. ادفع الكود إلى GitHub
2. اربط المستودع مع Vercel
3. أضف متغيرات البيئة في إعدادات Vercel
4. انشر التطبيق

### Netlify
1. اربط المستودع مع Netlify
2. اضبط Build Command: `npm run build`
3. اضبط Publish Directory: `dist`
4. أضف متغيرات البيئة
5. انشر التطبيق

## الاستخدام

### للمعلمين
1. أنشئ حساباً جديداً واختر "معلم"
2. أنشئ جلسة جديدة من لوحة التحكم
3. شارك رابط الجلسة مع الطلاب
4. قيّم الطلاب وأضف الملاحظات
5. صدّر التقرير النهائي بصيغة PDF

### للطلاب
1. أنشئ حساباً واختر "طالب"
2. انضم للجلسة باستخدام الرابط
3. أدخل اسمك الكامل
4. سجّل الحفظ والمراجعة
5. اطلع على تقييم المعلم وملاحظاته

## المساهمة

نرحب بالمساهمات! يرجى:
1. فرك المستودع (Fork)
2. أنشئ فرعاً للميزة الجديدة
3. اكتب كوداً نظيفاً ومعلقاً
4. اختبر التغييرات
5. أرسل Pull Request

## الترخيص

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## الدعم

للدعم الفني أو الاستفسارات، يرجى فتح issue في GitHub أو التواصل معنا.

---

**دار داركوم** - تطوير حلول تقنية لخدمة القرآن الكريم 🕌# quran-memo
