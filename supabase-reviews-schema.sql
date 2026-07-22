-- ============================================================
-- R U READY — Product Reviews Schema
-- รันใน Supabase Dashboard → SQL Editor
-- (รันหลัง supabase-products-schema.sql และ supabase-admin-setup.sql)
-- ============================================================

-- 1. Reviews table
CREATE TABLE IF NOT EXISTS public.reviews (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id   UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name  TEXT        NOT NULL DEFAULT '',
  rating       INT         NOT NULL,
  comment      TEXT        DEFAULT '',
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT reviews_rating_chk CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT reviews_one_per_user UNIQUE (product_id, user_id)  -- 1 คน 1 รีวิวต่อสินค้า
);

CREATE INDEX IF NOT EXISTS reviews_product_idx ON public.reviews (product_id);

-- 2. RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- ใครก็อ่านรีวิวได้
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews"
  ON public.reviews FOR SELECT USING (true);

-- ผู้ใช้ที่ล็อกอินเขียนรีวิวของตัวเองได้
DROP POLICY IF EXISTS "Users insert own review" ON public.reviews;
CREATE POLICY "Users insert own review"
  ON public.reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- แก้ไข/ลบรีวิวของตัวเองได้
DROP POLICY IF EXISTS "Users update own review" ON public.reviews;
CREATE POLICY "Users update own review"
  ON public.reviews FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own review" ON public.reviews;
CREATE POLICY "Users delete own review"
  ON public.reviews FOR DELETE USING (auth.uid() = user_id);

-- Admin จัดการรีวิวได้ทั้งหมด (ลบรีวิวสแปม ฯลฯ)
DROP POLICY IF EXISTS "Admin manage reviews" ON public.reviews;
CREATE POLICY "Admin manage reviews"
  ON public.reviews FOR ALL
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- 3. View: ดาวเฉลี่ย + จำนวนรีวิวต่อสินค้า (ใช้โชว์บนการ์ดสินค้า)
CREATE OR REPLACE VIEW public.product_ratings AS
SELECT product_id,
       ROUND(AVG(rating)::numeric, 1) AS avg,
       COUNT(*)::int                  AS count
FROM public.reviews
GROUP BY product_id;

GRANT SELECT ON public.product_ratings TO anon, authenticated;
