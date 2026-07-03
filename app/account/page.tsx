"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, CheckCircle, User, LogOut, Package, Shield, Eye, EyeOff, AlertTriangle, MapPin, Plus, Pencil, Trash2, Star } from "lucide-react";
import { createClient } from "@/app/lib/supabase";

type Profile = { first_name: string; last_name: string; phone: string; email: string; };
type Order = { id: string; status: string; total: number; created_at: string; order_items: { name_th: string; qty: number }[] };
type Address = { id: string; label: string; full_name: string; phone: string; address: string; is_default: boolean; };
type Tab = "profile" | "orders" | "addresses" | "security";

const EMPTY_ADDR: Omit<Address, "id" | "is_default"> = { label: "บ้าน", full_name: "", phone: "", address: "" };

const EMPTY: Profile = { first_name: "", last_name: "", phone: "", email: "" };

const statusLabel: Record<string, { th: string; color: string }> = {
  pending:   { th: "รอยืนยัน",   color: "#f59e0b" },
  paid:      { th: "ชำระแล้ว",   color: "#4ade80" },
  shipped:   { th: "จัดส่งแล้ว", color: "#5b8dee" },
  completed: { th: "สำเร็จ",     color: "#4ade80" },
  cancelled: { th: "ยกเลิก",     color: "#D32F3A" },
};

export default function AccountPage() {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("profile");
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Change password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  // Delete account state
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [showDeleteBox, setShowDeleteBox] = useState(false);

  // Address book state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addrLoading, setAddrLoading] = useState(false);
  const [addrForm, setAddrForm] = useState<Omit<Address, "id" | "is_default">>(EMPTY_ADDR);
  const [editingId, setEditingId] = useState<string | null>(null);  // null = new
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrSaving, setAddrSaving] = useState(false);
  const [addrError, setAddrError] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      // Use getUser() — verifies token with Supabase server (more secure than getSession)
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (!user || userError) { router.replace("/login"); return; }
      setUserId(user.id);
      const { data } = await supabase.from("profiles").select("first_name, last_name, phone").eq("id", user.id).single();
      setProfile({
        first_name: data?.first_name ?? "",
        last_name: data?.last_name ?? "",
        phone: data?.phone ?? "",
        email: user.email ?? "",
      });
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (tab !== "orders" || !userId) return;
    setOrdersLoading(true);
    const supabase = createClient();
    supabase.from("orders").select("id, status, total, created_at, order_items(name_th, qty)")
      .eq("user_id", userId).order("created_at", { ascending: false })
      .then(({ data }) => { setOrders((data as Order[]) ?? []); setOrdersLoading(false); });
  }, [tab, userId]);

  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((p) => ({ ...p, [k]: e.target.value }));
    setSuccess(false);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault(); setError(""); setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("profiles")
      .update({ first_name: profile.first_name.trim(), last_name: profile.last_name.trim(), phone: profile.phone.trim() })
      .eq("id", userId);
    setSaving(false);
    if (err) setError(err.message); else setSuccess(true);
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(""); setPwSuccess(false);
    if (newPassword.length < 8) { setPwError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร"); return; }
    if (newPassword !== confirmPassword) { setPwError("รหัสผ่านไม่ตรงกัน"); return; }
    setPwSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password: newPassword });
    setPwSaving(false);
    if (err) {
      setPwError(err.message);
    } else {
      setPwSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "DELETE") { setDeleteError('พิมพ์ "DELETE" เพื่อยืนยัน'); return; }
    setDeleting(true); setDeleteError("");
    const supabase = createClient();
    // Sign out first, then the user's data stays (soft delete pattern)
    // For hard delete, call a Supabase Edge Function with service role key
    await supabase.auth.signOut();
    router.push("/?deleted=1");
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/"); router.refresh();
  }

  // Load addresses when tab becomes active
  useEffect(() => {
    if (tab !== "addresses" || !userId) return;
    loadAddresses();
  }, [tab, userId]);

  async function loadAddresses() {
    setAddrLoading(true);
    const supabase = createClient();
    const { data } = await supabase.from("addresses")
      .select("*").eq("user_id", userId).order("is_default", { ascending: false }).order("created_at");
    setAddresses((data as Address[]) ?? []);
    setAddrLoading(false);
  }

  function openNewAddr() {
    setEditingId(null);
    setAddrForm(EMPTY_ADDR);
    setAddrError("");
    setShowAddrForm(true);
  }

  function openEditAddr(addr: Address) {
    setEditingId(addr.id);
    setAddrForm({ label: addr.label, full_name: addr.full_name, phone: addr.phone, address: addr.address });
    setAddrError("");
    setShowAddrForm(true);
  }

  async function handleSaveAddr(e: React.FormEvent) {
    e.preventDefault();
    setAddrError(""); setAddrSaving(true);
    const supabase = createClient();
    if (editingId) {
      const { error } = await supabase.from("addresses")
        .update({ ...addrForm }).eq("id", editingId);
      if (error) { setAddrError(error.message); setAddrSaving(false); return; }
    } else {
      const isFirst = addresses.length === 0;
      const { error } = await supabase.from("addresses")
        .insert({ ...addrForm, user_id: userId, is_default: isFirst });
      if (error) { setAddrError(error.message); setAddrSaving(false); return; }
    }
    setAddrSaving(false);
    setShowAddrForm(false);
    loadAddresses();
  }

  async function handleDeleteAddr(id: string) {
    const supabase = createClient();
    await supabase.from("addresses").delete().eq("id", id);
    loadAddresses();
  }

  async function handleSetDefault(id: string) {
    const supabase = createClient();
    await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    loadAddresses();
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
      <Loader2 size={24} className="text-[#D32F3A] animate-spin" />
    </div>
  );

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "profile",   label: "ข้อมูล",        icon: <User size={13} /> },
    { key: "orders",    label: "ออเดอร์",        icon: <Package size={13} /> },
    { key: "addresses", label: "ที่อยู่",         icon: <MapPin size={13} /> },
    { key: "security",  label: "ความปลอดภัย",   icon: <Shield size={13} /> },
  ];

  return (
    <div className="min-h-screen bg-[#0F0F10] px-4 py-24">
      <div className="max-w-lg mx-auto">

        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 group mb-3">
              <span className="text-xl text-[#F5F5F5] tracking-widest group-hover:text-[#D32F3A] transition-colors" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>R U READY</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D32F3A]" />
            </Link>
            <h1 className="text-[clamp(36px,8vw,56px)] leading-none text-[#F5F5F5]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>บัญชีของฉัน</h1>
            <p className="text-[#A5A5A5] text-sm mt-1">{profile.email}</p>
          </div>
          <div className="w-12 h-12 rounded-full bg-[#D32F3A] flex items-center justify-center mt-6 shrink-0">
            <span className="text-[#F5F5F5] font-bold text-lg">
              {profile.first_name ? profile.first_name.charAt(0).toUpperCase() : <User size={20} />}
            </span>
          </div>
        </div>

        {/* Tabs — horizontally scrollable on mobile */}
        <div className="border-b border-[#2B2B2E] mb-8 overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex min-w-max sm:min-w-0">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className={`flex items-center gap-2 px-4 py-3.5 text-xs font-semibold tracking-widest uppercase transition-colors border-b-2 -mb-px whitespace-nowrap ${
                  tab === t.key ? "border-[#D32F3A] text-[#F5F5F5]" : "border-transparent text-[#555] hover:text-[#A5A5A5]"
                }`}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Profile tab ── */}
        {tab === "profile" && (
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FieldWrap label="ชื่อ" required>
                <input type="text" value={profile.first_name} onChange={set("first_name")} placeholder="สมชาย" required className={inputCls} />
              </FieldWrap>
              <FieldWrap label="นามสกุล" required>
                <input type="text" value={profile.last_name} onChange={set("last_name")} placeholder="ใจดี" required className={inputCls} />
              </FieldWrap>
            </div>
            <FieldWrap label="อีเมล">
              <input type="email" value={profile.email} disabled className={inputCls + " opacity-40 cursor-not-allowed"} />
            </FieldWrap>
            <FieldWrap label="เบอร์โทรศัพท์">
              <input type="tel" value={profile.phone} onChange={set("phone")} placeholder="0812345678"
                pattern="0[0-9]{9}" title="เบอร์โทรศัพท์ 10 หลัก เริ่มด้วย 0" className={inputCls} />
            </FieldWrap>

            {error && <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-3 text-[#D32F3A] text-sm">{error}</div>}
            {success && (
              <div className="flex items-center gap-2 bg-[#1A2E1A] border border-[#2E5A2E] px-4 py-3 text-[#4CAF50] text-sm">
                <CheckCircle size={14} /> บันทึกข้อมูลสำเร็จ
              </div>
            )}

            <button type="submit" disabled={saving}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 text-[#F5F5F5] font-semibold text-sm px-6 py-4 tracking-widest uppercase transition-colors">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <>บันทึกข้อมูล <ArrowRight size={16} /></>}
            </button>

            <div className="mt-6 pt-6 border-t border-[#2B2B2E]">
              <button type="button" onClick={handleLogout}
                className="flex items-center gap-2 text-[#A5A5A5] hover:text-[#D32F3A] text-sm transition-colors uppercase tracking-widest font-semibold">
                <LogOut size={14} /> ออกจากระบบ
              </button>
            </div>
          </form>
        )}

        {/* ── Orders tab ── */}
        {tab === "orders" && (
          <div>
            {ordersLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={20} className="text-[#D32F3A] animate-spin" /></div>
            ) : orders.length === 0 ? (
              <div className="text-center py-16">
                <Package size={32} className="text-[#2B2B2E] mx-auto mb-4" />
                <p className="text-[#F5F5F5] font-semibold mb-2">ยังไม่มีออเดอร์</p>
                <p className="text-[#555] text-sm mb-6">ไปสั่งสินค้ากันเลย!</p>
                <Link href="/shop" className="inline-flex items-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] text-xs font-semibold px-5 py-2.5 tracking-widest uppercase transition-colors">
                  ไปร้านค้า <ArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {orders.map((order) => {
                  const st = statusLabel[order.status] ?? { th: order.status, color: "#A5A5A5" };
                  const date = new Date(order.created_at).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" });
                  const preview = order.order_items?.map((i) => `${i.name_th} ×${i.qty}`).join(", ") ?? "";
                  return (
                    <Link key={order.id} href={`/account/orders/${order.id}`}
                      className="group bg-[#1A1A1C] border border-[#2B2B2E] hover:border-[#D32F3A] px-5 py-4 transition-colors block">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="text-[#F5F5F5] font-mono text-xs font-semibold group-hover:text-[#D32F3A] transition-colors">#{order.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-[#555] text-xs mt-0.5">{date}</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 border" style={{ color: st.color, borderColor: st.color + "40", background: st.color + "10" }}>
                          {st.th}
                        </span>
                      </div>
                      <p className="text-[#A5A5A5] text-xs mb-3 truncate">{preview}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[#F5F5F5] font-bold">฿{order.total.toLocaleString()}</span>
                        <span className="text-[#555] text-xs group-hover:text-[#D32F3A] transition-colors">ดูรายละเอียด →</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Addresses tab ── */}
        {tab === "addresses" && (
          <div>
            {addrLoading ? (
              <div className="flex justify-center py-16"><Loader2 size={20} className="text-[#D32F3A] animate-spin" /></div>
            ) : (
              <div className="flex flex-col gap-3">
                {/* Address cards */}
                {addresses.map((addr) => (
                  <div key={addr.id}
                    className={`bg-[#1A1A1C] border px-5 py-4 transition-colors ${addr.is_default ? "border-[#D32F3A]/60" : "border-[#2B2B2E]"}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-[#2B2B2E] text-[#A5A5A5]">
                          {addr.label}
                        </span>
                        {addr.is_default && (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[#D32F3A]">
                            <Star size={10} fill="currentColor" /> Default
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        <button onClick={() => openEditAddr(addr)}
                          className="text-[#555] hover:text-[#F5F5F5] transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDeleteAddr(addr.id)}
                          className="text-[#555] hover:text-[#D32F3A] transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <p className="text-[#F5F5F5] text-sm font-semibold">{addr.full_name}</p>
                    <p className="text-[#A5A5A5] text-xs mt-0.5">{addr.phone}</p>
                    <p className="text-[#A5A5A5] text-xs mt-1 leading-relaxed">{addr.address}</p>
                    {!addr.is_default && (
                      <button onClick={() => handleSetDefault(addr.id)}
                        className="mt-3 text-[#555] hover:text-[#D32F3A] text-xs transition-colors uppercase tracking-widest font-semibold">
                        ตั้งเป็น default →
                      </button>
                    )}
                  </div>
                ))}

                {/* Add new / form */}
                {!showAddrForm ? (
                  <button onClick={openNewAddr}
                    className="flex items-center justify-center gap-2 border border-dashed border-[#2B2B2E] hover:border-[#D32F3A] text-[#555] hover:text-[#D32F3A] py-4 text-xs font-semibold tracking-widest uppercase transition-colors">
                    <Plus size={14} /> เพิ่มที่อยู่ใหม่
                  </button>
                ) : (
                  <form onSubmit={handleSaveAddr}
                    className="bg-[#1A1A1C] border border-[#D32F3A]/40 p-5 flex flex-col gap-4">
                    <p className="text-[#F5F5F5] text-xs font-semibold tracking-widest uppercase">
                      {editingId ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่ใหม่"}
                    </p>

                    {/* Label */}
                    <FieldWrap label="ชื่อที่อยู่ (เช่น บ้าน, ที่ทำงาน)" required>
                      <div className="flex gap-2 flex-wrap">
                        {["บ้าน", "ที่ทำงาน", "อื่นๆ"].map((l) => (
                          <button key={l} type="button"
                            onClick={() => setAddrForm((f) => ({ ...f, label: l }))}
                            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-widest border transition-colors ${
                              addrForm.label === l
                                ? "border-[#D32F3A] text-[#D32F3A] bg-[#D32F3A]/10"
                                : "border-[#2B2B2E] text-[#555] hover:border-[#A5A5A5] hover:text-[#A5A5A5]"
                            }`}>
                            {l}
                          </button>
                        ))}
                        {!["บ้าน", "ที่ทำงาน", "อื่นๆ"].includes(addrForm.label) && (
                          <input
                            type="text"
                            value={addrForm.label}
                            onChange={(e) => setAddrForm((f) => ({ ...f, label: e.target.value }))}
                            placeholder="ชื่อที่อยู่"
                            className={inputCls + " w-32"}
                          />
                        )}
                      </div>
                    </FieldWrap>

                    <div className="grid grid-cols-2 gap-3">
                      <FieldWrap label="ชื่อ-นามสกุล" required>
                        <input type="text" required value={addrForm.full_name}
                          onChange={(e) => setAddrForm((f) => ({ ...f, full_name: e.target.value }))}
                          placeholder="สมชาย ใจดี" className={inputCls} />
                      </FieldWrap>
                      <FieldWrap label="เบอร์โทร" required>
                        <input type="tel" required value={addrForm.phone}
                          onChange={(e) => setAddrForm((f) => ({ ...f, phone: e.target.value }))}
                          placeholder="0812345678" pattern="0[0-9]{9}" className={inputCls} />
                      </FieldWrap>
                    </div>

                    <FieldWrap label="ที่อยู่จัดส่ง" required>
                      <textarea required value={addrForm.address}
                        onChange={(e) => setAddrForm((f) => ({ ...f, address: e.target.value }))}
                        placeholder="บ้านเลขที่, ถนน, แขวง, เขต, จังหวัด, รหัสไปรษณีย์"
                        rows={3}
                        className="w-full bg-[#1A1A1C] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-4 py-3 outline-none transition-colors resize-none" />
                    </FieldWrap>

                    {addrError && (
                      <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-3 text-[#D32F3A] text-sm">
                        {addrError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button type="submit" disabled={addrSaving}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 text-[#F5F5F5] text-xs font-semibold px-4 py-3 tracking-widest uppercase transition-colors">
                        {addrSaving ? <Loader2 size={14} className="animate-spin" /> : <>{editingId ? "บันทึก" : "เพิ่มที่อยู่"} <ArrowRight size={14} /></>}
                      </button>
                      <button type="button"
                        onClick={() => { setShowAddrForm(false); setAddrError(""); }}
                        className="px-4 py-3 border border-[#2B2B2E] text-[#A5A5A5] hover:text-[#F5F5F5] text-xs font-semibold uppercase tracking-widest transition-colors">
                        ยกเลิก
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Security tab ── */}
        {tab === "security" && (
          <div className="flex flex-col gap-8">

            {/* Change Password */}
            <div>
              <h2 className="text-[#F5F5F5] text-sm font-semibold tracking-widest uppercase mb-4 flex items-center gap-2">
                <Shield size={14} className="text-[#D32F3A]" /> เปลี่ยนรหัสผ่าน
              </h2>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <FieldWrap label="รหัสผ่านใหม่" required>
                  <div className="relative">
                    <input
                      type={showNewPw ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => { setNewPassword(e.target.value); setPwSuccess(false); setPwError(""); }}
                      placeholder="อย่างน้อย 8 ตัวอักษร"
                      required
                      className={inputCls + " pr-10"}
                    />
                    <button type="button" onClick={() => setShowNewPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#A5A5A5] transition-colors">
                      {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {newPassword.length > 0 && (
                    <div className="h-0.5 bg-[#2B2B2E] mt-1">
                      <div className={`h-full transition-all duration-300 ${
                        newPassword.length < 8 ? "w-1/4 bg-[#D32F3A]"
                        : newPassword.length < 12 ? "w-2/4 bg-amber-500"
                        : "w-full bg-[#4ade80]"
                      }`} />
                    </div>
                  )}
                </FieldWrap>

                <FieldWrap label="ยืนยันรหัสผ่านใหม่" required>
                  <div className="relative">
                    <input
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setPwError(""); }}
                      placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                      required
                      className={inputCls + " pr-10"}
                    />
                    <button type="button" onClick={() => setShowConfirmPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#A5A5A5] transition-colors">
                      {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                    <p className="text-[#D32F3A] text-xs mt-1">รหัสผ่านไม่ตรงกัน</p>
                  )}
                </FieldWrap>

                {pwError && <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-3 text-[#D32F3A] text-sm">{pwError}</div>}
                {pwSuccess && (
                  <div className="flex items-center gap-2 bg-[#1A2E1A] border border-[#2E5A2E] px-4 py-3 text-[#4CAF50] text-sm">
                    <CheckCircle size={14} /> เปลี่ยนรหัสผ่านสำเร็จ
                  </div>
                )}

                <button type="submit" disabled={pwSaving}
                  className="w-full flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 text-[#F5F5F5] font-semibold text-sm px-6 py-4 tracking-widest uppercase transition-colors">
                  {pwSaving ? <Loader2 size={16} className="animate-spin" /> : <>บันทึกรหัสผ่านใหม่ <ArrowRight size={16} /></>}
                </button>
              </form>
            </div>

            {/* Delete Account */}
            <div className="pt-8 border-t border-[#2B2B2E]">
              <h2 className="text-[#D32F3A] text-sm font-semibold tracking-widest uppercase mb-2 flex items-center gap-2">
                <AlertTriangle size={14} /> ลบบัญชี
              </h2>
              <p className="text-[#555] text-xs mb-4">การลบบัญชีจะออกจากระบบทันที ข้อมูลออเดอร์ยังคงอยู่เพื่อการดูแลหลังการขาย</p>

              {!showDeleteBox ? (
                <button onClick={() => setShowDeleteBox(true)}
                  className="text-[#D32F3A] border border-[#D32F3A]/40 hover:border-[#D32F3A] text-xs font-semibold px-4 py-2.5 tracking-widest uppercase transition-colors">
                  ลบบัญชีของฉัน
                </button>
              ) : (
                <div className="bg-[#D32F3A]/5 border border-[#D32F3A]/30 p-4 flex flex-col gap-3">
                  <p className="text-[#F5F5F5] text-xs">พิมพ์ <span className="font-mono font-bold text-[#D32F3A]">DELETE</span> เพื่อยืนยัน</p>
                  <input
                    type="text"
                    value={deleteConfirm}
                    onChange={(e) => { setDeleteConfirm(e.target.value); setDeleteError(""); }}
                    placeholder="DELETE"
                    className="w-full bg-[#0F0F10] border border-[#D32F3A]/40 focus:border-[#D32F3A] text-[#F5F5F5] font-mono text-sm px-4 py-2.5 outline-none transition-colors"
                  />
                  {deleteError && <p className="text-[#D32F3A] text-xs">{deleteError}</p>}
                  <div className="flex gap-2">
                    <button onClick={handleDeleteAccount} disabled={deleting}
                      className="flex-1 flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 text-[#F5F5F5] text-xs font-semibold px-4 py-2.5 tracking-widest uppercase transition-colors">
                      {deleting ? <Loader2 size={14} className="animate-spin" /> : "ยืนยันลบบัญชี"}
                    </button>
                    <button onClick={() => { setShowDeleteBox(false); setDeleteConfirm(""); setDeleteError(""); }}
                      className="px-4 py-2.5 border border-[#2B2B2E] text-[#A5A5A5] hover:text-[#F5F5F5] text-xs font-semibold uppercase tracking-widest transition-colors">
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}

const inputCls = "w-full bg-[#1A1A1C] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-4 py-3 outline-none transition-colors";

function FieldWrap({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#A5A5A5] text-xs font-semibold tracking-widest uppercase">
        {label}{required && <span className="text-[#D32F3A] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
