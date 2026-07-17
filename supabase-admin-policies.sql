-- ============================================================
-- R U READY — Admin Policies + Tracking Number
-- รันใน Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. เพิ่ม tracking_number ใน orders table
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tracking_number TEXT DEFAULT '';

-- 2. Admin: ดูออเดอร์ทั้งหมด (ไม่ใช่แค่ของตัวเอง)
DROP POLICY IF EXISTS "Admin can view all orders" ON public.orders;
CREATE POLICY "Admin can view all orders"
  ON public.orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 3. Admin: อัปเดต orders (status + tracking_number)
DROP POLICY IF EXISTS "Admin can update orders" ON public.orders;
CREATE POLICY "Admin can update orders"
  ON public.orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 4. Admin: จัดการ order_items (ดูได้ทั้งหมด)
DROP POLICY IF EXISTS "Admin can view all order items" ON public.order_items;
CREATE POLICY "Admin can view all order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- 5. Admin: จัดการ products ทั้งหมด (INSERT, UPDATE, DELETE)
DROP POLICY IF EXISTS "Admin can manage products" ON public.products;
CREATE POLICY "Admin can manage products"
  ON public.products FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.is_admin = true
    )
  );

-- ============================================================
-- หลังรัน SQL นี้แล้ว admin จะ:
--   ✓ เห็นออเดอร์ทั้งหมด (ไม่ใช่แค่ของตัวเอง)
--   ✓ อัปเดต status + tracking_number ได้
--   ✓ เพิ่ม/แก้ไข/ลบสินค้าได้จาก UI
-- ============================================================
