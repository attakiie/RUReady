"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wind, Target, Layers, Printer, ArrowRight } from "lucide-react";
import { createClient } from "@/app/lib/supabase";
import { useLanguage } from "@/app/contexts/LanguageContext";

type Category = {
  id: string;
  name_en: string;
  name_th: string;
  desc_en: string;
  desc_th: string;
  icon: string;
  sort_order: number;
  count?: number;
};

const iconMap: Record<string, React.ElementType> = {
  Wind, Target, Layers, Printer,
};

const copy = {
  en: { eyebrow: "Browse", heading: "Categories", items: "items", loading: "Loading…", shop: "All Products" },
  th: { eyebrow: "หมวดหมู่", heading: "หมวดหมู่", items: "ชิ้น", loading: "กำลังโหลด…", shop: "ดูสินค้าทั้งหมด" },
};

export default function CategoriesPage() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: cats } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");

      if (!cats) { setLoading(false); return; }

      // Get product counts per category
      const counts = await Promise.all(
        cats.map((c) =>
          supabase
            .from("products")
            .select("id", { count: "exact", head: true })
            .eq("category_id", c.id)
            .eq("is_active", true)
        )
      );

      setCategories(
        cats.map((c, i) => ({ ...c, count: counts[i].count ?? 0 }))
      );
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-50" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12 border-b border-[#2B2B2E] pb-8">
          <div>
            <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
              {t.eyebrow}
            </p>
            <h1
              className="text-[clamp(48px,8vw,80px)] leading-none text-[#F5F5F5]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {t.heading}
            </h1>
            <div className="w-16 h-[3px] bg-[#D32F3A] mt-4" />
          </div>
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-2 text-[#A5A5A5] hover:text-[#F5F5F5] text-sm tracking-wide uppercase transition-colors group"
          >
            {t.shop}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-52 bg-[#1A1A1C] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => {
              const Icon = iconMap[cat.icon] ?? Layers;
              const name = lang === "en" ? cat.name_en : cat.name_th;
              const desc = lang === "en" ? cat.desc_en : cat.desc_th;

              return (
                <Link
                  key={cat.id}
                  href={`/shop?cat=${cat.id}`}
                  className="group relative flex flex-col p-6 bg-[#1A1A1C] border border-[#2B2B2E] hover:border-[#D32F3A] transition-all duration-200 overflow-hidden min-h-[200px]"
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 bg-[#D32F3A] opacity-0 group-hover:opacity-[0.04] transition-opacity duration-200" />
                  {/* Corner accent */}
                  <div className="absolute top-0 left-0 w-6 h-6 border-t border-l border-[#D32F3A] opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

                  {/* Icon */}
                  <div className="mb-auto">
                    <Icon size={28} className="text-[#D32F3A] mb-5" strokeWidth={1.5} />
                  </div>

                  {/* Text */}
                  <div>
                    <h2
                      className="text-[28px] leading-none text-[#F5F5F5] mb-2 group-hover:text-[#D32F3A] transition-colors"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {name}
                    </h2>
                    <p className="text-[#A5A5A5] text-xs leading-relaxed mb-4 hidden sm:block">
                      {desc}
                    </p>
                    <span className="text-[#2B2B2E] text-xs tracking-widest uppercase">
                      {cat.count ?? 0} {t.items}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
