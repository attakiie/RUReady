-- ============================================================
-- R U READY — Admin & Auth Setup SQL
-- รันใน Supabase Dashboard → SQL Editor
-- รันหลังจากรัน supabase-schema.sql, supabase-products-schema.sql
-- และ supabase-orders-schema.sql แล้ว
-- ============================================================

-- ── 1. Profile Auto-Create Trigger ──────────────────────────
-- สร้าง profile อัตโนมัติเมื่อ user ลงทะเบียน
-- (ไม่ต้องรอ client-side insert ซึ่งถูก RLS block)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, phone)
  VALUES (NEW.id, '', '', '')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- ลบ trigger เดิมก่อน (ถ้ามี) แล้วสร้างใหม่
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. เพิ่ม is_admin Column ในตาราง profiles ──────────────
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_admin BOOLEAN NOT NULL DEFAULT false;


-- ── 3. Admin RLS Policies สำหรับ Orders ────────────────────
-- ให้ admin ดูออเดอร์ทั้งหมดได้ (SELECT)
CREATE POLICY "Admin can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- ให้ admin อัปเดตสถานะออเดอร์ได้ (UPDATE)
CREATE POLICY "Admin can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- ให้ admin ดู order_items ทั้งหมดได้
CREATE POLICY "Admin can view all order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.is_admin = true
    )
  );

-- ให้ admin ดู profiles ทั้งหมดได้
CREATE POLICY "Admin can view all profiles"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles p2
      WHERE p2.id = auth.uid()
        AND p2.is_admin = true
    )
  );


-- ── 4. ตั้ง Admin User ──────────────────────────────────────
-- ** แก้ email ด้านล่างให้ตรงกับ email ที่ใช้ลงทะเบียนบนเว็บ **

UPDATE public.profiles
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users
  WHERE email = 'attakrit.ch@gmail.com'  -- ← แก้ email ตรงนี้
  LIMIT 1
);

-- หรือจะใช้ user id โดยตรงก็ได้:
-- UPDATE public.profiles SET is_admin = true WHERE id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
