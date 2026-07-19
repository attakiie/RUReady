import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-50" />

      <div className="text-center max-w-md">
        {/* Big 404 */}
        <div className="relative mb-8">
          <span
            className="text-[180px] leading-none font-display text-[#1A1A1C] select-none"
            style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}
            aria-hidden
          >
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <span
              className="text-[clamp(32px,6vw,56px)] leading-none text-[#D32F3A]"
              style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}
            >
              MISS.
            </span>
          </div>
        </div>

        <p className="text-[#F5F5F5] text-lg font-semibold mb-2">
          หน้านี้ไม่มีอยู่จริง
        </p>
        <p className="text-[#555] text-sm mb-10">
          Page not found — ลองเช็ค URL อีกครั้ง หรือกลับไปหน้าหลัก
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] text-sm font-semibold tracking-widest uppercase px-6 py-3 transition-colors group"
          >
            หน้าหลัก
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5] text-sm font-semibold tracking-widest uppercase px-6 py-3 transition-colors"
          >
            ร้านค้า
          </Link>
        </div>
      </div>
    </div>
  );
}
