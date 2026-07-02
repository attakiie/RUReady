-- ============================================================
-- R U READY — Products Schema  (v0.18)
-- รันใน Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id           TEXT PRIMARY KEY,
  name_en      TEXT NOT NULL,
  name_th      TEXT NOT NULL,
  desc_en      TEXT DEFAULT '',
  desc_th      TEXT DEFAULT '',
  icon         TEXT DEFAULT '',
  sort_order   INT  DEFAULT 0
);

-- 2. Products
CREATE TABLE IF NOT EXISTS public.products (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT        UNIQUE NOT NULL,
  name_en      TEXT        NOT NULL,
  name_th      TEXT        NOT NULL,
  desc_en      TEXT        DEFAULT '',
  desc_th      TEXT        DEFAULT '',
  price        INT         NOT NULL,
  stock        INT         NOT NULL DEFAULT 0,
  category_id  TEXT        REFERENCES public.categories(id),
  images       TEXT[]      DEFAULT '{}',
  tag          TEXT        DEFAULT '',
  is_active    BOOLEAN     DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public read products"   ON public.products   FOR SELECT USING (is_active = true);

-- 4. Seed Categories
INSERT INTO public.categories (id, name_en, name_th, desc_en, desc_th, icon, sort_order) VALUES
  ('gas',         'Gas',         'Gas',           'High-pressure propellant for GBB pistols',   'แก๊สแรงดันสูงสำหรับปืน GBB',          'Wind',    1),
  ('targets',     'Targets',     'เป้ายิง',       'IPSC-spec steel and popper targets',          'เป้าเหล็กมาตรฐาน IPSC',               'Target',  2),
  ('accessories', 'Accessories', 'อุปกรณ์เสริม', 'Holsters, mag pouches, range gear',           'ซองปืน, ซองแม็ก, อุปกรณ์ประกอบ',      'Layers',  3),
  ('3d-print',    '3D Print',    '3D Print',      'Custom printed parts & accessories',          'ชิ้นส่วนพิมพ์ 3 มิติ',                'Printer', 4)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Products
INSERT INTO public.products (slug, name_en, name_th, desc_en, desc_th, price, stock, category_id, images, tag) VALUES
  (
    'et-1000-green-gas',
    'ET-1000 Green Gas',
    'ET-1000 กรีนแก๊ส',
    'Premium high-pressure green gas for GBB pistols and rifles. Consistent pressure for reliable cycling every time.',
    'กรีนแก๊สแรงดันสูงคุณภาพพรีเมียม เหมาะสำหรับปืน GBB ทุกรุ่น แรงดันสม่ำเสมอ ใช้งานได้ต่อเนื่อง',
    230, 50, 'gas',
    '{"/images/prod-et1000.svg"}',
    'Best Seller'
  ),
  (
    'top-gas-12kg',
    'Top Gas 12kg',
    'ท็อปแก๊ส 12กก.',
    'Large 12kg industrial gas cylinder for refilling GBB magazines. Best value per fill for regular range sessions.',
    'ถังแก๊สขนาดใหญ่ 12กก. สำหรับเติมแม็กปืน GBB ประหยัดกว่ากระป๋องทั่วไป เหมาะสำหรับนักยิงประจำ',
    260, 20, 'gas',
    '{"/images/prod-topgas.svg"}',
    'New'
  ),
  (
    'mini-popper',
    'Mini Popper',
    'มินิป็อปเปอร์',
    'IPSC-spec steel mini popper target with spring-loaded auto-reset mechanism. A-zone clearly marked. Built for competition.',
    'เป้าเหล็ก Mini Popper มาตรฐาน IPSC ระบบ spring reset อัตโนมัติ มีเส้น A-zone ชัดเจน เหมาะสำหรับฝึกซ้อมและแข่งขัน',
    180, 15, 'targets',
    '{"/images/prod-mini-popper-1.jpg", "/images/prod-mini-popper-2.png"}',
    'IPSC'
  )
ON CONFLICT (slug) DO NOTHING;
