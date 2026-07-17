"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, Check, AlertCircle, ChevronRight, Plus, Minus } from "lucide-react";
import { createClient } from "@/app/lib/supabase";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCart } from "@/app/contexts/CartContext";

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
    added: "Added!",
    category: "Category",
    stock: "Stock",
    units: "units",
    sku: "SKU",
    firstOrderHint: "First purchase eligible for 30 THB discount",
  },
  th: {
    back: "กลับไปร้านค้า",
    inStock: "มีสินค้า",
    outOfStock: "สินค้าหมด",
    addToCart: "หยิบใส่ตะกร้า",
    added: "เพิ่มแล้ว!",
    category: "หมวดหมู่",
    stock: "สต๊อก",
    units: "ชิ้น",
    sku: "รหัสสินค้า",
    firstOrderHint: "สั่งซื้อครั้งแรก รับส่วนลด 30 บาท",
  },
};

export default function ProductPage() {
  const { slug } = useParams<{ slug: string }>();
  const { lang } = useLanguage();
  const t = copy[lang];
  const { addItem } = useCart();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
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
      // Fetch related products (same category, exclude current)
      const { data: rel } = await supabase
        .from("products").select("*")
        .eq("category_id", data.category_id)
        .eq("is_active", true)
        .neq("slug", slug)
        .limit(3);
      setRelated(rel ?? []);
      setLoading(false);
    }
    load();
  }, [slug]);

  function handleAddToCart() {
    if (!product) return;
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
      qty
    );
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
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-28 sm:pb-24">
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
              <img src={img} alt={name} className="w-full h-full object-contain p-8" />
            ) : (
              <div className="w-32 h-32 border border-[#2B2B2E] flex items-center justify-center text-[#2B2B2E] text-6xl font-bold">
                {name.charAt(0)}
              </div>
            )}
          </div>

          {/* Right — Details */}
          <div className="bg-[#1A1A1C] flex flex-col p-5 sm:p-8 lg:p-12">
            <Link
              href={`/shop?cat=${product.category_id}`}
              className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-3 hover:text-[#F5F5F5] transition-colors"
            >
              {product.category_id}
            </Link>

            <h1
              className="text-[clamp(32px,5vw,56px)] leading-none text-[#F5F5F5] mb-6"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              {name}
            </h1>

            <div className="flex items-center gap-4 mb-1">
              <span className="text-3xl font-bold text-[#F5F5F5]">
                ฿{product.price.toLocaleString()}
              </span>
              <span className={`text-xs font-semibold tracking-widest uppercase flex items-center gap-1 ${inStock ? "text-[#4ade80]" : "text-[#A5A5A5]"}`}>
                {inStock ? <Check size={12} /> : <AlertCircle size={12} />}
                {inStock ? t.inStock : t.outOfStock}
              </span>
            </div>
            <p className="text-xs text-[#D32F3A]/80 mb-6">
              🔥 {t.firstOrderHint}
            </p>

            <p className="text-[#A5A5A5] text-sm leading-relaxed mb-8">{desc}</p>

            <div className="h-px bg-[#2B2B2E] mb-8" />

            {/* Qty + Add to Cart */}
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center border border-[#2B2B2E]">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={!inStock}
                  className="w-10 h-10 flex items-center justify-center text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors disabled:opacity-40"
                >
                  <Minus size={14} />
                </button>
                <span className="w-10 text-center text-[#F5F5F5] text-sm font-semibold">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={!inStock}
                  className="w-10 h-10 flex items-center justify-center text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors disabled:opacity-40"
                >
                  <Plus size={14} />
                </button>
              </div>

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
                {added ? <><Check size={14} /> {t.added}</> : <><ShoppingBag size={14} /> {t.addToCart}</>}
              </button>
            </div>

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

            {/* Shipping note */}
            <div className="mt-6 flex items-center gap-2 text-xs text-[#555] border-l-2 border-[#2B2B2E] pl-3">
              🚚 {lang === "th" ? "จัดส่งทั่วประเทศ · ขวดแรก ฿50 · ขวดต่อไป ฿30" : "Nationwide shipping · First ฿50 · Additional ฿30 each"}
            </div>
          </div>
        </div>

        {/* Related products */}
        {related.length > 0 && (
          <div className="mt-16">
            <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-4">
              {lang === "th" ? "สินค้าที่เกี่ยวข้อง" : "Related Products"}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-[#2B2B2E]">
              {related.map((p) => {
                const rname = lang === "en" ? p.name_en : p.name_th;
                const rimg = p.images?.[0] ?? null;
                return (
                  <Link key={p.id} href={`/products/${p.slug}`}
                    className="group bg-[#1A1A1C] flex flex-col hover:bg-[#1e1e20] transition-colors">
                    <div className="aspect-square bg-[#0F0F10] relative overflow-hidden">
                      {p.tag && <span className="absolute top-2 left-2 bg-[#D32F3A] text-[#F5F5F5] text-[9px] font-semibold px-2 py-0.5 tracking-widest uppercase z-10">{p.tag}</span>}
                      {rimg ? <img src={rimg} alt={rname} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        : <div className="w-full h-full flex items-center justify-center text-[#2B2B2E] text-4xl font-bold">{rname.charAt(0)}</div>}
                    </div>
                    <div className="p-4">
                      <p className="text-[#F5F5F5] text-sm font-semibold mb-1 group-hover:text-[#D32F3A] transition-colors">{rname}</p>
                      <p className="text-[#F5F5F5] font-bold">฿{p.price.toLocaleString()}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Sticky mobile Add-to-Cart bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-[#0F0F10]/95 backdrop-blur-md border-t border-[#2B2B2E] px-4 py-3 flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[#F5F5F5] font-semibold text-sm leading-tight truncate">{name}</p>
          <p className="text-[#D32F3A] font-bold text-base">฿{product.price.toLocaleString()}</p>
        </div>
        <div className="flex items-center border border-[#2B2B2E] shrink-0">
          <button onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={!inStock}
            className="w-9 h-10 flex items-center justify-center text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors disabled:opacity-40">
            <Minus size={13} />
          </button>
          <span className="w-8 text-center text-[#F5F5F5] text-sm font-semibold">{qty}</span>
          <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} disabled={!inStock}
            className="w-9 h-10 flex items-center justify-center text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors disabled:opacity-40">
            <Plus size={13} />
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`shrink-0 flex items-center gap-1.5 h-10 px-5 font-semibold text-xs tracking-widest uppercase transition-all duration-200 ${
            added
              ? "bg-[#2e5a2e] text-[#4ade80]"
              : inStock
              ? "bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5]"
              : "bg-[#1A1A1C] text-[#555] cursor-not-allowed"
          }`}
        >
          {added ? <Check size={13} /> : <ShoppingBag size={13} />}
          {added ? t.added : t.addToCart}
        </button>
      </div>
    </div>
  );
}
