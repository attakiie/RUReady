"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Loader2, Copy, Check, MapPin, ChevronDown } from "lucide-react";
import { createClient } from "@/app/lib/supabase";
import { useCart } from "@/app/contexts/CartContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { promptPayQRImageUrl } from "@/app/lib/promptpay";

const STORE_PHONE = process.env.NEXT_PUBLIC_PROMPTPAY_PHONE ?? "0800000000";

type SavedAddress = {
  id: string;
  label: string;
  full_name: string;
  phone: string;
  address: string;
  is_default: boolean;
};

const copy = {
  en: {
    title: "Checkout",
    shipping: "Shipping Details",
    savedAddresses: "Saved Addresses",
    useNewAddress: "Enter a new address",
    fullName: "Full Name",
    phone: "Phone",
    address: "Shipping Address",
    note: "Note (optional)",
    notePlaceholder: "Special instructions, gate code, etc.",
    orderSummary: "Order Summary",
    shippingFee: "Shipping",
    total: "Total",
    payment: "Payment",
    paymentDesc: "Transfer via PromptPay then tap Confirm",
    qrHelp: "Open your banking app → Scan QR code → Transfer ฿",
    confirm: "Confirm Payment",
    confirming: "Saving order…",
    freeShipNote: "Shipping: ฿50 first item · ฿30 each additional",
    copied: "Copied!",
    copyPhone: "Copy number",
  },
  th: {
    title: "ชำระเงิน",
    shipping: "ที่อยู่จัดส่ง",
    savedAddresses: "ที่อยู่ที่บันทึกไว้",
    useNewAddress: "กรอกที่อยู่ใหม่",
    fullName: "ชื่อ-นามสกุล",
    phone: "เบอร์โทรศัพท์",
    address: "ที่อยู่จัดส่ง",
    note: "หมายเหตุ (ถ้ามี)",
    notePlaceholder: "บอกรายละเอียดเพิ่มเติม เช่น บ้านล็อคประตู",
    orderSummary: "สรุปออเดอร์",
    shippingFee: "ค่าจัดส่ง",
    total: "ยอดรวมทั้งสิ้น",
    payment: "ชำระเงิน",
    paymentDesc: "โอนเงินผ่าน PromptPay แล้วกด ยืนยัน",
    qrHelp: "เปิดแอปธนาคาร → สแกน QR → โอนเงิน ฿",
    confirm: "ยืนยันการชำระเงิน",
    confirming: "กำลังบันทึกออเดอร์…",
    freeShipNote: "ค่าจัดส่ง: ขวดแรก ฿50 · ขวดต่อไป ฿30",
    copied: "คัดลอกแล้ว!",
    copyPhone: "คัดลอกเบอร์",
  },
};

function calcShipping(totalQty: number): number {
  if (totalQty === 0) return 0;
  return 50 + Math.max(0, totalQty - 1) * 30;
}

export default function CheckoutPage() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const { items, total: subtotal, count, clearCart } = useCart();
  const router = useRouter();

  const [form, setForm] = useState({ fullName: "", phone: "", address: "", note: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Address book
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | "new">("new");
  const [addrDropdownOpen, setAddrDropdownOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const shipping = calcShipping(count);
  const grandTotal = subtotal + shipping;
  const qrUrl = promptPayQRImageUrl(STORE_PHONE, grandTotal);

  // Load saved addresses + prefill profile
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      // Load saved addresses
      const { data: addrs } = await supabase
        .from("addresses")
        .select("*")
        .eq("user_id", user.id)
        .order("is_default", { ascending: false })
        .order("created_at");

      if (addrs && addrs.length > 0) {
        setSavedAddresses(addrs as SavedAddress[]);
        // Auto-select default
        const def = (addrs as SavedAddress[]).find((a) => a.is_default) ?? addrs[0];
        setSelectedAddrId(def.id);
        setForm((f) => ({ ...f, fullName: def.full_name, phone: def.phone, address: def.address }));
      } else {
        // No saved addresses — prefill from profile
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, phone")
          .eq("id", user.id)
          .single();
        if (profile) {
          setForm((f) => ({
            ...f,
            fullName: `${profile.first_name} ${profile.last_name}`.trim(),
            phone: profile.phone ?? "",
          }));
        }
      }
    }
    init();
  }, []);

  // Redirect if cart empty
  useEffect(() => {
    if (items.length === 0) router.replace("/shop");
  }, [items, router]);

  function selectAddress(addr: SavedAddress) {
    setSelectedAddrId(addr.id);
    setForm((f) => ({ ...f, fullName: addr.full_name, phone: addr.phone, address: addr.address }));
    setAddrDropdownOpen(false);
  }

  function selectNew() {
    setSelectedAddrId("new");
    setForm((f) => ({ ...f, fullName: "", phone: "", address: "" }));
    setAddrDropdownOpen(false);
  }

  function set(k: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        user_id: user?.id ?? null,
        full_name: form.fullName.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
        note: form.note.trim(),
        subtotal,
        shipping,
        total: grandTotal,
        status: "pending",
      })
      .select("id")
      .single();

    if (orderErr || !order) {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
      setLoading(false);
      return;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.id,
      slug: item.slug,
      name_th: item.name_th,
      name_en: item.name_en,
      price: item.price,
      qty: item.qty,
      img: item.img,
    }));

    const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
    if (itemsErr) {
      setError("บันทึกรายการสินค้าไม่สำเร็จ");
      setLoading(false);
      return;
    }

    clearCart();
    router.push(`/checkout/success?id=${order.id}`);
  }

  function copyPhone() {
    navigator.clipboard.writeText(STORE_PHONE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const selectedAddr = savedAddresses.find((a) => a.id === selectedAddrId);

  if (items.length === 0) return null;

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10 pb-8 border-b border-[#2B2B2E]">
          <Link href="/shop" className="inline-flex items-center gap-2 text-[#555] hover:text-[#D32F3A] text-xs uppercase tracking-widest mb-4 transition-colors">
            <ArrowLeft size={12} /> {lang === "th" ? "กลับไปร้านค้า" : "Back to Shop"}
          </Link>
          <h1 className="text-[clamp(40px,7vw,72px)] leading-none text-[#F5F5F5]"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            {t.title}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* LEFT — Shipping */}
            <div className="flex flex-col gap-6">
              <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D32F3A]">{t.shipping}</h2>

              {/* Saved address selector (only for logged-in users with saved addresses) */}
              {savedAddresses.length > 0 && (
                <div className="flex flex-col gap-2">
                  <label className="text-[#A5A5A5] text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5">
                    <MapPin size={11} /> {t.savedAddresses}
                  </label>

                  {/* Dropdown trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setAddrDropdownOpen((v) => !v)}
                      className="w-full flex items-center justify-between bg-[#1A1A1C] border border-[#2B2B2E] hover:border-[#D32F3A] px-4 py-3 text-left transition-colors"
                    >
                      <div className="min-w-0">
                        {selectedAddrId === "new" ? (
                          <span className="text-[#A5A5A5] text-sm">{t.useNewAddress}</span>
                        ) : selectedAddr ? (
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#D32F3A] mr-2">{selectedAddr.label}</span>
                            <span className="text-[#F5F5F5] text-sm">{selectedAddr.full_name}</span>
                            <p className="text-[#555] text-xs truncate mt-0.5">{selectedAddr.address}</p>
                          </div>
                        ) : null}
                      </div>
                      <ChevronDown size={14} className={`text-[#555] shrink-0 ml-2 transition-transform ${addrDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {/* Dropdown list */}
                    {addrDropdownOpen && (
                      <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-[#1A1A1C] border border-[#2B2B2E] shadow-xl">
                        {savedAddresses.map((addr) => (
                          <button key={addr.id} type="button" onClick={() => selectAddress(addr)}
                            className={`w-full text-left px-4 py-3 hover:bg-[#2B2B2E] transition-colors border-b border-[#2B2B2E] last:border-0 ${selectedAddrId === addr.id ? "bg-[#D32F3A]/5" : ""}`}>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-bold uppercase tracking-widest text-[#D32F3A]">{addr.label}</span>
                              {addr.is_default && <span className="text-[9px] text-[#555] uppercase tracking-widest">default</span>}
                            </div>
                            <p className="text-[#F5F5F5] text-sm">{addr.full_name} · {addr.phone}</p>
                            <p className="text-[#555] text-xs truncate">{addr.address}</p>
                          </button>
                        ))}
                        <button type="button" onClick={selectNew}
                          className="w-full text-left px-4 py-3 hover:bg-[#2B2B2E] transition-colors text-[#A5A5A5] text-sm">
                          + {t.useNewAddress}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Link to manage addresses */}
                  <Link href="/account" className="text-[#555] hover:text-[#D32F3A] text-xs transition-colors">
                    จัดการที่อยู่ →
                  </Link>
                </div>
              )}

              {/* Form fields — editable regardless */}
              <Field label={t.fullName} required>
                <input type="text" value={form.fullName} onChange={set("fullName")}
                  placeholder="สมชาย ใจดี" required className={inputCls} />
              </Field>
              <Field label={t.phone} required>
                <input type="tel" value={form.phone} onChange={set("phone")}
                  placeholder="0812345678" required className={inputCls} />
              </Field>
              <Field label={t.address} required>
                <textarea value={form.address} onChange={set("address")}
                  placeholder={"123 ถ.สุขุมวิท แขวงคลองเตย\nเขตคลองเตย กรุงเทพฯ 10110"}
                  required rows={4} className={inputCls + " resize-none"} />
              </Field>
              <Field label={t.note}>
                <input type="text" value={form.note} onChange={set("note")}
                  placeholder={t.notePlaceholder} className={inputCls} />
              </Field>

              <p className="text-[#555] text-xs tracking-wide border-l-2 border-[#2B2B2E] pl-3">
                {t.freeShipNote}
              </p>
            </div>

            {/* RIGHT — Summary + QR */}
            <div className="flex flex-col gap-6">
              {/* Order summary */}
              <div className="bg-[#1A1A1C] border border-[#2B2B2E]">
                <div className="px-5 py-4 border-b border-[#2B2B2E]">
                  <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D32F3A]">{t.orderSummary}</h2>
                </div>
                <div className="px-5 py-4 flex flex-col gap-3">
                  {items.map((item) => {
                    const name = lang === "en" ? item.name_en : item.name_th;
                    return (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#0F0F10] border border-[#2B2B2E] flex-shrink-0 overflow-hidden">
                          {item.img && <img src={item.img} alt={name} className="w-full h-full object-cover" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[#F5F5F5] text-xs font-semibold truncate">{name}</p>
                          <p className="text-[#555] text-xs">× {item.qty}</p>
                        </div>
                        <p className="text-[#F5F5F5] text-sm font-bold">฿{(item.price * item.qty).toLocaleString()}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="px-5 py-4 border-t border-[#2B2B2E] flex flex-col gap-2">
                  <div className="flex justify-between text-sm text-[#A5A5A5]">
                    <span>Subtotal</span><span>฿{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-[#A5A5A5]">
                    <span>{t.shippingFee}</span><span>฿{shipping}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-[#F5F5F5] pt-2 border-t border-[#2B2B2E]">
                    <span>{t.total}</span>
                    <span className="text-[#D32F3A]">฿{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* PromptPay QR */}
              <div className="bg-[#1A1A1C] border border-[#2B2B2E]">
                <div className="px-5 py-4 border-b border-[#2B2B2E]">
                  <h2 className="text-xs font-semibold tracking-[0.2em] uppercase text-[#D32F3A]">{t.payment}</h2>
                  <p className="text-[#555] text-xs mt-1">{t.paymentDesc}</p>
                </div>
                <div className="px-5 py-6 flex flex-col items-center gap-4">
                  <div className="bg-white p-2 inline-block">
                    <img src={qrUrl} alt="PromptPay QR" width={220} height={220} />
                  </div>
                  <p className="text-[#A5A5A5] text-xs text-center">
                    {t.qrHelp}<span className="text-[#F5F5F5] font-bold">{grandTotal.toLocaleString()}</span>
                  </p>
                  <button type="button" onClick={copyPhone}
                    className="flex items-center gap-2 text-xs text-[#555] hover:text-[#F5F5F5] transition-colors border border-[#2B2B2E] hover:border-[#D32F3A] px-4 py-2">
                    {copied
                      ? <><Check size={12} className="text-[#4ade80]" /> {t.copied}</>
                      : <><Copy size={12} /> {t.copyPhone}: {STORE_PHONE}</>}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-3 text-[#D32F3A] text-sm">
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 text-[#F5F5F5] font-semibold text-sm px-6 py-4 tracking-widest uppercase transition-colors">
                {loading
                  ? <><Loader2 size={16} className="animate-spin" /> {t.confirming}</>
                  : <>{t.confirm} <ArrowRight size={16} /></>}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls = "w-full bg-[#0F0F10] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-4 py-3 outline-none transition-colors";

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#A5A5A5] text-xs font-semibold tracking-widest uppercase">
        {label}{required && <span className="text-[#D32F3A] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
