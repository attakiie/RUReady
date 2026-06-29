import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTABanner() {
  return (
    <section className="py-24 bg-[#D32F3A] relative overflow-hidden">
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
          className="text-[clamp(48px,8vw,110px)] leading-none font-display text-[#F5F5F5] mb-8"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          Ready for Your
          <br />
          Next Stage?
        </h2>
        <p className="text-[#F5F5F5]/70 text-lg mb-10 max-w-md mx-auto">
          The range doesn't wait. Neither should your gear.
        </p>
        <Link
          href="/shop"
          className="group inline-flex items-center gap-3 bg-[#0F0F10] hover:bg-[#1A1A1C] text-[#F5F5F5] font-semibold text-sm px-10 py-4 tracking-widest uppercase transition-colors duration-200"
        >
          Gear Up Now
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200" />
        </Link>
      </div>
    </section>
  );
}
