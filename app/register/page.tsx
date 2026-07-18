"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase";

type Field = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const INIT: Field = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const [form, setForm] = useState<Field>(INIT);
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const set = (k: keyof Field) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (form.password.length < 8) {
      setError("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          first_name: form.firstName.trim(),
          last_name: form.lastName.trim(),
          phone: form.phone.trim(),
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setDone(true);
  }

  async function handleGoogleSignup() {
    setError("");
    setGoogleLoading(true);
    const supabase = createClient();
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (oauthError) {
      setError("สมัครสมาชิกด้วย Google ไม่สำเร็จ กรุณาลองใหม่");
      setGoogleLoading(false);
    }
    // On success, Supabase redirects the browser to Google — no further action needed here.
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-16 h-16 bg-[#D32F3A]/10 border border-[#D32F3A]/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-6 h-6 border-2 border-[#D32F3A] rounded-full flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-[#D32F3A] rounded-full" />
            </div>
          </div>
          <h2
            className="text-[48px] leading-none text-[#F5F5F5] mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            READY.
          </h2>
          <p className="text-[#A5A5A5] mb-2">
            ส่งลิงก์ยืนยันไปที่ <span className="text-[#F5F5F5]">{form.email}</span> แล้ว
          </p>
          <p className="text-[#A5A5A5] text-sm mb-8">กรุณาเช็ค email เพื่อยืนยันบัญชี</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#D32F3A] text-sm font-semibold tracking-widest uppercase hover:text-[#F5F5F5] transition-colors"
          >
            ไปหน้า Login <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4 py-16">
      {/* Red top stripe (fixed) */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-50" />

      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="mb-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 group"
          >
            <span
              className="text-2xl text-[#F5F5F5] tracking-widest group-hover:text-[#D32F3A] transition-colors"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              R U READY
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D32F3A]" />
          </Link>
          <h1
            className="text-[clamp(36px,8vw,56px)] leading-none text-[#F5F5F5] mt-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            สมัครสมาชิก
          </h1>
          <p className="text-[#A5A5A5] text-sm mt-2">
            มีบัญชีแล้ว?{" "}
            <Link href="/login" className="text-[#D32F3A] hover:text-[#F5F5F5] transition-colors">
              เข้าสู่ระบบ
            </Link>
          </p>
        </div>

        <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-3 mb-6 text-sm text-[#F5F5F5]">
          🎉 สมัครวันนี้ รับส่วนลด <span className="font-bold text-[#D32F3A]">฿30</span> ในบิลแรกทันที
        </div>

        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-3 bg-[#F5F5F5] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-[#0F0F10] font-semibold text-sm px-6 py-3.5 transition-colors duration-200"
        >
          {googleLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <GoogleIcon size={16} />
              สมัครสมาชิกด้วย Google
            </>
          )}
        </button>

        <div className="flex items-center gap-4 my-6">
          <div className="flex-1 h-px bg-[#2B2B2E]" />
          <span className="text-[#2B2B2E] text-xs tracking-widest uppercase">หรือ</span>
          <div className="flex-1 h-px bg-[#2B2B2E]" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Name row */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="ชื่อ" required>
              <input
                type="text"
                value={form.firstName}
                onChange={set("firstName")}
                placeholder="สมชาย"
                required
                className={inputCls}
              />
            </Field>
            <Field label="นามสกุล" required>
              <input
                type="text"
                value={form.lastName}
                onChange={set("lastName")}
                placeholder="ใจดี"
                required
                className={inputCls}
              />
            </Field>
          </div>

          {/* Email */}
          <Field label="อีเมล" required>
            <input
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="you@example.com"
              required
              className={inputCls}
            />
          </Field>

          {/* Phone */}
          <Field label="เบอร์โทรศัพท์">
            <input
              type="tel"
              value={form.phone}
              onChange={set("phone")}
              placeholder="0812345678"
              className={inputCls}
            />
          </Field>

          {/* Password */}
          <Field label="รหัสผ่าน" required>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={form.password}
                onChange={set("password")}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                required
                className={inputCls + " pr-11"}
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </Field>

          {/* Confirm password */}
          <Field label="ยืนยันรหัสผ่าน" required>
            <input
              type={showPw ? "text" : "password"}
              value={form.confirmPassword}
              onChange={set("confirmPassword")}
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
              required
              className={inputCls}
            />
          </Field>

          {/* Error */}
          {error && (
            <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-3 text-[#D32F3A] text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 disabled:cursor-not-allowed text-[#F5F5F5] font-semibold text-sm px-6 py-4 tracking-widest uppercase transition-colors duration-200"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                สมัครสมาชิก <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-[#555] text-xs text-center leading-relaxed">
            การสมัครสมาชิกถือว่าคุณยอมรับ{" "}
            <a href="/terms" className="underline hover:text-[#D32F3A] transition-colors">
              ข้อกำหนดและนโยบายความเป็นส่วนตัว
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-[#1A1A1C] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-4 py-3 outline-none transition-colors duration-200";

function Field({
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

function GoogleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.5 0 10.5-2.1 14.3-5.6l-6.6-5.6C29.6 34.7 27 35.6 24 35.6c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6.6 5.6C41.9 35.9 44 30.4 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
