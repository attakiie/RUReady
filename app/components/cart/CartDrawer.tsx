"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X, Trash2, ShoppingBag, ArrowRight, Plus, Minus } from "lucide-react";
import { useCart } from "@/app/contexts/CartContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useFirstOrderEligibility } from "@/app/lib/useFirstOrderEligibility";

const copy = {
  en: {
    title: "Your Cart",
    empty: "Your cart is empty",
    emptySub: "Head to the shop to gear up",
    shopNow: "Shop Now",
    subtotal: "Subtotal",
    firstOrderDiscount: "First Order Discount",
    total: "Total",
    checkout: "Checkout",
    continueShopping: "Continue Shopping",
    items: "items",
    remove: "Remove",
  },
  th: {
    title: "ตะกร้าสินค้า",
    empty: "ตะกร้าว่างอยู่",
    emptySub: "ไปเลือกสินค้ากันเลย",
    shopNow: "ไปร้านค้า",
    subtotal: "ยอดรวม",
    firstOrderDiscount: "ส่วนลดสมาชิกใหม่",
    total: "ยอดรวมสุทธิ",
    checkout: "ชำระเงิน",
    continueShopping: "เลือกต่อ",
    items: "ชิ้น",
    remove: "ลบ",
  },
};

const NEW_MEMBER_DISCOUNT = 30;

export default function CartDrawer() {
  const { items, removeItem, updateQty, total, count, drawerOpen, setDrawerOpen } = useCart();
  const { lang } = useLanguage();
  const t = copy[lang];
  const { isFirstOrder } = useFirstOrderEligibility();
  const discount = isFirstOrder ? NEW_MEMBER_DISCOUNT : 0;
  const grandTotal = Math.max(0, total - discount);

  // Lock body scroll when open
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setDrawerOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setDrawerOpen]);

  return (
    <>
      {/* Backdrop */}
      {drawerOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[200] backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Drawer panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[#0F0F10] border-l border-[#2B2B2E] z-[201] flex flex-col transition-transform duration-300 ease-in-out ${
          drawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#2B2B2E]">
          <div className="flex items-center gap-3">
            <ShoppingBag size={18} className="text-[#D32F3A]" />
            <span
              className="text-xl text-[#F5F5F5]"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.1em" }}
            >
              {t.title}
            </span>
            {count > 0 && (
              <span className="bg-[#D32F3A] text-[#F5F5F5] text-[10px] font-bold px-2 py-0.5 rounded-full">
                {count}
              </span>
            )}
          </div>
          <button
            onClick={() => setDrawerOpen(false)}
            className="text-[#555] hover:text-[#F5F5F5] transition-colors p-1"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-6 text-center">
              <div className="w-16 h-16 border border-[#2B2B2E] flex items-center justify-center">
                <ShoppingBag size={28} className="text-[#2B2B2E]" />
              </div>
              <p className="text-[#F5F5F5] font-semibold">{t.empty}</p>
              <p className="text-[#555] text-sm">{t.emptySub}</p>
              <Link
                href="/shop"
                onClick={() => setDrawerOpen(false)}
                className="inline-flex items-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] text-xs font-semibold tracking-widest uppercase px-6 py-3 transition-colors"
              >
                {t.shopNow} <ArrowRight size={12} />
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#1e1e1e]">
              {items.map((item) => {
                const name = lang === "en" ? item.name_en : item.name_th;
                return (
                  <div key={item.id} className="flex gap-4 px-6 py-5">
                    {/* Image */}
                    <div className="w-16 h-16 bg-[#1A1A1C] border border-[#2B2B2E] flex-shrink-0 overflow-hidden">
                      {item.img ? (
                        <img src={item.img} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#2B2B2E] text-lg font-bold">
                          {name.charAt(0)}
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.slug}`}
                        onClick={() => setDrawerOpen(false)}
                        className="text-sm font-semibold text-[#F5F5F5] hover:text-[#D32F3A] transition-colors line-clamp-2 leading-snug"
                      >
                        {name}
                      </Link>
                      <p className="text-[#D32F3A] font-bold mt-1">
                        ฿{(item.price * item.qty).toLocaleString()}
                      </p>

                      {/* Qty controls */}
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center border border-[#2B2B2E]">
                          <button
                            onClick={() => updateQty(item.id, item.qty - 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="w-7 text-center text-[#F5F5F5] text-xs font-semibold">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQty(item.id, item.qty + 1)}
                            className="w-7 h-7 flex items-center justify-center text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors"
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-[#555] hover:text-[#D32F3A] transition-colors"
                          aria-label={t.remove}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer — only show when items exist */}
        {items.length > 0 && (
          <div className="border-t border-[#2B2B2E] px-6 py-5 flex flex-col gap-4">
            {/* Subtotal */}
            <div className="flex items-center justify-between">
              <span className="text-[#A5A5A5] text-sm uppercase tracking-widest">{t.subtotal}</span>
              <span className="text-[#F5F5F5] text-xl font-bold">
                ฿{total.toLocaleString()}
              </span>
            </div>

            {discount > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-[#4ade80] text-sm uppercase tracking-widest">{t.firstOrderDiscount}</span>
                  <span className="text-[#4ade80] text-sm font-bold">-฿{discount}</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#2B2B2E]">
                  <span className="text-[#A5A5A5] text-sm uppercase tracking-widest">{t.total}</span>
                  <span className="text-[#F5F5F5] text-xl font-bold">
                    ฿{grandTotal.toLocaleString()}
                  </span>
                </div>
              </>
            )}

            {/* Buttons */}
            <Link
              href="/checkout"
              onClick={() => setDrawerOpen(false)}
              className="w-full flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] font-semibold text-sm tracking-widest uppercase py-4 transition-colors"
            >
              {t.checkout} <ArrowRight size={14} />
            </Link>
            <button
              onClick={() => setDrawerOpen(false)}
              className="w-full text-center text-xs text-[#555] hover:text-[#A5A5A5] tracking-widest uppercase transition-colors"
            >
              {t.continueShopping}
            </button>
          </div>
        )}
      </div>
    </>
  );
}
