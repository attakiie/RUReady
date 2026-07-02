/**
 * PromptPay QR payload generator — EMV QR standard
 * รองรับเบอร์โทรศัพท์ 10 หลัก (0XXXXXXXXX)
 */

function crc16(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  return (crc & 0xffff).toString(16).toUpperCase().padStart(4, "0");
}

function tlv(tag: string, value: string): string {
  return `${tag}${value.length.toString().padStart(2, "0")}${value}`;
}

/**
 * สร้าง PromptPay EMV payload
 * @param phone  เบอร์โทรไทย 10 หลัก เช่น "0812345678"
 * @param amount จำนวนเงิน (บาท) — ถ้าไม่ระบุจะเป็น QR ไม่ล็อคจำนวน
 */
export function buildPromptPayPayload(phone: string, amount?: number): string {
  // normalize: 0812345678 → 0066812345678
  const normalized = "0066" + phone.replace(/^0/, "");

  const merchantInfo =
    tlv("00", "A000000677010111") + tlv("01", normalized);

  let payload =
    tlv("00", "01") +       // Payload format indicator
    tlv("01", "12") +       // Dynamic QR
    tlv("29", merchantInfo) + // Merchant account info
    tlv("53", "764") +      // THB
    (amount != null ? tlv("54", amount.toFixed(2)) : "") +
    tlv("58", "TH") +       // Country code
    "6304";                 // CRC tag + placeholder

  return payload + crc16(payload);
}

/**
 * URL สำหรับ render QR image
 */
export function promptPayQRImageUrl(phone: string, amount?: number): string {
  const payload = buildPromptPayPayload(phone, amount);
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=10&data=${encodeURIComponent(payload)}`;
}
