"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const copy = {
  en: {
    back: "Back",
    eyebrow: "FAQ",
    title: "QUESTIONS",
    items: [
      {
        q: "What gas do you sell?",
        a: "We carry TOPGAS 12KG green gas (HFC-134a) and ET-1000 CO₂ cartridges — both widely used in Action Air and IPSC competitions.",
      },
      {
        q: "Do you ship nationwide?",
        a: "Yes. We ship all over Thailand via Kerry / Flash Express. Shipping is ฿50 for the first item and ฿30 for each additional item.",
      },
      {
        q: "How long does delivery take?",
        a: "Bangkok & surrounding areas: 1–2 business days. Provincial areas: 2–4 business days. Orders placed before 2pm (Mon–Fri) are dispatched same day.",
      },
      {
        q: "Can gas be shipped by air?",
        a: "No. Pressurised gas containers cannot be shipped by air freight. All gas products are dispatched by land only.",
      },
      {
        q: "How do I pay?",
        a: "We accept PromptPay bank transfers. After placing your order, scan the QR code shown at checkout and transfer the exact amount. We'll confirm via LINE once payment is verified.",
      },
      {
        q: "When will my order be confirmed?",
        a: "Confirmation is typically within 1–2 hours during business hours (9am–8pm). We'll message you on LINE or by phone.",
      },
      {
        q: "Can I cancel or change my order?",
        a: "Please contact us via LINE as soon as possible. Orders that have already been dispatched cannot be changed.",
      },
    ],
  },
  th: {
    back: "กลับ",
    eyebrow: "คำถามที่พบบ่อย",
    title: "FAQ",
    items: [
      {
        q: "ขายแก๊สอะไรบ้าง?",
        a: "เรามี TOPGAS 12KG Green Gas (HFC-134a) และ CO₂ ET-1000 ซึ่งนิยมใช้ในการแข่งขัน Action Air และ IPSC",
      },
      {
        q: "จัดส่งทั่วประเทศไหม?",
        a: "ใช่ครับ เราจัดส่งทั่วไทยผ่าน Kerry / Flash Express ค่าส่งขวดแรก ฿50 ขวดต่อไป ฿30",
      },
      {
        q: "ส่งกี่วันถึง?",
        a: "กรุงเทพฯ และปริมณฑล 1–2 วันทำการ ต่างจังหวัด 2–4 วันทำการ ออเดอร์ที่สั่งก่อนบ่ายสองวันจันทร์–ศุกร์จะจัดส่งวันเดียวกัน",
      },
      {
        q: "แก๊สส่งทางอากาศได้ไหม?",
        a: "ไม่ได้ครับ แก๊สอัดความดันทุกชนิดส่งทางบกเท่านั้น ไม่สามารถขนส่งทางเครื่องบินได้",
      },
      {
        q: "ชำระเงินยังไง?",
        a: "ชำระผ่าน PromptPay โอนเงินตามยอดที่ระบุในหน้า Checkout เราจะยืนยันออเดอร์ทาง LINE หลังตรวจสอบการโอน",
      },
      {
        q: "รอยืนยันออเดอร์นานแค่ไหน?",
        a: "ปกติยืนยันภายใน 1–2 ชั่วโมงในเวลาทำการ (9.00–20.00 น.) เราจะแจ้งทาง LINE หรือโทรหาโดยตรง",
      },
      {
        q: "ยกเลิกหรือเปลี่ยนออเดอร์ได้ไหม?",
        a: "ติดต่อเราทาง LINE โดยเร็วที่สุดครับ ถ้าจัดส่งไปแล้วจะไม่สามารถเปลี่ยนหรือยกเลิกได้",
      },
    ],
  },
};

export default function FAQPage() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#555] hover:text-[#D32F3A] text-xs uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft size={12} /> {t.back}
        </Link>

        <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-2">{t.eyebrow}</p>
        <h1 className="text-[clamp(48px,8vw,80px)] leading-none text-[#F5F5F5] mb-12" style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}>
          {t.title}
        </h1>

        <div className="flex flex-col gap-px bg-[#2B2B2E]">
          {t.items.map((item, i) => (
            <div key={i} className="bg-[#1A1A1C]">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="text-[#F5F5F5] text-sm font-semibold">{item.q}</span>
                <ChevronDown
                  size={16}
                  className={`text-[#D32F3A] shrink-0 transition-transform duration-200 ${open === i ? "rotate-180" : ""}`}
                />
              </button>
              {open === i && (
                <div className="px-5 pb-4 border-t border-[#2B2B2E]">
                  <p className="text-[#A5A5A5] text-sm leading-relaxed pt-4">{item.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#2B2B2E] flex items-center gap-4">
          <p className="text-[#555] text-sm flex-1">
            {lang === "th" ? "ยังมีคำถามอื่นอีกไหม?" : "Still have questions?"}
          </p>
          <Link href="/contact"
            className="inline-flex items-center gap-2 border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5] text-xs font-semibold px-4 py-2.5 tracking-widest uppercase transition-colors">
            {lang === "th" ? "ติดต่อเรา" : "Contact Us"}
          </Link>
        </div>
      </div>
    </div>
  );
}
