"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const copy = {
  en: {
    heading: "Ready for Your\nNext Stage?",
    sub: "The range doesn't wait. Neither should your gear.",
    cta: "Gear Up Now",
  },
  th: {
    heading: "พร้อมสำหรับ\nสเตจถัดไปหรือยัง?",
    sub: "สนามไม่รอใคร อุปกรณ์ก็เช่นกัน",
    cta: "เตรียมพร้อมเลย",
  },
};

export default function CTABanner() {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <section className="py-24 bg-[#D32F3A] relative overflow-hidden border-t-4 border-[#A02029]">
      {/* Subtle texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, #F5F5F5 0px, #F5F5F5 1px, transparent 1px, transparent 60px)",
        }}
        aria-hidden
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="text-[clamp(48px,8vw,110px)] leading-none font-display text-[#F5F5F5] mb-8 whitespace-pre-line"
          style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}
        >
          {t.heading}
        </h2>
        <p className="text-[#F5F5F5]/70 text-lg mb-10 max-w-md mx-auto">
          {t.sub}
        </p>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-3 bg-[#0F0F10] hover:bg-[#1A1A1C] text-[#F5F5F5] font-semibold text-sm px-10 py-4 tracking-widest uppercase transition-colors duration-200"
        >
          {t.cta}
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </section>
  );
}
