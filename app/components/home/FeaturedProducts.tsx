"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const products = [
  { id: "et-1000", name: "ET-1000 Green Gas", price: 230, tag: "Best Seller", available: true, slug: "et-1000-green-gas" },
  { id: "topgas-12kg", name: "Top Gas 12kg", price: 260, tag: "New", available: true, slug: "top-gas-12kg" },
  { id: "mini-popper", name: "Mini Popper", price: 180, tag: "IPSC", available: true, slug: "mini-popper" },
];

const copy = {
  en: {
    eyebrow: "Latest",
    heading: "New on the Range",
    allProducts: "All Products",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    addToCart: "Gear Up",
  },
  th: {
    eyebrow: "ล่าสุด",
    heading: "มาใหม่บนสนาม",
    allProducts: "ดูสินค้าทั้งหมด",
    inStock: "มีสินค้า",
    outOfStock: "สินค้าหมด",
    addToCart: "หยิบใส่ตะกร้า",
  },
};

export default function FeaturedProducts() {
  const { lang } = useLanguage();
  const t = copy[lang];

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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-[#2B2B2E]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

type Product = {
  id: string;
  name: string;
  price: number;
  tag: string;
  available: boolean;
  slug: string;
};

type Copy = typeof copy.en;

function ProductCard({ product, t }: { product: Product; t: Copy }) {
  return (
    <div className="group bg-[#1A1A1C] flex flex-col">
      {/* Image area */}
      <Link href={`/products/${product.slug}`} className="block relative overflow-hidden">
        <div className="aspect-square bg-[#0F0F10] flex items-center justify-center relative">
          {/* Product tag */}
          <span className="absolute top-3 left-3 bg-[#D32F3A] text-[#F5F5F5] text-[10px] font-semibold px-2 py-1 tracking-widest uppercase z-10">
            {product.tag}
          </span>

          {/* Placeholder — replace with <Image> when photos are ready */}
          <div
            className="text-[72px] leading-none text-[#2B2B2E] select-none font-display group-hover:scale-105 transition-transform duration-300"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            aria-hidden
          >
            {product.name.charAt(0)}
          </div>

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-[#D32F3A] opacity-0 group-hover:opacity-[0.06] transition-opacity duration-200" />
        </div>
      </Link>

      {/* Info */}
      <div className="p-5 flex flex-col gap-4 flex-1">
        <div>
          <h3 className="text-[#F5F5F5] font-semibold text-sm tracking-wide leading-tight mb-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[#F5F5F5] text-xl font-bold">
              ฿{product.price.toLocaleString()}
            </span>
            {product.available ? (
              <span className="text-[10px] text-[#4ade80] tracking-widest uppercase">{t.inStock}</span>
            ) : (
              <span className="text-[10px] text-[#A5A5A5] tracking-widest uppercase">{t.outOfStock}</span>
            )}
          </div>
        </div>

        <button className="mt-auto w-full bg-[#0F0F10] hover:bg-[#D32F3A] border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5] text-xs font-semibold tracking-widest uppercase py-3 transition-all duration-200">
          {t.addToCart}
        </button>
      </div>
    </div>
  );
}
