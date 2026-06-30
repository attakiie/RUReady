"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, CheckCircle, User, LogOut } from "lucide-react";
import { createClient } from "@/app/lib/supabase";

type Profile = {
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
};

const EMPTY: Profile = { first_name: "", last_name: "", phone: "", email: "" };

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login");
        return;
      }
      setUserId(session.user.id);

      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, phone")
        .eq("id", session.user.id)
        .single();

      setProfile({
        first_name: data?.first_name ?? "",
        last_name: data?.last_name ?? "",
        phone: data?.phone ?? "",
        email: session.user.email ?? "",
      });
      setLoading(false);
    }
    load();
  }, [router]);

  const set = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile((p) => ({ ...p, [k]: e.target.value }));
    setSuccess(false);
  };

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        first_name: profile.first_name.trim(),
        last_name: profile.last_name.trim(),
        phone: profile.phone.trim(),
      })
      .eq("id", userId);

    setSaving(false);
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
    }
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center">
        <Loader2 size={24} className="text-[#D32F3A] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] px-4 py-24">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-50" />

      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 group mb-4">
              <span
                className="text-xl text-[#F5F5F5] tracking-widest group-hover:text-[#D32F3A] transition-colors"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                R U READY
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#D32F3A]" />
            </Link>
            <h1
              className="text-[clamp(36px,8vw,56px)] leading-none text-[#F5F5F5]"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              บัญชีของฉัน
            </h1>
            <p className="text-[#A5A5A5] text-sm mt-2">{profile.email}</p>
          </div>

          {/* Avatar circle */}
          <div className="w-12 h-12 rounded-full bg-[#D32F3A] flex items-center justify-center mt-8 shrink-0">
            <span className="text-[#F5F5F5] font-bold text-lg">
              {profile.first_name ? profile.first_name.charAt(0).toUpperCase() : <User size={20} />}
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <FieldWrap label="ชื่อ" required>
              <input
                type="text"
                value={profile.first_name}
                onChange={set("first_name")}
                placeholder="สมชาย"
                required
                className={inputCls}
              />
            </FieldWrap>
            <FieldWrap label="นามสกุล" required>
              <input
                type="text"
                value={profile.last_name}
                onChange={set("last_name")}
                placeholder="ใจดี"
                required
                className={inputCls}
              />
            </FieldWrap>
          </div>

          <FieldWrap label="อีเมล">
            <input
              type="email"
              value={profile.email}
              disabled
              className={inputCls + " opacity-40 cursor-not-allowed"}
            />
          </FieldWrap>

          <FieldWrap label="เบอร์โทรศัพท์">
            <input
              type="tel"
              value={profile.phone}
              onChange={set("phone")}
              placeholder="0812345678"
              className={inputCls}
            />
          </FieldWrap>

          {error && (
            <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-3 text-[#D32F3A] text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-[#1A2E1A] border border-[#2E5A2E] px-4 py-3 text-[#4CAF50] text-sm">
              <CheckCircle size={14} /> บันทึกข้อมูลสำเร็จ
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 disabled:cursor-not-allowed text-[#F5F5F5] font-semibold text-sm px-6 py-4 tracking-widest uppercase transition-colors duration-200"
          >
            {saving ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                บันทึกข้อมูล <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Logout */}
        <div className="mt-10 pt-6 border-t border-[#2B2B2E]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-[#A5A5A5] hover:text-[#D32F3A] text-sm transition-colors uppercase tracking-widest font-semibold"
          >
            <LogOut size={14} /> ออกจากระบบ
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-[#1A1A1C] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-4 py-3 outline-none transition-colors duration-200";

function FieldWrap({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[#A5A5A5] text-xs font-semibold tracking-widest uppercase">
        {label}
        {required && <span className="text-[#D32F3A] ml-1">*</span>}
      </label>
      {children}
    </div>
  );
}
