-- ============================================================
-- R U READY — Wishlist / รายการโปรด Schema
-- รันใน Supabase Dashboard → SQL Editor
-- (รันหลัง supabase-products-schema.sql และ supabase-admin-setup.sql)
-- ============================================================

-- 1. Wishlist table (1 แถว = 1 สินค้าที่ user กดถูกใจ)
CREATE TABLE IF NOT EXISTS public.wishlist (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id   UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT wishlist_unique UNIQUE (user_id, product_id)  -- กันกดซ้ำ
);

CREATE INDEX IF NOT EXISTS wishlist_user_idx ON public.wishlist (user_id);

-- 2. RLS — ผู้ใช้เห็น/จัดการเฉพาะรายการโปรดของตัวเอง
ALTER TABLE public.wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own wishlist" ON public.wishlist;
CREATE POLICY "Users view own wishlist"
  ON public.wishlist FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users add to own wishlist" ON public.wishlist;
CREATE POLICY "Users add to own wishlist"
  ON public.wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users remove from own wishlist" ON public.wishlist;
CREATE POLICY "Users remove from own wishlist"
  ON public.wishlist FOR DELETE USING (auth.uid() = user_id);
