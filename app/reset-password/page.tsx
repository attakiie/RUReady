"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, Eye, EyeOff, CheckCircle } from "lucide-react";
import { createClient } from "@/app/lib/supabase";
import { useLanguage } from "@/app/contexts/LanguageContext";

const copy = {
  en: {
    eyebrow: "Account Security",
    title: "SET NEW\nPASSWORD",
    newPass: "New Password",
    confirmPass: "Confirm Password",
    passPlaceholder: "At least 8 characters",
    confirm: "Set Password",
    confirming: "Saving…",
    mismatch: "Passwords do not match",
    weak: "Password must be at least 8 characters",
    success: "Password updated! Redirecting…",
    backToLogin: "Back to login",
  },
  th: {
    eyebrow: "ความปลอดภัยของบัญชี",
    title: "ตั้งรหัสผ่าน\nใหม่",
    newPass: "รหัสผ่านใหม่",
    confirmPass: "ยืนยันรหัสผ่าน",
    passPlaceholder: "อย่างน้อย 8 ตัวอักษร",
    confirm: "บันทึกรหัสผ่าน",
    confirming: "กำลังบันทึก…",
    mismatch: "รหัสผ่านไม่ตรงกัน",
    weak: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร",
    success: "เปลี่ยนรหัสผ่านแล้ว! กำลังพาไป…",
    backToLogin: "กลับหน้าเข้าสู่ระบบ",
  },
};

export default function ResetPasswordPage() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError(t.weak);
      return;
    }
    if (password !== confirm) {
      setError(t.mismatch);
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setTimeout(() => router.replace("/account"), 1800);
    }
  }

  const inputCls =
    "w-full bg-[#1A1A1C] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-4 py-3 outline-none transition-colors";

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 group mb-8"
        >
          <span
            className="text-2xl text-[#F5F5F5] tracking-widest group-hover:text-[#D32F3A] transition-colors"
            style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}
          >
            R U READY
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#D32F3A]" />
        </Link>

        <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase mb-2">
          {t.eyebrow}
        </p>
        <h1
          className="text-[clamp(36px,8vw,52px)] leading-none text-[#F5F5F5] mb-10 whitespace-pre-line"
          style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}
        >
          {t.title}
        </h1>

        {success ? (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="w-16 h-16 border border-[#2e5a2e] bg-[#0d150d] flex items-center justify-center">
              <CheckCircle size={28} className="text-[#4ade80]" />
            </div>
            <p className="text-[#4ade80] text-sm font-semibold">{t.success}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* New password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#A5A5A5] text-xs font-semibold tracking-widest uppercase">
                {t.newPass}
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passPlaceholder}
                  required
                  className={inputCls + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#A5A5A5] transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="h-0.5 bg-[#2B2B2E] mt-1">
                  <div
                    className={`h-full transition-all duration-300 ${
                      password.length < 8
                        ? "w-1/4 bg-[#D32F3A]"
                        : password.length < 12
                        ? "w-2/4 bg-amber-500"
                        : "w-full bg-[#4ade80]"
                    }`}
                  />
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[#A5A5A5] text-xs font-semibold tracking-widest uppercase">
                {t.confirmPass}
              </label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder={t.passPlaceholder}
                  required
                  className={inputCls + " pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555] hover:text-[#A5A5A5] transition-colors"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirm.length > 0 && password !== confirm && (
                <p className="text-[#D32F3A] text-xs">{t.mismatch}</p>
              )}
            </div>

            {error && (
              <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-3 text-[#D32F3A] text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 text-[#F5F5F5] font-semibold text-sm px-6 py-4 tracking-widest uppercase transition-colors"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  {t.confirm} <ArrowRight size={16} />
                </>
              )}
            </button>

            <Link
              href="/login"
              className="text-center text-[#555] hover:text-[#A5A5A5] text-xs transition-colors mt-2"
            >
              {t.backToLogin}
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
