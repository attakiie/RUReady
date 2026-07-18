"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRight, CheckCircle, Upload, Loader2, Check, AlertCircle } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { createClient } from "@/app/lib/supabase";

const LINE_OPENCHAT = "https://line.me/ti/g2/eQ6xRJ2zwfCd0W99zlxQhMGkPBi_ZqOzVylHBA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default";

const copy = {
  en: {
    heading: "ORDER PLACED.",
    sub: "We've received your order. Payment will be confirmed shortly.",
    orderId: "Order ID",
    next: "You'll receive a confirmation via LINE or phone once payment is verified.",
    lineLabel: "Stay in the loop",
    lineDesc: "Join our LINE OpenChat for order updates, new arrivals, and range news.",
    lineJoin: "Join LINE OpenChat",
    shopMore: "Continue Shopping",
    account: "View My Orders",
    slipLabel: "Upload payment slip",
    slipDesc: "Attach a screenshot of your transfer so we can confirm it faster.",
    slipChoose: "Choose image",
    slipUpload: "Upload",
    slipUploading: "Uploading...",
    slipDone: "Slip received — we'll verify it shortly.",
    slipError: "Upload failed. Please try again or send it via LINE.",
  },
  th: {
    heading: "สั่งซื้อแล้ว.",
    sub: "ได้รับออเดอร์ของคุณแล้ว เราจะยืนยันการชำระเงินเร็วๆ นี้",
    orderId: "หมายเลขออเดอร์",
    next: "เราจะแจ้งยืนยันผ่าน LINE หรือโทรศัพท์หลังตรวจสอบการโอนเงิน",
    lineLabel: "ติดตามข่าวสาร",
    lineDesc: "เข้าร่วม LINE OpenChat เพื่อรับแจ้งสถานะออเดอร์ สินค้าใหม่ และข่าวสนาม",
    lineJoin: "เข้าร่วม LINE OpenChat",
    shopMore: "ซื้อสินค้าต่อ",
    account: "ดูออเดอร์ของฉัน",
    slipLabel: "แนบสลิปการโอนเงิน",
    slipDesc: "แนบรูปสลิปโอนเงิน เพื่อให้เราตรวจสอบและยืนยันได้เร็วขึ้น",
    slipChoose: "เลือกรูปภาพ",
    slipUpload: "อัปโหลด",
    slipUploading: "กำลังอัปโหลด...",
    slipDone: "ได้รับสลิปแล้ว เราจะตรวจสอบให้เร็วๆ นี้",
    slipError: "อัปโหลดไม่สำเร็จ ลองใหม่อีกครั้ง หรือส่งทาง LINE แทน",
  },
};

function SuccessContent() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id") ?? "—";
  const shortId = orderId.slice(0, 8).toUpperCase();
  const hasOrder = orderId !== "—";

  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [slipStatus, setSlipStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");

  async function handleSlipUpload() {
    if (!slipFile || !hasOrder) return;
    setSlipStatus("uploading");
    const supabase = createClient();
    const path = `${orderId}/${Date.now()}-${slipFile.name}`;

    const { error: uploadError } = await supabase.storage
      .from("payment-slips")
      .upload(path, slipFile);

    if (uploadError) {
      setSlipStatus("error");
      return;
    }

    const { error: rpcError } = await supabase.rpc("attach_payment_slip", {
      p_order_id: orderId,
      p_slip_path: path,
    });

    if (rpcError) {
      setSlipStatus("error");
      return;
    }

    setSlipStatus("done");
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4 py-24">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 border border-[#2e5a2e] bg-[#0d150d] flex items-center justify-center">
            <CheckCircle size={36} className="text-[#4ade80]" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-[clamp(48px,10vw,80px)] leading-none text-[#F5F5F5] mb-4"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          {t.heading}
        </h1>
        <p className="text-[#A5A5A5] mb-8">{t.sub}</p>

        {/* Order ID */}
        <div className="bg-[#1A1A1C] border border-[#2B2B2E] px-6 py-4 mb-6">
          <p className="text-[#555] text-xs uppercase tracking-widest mb-1">{t.orderId}</p>
          <p className="text-[#F5F5F5] font-mono font-bold text-lg tracking-widest">#{shortId}</p>
        </div>

        <p className="text-[#555] text-sm mb-8 leading-relaxed">{t.next}</p>

        {/* Payment slip upload */}
        {hasOrder && (
          <div className="bg-[#1A1A1C] border border-[#2B2B2E] px-6 py-5 mb-6 text-left">
            <p className="text-[#555] text-xs uppercase tracking-widest mb-1">{t.slipLabel}</p>
            <p className="text-[#A5A5A5] text-sm mb-3">{t.slipDesc}</p>

            {slipStatus === "done" ? (
              <div className="flex items-center gap-2 text-[#4ade80] text-sm">
                <Check size={16} /> {t.slipDone}
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <label className="flex-1 flex items-center gap-2 border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5] text-xs font-semibold px-4 py-2.5 tracking-widest uppercase cursor-pointer transition-colors">
                  <Upload size={14} />
                  {slipFile ? slipFile.name : t.slipChoose}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      setSlipStatus("idle");
                      setSlipFile(e.target.files?.[0] ?? null);
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={handleSlipUpload}
                  disabled={!slipFile || slipStatus === "uploading"}
                  className="flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-40 disabled:cursor-not-allowed text-[#F5F5F5] text-xs font-semibold px-5 py-2.5 tracking-widest uppercase transition-colors"
                >
                  {slipStatus === "uploading" ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    t.slipUpload
                  )}
                </button>
              </div>
            )}

            {slipStatus === "error" && (
              <div className="flex items-center gap-2 text-[#D32F3A] text-xs mt-3">
                <AlertCircle size={12} /> {t.slipError}
              </div>
            )}
          </div>
        )}

        {/* LINE OpenChat CTA */}
        <div className="bg-[#1A1A1C] border border-[#2B2B2E] px-6 py-5 mb-10 text-left">
          <p className="text-[#555] text-xs uppercase tracking-widest mb-1">{t.lineLabel}</p>
          <p className="text-[#A5A5A5] text-sm mb-3">{t.lineDesc}</p>
          <a
            href={LINE_OPENCHAT}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 border border-[#06C755]/40 hover:border-[#06C755] text-[#06C755] text-xs font-semibold px-4 py-2 tracking-widest uppercase transition-colors duration-200"
          >
            {t.lineJoin}
          </a>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/shop"
            className="inline-flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] font-semibold text-sm px-6 py-3 tracking-widest uppercase transition-colors">
            {t.shopMore} <ArrowRight size={14} />
          </Link>
          <Link href="/account"
            className="inline-flex items-center justify-center gap-2 border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5] font-semibold text-sm px-6 py-3 tracking-widest uppercase transition-colors">
            {t.account}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0F0F10]" />}>
      <SuccessContent />
    </Suspense>
  );
}
