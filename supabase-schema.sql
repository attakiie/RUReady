-- ============================================================
-- R U READY — Supabase Schema
-- รันใน Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. สร้าง profiles table (เก็บข้อมูลเพิ่มเติมของ user)
CREATE TABLE public.profiles (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name  TEXT        NOT NULL,
  last_name   TEXT        NOT NULL,
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. เปิด Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Policies — user เห็นและแก้ได้แค่ข้อมูลตัวเอง
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. (Optional) ปิด email confirmation ถ้าอยากให้ login ได้ทันทีหลังสมัคร
-- ไปที่ Supabase Dashboard → Authentication → Email → Confirm email → OFF
