-- ============================================================
-- R U READY — Addresses Schema
-- รันใน Supabase Dashboard → SQL Editor
-- รันหลังจาก supabase-schema.sql แล้ว
-- ============================================================

-- 1. Addresses table
CREATE TABLE IF NOT EXISTS public.addresses (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label       TEXT        NOT NULL DEFAULT 'บ้าน',   -- e.g. บ้าน, ที่ทำงาน, อื่นๆ
  full_name   TEXT        NOT NULL DEFAULT '',
  phone       TEXT        NOT NULL DEFAULT '',
  address     TEXT        NOT NULL DEFAULT '',
  is_default  BOOLEAN     NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Function: ensure only ONE default per user
--    เมื่อตั้ง is_default = true บน address ใดๆ จะ unset default ของที่อยู่อื่นอัตโนมัติ
CREATE OR REPLACE FUNCTION public.ensure_single_default_address()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.is_default = true THEN
    UPDATE public.addresses
    SET is_default = false
    WHERE user_id = NEW.user_id
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_single_default_address ON public.addresses;
CREATE TRIGGER trg_single_default_address
  AFTER INSERT OR UPDATE OF is_default ON public.addresses
  FOR EACH ROW EXECUTE FUNCTION public.ensure_single_default_address();
