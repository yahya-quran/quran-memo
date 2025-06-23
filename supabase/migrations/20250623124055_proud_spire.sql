/*
  # إنشاء مخطط قاعدة البيانات لمدير جلسات تحفيظ القرآن

  1. الجداول الجديدة
    - `users`
      - `id` (uuid, primary key, references auth.users)
      - `email` (text, unique)
      - `role` (enum: 'teacher' أو 'student')
      - `created_at` (timestamp)
    
    - `sessions`
      - `id` (uuid, primary key)
      - `teacher_id` (uuid, foreign key to users)
      - `title` (text, عنوان الجلسة)
      - `date` (date, تاريخ الجلسة)
      - `created_at` (timestamp)
    
    - `entries`
      - `id` (uuid, primary key)
      - `session_id` (uuid, foreign key to sessions)
      - `user_id` (uuid, foreign key to users)
      - `full_name` (text, الاسم الكامل)
      - `memorization` (text, مجزوء الحفظ)
      - `revision` (text, المراجعة)
      - `stars` (integer, nullable, التقييم بالنجوم)
      - `comments` (text, nullable, ملاحظات المعلم)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. الأمان
    - تفعيل RLS على جميع الجداول
    - إضافة سياسات للمعلمين والطلاب
    - المعلمون: يمكنهم قراءة وتعديل كل شيء
    - الطلاب: يمكنهم قراءة الجلسات وتعديل بياناتهم فقط

  3. الفهارس
    - فهرسة العلاقات الخارجية للأداء الأمثل
*/

-- إنشاء enum لأدوار المستخدمين
CREATE TYPE user_role AS ENUM ('teacher', 'student');

-- جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'student',
  created_at timestamptz DEFAULT now()
);

-- جدول الجلسات
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- جدول الإدخالات
CREATE TABLE IF NOT EXISTS entries (
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

-- تفعيل RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entries ENABLE ROW LEVEL SECURITY;

-- سياسات جدول المستخدمين
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Anyone can insert user data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- سياسات جدول الجلسات
CREATE POLICY "Teachers can manage their sessions"
  ON sessions
  FOR ALL
  TO authenticated
  USING (
    teacher_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'teacher'
    )
  );

CREATE POLICY "Students can read sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (true);

-- سياسات جدول الإدخالات
CREATE POLICY "Teachers can manage all entries"
  ON entries
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'teacher'
    )
  );

CREATE POLICY "Students can read all entries"
  ON entries
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Students can manage own entries"
  ON entries
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- الفهارس للأداء الأمثل
CREATE INDEX IF NOT EXISTS idx_sessions_teacher_id ON sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_entries_session_id ON entries(session_id);
CREATE INDEX IF NOT EXISTS idx_entries_user_id ON entries(user_id);

-- دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تطبيق الدالة على جدول entries
CREATE TRIGGER update_entries_updated_at
    BEFORE UPDATE ON entries
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();