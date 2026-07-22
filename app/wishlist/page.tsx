"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Loader2, ShoppingBag, X } from "lucide-react";
import { createClient } from "@/app/lib/supabase";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCart } from "@/app/contexts/CartContext";
import { useWishlist } from "@/app/contexts/WishlistContext";

type Product = {
  id: string; slug: string; name_en: string; name_th: string;
  price: number; stock: number; category_id: string; images: string[]; tag: string;
};

const copy = {
  en: {
    title: "Wishlist",
    empty: "Your wishlist is empty.",
    emptySub: "Tap the heart on any product to save it here.",
    browse: "Browse products",
    loginTitle: "Log in to see your wishlist",
    login: "Log in",
    addToCart: "Add to cart",
    remove: "Remove",
    outOfStock: "Out of stock",
    count: (n: number) => `${n} item${n === 1 ? "" : "s"}`,
  },
  th: {
    title: "รายการโปรด",
    empty: "ยังไม่มีสินค้าในรายการโปรด",
    emptySub: "กดรูปหัวใจที่สินค้าไหนก็ได้ เพื่อเก็บไว้ดูที่นี่",
    browse: "เลือกดูสินค้า",
    loginTitle: "เข้าสู่ระบบเพื่อดูรายการโปรด",
    login: "เข้าสู่ระบบ",
    addToCart: "หยิบใส่ตะกร้า",
    remove: "เอาออก",
    outOfStock: "สินค้าหมด",
    count: (n: number) => `${n} รายการ`,
  },
};

export default function WishlistPage() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const { addItem } = useCart();
  const { ids, ready, isLoggedIn, toggle } = useWishlist();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    let active = true;
    async function load() {
      const idList = Array.from(ids);
      if (idList.length === 0) { setProducts([]); setLoading(false); return; }
      const supabase = createClient();
      const { data } = await supabase
        .from("products")
        .select("id, slug, name_en, name_th, price, stock, category_id, images, tag")
        .in("id", idList)
        .eq("is_active", true);
      if (!active) return;
      setProducts((data as Product[]) ?? []);
      setLoading(false);
    }
    load();
    return () => { active = false; };
    // re-run when the set of ids changes
  }, [ready, ids]);

  // Logged out
  if (ready && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24 flex flex-col items-center justify-center text-center px-4">
        <Heart size={40} className="text-[#2B2B2E] mb-4" />
        <h1 className="text-2xl text-[#F5F5F5] mb-4" style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}>{t.loginTitle}</h1>
        <Link href="/login" className="text-[#D32F3A] text-sm font-semibold tracking-widest uppercase hover:text-[#F5F5F5] transition-colors">
          {t.login} →
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pb-8 border-b border-[#2B2B2E] flex items-end justify-between">
          <h1 className="text-[clamp(40px,7vw,72px)] leading-none text-[#F5F5F5] flex items-center gap-3"
            style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}>
            <Heart size={40} className="text-[#D32F3A]" fill="#D32F3A" /> {t.title}
          </h1>
          {products.length > 0 && <span className="text-[#555] text-sm">{t.count(products.length)}</span>}
        </div>

        {loading || !ready ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-[#D32F3A]" /></div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#F5F5F5] text-lg mb-2">{t.empty}</p>
            <p className="text-[#555] text-sm mb-8">{t.emptySub}</p>
            <Link href="/shop" className="inline-flex items-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] font-semibold text-sm px-6 py-3.5 tracking-widest uppercase transition-colors">
              {t.browse}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-px bg-[#2B2B2E]">
            {products.map((p) => {
              const name = lang === "en" ? p.name_en : p.name_th;
              const img = p.images?.[0] ?? null;
              const inStock = p.stock > 0;
              return (
                <div key={p.id} className="group bg-[#1A1A1C] flex flex-col">
                  <Link href={`/products/${p.slug}`} className="block aspect-square bg-[#0F0F10] relative overflow-hidden">
                    {p.tag && <span className="absolute top-2 left-2 bg-[#D32F3A] text-[#F5F5F5] text-[9px] font-semibold px-2 py-0.5 tracking-widest uppercase z-10">{p.tag}</span>}
                    <button
                      type="button"
                      onClick={(e) => { e.preventDefault(); toggle(p.id); }}
                      aria-label={t.remove}
                      className="absolute top-2 right-2 z-10 w-8 h-8 flex items-center justify-center bg-[#0F0F10]/70 backdrop-blur-sm border border-[#2B2B2E] hover:border-[#D32F3A] text-[#D32F3A] transition-colors"
                    >
                      <X size={14} />
                    </button>
                    {img
                      ? <img src={img} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      : <div className="w-full h-full flex items-center justify-center text-[#2B2B2E] text-4xl font-bold">{name.charAt(0)}</div>}
                  </Link>
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <div className="flex-1">
                      <Link href={`/products/${p.slug}`}>
                        <p className="text-[#F5F5F5] text-sm font-semibold mb-1 group-hover:text-[#D32F3A] transition-colors line-clamp-2">{name}</p>
                      </Link>
                      <p className="text-[#F5F5F5] font-bold">฿{p.price.toLocaleString()}</p>
                    </div>
                    <button
                      onClick={() => inStock && addItem({ id: p.id, slug: p.slug, name_en: p.name_en, name_th: p.name_th, price: p.price, img: img ?? "", category_id: p.category_id })}
                      disabled={!inStock}
                      className={`w-full flex items-center justify-center gap-1.5 h-9 text-xs font-semibold tracking-widest uppercase transition-colors ${
                        inStock ? "bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5]" : "bg-[#0F0F10] border border-[#2B2B2E] text-[#555] cursor-not-allowed"
                      }`}
                    >
                      <ShoppingBag size={13} /> {inStock ? t.addToCart : t.outOfStock}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
