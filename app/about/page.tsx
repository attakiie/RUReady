"use client";

import Link from "next/link";
import { ArrowRight, Target, Zap, Shield, MapPin, MessageCircle } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import Footer from "@/app/components/layout/Footer";

const copy = {
  en: {
    eyebrow: "About Us",
    heading: "Built by Players.\nFor Players.",
    story: "R U READY was born on the range. We're Action Air and IPSC competitors who got tired of hunting for quality gear — so we built the store we always wanted. Every product we carry is something we've used, tested, and trusted ourselves.",
    missionLabel: "Our Mission",
    mission: "Make competition-grade gear accessible to every Action Air player in Thailand. No compromises on quality. No guesswork on compatibility.",
    pillars: [
      { icon: Target, title: "Competition Focused", desc: "Every product is selected with IPSC and Action Air rules in mind. If it works on the range, we stock it." },
      { icon: Zap, title: "Fast Shipping", desc: "Orders ship within 1 business day. Nationwide delivery across Thailand with tracking on every order." },
      { icon: Shield, title: "Quality Guaranteed", desc: "We only carry products we've personally tested. Not happy? Contact us and we'll make it right." },
    ],
    contactLabel: "Get in Touch",
    contactDesc: "Questions about products, orders, or just want to talk airsoft? We're easy to reach.",
    line: "LINE Official",
    lineHandle: "@ruready",
    facebook: "Facebook",
    fbHandle: "R U READY Thailand",
    location: "Bangkok, Thailand",
    locationSub: "Shipping nationwide",
    shopCta: "Shop Now",
  },
  th: {
    eyebrow: "เกี่ยวกับเรา",
    heading: "สร้างโดยนักยิง\nเพื่อนักยิง",
    story: "R U READY เกิดขึ้นบนสนามยิง เราเป็นนักยิง Action Air และ IPSC ที่เบื่อกับการตามหาอุปกรณ์คุณภาพดี จึงลงมือสร้างร้านที่เราอยากได้เอง ทุกสินค้าที่เราขายคือสินค้าที่เราใช้ ทดสอบ และไว้วางใจด้วยตัวเอง",
    missionLabel: "พันธกิจของเรา",
    mission: "ทำให้อุปกรณ์ระดับแข่งขันเข้าถึงได้สำหรับนักยิง Action Air ทุกคนในไทย ไม่ประนีประนอมเรื่องคุณภาพ ไม่ต้องเดาว่าสินค้าใช้ได้ไหม",
    pillars: [
      { icon: Target, title: "มุ่งเน้นการแข่งขัน", desc: "ทุกสินค้าคัดเลือกโดยคำนึงถึงกฎ IPSC และ Action Air หากใช้ได้ในสนาม เราก็มีขาย" },
      { icon: Zap, title: "จัดส่งรวดเร็ว", desc: "ส่งภายใน 1 วันทำการ จัดส่งทั่วประเทศพร้อมเลขติดตามทุกออเดอร์" },
      { icon: Shield, title: "รับประกันคุณภาพ", desc: "เราขายเฉพาะสินค้าที่ทดสอบแล้ว ไม่พอใจ? ติดต่อเราได้เลย" },
    ],
    contactLabel: "ติดต่อเรา",
    contactDesc: "มีคำถามเรื่องสินค้า ออเดอร์ หรืออยากคุยเรื่อง airsoft? เราตอบทุกช่องทาง",
    line: "LINE Official",
    lineHandle: "@ruready",
    facebook: "Facebook",
    fbHandle: "R U READY Thailand",
    location: "กรุงเทพมหานคร, ประเทศไทย",
    locationSub: "จัดส่งทั่วประเทศ",
    shopCta: "ไปร้านค้า",
  },
};

export default function AboutPage() {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <>
      <div className="min-h-screen bg-[#0F0F10] pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Hero */}
          <div className="py-20 border-b border-[#2B2B2E]">
            <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              {t.eyebrow}
            </p>
            <h1
              className="text-[clamp(48px,9vw,96px)] leading-[0.9] text-[#F5F5F5] mb-8 whitespace-pre-line"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {t.heading}
            </h1>
            <p className="text-[#A5A5A5] text-lg leading-relaxed max-w-2xl">
              {t.story}
            </p>
          </div>

          {/* Mission */}
          <div className="py-16 border-b border-[#2B2B2E]">
            <div className="flex gap-8 items-start">
              <div className="w-[3px] bg-[#D32F3A] self-stretch flex-shrink-0 hidden sm:block" />
              <div>
                <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
                  {t.missionLabel}
                </p>
                <p className="text-[#F5F5F5] text-xl sm:text-2xl leading-relaxed font-medium">
                  {t.mission}
                </p>
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div className="py-16 border-b border-[#2B2B2E]">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#2B2B2E]">
              {t.pillars.map((pillar) => {
                const Icon = pillar.icon;
                return (
                  <div key={pillar.title} className="bg-[#0F0F10] p-8">
                    <Icon size={28} className="text-[#D32F3A] mb-5" strokeWidth={1.5} />
                    <h3
                      className="text-2xl text-[#F5F5F5] mb-3"
                      style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
                    >
                      {pillar.title}
                    </h3>
                    <p className="text-[#A5A5A5] text-sm leading-relaxed">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div className="py-16 border-b border-[#2B2B2E]">
            <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
              {t.contactLabel}
            </p>
            <p className="text-[#A5A5A5] text-sm mb-10 max-w-lg">{t.contactDesc}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* LINE */}
              <div className="bg-[#1A1A1C] border border-[#2B2B2E] p-6 flex flex-col gap-2">
                <MessageCircle size={20} className="text-[#06C755]" />
                <p className="text-[#A5A5A5] text-xs uppercase tracking-widest">{t.line}</p>
                <p className="text-[#F5F5F5] font-semibold">{t.lineHandle}</p>
              </div>

              {/* Facebook */}
              <div className="bg-[#1A1A1C] border border-[#2B2B2E] p-6 flex flex-col gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                <p className="text-[#A5A5A5] text-xs uppercase tracking-widest">{t.facebook}</p>
                <p className="text-[#F5F5F5] font-semibold">{t.fbHandle}</p>
              </div>

              {/* Location */}
              <div className="bg-[#1A1A1C] border border-[#2B2B2E] p-6 flex flex-col gap-2">
                <MapPin size={20} className="text-[#D32F3A]" />
                <p className="text-[#A5A5A5] text-xs uppercase tracking-widest">{t.location}</p>
                <p className="text-[#555] text-sm">{t.locationSub}</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="py-16 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] font-semibold text-sm px-8 py-4 tracking-widest uppercase transition-colors group"
            >
              {t.shopCta}
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}
