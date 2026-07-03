"use client";

import { Users, Target, Zap, Heart } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const copy = {
  en: {
    eyebrow: "Why Us",
    heading: "Why R U READY",
    pillars: [
      { title: "Built by Players", desc: "We shoot IPSC. We know what you need before you do." },
      { title: "Tested on the Range", desc: "Every product earns its place on the table through real competition." },
      { title: "Fast Shipping", desc: "Order before 2PM, ships same day. Nationwide coverage." },
      { title: "Friendly Community", desc: "Beginners welcome. The only barrier to entry is the beep." },
    ],
  },
  th: {
    eyebrow: "ทำไมต้องเรา",
    heading: "Why R U READY",
    pillars: [
      { title: "สร้างโดยผู้เล่น", desc: "เราเล่น IPSC เราเข้าใจความต้องการของคุณดีกว่าใคร" },
      { title: "ทดสอบในสนามจริง", desc: "ทุกชิ้นผ่านการทดสอบในการแข่งขันจริงก่อนวางขาย" },
      { title: "จัดส่งเร็ว", desc: "สั่งก่อนบ่ายสองโมง ส่งวันเดียวกัน ทั่วประเทศ" },
      { title: "ชุมชนที่เป็นมิตร", desc: "ยินดีต้อนรับมือใหม่ อุปสรรคเดียวคือเสียงบีป" },
    ],
  },
};

const icons = [Users, Target, Zap, Heart];

export default function WhyUs() {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <section className="py-24 bg-[#0F0F10] border-t-2 border-[#D32F3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 max-w-xl">
          <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-3">
            {t.eyebrow}
          </p>
          <h2
            className="text-[clamp(40px,6vw,72px)] leading-none font-display text-[#F5F5F5]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            {t.heading}
          </h2>
          <div className="w-16 h-[3px] bg-[#D32F3A] mt-4" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {t.pillars.map((pillar, i) => {
            const Icon = icons[i];
            return (
              <div key={i} className="group border-t-2 border-[#D32F3A]/40 pt-6">
                {/* Number */}
                <div
                  className="text-[#2B2B2E] text-[52px] sm:text-[80px] leading-none font-display mb-3 sm:mb-4 select-none"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  aria-hidden
                >
                  0{i + 1}
                </div>
                <Icon size={20} className="text-[#D32F3A] mb-3 sm:mb-4" strokeWidth={1.5} />
                <h3 className="text-[#F5F5F5] font-semibold text-xs sm:text-sm tracking-wide uppercase mb-2">
                  {pillar.title}
                </h3>
                <p className="text-[#A5A5A5] text-xs sm:text-sm leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
