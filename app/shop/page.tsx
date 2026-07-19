"use client";

import { Suspense, useEffect, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal, ArrowRight, X } from "lucide-react";
import { createClient } from "@/app/lib/supabase";
import { useLanguage } from "@/app/contexts/LanguageContext";

type Product = {
  id: string;
  slug: string;
  name_en: string;
  name_th: string;
  price: number;
  stock: number;
  category_id: string;
  images: string[];
  tag: string;
};

type Category = {
  id: string;
  name_en: string;
  name_th: string;
};

const copy = {
  en: {
    title: "Shop",
    all: "All",
    search: "Search products…",
    sort: "Sort",
    sortOptions: [
      { value: "default", label: "Default" },
      { value: "price_asc", label: "Price: Low → High" },
      { value: "price_desc", label: "Price: High → Low" },
    ],
    inStock: "In Stock",
    outOfStock: "Out of Stock",
    addToCart: "Gear Up",
    noResults: "No products found",
    noResultsSub: "Try a different search or category",
    results: "products",
    loading: "Loading…",
    firstOrderHint: "First purchase eligible for 30 THB discount",
  },
  th: {
    title: "ร้านค้า",
    all: "ทั้งหมด",
    search: "ค้นหาสินค้า…",
    sort: "เรียงตาม",
    sortOptions: [
      { value: "default", label: "ค่าเริ่มต้น" },
      { value: "price_asc", label: "ราคา: น้อย → มาก" },
      { value: "price_desc", label: "ราคา: มาก → น้อย" },
    ],
    inStock: "มีสินค้า",
    outOfStock: "สินค้าหมด",
    addToCart: "หยิบใส่ตะกร้า",
    noResults: "ไม่พบสินค้า",
    noResultsSub: "ลองค้นหาด้วยคำอื่น หรือเลือกหมวดหมู่อื่น",
    results: "รายการ",
    loading: "กำลังโหลด…",
    firstOrderHint: "สั่งซื้อครั้งแรก รับส่วนลด 30 บาท",
  },
};

// Inner component that uses useSearchParams — must be inside <Suspense>
function ShopContent() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("default");
  const activeCategory = searchParams.get("cat") ?? "all";

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const [{ data: prods }, { data: cats }] = await Promise.all([
        supabase.from("products").select("*").eq("is_active", true),
        supabase.from("categories").select("id, name_en, name_th").order("sort_order"),
      ]);
      setProducts(prods ?? []);
      setCategories(cats ?? []);
      setLoading(false);
    }
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    let list = [...products];
    if (activeCategory !== "all") {
      list = list.filter((p) => p.category_id === activeCategory);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name_en.toLowerCase().includes(q) ||
          p.name_th.toLowerCase().includes(q)
      );
    }
    if (sort === "price_asc") list.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, activeCategory, search, sort]);

  function setCategory(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (id === "all") params.delete("cat");
    else params.set("cat", id);
    router.replace(`/shop?${params.toString()}`);
  }

  return (
    <>
      {/* Filters row */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3E]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="w-full bg-[#1A1A1C] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm pl-9 pr-4 py-3 outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#F5F5F5]"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div className="relative shrink-0">
          <SlidersHorizontal size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#3A3A3E] pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="appearance-none bg-[#1A1A1C] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#A5A5A5] text-sm pl-9 pr-8 py-3 outline-none transition-colors cursor-pointer w-[130px] sm:w-[180px]"
          >
            {t.sortOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Category chips — scrollable on mobile */}
      <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-none pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap">
        <CategoryChip active={activeCategory === "all"} onClick={() => setCategory("all")}>
          {t.all}
        </CategoryChip>
        {categories.map((cat) => (
          <CategoryChip
            key={cat.id}
            active={activeCategory === cat.id}
            onClick={() => setCategory(cat.id)}
          >
            {lang === "en" ? cat.name_en : cat.name_th}
          </CategoryChip>
        ))}
      </div>

      {/* Shipping banner */}
      <div className="flex items-center gap-3 bg-[#1A1A1C] border border-[#2B2B2E] px-4 py-3 mb-6 text-xs text-[#A5A5A5]">
        <span className="text-base">🚚</span>
        <span>{lang === "th" ? "จัดส่งทั่วประเทศ · แก๊ส กระป๋องแรก ฿50 ถัดไป ฿30 · สินค้าอื่น ฿30/ชิ้น" : "Nationwide shipping · Gas ฿50 first can, ฿30 each additional · Other items ฿30/pc"}</span>
      </div>

      {/* Result count */}
      {!loading && (
        <p className="text-[#555] text-xs tracking-widest uppercase mb-6">
          {filtered.length} {t.results}
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#2B2B2E]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-[#1A1A1C] aspect-square animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32">
          <p className="text-[#F5F5F5] text-2xl font-semibold mb-2">{t.noResults}</p>
          <p className="text-[#555] text-sm">{t.noResultsSub}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#2B2B2E]">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} t={t} lang={lang} />
          ))}
        </div>
      )}
    </>
  );
}

export default function ShopPage() {
  const { lang } = useLanguage();
  const t = copy[lang];

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-50" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-10 border-b border-[#2B2B2E] pb-8">
          <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
            R U READY
          </p>
          <h1
            className="text-[clamp(48px,8vw,80px)] leading-none text-[#F5F5F5]"
            style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}
          >
            {t.title}
          </h1>
        </div>

        {/* Wrap useSearchParams content in Suspense */}
        <Suspense fallback={
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-px bg-[#2B2B2E]">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#1A1A1C] aspect-square animate-pulse" />
            ))}
          </div>
        }>
          <ShopContent />
        </Suspense>
      </div>
    </div>
  );
}

function CategoryChip({
  active, onClick, children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold tracking-widest uppercase px-4 py-2.5 transition-all duration-150 whitespace-nowrap ${
        active
          ? "bg-[#D32F3A] text-[#F5F5F5] border border-[#D32F3A]"
          : "bg-transparent text-[#A5A5A5] border border-[#2B2B2E] hover:border-[#D32F3A] hover:text-[#F5F5F5]"
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({
  product, t, lang,
}: {
  product: Product;
  t: typeof copy.en;
  lang: "en" | "th";
}) {
  const name = lang === "en" ? product.name_en : product.name_th;
  const img = product.images?.[0] ?? null;
  const inStock = product.stock > 0;

  return (
    <div className="group bg-[#1A1A1C] flex flex-col">
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
        <Link
          href={`/products/${product.slug}`}
          className="mt-auto w-full flex items-center justify-center gap-1 sm:gap-2 bg-[#0F0F10] hover:bg-[#D32F3A] border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5] text-[10px] sm:text-xs font-semibold tracking-widest uppercase py-2.5 sm:py-3 transition-all duration-200"
        >
          {t.addToCart} <ArrowRight size={10} className="sm:w-3 sm:h-3" />
        </Link>
      </div>
    </div>
  );
}
