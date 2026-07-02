-- ============================================================
-- R U READY — Orders Schema  (v0.19)
-- รันใน Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. Orders table
CREATE TABLE IF NOT EXISTS public.orders (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  status        TEXT        NOT NULL DEFAULT 'pending',
  -- pending | paid | shipped | completed | cancelled
  full_name     TEXT        NOT NULL,
  phone         TEXT        NOT NULL,
  address       TEXT        NOT NULL,
  note          TEXT        DEFAULT '',
  subtotal      INT         NOT NULL,
  shipping      INT         NOT NULL DEFAULT 50,
  total         INT         NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Order items table
CREATE TABLE IF NOT EXISTS public.order_items (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id      UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id    UUID,
  slug          TEXT        NOT NULL,
  name_th       TEXT        NOT NULL,
  name_en       TEXT        NOT NULL,
  price         INT         NOT NULL,
  qty           INT         NOT NULL,
  img           TEXT        DEFAULT ''
);

-- 3. RLS
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Logged-in users can see their own orders
CREATE POLICY "Users can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can insert (guest checkout allowed)
CREATE POLICY "Anyone can place order"
  ON public.orders FOR INSERT
  WITH CHECK (true);

-- Anyone can insert items (linked to order)
CREATE POLICY "Anyone can insert order items"
  ON public.order_items FOR INSERT
  WITH CHECK (true);

-- Logged-in users see their own order items
CREATE POLICY "Users can view own order items"
  ON public.order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );
