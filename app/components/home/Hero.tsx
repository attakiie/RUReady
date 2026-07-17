"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const copy = {
  en: {
    eyebrow: "Action Air · IPSC · Thailand",
    sub: "Performance gear for Action Air players.\nBuilt by players. Tested on the range.",
    gearUp: "Gear Up",
    shopAll: "Shop All",
    stats: [
      { value: "TH", label: "Nationwide Shipping" },
    ],
    standBy: "Stand By...",
    athletePhoto: "Athlete Photo Here",
  },
  th: {
    eyebrow: "Action Air · IPSC · ไทยแลนด์",
    sub: "อุปกรณ์สำหรับนักยิง Action Air\nคัดเลือกโดยผู้เล่น ทดสอบ ใช้จริง ในสนามจริง",
    gearUp: "เลือกซื้อเลย",
    shopAll: "ดูสินค้าทั้งหมด",
    stats: [
      { value: "TH", label: "จัดส่งทั่วประเทศ" },
    ],
    standBy: "กำลังมา...",
    athletePhoto: "รูปนักกีฬา",
  },
};

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { lang } = useLanguage();
  const t = copy[lang];

  // Animated red motion lines — like laser sight traces
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    type Line = {
      x: number;
      y: number;
      length: number;
      speed: number;
      opacity: number;
      width: number;
    };

    const lines: Line[] = Array.from({ length: 8 }, () => createLine(canvas.width, canvas.height));

    function createLine(w: number, h: number): Line {
      return {
        x: Math.random() * w,
        y: Math.random() * h,
        length: 60 + Math.random() * 120,
        speed: 1.5 + Math.random() * 2,
        opacity: 0.04 + Math.random() * 0.08,
        width: 0.5 + Math.random() * 1,
      };
    }

    let animId: number;

    function draw() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      lines.forEach((line) => {
        ctx.beginPath();
        ctx.moveTo(line.x, line.y);
        ctx.lineTo(line.x + line.length, line.y - line.length * 0.3);
        ctx.strokeStyle = `rgba(211, 47, 58, ${line.opacity})`;
        ctx.lineWidth = line.width;
        ctx.stroke();

        line.x += line.speed;
        line.y -= line.speed * 0.3;

        if (line.x > canvas.width + 200) {
          Object.assign(line, createLine(canvas.width, canvas.height));
          line.x = -200;
        }
      });

      animId = requestAnimationFrame(draw);
    }

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0F0F10]">
      {/* Motion lines canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        aria-hidden
      />

      {/* Grid overlay — subtle texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#F5F5F5 1px, transparent 1px), linear-gradient(90deg, #F5F5F5 1px, transparent 1px)",
          backgroundSize: "80px 80px",
        }}
        aria-hidden
      />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[80vh]">
          {/* Left — Text */}
          <div className="flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4 lg:mb-6">
              <span className="block w-8 h-px bg-[#D32F3A]" />
              <span className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase">
                {t.eyebrow}
              </span>
            </div>

            {/* Main headline */}
            <h1
              className="text-[clamp(52px,10vw,120px)] leading-[0.92] font-display text-[#F5F5F5] mb-4 lg:mb-6"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              ARE YOU
              <br />
              <span className="text-[#D32F3A]">READY</span>
              <br />
              FOR YOUR
              <br />
              NEXT STAGE?
            </h1>

            {/* Mobile product image — between headline and sub */}
            <div className="block lg:hidden relative my-5 mx-auto w-full max-w-[260px]">
              <div className="absolute inset-0 border border-[#2B2B2E] pointer-events-none z-10" />
              <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#D32F3A] z-10" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#D32F3A] z-10" />
              <img
                src="/images/hero-gas-products.png"
                alt="Green Gas — TOPGAS & ET-1000"
                className="w-full h-auto block"
              />
            </div>

            {/* Subheadline */}
            <p className="text-[#A5A5A5] text-base lg:text-lg leading-relaxed max-w-md mb-8 lg:mb-10 whitespace-pre-line">
              {t.sub}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/shop"
                className="group inline-flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] font-semibold text-sm px-7 py-4 tracking-wide uppercase transition-colors duration-200"
              >
                {t.gearUp}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center gap-2 border border-[#2B2B2E] hover:border-[#F5F5F5] text-[#A5A5A5] hover:text-[#F5F5F5] font-semibold text-sm px-7 py-4 tracking-wide uppercase transition-colors duration-200"
              >
                {t.shopAll}
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-8 mt-8 lg:mt-12 pt-6 lg:pt-8 border-t-2 border-[#D32F3A]/30">
              {t.stats.map((s) => (
                <Stat key={s.label} value={s.value} label={s.label} />
              ))}
            </div>
          </div>

          {/* Right — Product image (desktop only) */}
          <div className="hidden lg:flex items-center justify-center relative">
            <div className="relative w-full max-w-md">
              {/* Frame corners */}
              <div className="absolute inset-0 border border-[#2B2B2E] pointer-events-none z-10" />
              <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-[#D32F3A] z-10" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-[#D32F3A] z-10" />
              <img
                src="/images/hero-gas-products.png"
                alt="Green Gas — TOPGAS & ET-1000"
                className="w-full h-auto block"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
        <ChevronDown size={16} className="text-[#2B2B2E]" />
      </div>
    </section>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div
        className="text-2xl text-[#F5F5F5] font-display"
        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
      >
        {value}
      </div>
      <div className="text-[#A5A5A5] text-xs tracking-wide uppercase mt-0.5">{label}</div>
    </div>
  );
}
