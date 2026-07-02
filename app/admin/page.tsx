"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, RefreshCw, Package, ChevronDown, ChevronUp, LogOut } from "lucide-react";
import { createClient } from "@/app/lib/supabase";

// ---- Types ----
type OrderItem = {
  id: string;
  name_th: string;
  name_en: string;
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
  total: number;
  created_at: string;
  user_id: string | null;
  order_items: OrderItem[];
};

// ---- Constants ----
const STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_META: Record<Status, { th: string; color: string; bg: string }> = {
  pending:   { th: "รอยืนยัน",   color: "#f59e0b", bg: "#f59e0b18" },
  paid:      { th: "ชำระแล้ว",   color: "#4ade80", bg: "#4ade8018" },
  shipped:   { th: "จัดส่งแล้ว", color: "#5b8dee", bg: "#5b8dee18" },
  completed: { th: "สำเร็จ",     color: "#4ade80", bg: "#4ade8018" },
  cancelled: { th: "ยกเลิก",     color: "#D32F3A", bg: "#D32F3A18" },
};

// ---- Admin guard ----
// To enable admin access: run in Supabase SQL Editor:
//   ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;
//   UPDATE profiles SET is_admin = true WHERE id = '<your-user-id>';

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = useCallback(async (showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });
    setOrders((data as Order[]) ?? []);
    if (showSpinner) setRefreshing(false);
  }, []);

  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      // Check is_admin on profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", session.user.id)
        .single();

      if (!profile?.is_admin) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      await fetchOrders();
      setLoading(false);
    }
    init();
  }, [router, fetchOrders]);

  async function updateStatus(orderId: string, newStatus: Status) {
    setUpdatingId(orderId);
    const supabase = createClient();
    await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
    setUpdatingId(null);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  // ---- States ----
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <Loader2 size={24} className="text-[#D32F3A] animate-spin" />
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex flex-col items-center justify-center gap-4 text-center px-4">
        <p className="text-[#D32F3A] text-4xl font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>ACCESS DENIED</p>
        <p className="text-[#555] text-sm max-w-xs">
          คุณไม่มีสิทธิ์เข้าหน้านี้ ต้องตั้ง is_admin = true ใน Supabase ก่อน
        </p>
        <Link href="/" className="text-[#D32F3A] text-xs uppercase tracking-widest underline">กลับหน้าแรก</Link>
      </div>
    );
  }

  const filtered = filterStatus === "all"
    ? orders
    : orders.filter((o) => o.status === filterStatus);

  // Summary counts
  const summary = STATUSES.reduce((acc, s) => {
    acc[s] = orders.filter((o) => o.status === s).length;
    return acc;
  }, {} as Record<Status, number>);

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-6 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 pt-4">
          <div>
            <Link href="/" className="text-[#555] text-xs uppercase tracking-widest hover:text-[#D32F3A] transition-colors mb-1 inline-block">
              ← R U READY
            </Link>
            <h1 className="text-[clamp(36px,6vw,60px)] leading-none text-[#F5F5F5]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              ADMIN
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchOrders(true)}
              className="flex items-center gap-1.5 text-[#555] hover:text-[#F5F5F5] text-xs uppercase tracking-widest border border-[#2B2B2E] hover:border-[#D32F3A] px-3 py-2 transition-colors"
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> รีเฟรช
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-[#D32F3A] text-xs uppercase tracking-widest border border-[#D32F3A]/40 px-3 py-2 hover:bg-[#D32F3A]/10 transition-colors"
            >
              <LogOut size={12} /> ออก
            </button>
          </div>
        </div>

        {/* Summary bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-px bg-[#2B2B2E] mb-8">
          {STATUSES.map((s) => {
            const m = STATUS_META[s];
            return (
              <button key={s}
                onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                className={`bg-[#1A1A1C] flex flex-col items-center py-4 transition-colors ${filterStatus === s ? "bg-[#2B2B2E]" : "hover:bg-[#1e1e20]"}`}
              >
                <span className="text-2xl font-bold" style={{ color: m.color }}>{summary[s]}</span>
                <span className="text-[#555] text-[10px] uppercase tracking-widest mt-0.5">{m.th}</span>
              </button>
            );
          })}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button onClick={() => setFilterStatus("all")}
            className={`text-xs font-semibold tracking-widest uppercase px-4 py-2 transition-all border ${filterStatus === "all" ? "border-[#D32F3A] text-[#F5F5F5] bg-[#D32F3A]" : "border-[#2B2B2E] text-[#555] hover:border-[#D32F3A] hover:text-[#F5F5F5]"}`}>
            ทั้งหมด ({orders.length})
          </button>
          {STATUSES.map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`text-xs font-semibold tracking-widest uppercase px-4 py-2 transition-all border ${filterStatus === s ? "border-[#D32F3A] text-[#F5F5F5] bg-[#D32F3A]" : "border-[#2B2B2E] text-[#555] hover:border-[#D32F3A] hover:text-[#F5F5F5]"}`}>
              {STATUS_META[s].th} ({summary[s]})
            </button>
          ))}
        </div>

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <Package size={32} className="text-[#2B2B2E] mx-auto mb-4" />
            <p className="text-[#555] text-sm">ไม่มีออเดอร์</p>
          </div>
        ) : (
          <div className="flex flex-col gap-px bg-[#2B2B2E]">
            {filtered.map((order) => {
              const meta = STATUS_META[order.status as Status] ?? { th: order.status, color: "#A5A5A5", bg: "#A5A5A518" };
              const date = new Date(order.created_at);
              const isExpanded = expandedId === order.id;
              const isUpdating = updatingId === order.id;

              return (
                <div key={order.id} className="bg-[#1A1A1C]">
                  {/* Row header */}
                  <div className="flex items-center gap-4 px-4 py-4">
                    {/* Expand toggle */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                      className="text-[#555] hover:text-[#F5F5F5] transition-colors shrink-0"
                    >
                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* Order ID + date */}
                    <div className="min-w-0 flex-1">
                      <p className="text-[#F5F5F5] font-mono text-xs font-bold">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-[#555] text-[11px] mt-0.5">
                        {date.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" })}
                        {" · "}
                        {date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>

                    {/* Customer */}
                    <div className="hidden sm:block min-w-0 w-36">
                      <p className="text-[#F5F5F5] text-sm font-semibold truncate">{order.full_name}</p>
                      <p className="text-[#555] text-xs">{order.phone}</p>
                    </div>

                    {/* Total */}
                    <div className="text-right w-24 shrink-0">
                      <p className="text-[#F5F5F5] font-bold">฿{order.total.toLocaleString()}</p>
                      <p className="text-[#555] text-xs">{order.order_items?.length ?? 0} รายการ</p>
                    </div>

                    {/* Status selector */}
                    <div className="shrink-0">
                      {isUpdating ? (
                        <Loader2 size={14} className="text-[#D32F3A] animate-spin" />
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value as Status)}
                          className="text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 border outline-none cursor-pointer bg-[#0F0F10] transition-colors"
                          style={{
                            color: meta.color,
                            borderColor: meta.color + "50",
                            background: meta.bg,
                          }}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s} style={{ color: "#F5F5F5", background: "#1A1A1C" }}>
                              {STATUS_META[s].th}
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="border-t border-[#2B2B2E] px-4 py-5 flex flex-col gap-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        {/* Shipping info */}
                        <div>
                          <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest mb-2">ที่อยู่จัดส่ง</p>
                          <p className="text-[#F5F5F5] text-sm font-semibold">{order.full_name}</p>
                          <p className="text-[#A5A5A5] text-sm">{order.phone}</p>
                          <p className="text-[#A5A5A5] text-sm mt-1 whitespace-pre-wrap">{order.address}</p>
                          {order.note && (
                            <p className="text-[#555] text-xs mt-2 border-l-2 border-[#2B2B2E] pl-2">{order.note}</p>
                          )}
                        </div>

                        {/* Cost breakdown */}
                        <div>
                          <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest mb-2">สรุปยอด</p>
                          <div className="flex flex-col gap-1">
                            <div className="flex justify-between text-sm">
                              <span className="text-[#555]">ค่าสินค้า</span>
                              <span className="text-[#A5A5A5]">฿{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-[#555]">ค่าส่ง</span>
                              <span className="text-[#A5A5A5]">฿{order.shipping}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold pt-1 border-t border-[#2B2B2E] mt-1">
                              <span className="text-[#F5F5F5]">รวมทั้งสิ้น</span>
                              <span className="text-[#D32F3A]">฿{order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest mb-2">รายการสินค้า</p>
                        <div className="flex flex-col gap-2">
                          {order.order_items?.map((item) => (
                            <div key={item.id} className="flex items-center gap-3 bg-[#0F0F10] px-3 py-2">
                              <div className="w-8 h-8 bg-[#1A1A1C] border border-[#2B2B2E] shrink-0 overflow-hidden">
                                {item.img && <img src={item.img} alt={item.name_th} className="w-full h-full object-cover" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[#F5F5F5] text-xs font-semibold truncate">{item.name_th}</p>
                              </div>
                              <p className="text-[#555] text-xs shrink-0">× {item.qty}</p>
                              <p className="text-[#F5F5F5] text-xs font-bold shrink-0 w-20 text-right">
                                ฿{(item.price * item.qty).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
