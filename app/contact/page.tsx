"use client";

import Link from "next/link";
import { ArrowLeft, MessageCircle, MapPin, Clock } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const copy = {
  en: {
    back: "Back",
    eyebrow: "Get In Touch",
    title: "CONTACT",
    sub: "We're here. Hit us up on LINE for the fastest response.",
    channels: [
      {
        icon: "LINE",
        label: "LINE OpenChat",
        value: "R U Ready OpenChat",
        href: "https://line.me/ti/g2/eQ6xRJ2zwfCd0W99zlxQhMGkPBi_ZqOzVylHBA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
        cta: "Open LINE",
        desc: "Fastest response — usually within the hour",
      },
      {
        icon: "FB",
        label: "Facebook",
        value: "R U Ready Thailand",
        href: "https://facebook.com/rureadythailand",
        cta: "Open Facebook",
        desc: "DM us on Facebook Messenger",
      },
    ],
    hours: "Business Hours",
    hoursItems: [
      { day: "Mon – Fri", time: "9:00 am – 8:00 pm" },
      { day: "Sat – Sun", time: "10:00 am – 6:00 pm" },
    ],
    location: "Location",
    locationDesc: "Bangkok, Thailand. Nationwide shipping available.",
    faqLink: "Check our FAQ first",
  },
  th: {
    back: "กลับ",
    eyebrow: "ติดต่อเรา",
    title: "ติดต่อ",
    sub: "เราอยู่ที่นี่ ทักมาทาง LINE ได้เลย ตอบเร็วที่สุด",
    channels: [
      {
        icon: "LINE",
        label: "LINE OpenChat",
        value: "R U Ready OpenChat",
        href: "https://line.me/ti/g2/eQ6xRJ2zwfCd0W99zlxQhMGkPBi_ZqOzVylHBA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default",
        cta: "เปิด LINE",
        desc: "ตอบเร็วที่สุด ปกติภายใน 1 ชั่วโมง",
      },
      {
        icon: "FB",
        label: "Facebook",
        value: "R U Ready Thailand",
        href: "https://facebook.com/rureadythailand",
        cta: "เปิด Facebook",
        desc: "ทักมาใน Facebook Messenger",
      },
    ],
    hours: "เวลาทำการ",
    hoursItems: [
      { day: "จ. – ศ.", time: "09:00 – 20:00 น." },
      { day: "ส. – อา.", time: "10:00 – 18:00 น." },
    ],
    location: "ที่ตั้ง",
    locationDesc: "กรุงเทพฯ ประเทศไทย จัดส่งทั่วประเทศ",
    faqLink: "ดูคำถามที่พบบ่อยก่อนได้เลย",
  },
};

export default function ContactPage() {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-2 text-[#555] hover:text-[#D32F3A] text-xs uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft size={12} /> {t.back}
        </Link>

        <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-2">{t.eyebrow}</p>
        <h1 className="text-[clamp(48px,8vw,80px)] leading-none text-[#F5F5F5] mb-4" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
          {t.title}
        </h1>
        <p className="text-[#A5A5A5] text-sm mb-12">{t.sub}</p>

        {/* Channels */}
        <div className="flex flex-col gap-px bg-[#2B2B2E] mb-10">
          {t.channels.map((ch) => (
            <div key={ch.label} className="bg-[#1A1A1C] flex items-center gap-5 px-5 py-5">
              <div className="w-12 h-12 bg-[#0F0F10] border border-[#2B2B2E] flex items-center justify-center shrink-0">
                {ch.icon === "LINE" ? (
                  <MessageCircle size={20} className="text-[#06C755]" />
                ) : (
                  <span className="text-[#1877F2] text-xs font-bold">f</span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#555] text-xs uppercase tracking-widest mb-0.5">{ch.label}</p>
                <p className="text-[#F5F5F5] font-semibold text-sm">{ch.value}</p>
                <p className="text-[#555] text-xs mt-0.5">{ch.desc}</p>
              </div>
              <a href={ch.href} target="_blank" rel="noopener noreferrer"
                className="shrink-0 text-xs font-semibold tracking-widest uppercase border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5] px-4 py-2 transition-colors">
                {ch.cta}
              </a>
            </div>
          ))}
        </div>

        {/* Hours + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#2B2B2E] mb-10">
          <div className="bg-[#1A1A1C] p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={14} className="text-[#D32F3A]" />
              <span className="text-[#F5F5F5] text-xs font-semibold uppercase tracking-widest">{t.hours}</span>
            </div>
            <div className="flex flex-col gap-2">
              {t.hoursItems.map((h) => (
                <div key={h.day} className="flex justify-between text-sm">
                  <span className="text-[#555]">{h.day}</span>
                  <span className="text-[#A5A5A5]">{h.time}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-[#1A1A1C] p-5">
            <div className="flex items-center gap-2 mb-4">
              <MapPin size={14} className="text-[#D32F3A]" />
              <span className="text-[#F5F5F5] text-xs font-semibold uppercase tracking-widest">{t.location}</span>
            </div>
            <p className="text-[#A5A5A5] text-sm leading-relaxed">{t.locationDesc}</p>
          </div>
        </div>

        {/* FAQ link */}
        <div className="text-center">
          <Link href="/faq" className="text-[#555] text-sm hover:text-[#D32F3A] transition-colors underline underline-offset-4">
            {t.faqLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
