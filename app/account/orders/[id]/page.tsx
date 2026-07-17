"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package, Loader2, Truck } from "lucide-react";

const LINE_OPENCHAT = "https://line.me/ti/g2/eQ6xRJ2zwfCd0W99zlxQhMGkPBi_ZqOzVylHBA?utm_source=invitation&utm_medium=link_copy&utm_campaign=default";
import { createClient } from "@/app/lib/supabase";
import { useLanguage } from "@/app/contexts/LanguageContext";

type OrderItem = {
  id: string;
  name_th: string;
  name_en: string;
  slug: string;
  qty: number;
  price: number;
  img: string;
};

type Order = {
  id: string;
  status: string;
  full_name: string;
  phone: string;
  address: string;
  note: string;
  subtotal: number;
  shipping: number;
  discount?: number;
  total: number;
  created_at: string;
  tracking_number?: string;
  order_items: OrderItem[];
};

const statusMeta: Record<string, { th: string; en: string; color: string }> = {
  pending:   { th: "รอยืนยัน",   en: "Pending",   color: "#f59e0b" },
  paid:      { th: "ชำระแล้ว",   en: "Paid",      color: "#4ade80" },
  shipped:   { th: "จัดส่งแล้ว", en: "Shipped",   color: "#5b8dee" },
  completed: { th: "สำเร็จ",     en: "Completed", color: "#4ade80" },
  cancelled: { th: "ยกเลิก",     en: "Cancelled", color: "#D32F3A" },
};

// Simple status timeline
const STATUS_STEPS = ["pending", "paid", "shipped", "completed"];

const copy = {
  en: {
    back: "My Orders",
    order: "Order",
    status: "Status",
    items: "Items",
    shippingInfo: "Shipping Details",
    breakdown: "Price Breakdown",
    subtotal: "Subtotal",
    shipping: "Shipping",
    discount: "New member discount",
    total: "Total",
    note: "Note",
    tracking: "Tracking Number",
    trackingHint: "Use this number to track your parcel.",
    contact: "Questions? Contact us on LINE",
    shopMore: "Continue Shopping",
    notFound: "Order not found",
  },
  th: {
    back: "ออเดอร์ของฉัน",
    order: "ออเดอร์",
    status: "สถานะ",
    items: "รายการสินค้า",
    shippingInfo: "ข้อมูลจัดส่ง",
    breakdown: "สรุปราคา",
    subtotal: "ค่าสินค้า",
    shipping: "ค่าจัดส่ง",
    discount: "ส่วนลดสมาชิกใหม่",
    total: "ยอดรวมทั้งสิ้น",
    note: "หมายเหตุ",
    tracking: "หมายเลขพัสดุ",
    trackingHint: "ใช้หมายเลขนี้ติดตามสถานะการจัดส่งได้เลย",
    contact: "มีคำถาม? ทักมาทาง LINE",
    shopMore: "ซื้อสินค้าต่อ",
    notFound: "ไม่พบออเดอร์",
  },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { lang } = useLanguage();
  const t = copy[lang];

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("id", id)
        .eq("user_id", session.user.id)
        .single();

      if (!data) { setNotFound(true); setLoading(false); return; }
      setOrder(data as Order);
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
      <Loader2 size={22} className="text-[#D32F3A] animate-spin" />
    </div>
  );

  if (notFound || !order) return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col items-center justify-center gap-4">
      <Package size={32} className="text-[#2B2B2E]" />
      <p className="text-[#F5F5F5] font-semibold">{t.notFound}</p>
      <Link href="/account" className="text-[#D32F3A] text-xs uppercase tracking-widest underline">{t.back}</Link>
    </div>
  );

  const meta = statusMeta[order.status] ?? { th: order.status, en: order.status, color: "#A5A5A5" };
  const statusLabel = lang === "th" ? meta.th : meta.en;
  const date = new Date(order.created_at);
  const shortId = order.id.slice(0, 8).toUpperCase();

  // Which step are we on?
  const stepIndex = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-24 pb-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Back */}
        <Link href="/account"
          className="inline-flex items-center gap-2 text-[#555] hover:text-[#D32F3A] text-xs uppercase tracking-widest mb-8 transition-colors">
          <ArrowLeft size={12} /> {t.back}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[#555] text-xs uppercase tracking-widest mb-1">{t.order}</p>
          <h1 className="text-[clamp(32px,6vw,52px)] leading-none text-[#F5F5F5] mb-1"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            #{shortId}
          </h1>
          <p className="text-[#555] text-xs">
            {date.toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", {
              day: "numeric", month: "long", year: "numeric",
            })}
            {" · "}
            {date.toLocaleTimeString(lang === "th" ? "th-TH" : "en-GB", {
              hour: "2-digit", minute: "2-digit",
            })}
          </p>
        </div>

        {/* Status + timeline */}
        <div className="bg-[#1A1A1C] border border-[#2B2B2E] p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[#555] text-xs uppercase tracking-widest">{t.status}</p>
            <span
              className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border"
              style={{ color: meta.color, borderColor: meta.color + "40", background: meta.color + "12" }}
            >
              {statusLabel}
            </span>
          </div>

          {!isCancelled && (
            <div className="flex items-center gap-0">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= stepIndex;
                const isLast = i === STATUS_STEPS.length - 1;
                const stepMeta = statusMeta[step];
                return (
                  <div key={step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full border-2 transition-colors ${done ? "border-[#D32F3A] bg-[#D32F3A]" : "border-[#2B2B2E] bg-transparent"}`}
                      />
                      <span className={`text-[9px] uppercase tracking-widest whitespace-nowrap ${done ? "text-[#D32F3A]" : "text-[#3A3A3E]"}`}>
                        {lang === "th" ? stepMeta.th : stepMeta.en}
                      </span>
                    </div>
                    {!isLast && (
                      <div className={`flex-1 h-px mx-1 mb-3 ${i < stepIndex ? "bg-[#D32F3A]" : "bg-[#2B2B2E]"}`} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tracking number (shown only when admin has entered one) */}
        {order.tracking_number && (
          <div className="bg-[#1A1A1C] border border-[#5b8dee]/40 p-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Truck size={14} className="text-[#5b8dee]" />
              <p className="text-[#5b8dee] text-[10px] font-semibold uppercase tracking-widest">{t.tracking}</p>
            </div>
            <p className="text-[#F5F5F5] font-mono font-bold text-lg tracking-widest">{order.tracking_number}</p>
            <p className="text-[#555] text-xs mt-1">{t.trackingHint}</p>
          </div>
        )}

        {/* Items */}
        <div className="bg-[#1A1A1C] border border-[#2B2B2E] mb-6">
          <div className="px-5 py-3 border-b border-[#2B2B2E]">
            <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest">{t.items}</p>
          </div>
          <div className="flex flex-col gap-px bg-[#2B2B2E]">
            {order.order_items.map((item) => {
              const name = lang === "en" ? item.name_en : item.name_th;
              return (
                <div key={item.id} className="bg-[#1A1A1C] flex items-center gap-4 px-5 py-4">
                  <div className="w-12 h-12 bg-[#0F0F10] border border-[#2B2B2E] shrink-0 overflow-hidden">
                    {item.img && <img src={item.img} alt={name} className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/products/${item.slug}`}
                      className="text-[#F5F5F5] text-sm font-semibold hover:text-[#D32F3A] transition-colors truncate block">
                      {name}
                    </Link>
                    <p className="text-[#555] text-xs">× {item.qty}</p>
                  </div>
                  <p className="text-[#F5F5F5] font-bold shrink-0">฿{(item.price * item.qty).toLocaleString()}</p>
                </div>
              );
            })}
          </div>

          {/* Cost breakdown */}
          <div className="px-5 py-4 border-t border-[#2B2B2E] flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">{t.subtotal}</span>
              <span className="text-[#A5A5A5]">฿{order.subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#555]">{t.shipping}</span>
              <span className="text-[#A5A5A5]">฿{order.shipping}</span>
            </div>
            {!!order.discount && order.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[#4ade80]">{t.discount}</span>
                <span className="text-[#4ade80]">-฿{order.discount}</span>
              </div>
            )}
            <div className="flex justify-between font-bold pt-2 border-t border-[#2B2B2E] mt-1">
              <span className="text-[#F5F5F5]">{t.total}</span>
              <span className="text-[#D32F3A] text-lg">฿{order.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Shipping details */}
        <div className="bg-[#1A1A1C] border border-[#2B2B2E] p-5 mb-6">
          <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest mb-3">{t.shippingInfo}</p>
          <p className="text-[#F5F5F5] text-sm font-semibold">{order.full_name}</p>
          <p className="text-[#A5A5A5] text-sm">{order.phone}</p>
          <p className="text-[#A5A5A5] text-sm mt-1 whitespace-pre-wrap leading-relaxed">{order.address}</p>
          {order.note && (
            <div className="mt-3 border-l-2 border-[#2B2B2E] pl-3">
              <p className="text-[#555] text-xs font-semibold uppercase tracking-widest mb-0.5">{t.note}</p>
              <p className="text-[#555] text-xs">{order.note}</p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/shop"
            className="flex-1 flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] text-xs font-semibold px-5 py-3 tracking-widest uppercase transition-colors">
            {t.shopMore}
          </Link>
          <a href={LINE_OPENCHAT} target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 border border-[#2B2B2E] hover:border-[#D32F3A] text-[#555] hover:text-[#F5F5F5] text-xs font-semibold px-5 py-3 tracking-widest uppercase transition-colors">
            {t.contact}
          </a>
        </div>
      </div>
    </div>
  );
}
