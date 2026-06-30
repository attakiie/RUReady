"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Check, AlertCircle, ChevronRight } from "lucide-react";
import { createClient } from "@/app/lib/supabase";
import { useLanguage } from "@/app/contexts/LanguageContext";

type Product = {
  id: string;
  slug: string;
  name_en: string;
  name_th: string;
  desc_en: string;
  desc_th: string;
  price: number;
  stock: number;
  category_id: string;
  images: string[];
  tag: string;
};

const copy = {
  en: {
    back: "Back to Shop",
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    addToCart: "Add to Cart",
    comingSoon: "Cart coming soon",
    category: "Category",
    stock: "Stock",
    units: "units",
    sku: "SKU",
    share: "Share",
  },
  th: {
    back: "กลับไปร้านค้า",
    inStock: "มีสินค้า",
    outOfStock: "สินค้าหมด",
    addToCart: "หยิบใส่ตะกร้า",
    comingSoon: "ระบบตะกร้าเร็วๆ นี้",
    category: "หมวดหมู่",
    stock: "สต๊อก",
    units: "ชิ้น",
    sku: "รหัสสินค้า",
    share: "แชร์",
  },
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const t = copy[lang];
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (!data) { setNotFound(true); setLoading(false); return; }
      setProduct(data);
      setLoading(false);
    }
    load();
  }, [slug]);

  function handleAddToCart() {
    // Cart not yet implemented — show feedback only
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D32F3A] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex flex-col items-center justify-center gap-4">
        <p className="text-[#F5F5F5] text-xl font-semibold">ไม่พบสินค้า</p>
        <Link href="/shop" className="text-[#D32F3A] text-sm underline">
          กลับไปร้านค้า
        </Link>
      </div>
    );
  }

  const name = lang === "en" ? product.name_en : product.name_th;
  const desc = lang === "en" ? product.desc_en : product.desc_th;
  const img = product.images?.[0] ?? null;
  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-50" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-[#555] mb-8 tracking-widest uppercase">
          <Link href="/shop" className="hover:text-[#D32F3A] transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> {t.back}
          </Link>
          <ChevronRight size={10} />
          <span className="text-[#A5A5A5]">{name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-[#2B2B2E]">
          {/* Left — Image */}
          <div className="bg-[#1A1A1C] aspect-square flex items-center justify-center relative overflow-hidden">
            {product.tag && (
              <span className="absolute top-4 left-4 bg-[#D32F3A] text-[#F5F5F5] text-[10px] font-semibold px-2 py-1 tracking-widest uppercase z-10">
                {product.tag}
              </span>
            )}
            {img ? (
              <img
                src={img}
                alt={name}
                className="w-full h-full object-contain p-8"
              />
            ) : (
              <div className="w-32 h-32 border border-[#2B2B2E] flex items-center justify-center text-[#2B2B2E] text-6xl font-bold">
                {name.charAt(0)}
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div className="bg-[#1A1A1C] flex flex-col p-8 lg:p-12">
            {/* Category */}
            <Link
              href={`/shop?cat=${product.category_id}`}
              className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-3 hover:text-[#F5F5F5] transition-colors"
            >
              {product.category_id}
            </Link>

            {/* Name */}
            <h1
              className="text-[clamp(32px,5vw,56px)] leading-none text-[#F5F5F5] mb-6"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {name}
            </h1>

            {/* Price + Stock */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-3xl font-bold text-[#F5F5F5]">
                ฿{product.price.toLocaleString()}
              </span>
              <span
                className={`text-xs font-semibold tracking-widest uppercase flex items-center gap-1 ${
                  inStock ? "text-[#4ade80]" : "text-[#A5A5A5]"
                }`}
              >
                {inStock ? <Check size={12} /> : <AlertCircle size={12} />}
                {inStock ? t.inStock : t.outOfStock}
              </span>
            </div>

            {/* Description */}
            <p className="text-[#A5A5A5] text-sm leading-relaxed mb-8">
              {desc}
            </p>

            <div className="h-px bg-[#2B2B2E] mb-8" />

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-3 mb-4">
              {/* Qty selector */}
              <div className="flex items-center border border-[#2B2B2E]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors text-lg"
                  disabled={!inStock}
                >
                  −
                </button>
                <span className="w-10 text-center text-[#F5F5F5] text-sm font-semibold">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="w-10 h-10 flex items-center justify-center text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors text-lg"
                  disabled={!inStock}
                >
                  +
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`flex-1 flex items-center justify-center gap-2 h-10 font-semibold text-sm tracking-widest uppercase transition-all duration-200 ${
                  added
                    ? "bg-[#2e5a2e] border border-[#2e5a2e] text-[#4ade80]"
                    : inStock
                    ? "bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5]"
                    : "bg-[#1A1A1C] border border-[#2B2B2E] text-[#555] cursor-not-allowed"
                }`}
              >
                {added ? (
                  <><Check size={14} /> Added!</>
                ) : (
                  <><ShoppingBag size={14} /> {t.addToCart}</>
                )}
              </button>
            </div>

            {added && (
              <p className="text-xs text-[#555] text-center">{t.comingSoon}</p>
            )}

            {/* Meta */}
            <div className="mt-8 pt-6 border-t border-[#2B2B2E] flex flex-col gap-2">
              <div className="flex gap-3 text-xs">
                <span className="text-[#555] uppercase tracking-widest w-20">{t.sku}</span>
                <span className="text-[#A5A5A5] uppercase tracking-widest">{product.slug}</span>
              </div>
              <div className="flex gap-3 text-xs">
                <span className="text-[#555] uppercase tracking-widest w-20">{t.stock}</span>
                <span className="text-[#A5A5A5]">{product.stock} {t.units}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
