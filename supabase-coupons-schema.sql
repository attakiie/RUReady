-- ============================================================
-- R U READY — Coupons / Discount Codes Schema
-- รันใน Supabase Dashboard → SQL Editor
-- (รันหลัง supabase-orders-schema.sql และ supabase-admin-setup.sql)
-- ============================================================

-- 1. Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  code          TEXT        PRIMARY KEY,          -- เก็บเป็นตัวพิมพ์ใหญ่เสมอ
  type          TEXT        NOT NULL DEFAULT 'fixed',  -- 'fixed' (บาท) | 'percent' (%)
  value         INT         NOT NULL,             -- fixed = บาท, percent = เปอร์เซ็นต์
  min_subtotal  INT         NOT NULL DEFAULT 0,   -- ยอดขั้นต่ำก่อนใช้ได้
  max_discount  INT,                              -- เพดานส่วนลด (เฉพาะ percent, NULL = ไม่จำกัด)
  active        BOOLEAN     NOT NULL DEFAULT true,
  starts_at     TIMESTAMPTZ,                      -- NULL = เริ่มทันที
  expires_at    TIMESTAMPTZ,                      -- NULL = ไม่มีวันหมดอายุ
  usage_limit   INT,                              -- จำนวนครั้งที่ใช้ได้รวม (NULL = ไม่จำกัด)
  used_count    INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT coupons_type_chk  CHECK (type IN ('fixed', 'percent')),
  CONSTRAINT coupons_value_chk CHECK (value > 0)
);

-- 2. เก็บโค้ดที่ใช้กับออเดอร์ (เพื่อรายงาน/กันใช้ซ้ำในอนาคต)
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT DEFAULT '';

-- 3. RLS — ไม่เปิด public SELECT (กันคนไล่เดาโค้ด) ตรวจสอบผ่าน RPC เท่านั้น
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Admin จัดการโค้ดได้ทั้งหมด
DROP POLICY IF EXISTS "Admin can manage coupons" ON public.coupons;
CREATE POLICY "Admin can manage coupons"
  ON public.coupons FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true)
  );

-- 4. ฟังก์ชันตรวจสอบโค้ด (SECURITY DEFINER) — คำนวณส่วนลดฝั่ง server กันการปลอมค่า
CREATE OR REPLACE FUNCTION public.validate_coupon(p_code TEXT, p_subtotal INT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  c    public.coupons;
  disc INT;
BEGIN
  SELECT * INTO c FROM public.coupons WHERE code = upper(trim(p_code));

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_found');
  END IF;
  IF NOT c.active THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'inactive');
  END IF;
  IF c.starts_at IS NOT NULL AND now() < c.starts_at THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'not_started');
  END IF;
  IF c.expires_at IS NOT NULL AND now() > c.expires_at THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'expired');
  END IF;
  IF c.usage_limit IS NOT NULL AND c.used_count >= c.usage_limit THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'used_up');
  END IF;
  IF p_subtotal < c.min_subtotal THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'min_subtotal', 'min', c.min_subtotal);
  END IF;

  IF c.type = 'percent' THEN
    disc := (p_subtotal * c.value) / 100;
    IF c.max_discount IS NOT NULL AND disc > c.max_discount THEN
      disc := c.max_discount;
    END IF;
  ELSE
    disc := c.value;
  END IF;

  IF disc > p_subtotal THEN
    disc := p_subtotal;
  END IF;

  RETURN jsonb_build_object(
    'ok', true, 'discount', disc, 'code', c.code, 'type', c.type, 'value', c.value
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.validate_coupon(TEXT, INT) TO anon, authenticated;

-- 5. ฟังก์ชันบันทึกการใช้โค้ด (เพิ่ม used_count อย่างปลอดภัย) — เรียกหลังสั่งซื้อสำเร็จ
CREATE OR REPLACE FUNCTION public.redeem_coupon(p_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = upper(trim(p_code))
    AND active = true
    AND (usage_limit IS NULL OR used_count < usage_limit);
END;
$$;

GRANT EXECUTE ON FUNCTION public.redeem_coupon(TEXT) TO anon, authenticated;

-- 6. ตัวอย่างโค้ด (ปรับ/ลบได้)
INSERT INTO public.coupons (code, type, value, min_subtotal, active) VALUES
  ('WELCOME50', 'fixed',   50, 300, true),
  ('RUREADY10', 'percent', 10, 500, true)
ON CONFLICT (code) DO NOTHING;
