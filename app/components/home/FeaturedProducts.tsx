"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCart } from "@/app/contexts/CartContext";
import { createClient } from "@/app/lib/supabase";

type Product = {
  id: string;
  slug: string;
  name_en: string;
  name_th: string;
  price: number;
  stock: number;
  images: string[];
  tag: string;
  category_id: string;
};

const copy = {
  en: {
    eyebrow: "Latest",
    heading: "New on the Range",
    allProducts: "All Products",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    addToCart: "Gear Up",
    added: "Added!",
    firstOrderHint: "First purchase eligible for 30 THB discount",
  },
  th: {
    eyebrow: "ล่าสุด",
    heading: "มาใหม่บนสนาม",
    allProducts: "ดูสินค้าทั้งหมด",
    inStock: "มีสินค้า",
    outOfStock: "สินค้าหมด",
    addToCart: "หยิบใส่ตะกร้า",
    added: "เพิ่มแล้ว!",
    firstOrderHint: "สั่งซื้อครั้งแรก รับส่วนลด 30 บาท",
  },
};

export default function FeaturedProducts() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const { addItem } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [addedId, setAddedId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("products")
      .select("id, slug, name_en, name_th, price, stock, images, tag, category_id")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setProducts(data ?? []));
  }, []);

  function handleAdd(product: Product) {
    addItem(
      {
        id: product.id,
        slug: product.slug,
        name_en: product.name_en,
        name_th: product.name_th,
        price: product.price,
        img: product.images?.[0] ?? "",
        category_id: product.category_id,
      },
      1
    );
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1800);
  }

  return (
    <section className="py-24 bg-[#1A1A1C] border-t-2 border-[#D32F3A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
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
          <Link
            href="/shop"
            className="hidden sm:inline-flex items-center gap-2 text-[#A5A5A5] hover:text-[#F5F5F5] text-sm tracking-wide uppercase transition-colors duration-200 group"
          >
            {t.allProducts}
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[#2B2B2E]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1A1A1C] aspect-square animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[#2B2B2E]">
            {products.map((product) => {
              const name = lang === "en" ? product.name_en : product.name_th;
              const img = product.images?.[0] ?? null;
              const inStock = product.stock > 0;
              const wasAdded = addedId === product.id;

              return (
                <div key={product.id} className="group bg-[#1A1A1C] flex flex-col">
                  {/* Image */}
                  <Link href={`/products/${product.slug}`} className="block relative overflow-hidden">
                    <div className="aspect-square bg-[#0F0F10] flex items-center justify-center relative">
                      {product.tag && (
                        <span className="absolute top-3 left-3 bg-[#D32F3A] text-[#F5F5F5] text-[10px] font-semibold px-2 py-1 tracking-widest uppercase z-10">
                          {product.tag}
                        </span>
                      )}
                      {img ? (
                        <img
                          src={img}
                          alt={name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-20 h-20 border border-[#2B2B2E] flex items-center justify-center text-[#2B2B2E] text-4xl font-bold">
                          {name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-[#D32F3A] opacity-0 group-hover:opacity-[0.06] transition-opacity duration-200" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-3 sm:p-5 flex flex-col gap-3 sm:gap-4 flex-1">
                    <div>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="text-[#F5F5F5] font-semibold text-xs sm:text-sm tracking-wide leading-tight mb-1 hover:text-[#D32F3A] transition-colors">
                          {name}
                        </h3>
                      </Link>
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <span className="text-[#F5F5F5] text-base sm:text-xl font-bold">
                          ฿{product.price.toLocaleString()}
                        </span>
                        {inStock ? (
                          <span className="text-[9px] sm:text-[10px] text-[#4ade80] tracking-widest uppercase">{t.inStock}</span>
                        ) : (
                          <span className="text-[9px] sm:text-[10px] text-[#A5A5A5] tracking-widest uppercase">{t.outOfStock}</span>
                        )}
                      </div>
                      <p className="text-[9px] sm:text-[10px] text-[#D32F3A]/80 mt-1">
                        🔥 {t.firstOrderHint}
                      </p>
                    </div>

                    <button
                      onClick={() => inStock && handleAdd(product)}
                      disabled={!inStock}
                      className={`mt-auto w-full text-[10px] sm:text-xs font-semibold tracking-widest uppercase py-2.5 sm:py-3 transition-all duration-200 border ${
                        wasAdded
                          ? "bg-[#1a2e1a] border-[#2e5a2e] text-[#4ade80]"
                          : inStock
                          ? "bg-[#0F0F10] hover:bg-[#D32F3A] border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5]"
                          : "bg-[#0F0F10] border-[#2B2B2E] text-[#3A3A3E] cursor-not-allowed"
                      }`}
                    >
                      {wasAdded ? t.added : inStock ? t.addToCart : t.outOfStock}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
