"use client";

import Link from "next/link";
import { ArrowLeft, Package, Clock, MapPin, Phone } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const copy = {
  en: {
    back: "Back",
    eyebrow: "Shipping Info",
    title: "SHIPPING",
    rates: "Shipping Rates",
    ratesDesc: "We ship nationwide across Thailand via Kerry / Flash Express.",
    rateItems: [
      { label: "First item", price: "฿50" },
      { label: "Each additional item", price: "฿30" },
    ],
    timing: "Delivery Time",
    timingItems: [
      { region: "Bangkok & surrounding areas", days: "1–2 business days" },
      { region: "Provincial areas", days: "2–4 business days" },
    ],
    cutoff: "Orders placed before 2pm (Mon–Fri) are dispatched same day.",
    tracking: "Tracking",
    trackingDesc: "Tracking number will be sent via LINE or SMS after dispatch.",
    note: "Note",
    noteDesc: "Gas products (Green Gas / CO₂) must be shipped by land — air freight is not available for pressurised containers.",
    contact: "Questions? Chat us on LINE",
    contactLink: "Chat on LINE",
  },
  th: {
    back: "กลับ",
    eyebrow: "ข้อมูลการจัดส่ง",
    title: "จัดส่ง",
    rates: "ค่าจัดส่ง",
    ratesDesc: "จัดส่งทั่วประเทศไทยผ่าน Kerry / Flash Express",
    rateItems: [
      { label: "ขวดแรก", price: "฿50" },
      { label: "ขวดต่อไป", price: "฿30 / ขวด" },
    ],
    timing: "ระยะเวลาจัดส่ง",
    timingItems: [
      { region: "กรุงเทพฯ และปริมณฑล", days: "1–2 วันทำการ" },
      { region: "ต่างจังหวัด", days: "2–4 วันทำการ" },
    ],
    cutoff: "ออเดอร์ที่สั่งก่อน 14.00 น. (จ.–ศ.) จัดส่งได้ในวันเดียวกัน",
    tracking: "ติดตามพัสดุ",
    trackingDesc: "เราจะส่งหมายเลขพัสดุให้ทาง LINE หรือ SMS หลังจัดส่ง",
    note: "หมายเหตุ",
    noteDesc: "สินค้าประเภทแก๊ส (Green Gas / CO₂) จัดส่งทางบกเท่านั้น ไม่สามารถขนส่งทางอากาศได้",
    contact: "มีคำถาม? ทักมาได้เลยผ่าน LINE",
    contactLink: "ทักมาทาง LINE",
  },
};

export default function ShippingPage() {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#555] hover:text-[#D32F3A] text-xs uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft size={12} /> {t.back}
        </Link>

        <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-2">{t.eyebrow}</p>
        <h1 className="text-[clamp(48px,8vw,80px)] leading-none text-[#F5F5F5] mb-12" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          {t.title}
        </h1>

        <div className="flex flex-col gap-8">
          {/* Rates */}
          <Section icon={<Package size={16} />} title={t.rates}>
            <p className="text-[#A5A5A5] text-sm mb-4">{t.ratesDesc}</p>
            <div className="flex flex-col gap-px bg-[#2B2B2E]">
              {t.rateItems.map((r) => (
                <div key={r.label} className="flex justify-between items-center bg-[#1A1A1C] px-4 py-3">
                  <span className="text-[#A5A5A5] text-sm">{r.label}</span>
                  <span className="text-[#F5F5F5] font-bold">{r.price}</span>
                </div>
              ))}
            </div>
          </Section>

          {/* Timing */}
          <Section icon={<Clock size={16} />} title={t.timing}>
            <div className="flex flex-col gap-px bg-[#2B2B2E] mb-4">
              {t.timingItems.map((r) => (
                <div key={r.region} className="flex justify-between items-center bg-[#1A1A1C] px-4 py-3">
                  <span className="text-[#A5A5A5] text-sm">{r.region}</span>
                  <span className="text-[#F5F5F5] text-sm font-semibold">{r.days}</span>
                </div>
              ))}
            </div>
            <p className="text-[#555] text-xs border-l-2 border-[#2B2B2E] pl-3">{t.cutoff}</p>
          </Section>

          {/* Tracking */}
          <Section icon={<MapPin size={16} />} title={t.tracking}>
            <p className="text-[#A5A5A5] text-sm">{t.trackingDesc}</p>
          </Section>

          {/* Note */}
          <div className="border border-[#D32F3A]/30 bg-[#D32F3A]/05 px-5 py-4">
            <p className="text-[#D32F3A] text-xs font-semibold uppercase tracking-widest mb-1">{t.note}</p>
            <p className="text-[#A5A5A5] text-sm">{t.noteDesc}</p>
          </div>

          {/* Contact */}
          <div className="flex items-center justify-between border-t border-[#2B2B2E] pt-8">
            <p className="text-[#555] text-sm">{t.contact}</p>
            <a href="https://line.me/R/ti/p/@ruready" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1A1A1C] border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5] text-xs font-semibold px-4 py-2.5 tracking-widest uppercase transition-colors">
              <Phone size={12} /> {t.contactLink}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#D32F3A]">{icon}</span>
        <h2 className="text-[#F5F5F5] text-sm font-semibold tracking-widest uppercase">{title}</h2>
      </div>
      {children}
    </div>
  );
}
