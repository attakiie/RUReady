"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2, RefreshCw, Package, ChevronDown, ChevronUp, LogOut,
  ShoppingBag, Plus, Pencil, Trash2, Eye, EyeOff, X, Truck, Save,
  Check, AlertCircle, Receipt, TriangleAlert,
} from "lucide-react";
import { createClient } from "@/app/lib/supabase";

// ─── Types ───────────────────────────────────────────────────

type OrderItem = {
  id: string; name_th: string; name_en: string;
  qty: number; price: number; img: string;
};
type Order = {
  id: string; status: string; full_name: string; phone: string;
  address: string; note: string; subtotal: number; shipping: number;
  discount?: number;
  total: number; created_at: string; user_id: string | null;
  tracking_number?: string; payment_slip_path?: string | null; order_items: OrderItem[];
};
type Product = {
  id: string; slug: string; name_en: string; name_th: string;
  desc_en: string; desc_th: string; price: number; stock: number;
  category_id: string; images: string[]; tag: string; is_active: boolean;
};
type Category = { id: string; name_en: string; name_th: string; };
type LowStockProduct = { id: string; name_en: string; name_th: string; slug: string; stock: number; price: number; };
type AdminTab = "orders" | "products";

// ─── Constants ───────────────────────────────────────────────

const STATUSES = ["pending", "paid", "shipped", "completed", "cancelled"] as const;
type Status = (typeof STATUSES)[number];

const STATUS_META: Record<Status, { th: string; color: string; bg: string }> = {
  pending:   { th: "รอยืนยัน",   color: "#f59e0b", bg: "#f59e0b18" },
  paid:      { th: "ชำระแล้ว",   color: "#4ade80", bg: "#4ade8018" },
  shipped:   { th: "จัดส่งแล้ว", color: "#5b8dee", bg: "#5b8dee18" },
  completed: { th: "สำเร็จ",     color: "#4ade80", bg: "#4ade8018" },
  cancelled: { th: "ยกเลิก",     color: "#D32F3A", bg: "#D32F3A18" },
};

const EMPTY_FORM = {
  slug: "", name_en: "", name_th: "", desc_en: "", desc_th: "",
  price: "", stock: "", category_id: "", images_raw: "", tag: "", is_active: true,
};

// ─── Payment slip viewer ─────────────────────────────────────

function PaymentSlip({ path }: { path: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const { data, error: signError } = await supabase.storage
        .from("payment-slips")
        .createSignedUrl(path, 3600);
      if (!active) return;
      if (signError || !data) { setError(true); return; }
      setUrl(data.signedUrl);
    }
    load();
    return () => { active = false; };
  }, [path]);

  return (
    <div>
      <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest mb-2">
        หลักฐานการโอนเงิน
      </p>
      {error ? (
        <p className="text-[#555] text-xs">โหลดรูปสลิปไม่สำเร็จ</p>
      ) : url ? (
        <a href={url} target="_blank" rel="noopener noreferrer" className="inline-block">
          <img
            src={url}
            alt="สลิปการโอนเงิน"
            className="max-h-48 border border-[#2B2B2E] hover:border-[#D32F3A] transition-colors"
          />
        </a>
      ) : (
        <Loader2 size={14} className="text-[#555] animate-spin" />
      )}
    </div>
  );
}

function toSlug(s: string) {
  return s.toLowerCase().replace(/[^\w\s-]/g, "").replace(/[\s_]+/g, "-").replace(/^-+|-+$/g, "");
}

// ─── Helpers ─────────────────────────────────────────────────

const inputCls = "w-full bg-[#0F0F10] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-3 py-2.5 outline-none transition-colors";
const labelCls = "text-[#555] text-[10px] font-semibold tracking-[0.15em] uppercase block mb-1";

// ─── Main Component ──────────────────────────────────────────

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>("orders");
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  // ── Orders state ──
  const [orders, setOrders] = useState<Order[]>([]);
  const [filterStatus, setFilterStatus] = useState<Status | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, string>>({});
  const [trackingSaving, setTrackingSaving] = useState<string | null>(null);
  const [trackingSaved, setTrackingSaved] = useState<string | null>(null);

  // ── Products state ──
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [prodLoading, setProdLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Low stock alert ──
  const [lowStock, setLowStock] = useState<LowStockProduct[]>([]);
  const [showLowStock, setShowLowStock] = useState(true);

  // ── Action errors (failed writes shown to admin instead of silently ignored) ──
  const [actionError, setActionError] = useState<string | null>(null);
  function flashError(msg: string) {
    setActionError(msg);
    setTimeout(() => setActionError(null), 4000);
  }

  const fetchLowStock = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("low_stock_products")
      .select("id, name_en, name_th, slug, stock, price");
    setLowStock((data as LowStockProduct[]) ?? []);
  }, []);

  // ── Fetch orders ──
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

  // ── Fetch products ──
  const fetchProducts = useCallback(async () => {
    setProdLoading(true);
    const supabase = createClient();
    const [{ data: prods }, { data: cats }] = await Promise.all([
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name_en, name_th").order("sort_order"),
    ]);
    setProducts((prods as Product[]) ?? []);
    setCategories((cats as Category[]) ?? []);
    setProdLoading(false);
  }, []);

  // ── Auth + init ──
  useEffect(() => {
    async function init() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }
      const { data: profile } = await supabase
        .from("profiles").select("is_admin").eq("id", session.user.id).single();
      if (!profile?.is_admin) { setUnauthorized(true); setLoading(false); return; }
      await Promise.all([fetchOrders(), fetchLowStock()]);
      setLoading(false);
    }
    init();
  }, [router, fetchOrders, fetchLowStock]);

  function switchTab(next: AdminTab) {
    setTab(next);
    if (next === "products" && products.length === 0) fetchProducts();
  }

  // ── Order actions ──
  async function updateStatus(orderId: string, newStatus: Status) {
    setUpdatingId(orderId);
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ status: newStatus }).eq("id", orderId);
    setUpdatingId(null);
    if (error) {
      flashError("อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่ (ยอดในหน้านี้ยังไม่เปลี่ยน)");
      return;
    }
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, status: newStatus } : o));
  }

  async function saveTracking(orderId: string) {
    setTrackingSaving(orderId);
    const tracking = trackingInputs[orderId] ?? "";
    const supabase = createClient();
    const { error } = await supabase.from("orders").update({ tracking_number: tracking }).eq("id", orderId);
    setTrackingSaving(null);
    if (error) {
      flashError("บันทึกเลขพัสดุไม่สำเร็จ กรุณาลองใหม่");
      return;
    }
    setOrders((prev) => prev.map((o) => o.id === orderId ? { ...o, tracking_number: tracking } : o));
    setTrackingSaved(orderId);
    setTimeout(() => setTrackingSaved(null), 2000);
  }

  // ── Product actions ──
  function openNewProduct() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openEditProduct(p: Product) {
    setEditingId(p.id);
    setForm({
      slug: p.slug,
      name_en: p.name_en,
      name_th: p.name_th,
      desc_en: p.desc_en ?? "",
      desc_th: p.desc_th ?? "",
      price: String(p.price),
      stock: String(p.stock),
      category_id: p.category_id,
      images_raw: (p.images ?? []).join(", "),
      tag: p.tag ?? "",
      is_active: p.is_active,
    });
    setFormError("");
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function setF(k: keyof typeof EMPTY_FORM) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
      setForm((f) => {
        const next = { ...f, [k]: val };
        if (k === "name_en" && !editingId) {
          next.slug = toSlug(String(val));
        }
        return next;
      });
    };
  }

  async function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!form.name_th || !form.name_en || !form.price || !form.stock || !form.category_id || !form.slug) {
      setFormError("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");
      return;
    }
    setFormSaving(true);
    const supabase = createClient();
    const payload = {
      slug: form.slug.trim(),
      name_en: form.name_en.trim(),
      name_th: form.name_th.trim(),
      desc_en: form.desc_en.trim(),
      desc_th: form.desc_th.trim(),
      price: parseInt(form.price) || 0,
      stock: parseInt(form.stock) || 0,
      category_id: form.category_id,
      images: form.images_raw.split(",").map((s) => s.trim()).filter(Boolean),
      tag: form.tag.trim(),
      is_active: form.is_active,
    };

    if (editingId) {
      const { error } = await supabase.from("products").update(payload).eq("id", editingId);
      if (error) { setFormError(error.message); setFormSaving(false); return; }
    } else {
      const { error } = await supabase.from("products").insert(payload);
      if (error) { setFormError(error.message); setFormSaving(false); return; }
    }

    setFormSaving(false);
    setShowForm(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
    fetchProducts();
  }

  async function handleDeleteProduct(id: string) {
    if (!confirm("ลบสินค้านี้? ไม่สามารถย้อนกลับได้")) return;
    setDeletingId(id);
    const supabase = createClient();
    const { error } = await supabase.from("products").delete().eq("id", id);
    setDeletingId(null);
    if (error) {
      flashError("ลบสินค้าไม่สำเร็จ กรุณาลองใหม่");
      return;
    }
    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function toggleActive(p: Product) {
    setTogglingId(p.id);
    const supabase = createClient();
    const { error } = await supabase.from("products").update({ is_active: !p.is_active }).eq("id", p.id);
    setTogglingId(null);
    if (error) {
      flashError("เปลี่ยนสถานะสินค้าไม่สำเร็จ กรุณาลองใหม่");
      return;
    }
    setProducts((prev) => prev.map((x) => x.id === p.id ? { ...x, is_active: !x.is_active } : x));
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  }

  // ─── Guard states ────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
      <Loader2 size={24} className="text-[#D32F3A] animate-spin" />
    </div>
  );

  if (unauthorized) return (
    <div className="min-h-screen bg-[#0F0F10] flex flex-col items-center justify-center gap-4 text-center px-4">
      <p className="text-[#D32F3A] text-4xl font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>ACCESS DENIED</p>
      <p className="text-[#555] text-sm max-w-xs">คุณไม่มีสิทธิ์เข้าหน้านี้</p>
      <Link href="/" className="text-[#D32F3A] text-xs uppercase tracking-widest underline">กลับหน้าแรก</Link>
    </div>
  );

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);
  const summary = STATUSES.reduce((acc, s) => { acc[s] = orders.filter((o) => o.status === s).length; return acc; }, {} as Record<Status, number>);

  return (
    <div className="min-h-screen bg-[#0F0F10] pt-6 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="flex items-center justify-between mb-6 pt-4">
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
            {tab === "orders" && (
              <button onClick={() => fetchOrders(true)}
                className="flex items-center gap-1.5 text-[#555] hover:text-[#F5F5F5] text-xs uppercase tracking-widest border border-[#2B2B2E] hover:border-[#D32F3A] px-3 py-2 transition-colors">
                <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} /> รีเฟรช
              </button>
            )}
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 text-[#D32F3A] text-xs uppercase tracking-widest border border-[#D32F3A]/40 px-3 py-2 hover:bg-[#D32F3A]/10 transition-colors">
              <LogOut size={12} /> ออก
            </button>
          </div>
        </div>

        {/* ── Action error banner ── */}
        {actionError && (
          <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/40 px-4 py-3 mb-6 flex items-center gap-3">
            <AlertCircle size={16} className="text-[#D32F3A] shrink-0" />
            <p className="text-[#D32F3A] text-xs font-semibold">{actionError}</p>
          </div>
        )}

        {/* ── Low stock alert ── */}
        {showLowStock && lowStock.length > 0 && (
          <div className="bg-[#f59e0b]/10 border border-[#f59e0b]/40 px-4 py-3 mb-6 flex items-start gap-3">
            <TriangleAlert size={16} className="text-[#f59e0b] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[#f59e0b] text-xs font-semibold uppercase tracking-widest mb-1.5">
                สินค้าใกล้หมด ({lowStock.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {lowStock.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => switchTab("products")}
                    className="text-xs bg-[#0F0F10] border border-[#2B2B2E] hover:border-[#f59e0b] text-[#A5A5A5] hover:text-[#f59e0b] px-2.5 py-1 transition-colors"
                  >
                    {p.name_th} — เหลือ {p.stock}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowLowStock(false)}
              className="text-[#555] hover:text-[#F5F5F5] transition-colors shrink-0"
              title="ซ่อน"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div className="flex border-b border-[#2B2B2E] mb-8">
          {([
            { key: "orders" as AdminTab, label: "ออเดอร์", icon: <Package size={14} />, count: orders.length },
            { key: "products" as AdminTab, label: "สินค้า", icon: <ShoppingBag size={14} />, count: products.length },
          ] as const).map((t) => (
            <button key={t.key} onClick={() => switchTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 text-xs font-semibold tracking-widest uppercase border-b-2 -mb-px transition-colors ${
                tab === t.key ? "border-[#D32F3A] text-[#F5F5F5]" : "border-transparent text-[#555] hover:text-[#A5A5A5]"
              }`}>
              {t.icon} {t.label}
              {t.count > 0 && (
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  tab === t.key ? "bg-[#D32F3A] text-[#F5F5F5]" : "bg-[#2B2B2E] text-[#555]"
                }`}>{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* ════════════════════════════════════════
            ORDERS TAB
        ════════════════════════════════════════ */}
        {tab === "orders" && (
          <>
            {/* Summary bar */}
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-px bg-[#2B2B2E] mb-6">
              {STATUSES.map((s) => {
                const m = STATUS_META[s];
                return (
                  <button key={s}
                    onClick={() => setFilterStatus(filterStatus === s ? "all" : s)}
                    className={`bg-[#1A1A1C] flex flex-col items-center py-3 sm:py-4 transition-colors ${filterStatus === s ? "bg-[#2B2B2E]" : "hover:bg-[#1e1e20]"}`}>
                    <span className="text-xl sm:text-2xl font-bold" style={{ color: m.color }}>{summary[s]}</span>
                    <span className="text-[#555] text-[9px] sm:text-[10px] uppercase tracking-widest mt-0.5">{m.th}</span>
                  </button>
                );
              })}
            </div>

            {/* Filter chips */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-none pb-1">
              {(["all", ...STATUSES] as const).map((s) => (
                <button key={s} onClick={() => setFilterStatus(s as Status | "all")}
                  className={`text-xs font-semibold tracking-widest uppercase px-3 py-1.5 transition-all border whitespace-nowrap ${
                    filterStatus === s
                      ? "border-[#D32F3A] text-[#F5F5F5] bg-[#D32F3A]"
                      : "border-[#2B2B2E] text-[#555] hover:border-[#D32F3A] hover:text-[#F5F5F5]"
                  }`}>
                  {s === "all" ? `ทั้งหมด (${orders.length})` : `${STATUS_META[s].th} (${summary[s]})`}
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
                  const isSaving = trackingSaving === order.id;
                  const isSaved = trackingSaved === order.id;
                  const currentTracking = trackingInputs[order.id] ?? order.tracking_number ?? "";

                  return (
                    <div key={order.id} className="bg-[#1A1A1C]">
                      {/* Row */}
                      <div className="flex items-center gap-3 px-4 py-4">
                        <button onClick={() => setExpandedId(isExpanded ? null : order.id)}
                          className="text-[#555] hover:text-[#F5F5F5] transition-colors shrink-0">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className="text-[#F5F5F5] font-mono text-xs font-bold">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-[#555] text-[11px] mt-0.5">
                            {date.toLocaleDateString("th-TH", { day: "numeric", month: "short" })}
                            {" · "}
                            {date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
                            {order.tracking_number && (
                              <span className="ml-2 text-[#5b8dee]">
                                <Truck size={9} className="inline mr-0.5" />{order.tracking_number}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="hidden sm:block min-w-0 w-36 shrink-0">
                          <p className="text-[#F5F5F5] text-sm font-semibold truncate">{order.full_name}</p>
                          <p className="text-[#555] text-xs">{order.phone}</p>
                        </div>
                        <div className="text-right w-20 shrink-0">
                          <p className="text-[#F5F5F5] font-bold text-sm">฿{order.total.toLocaleString()}</p>
                          <p className="text-[#555] text-xs">{order.order_items?.length ?? 0} รายการ</p>
                        </div>
                        <div className="shrink-0">
                          {isUpdating ? (
                            <Loader2 size={14} className="text-[#D32F3A] animate-spin" />
                          ) : (
                            <select
                              value={order.status}
                              onChange={(e) => updateStatus(order.id, e.target.value as Status)}
                              className="text-[10px] font-bold uppercase tracking-widest px-2 py-1.5 border outline-none cursor-pointer"
                              style={{ color: meta.color, borderColor: meta.color + "50", background: meta.bg }}
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

                      {/* Expanded */}
                      {isExpanded && (
                        <div className="border-t border-[#2B2B2E] px-4 py-5 flex flex-col gap-5">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            {/* Shipping info */}
                            <div>
                              <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest mb-2">ที่อยู่จัดส่ง</p>
                              <p className="text-[#F5F5F5] text-sm font-semibold">{order.full_name}</p>
                              <p className="text-[#A5A5A5] text-sm">{order.phone}</p>
                              <p className="text-[#A5A5A5] text-sm mt-1 whitespace-pre-wrap leading-relaxed">{order.address}</p>
                              {order.note && (
                                <p className="text-[#555] text-xs mt-2 border-l-2 border-[#2B2B2E] pl-2">{order.note}</p>
                              )}
                            </div>

                            {/* Price breakdown */}
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
                                {!!order.discount && order.discount > 0 && (
                                  <div className="flex justify-between text-sm">
                                    <span className="text-[#4ade80]">ส่วนลดสมาชิกใหม่</span>
                                    <span className="text-[#4ade80]">-฿{order.discount}</span>
                                  </div>
                                )}
                                <div className="flex justify-between font-bold pt-1 border-t border-[#2B2B2E] mt-1">
                                  <span className="text-[#F5F5F5] text-sm">รวมทั้งสิ้น</span>
                                  <span className="text-[#D32F3A]">฿{order.total.toLocaleString()}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Items */}
                          <div>
                            <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest mb-2">รายการสินค้า</p>
                            <div className="flex flex-col gap-1">
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

                          {/* Payment slip */}
                          {order.payment_slip_path ? (
                            <PaymentSlip path={order.payment_slip_path} />
                          ) : (
                            <div>
                              <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest mb-2">
                                <Receipt size={10} className="inline mr-1" />
                                หลักฐานการโอนเงิน
                              </p>
                              <p className="text-[#555] text-xs">ลูกค้ายังไม่ได้แนบสลิป</p>
                            </div>
                          )}

                          {/* Tracking number */}
                          <div>
                            <p className="text-[#D32F3A] text-[10px] font-semibold uppercase tracking-widest mb-2">
                              <Truck size={10} className="inline mr-1" />
                              หมายเลขพัสดุ
                            </p>
                            <div className="flex items-center gap-2">
                              <input
                                type="text"
                                value={currentTracking}
                                onChange={(e) => setTrackingInputs((prev) => ({ ...prev, [order.id]: e.target.value }))}
                                placeholder="เช่น TH123456789"
                                className="flex-1 bg-[#0F0F10] border border-[#2B2B2E] focus:border-[#5b8dee] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-3 py-2 outline-none transition-colors font-mono"
                              />
                              <button
                                onClick={() => saveTracking(order.id)}
                                disabled={isSaving}
                                className={`flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase px-4 py-2 transition-colors ${
                                  isSaved
                                    ? "bg-[#2e5a2e] text-[#4ade80]"
                                    : "bg-[#5b8dee]/20 hover:bg-[#5b8dee]/30 border border-[#5b8dee]/40 text-[#5b8dee]"
                                }`}
                              >
                                {isSaving ? <Loader2 size={12} className="animate-spin" /> : isSaved ? <Check size={12} /> : <Save size={12} />}
                                {isSaved ? "บันทึกแล้ว" : "บันทึก"}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════════════
            PRODUCTS TAB
        ════════════════════════════════════════ */}
        {tab === "products" && (
          <>
            {/* Product form — inline */}
            {showForm && (
              <div className="bg-[#1A1A1C] border border-[#2B2B2E] mb-6">
                <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B2B2E]">
                  <h2 className="text-[#F5F5F5] font-semibold text-sm tracking-widest uppercase">
                    {editingId ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                  </h2>
                  <button onClick={() => { setShowForm(false); setFormError(""); }}
                    className="text-[#555] hover:text-[#F5F5F5] transition-colors">
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveProduct} className="p-5 flex flex-col gap-4">
                  {/* Name row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>ชื่อสินค้า (ไทย) *</label>
                      <input type="text" value={form.name_th} onChange={setF("name_th")} placeholder="ชื่อภาษาไทย" required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>ชื่อสินค้า (EN) *</label>
                      <input type="text" value={form.name_en} onChange={setF("name_en")} placeholder="Product name" required className={inputCls} />
                    </div>
                  </div>

                  {/* Slug */}
                  <div>
                    <label className={labelCls}>Slug (URL) *</label>
                    <input type="text" value={form.slug} onChange={setF("slug")} placeholder="product-slug" required className={inputCls + " font-mono"} />
                  </div>

                  {/* Desc */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>รายละเอียด (ไทย)</label>
                      <textarea value={form.desc_th} onChange={setF("desc_th")} rows={3} placeholder="รายละเอียดภาษาไทย"
                        className={inputCls + " resize-none"} />
                    </div>
                    <div>
                      <label className={labelCls}>รายละเอียด (EN)</label>
                      <textarea value={form.desc_en} onChange={setF("desc_en")} rows={3} placeholder="Product description"
                        className={inputCls + " resize-none"} />
                    </div>
                  </div>

                  {/* Price + Stock + Category */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <label className={labelCls}>ราคา (฿) *</label>
                      <input type="number" value={form.price} onChange={setF("price")} placeholder="0" min="0" required className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>สต็อก *</label>
                      <input type="number" value={form.stock} onChange={setF("stock")} placeholder="0" min="0" required className={inputCls} />
                    </div>
                    <div className="col-span-2">
                      <label className={labelCls}>หมวดหมู่ *</label>
                      <select value={form.category_id} onChange={setF("category_id")} required
                        className={inputCls + " cursor-pointer"}>
                        <option value="">เลือกหมวดหมู่</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name_th} ({c.name_en})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tag + Images */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={labelCls}>Tag (เช่น HOT, NEW, SALE)</label>
                      <input type="text" value={form.tag} onChange={setF("tag")} placeholder="HOT" className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>รูปภาพ (path คั่นด้วยจุลภาค)</label>
                      <input type="text" value={form.images_raw} onChange={setF("images_raw")}
                        placeholder="/images/prod-name-1.jpg, /images/prod-name-2.jpg" className={inputCls + " font-mono text-xs"} />
                    </div>
                  </div>

                  {/* Active toggle */}
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={() => setForm((f) => ({ ...f, is_active: !f.is_active }))}
                      className={`w-10 h-5 rounded-full transition-colors relative ${form.is_active ? "bg-[#D32F3A]" : "bg-[#2B2B2E]"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${form.is_active ? "translate-x-5" : "translate-x-0.5"}`} />
                    </button>
                    <span className="text-[#A5A5A5] text-xs uppercase tracking-widest">
                      {form.is_active ? "แสดงในร้านค้า" : "ซ่อน"}
                    </span>
                  </div>

                  {formError && (
                    <div className="flex items-center gap-2 bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-2.5 text-[#D32F3A] text-xs">
                      <AlertCircle size={12} /> {formError}
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={formSaving}
                      className="flex items-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 text-[#F5F5F5] text-xs font-semibold tracking-widest uppercase px-6 py-2.5 transition-colors">
                      {formSaving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                      {editingId ? "อัปเดตสินค้า" : "เพิ่มสินค้า"}
                    </button>
                    <button type="button" onClick={() => { setShowForm(false); setFormError(""); }}
                      className="text-xs font-semibold tracking-widest uppercase border border-[#2B2B2E] text-[#555] hover:text-[#F5F5F5] hover:border-[#F5F5F5] px-5 py-2.5 transition-colors">
                      ยกเลิก
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products header */}
            <div className="flex items-center justify-between mb-5">
              <p className="text-[#555] text-xs uppercase tracking-widest">{products.length} สินค้า</p>
              {!showForm && (
                <button onClick={openNewProduct}
                  className="flex items-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] text-xs font-semibold tracking-widest uppercase px-4 py-2.5 transition-colors">
                  <Plus size={13} /> เพิ่มสินค้า
                </button>
              )}
            </div>

            {/* Products list */}
            {prodLoading ? (
              <div className="flex items-center justify-center py-24">
                <Loader2 size={24} className="text-[#D32F3A] animate-spin" />
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-24">
                <ShoppingBag size={32} className="text-[#2B2B2E] mx-auto mb-4" />
                <p className="text-[#555] text-sm">ยังไม่มีสินค้า</p>
              </div>
            ) : (
              <div className="flex flex-col gap-px bg-[#2B2B2E]">
                {products.map((product) => {
                  const img = product.images?.[0];
                  const isDeleting = deletingId === product.id;
                  const isToggling = togglingId === product.id;

                  return (
                    <div key={product.id} className="bg-[#1A1A1C] flex items-center gap-3 px-4 py-3">
                      {/* Image */}
                      <div className="w-12 h-12 bg-[#0F0F10] border border-[#2B2B2E] shrink-0 overflow-hidden">
                        {img
                          ? <img src={img} alt={product.name_th} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-[#2B2B2E] font-bold text-lg">{product.name_th.charAt(0)}</div>
                        }
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[#F5F5F5] text-sm font-semibold truncate">{product.name_th}</p>
                          {product.tag && (
                            <span className="bg-[#D32F3A] text-[#F5F5F5] text-[9px] font-semibold px-1.5 py-0.5 uppercase tracking-widest shrink-0">
                              {product.tag}
                            </span>
                          )}
                          {!product.is_active && (
                            <span className="text-[#555] text-[9px] uppercase tracking-widest border border-[#2B2B2E] px-1.5 py-0.5 shrink-0">
                              ซ่อน
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[#D32F3A] font-bold text-sm">฿{product.price.toLocaleString()}</span>
                          <span className="text-[#555] text-xs">สต็อก: {product.stock}</span>
                          <span className="text-[#3A3A3E] text-xs font-mono">{product.slug}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Toggle active */}
                        <button
                          onClick={() => toggleActive(product)}
                          disabled={isToggling}
                          title={product.is_active ? "ซ่อนสินค้า" : "แสดงสินค้า"}
                          className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors"
                        >
                          {isToggling
                            ? <Loader2 size={13} className="animate-spin" />
                            : product.is_active ? <Eye size={14} /> : <EyeOff size={14} />
                          }
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditProduct(product)}
                          title="แก้ไข"
                          className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors"
                        >
                          <Pencil size={13} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          disabled={isDeleting}
                          title="ลบ"
                          className="w-8 h-8 flex items-center justify-center text-[#555] hover:text-[#D32F3A] hover:bg-[#D32F3A]/10 transition-colors"
                        >
                          {isDeleting
                            ? <Loader2 size={13} className="animate-spin" />
                            : <Trash2 size={13} />
                          }
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Image note */}
            <div className="mt-6 bg-[#1A1A1C] border border-[#2B2B2E] px-4 py-3 text-xs text-[#555] leading-relaxed">
              💡 รูปภาพ: วางไฟล์ใน <code className="text-[#A5A5A5] bg-[#0F0F10] px-1">/public/images/</code> แล้วอ้างอิง path เช่น <code className="text-[#A5A5A5] bg-[#0F0F10] px-1">/images/prod-name.jpg</code> — คั่นหลายรูปด้วยจุลภาค
            </div>
          </>
        )}
      </div>
    </div>
  );
}
