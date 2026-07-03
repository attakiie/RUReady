-- ============================================================
-- R U READY — Stock Deduction System
-- รันใน Supabase Dashboard → SQL Editor
-- รันหลังจาก supabase-schema.sql แล้ว
-- ============================================================

-- 1. Function: ตัดสต็อกเมื่อ INSERT order_item
--    เมื่อสร้าง order_item ใหม่ จะลด stock ของสินค้าทันที
CREATE OR REPLACE FUNCTION public.deduct_stock_on_order()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Check stock availability
  IF (SELECT stock FROM public.products WHERE id = NEW.product_id) < NEW.qty THEN
    RAISE EXCEPTION 'สินค้าไม่เพียงพอ: product_id=%, มีสต็อก=%, ต้องการ=%',
      NEW.product_id,
      (SELECT stock FROM public.products WHERE id = NEW.product_id),
      NEW.qty;
  END IF;

  -- Deduct stock
  UPDATE public.products
  SET stock = stock - NEW.qty
  WHERE id = NEW.product_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_deduct_stock ON public.order_items;
CREATE TRIGGER trg_deduct_stock
  BEFORE INSERT ON public.order_items
  FOR EACH ROW EXECUTE FUNCTION public.deduct_stock_on_order();

-- 2. Function: คืนสต็อกเมื่อ order ถูกยกเลิก (status → 'cancelled')
--    เรียกใช้เมื่ออัปเดต order status เป็น cancelled
CREATE OR REPLACE FUNCTION public.restore_stock_on_cancel()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Only restore when status changes TO cancelled FROM a non-cancelled state
  IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
    UPDATE public.products p
    SET stock = p.stock + oi.qty
    FROM public.order_items oi
    WHERE oi.order_id = NEW.id
      AND oi.product_id = p.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_restore_stock_on_cancel ON public.orders;
CREATE TRIGGER trg_restore_stock_on_cancel
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.restore_stock_on_cancel();

-- 3. View: สินค้าที่ใกล้หมด (stock <= 5)
CREATE OR REPLACE VIEW public.low_stock_products AS
  SELECT id, name_en, name_th, slug, stock, price
  FROM public.products
  WHERE stock <= 5
  ORDER BY stock ASC;

-- =========================================================
-- วิธีทดสอบ:
-- SELECT * FROM public.products WHERE id = '<product_id>';
-- จากนั้น INSERT order_item แล้วตรวจว่า stock ลดลง
-- =========================================================
