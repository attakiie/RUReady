-- ============================================================
-- R U READY — แจ้งเตือนออเดอร์ใหม่เข้า Telegram อัตโนมัติ
-- ============================================================
-- วิธีนี้ใช้ pg_net (Supabase มีให้อยู่แล้ว) ยิง Telegram Bot API
-- ตรงจากฐานข้อมูล เมื่อมีแถวใหม่เข้าตาราง orders
--
-- ── สิ่งที่ต้องทำก่อนรัน SQL นี้ ──────────────────────────
-- 1) เปิด Telegram → คุยกับ @BotFather → /newbot → ตั้งชื่อบอท
--    จะได้ "Bot Token" หน้าตาเช่น  123456789:AAABBBCCC...
-- 2) หา Chat ID ที่จะให้บอทส่งข้อความไปหา:
--    • ส่วนตัว: คุยกับบอท (พิมพ์อะไรก็ได้) แล้วเปิด
--      https://api.telegram.org/bot<TOKEN>/getUpdates
--      ดูค่า "chat":{"id": <ตรงนี้> }
--    • กลุ่ม: สร้างกลุ่ม เพิ่มบอทเข้ากลุ่ม พิมพ์ข้อความในกลุ่ม
--      แล้วเปิด getUpdates เหมือนกัน (chat id ของกลุ่มจะติดลบ)
-- 3) เอา TOKEN และ CHAT_ID มาแทนค่าด้านล่าง แล้วรัน SQL นี้
-- ============================================================

-- เปิด extension pg_net (ยิง HTTP จาก Postgres)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ฟังก์ชัน trigger: ยิงข้อความเข้า Telegram เมื่อมีออเดอร์ใหม่
CREATE OR REPLACE FUNCTION public.notify_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bot_token TEXT := 'PASTE_YOUR_BOT_TOKEN_HERE';   -- ← ใส่ Bot Token
  chat_id   TEXT := 'PASTE_YOUR_CHAT_ID_HERE';      -- ← ใส่ Chat ID
  msg       TEXT;
BEGIN
  msg :=
    E'🛒 ออเดอร์ใหม่!\n' ||
    '👤 ' || COALESCE(NEW.full_name, '-') || E'\n' ||
    '📞 ' || COALESCE(NEW.phone, '-') || E'\n' ||
    '💰 รวม ฿' || COALESCE(NEW.total, 0) ||
    CASE WHEN COALESCE(NEW.coupon_code, '') <> '' THEN ' (โค้ด ' || NEW.coupon_code || ')' ELSE '' END || E'\n' ||
    '📍 ' || COALESCE(NEW.address, '-') ||
    CASE WHEN COALESCE(NEW.note, '') <> '' THEN E'\n📝 ' || NEW.note ELSE '' END;

  PERFORM net.http_post(
    url     := 'https://api.telegram.org/bot' || bot_token || '/sendMessage',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body    := jsonb_build_object('chat_id', chat_id, 'text', msg)
  );

  RETURN NEW;
END;
$$;

-- ผูก trigger กับตาราง orders (ยิงหลัง INSERT)
DROP TRIGGER IF EXISTS on_new_order_notify ON public.orders;
CREATE TRIGGER on_new_order_notify
  AFTER INSERT ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.notify_new_order();

-- ============================================================
-- ทดสอบ: ลองสั่งซื้อ 1 ออเดอร์บนเว็บ → บอทควรเด้งข้อความเข้ามา
-- ถ้าไม่เข้า ให้เช็ค:
--   • TOKEN / CHAT_ID ถูกต้องไหม
--   • ได้ทักบอท / เพิ่มบอทเข้ากลุ่มแล้วหรือยัง
-- ============================================================
