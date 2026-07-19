"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { createClient } from "@/app/lib/supabase";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
    });

    setLoading(false);
    if (resetError) {
      setError(resetError.message);
    } else {
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4">
        <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-50" />
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-[#D32F3A]/10 border border-[#D32F3A]/30 flex items-center justify-center mx-auto mb-6">
            <Mail size={24} className="text-[#D32F3A]" />
          </div>
          <h2
            className="text-[48px] leading-none text-[#F5F5F5] mb-4"
            style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}
          >
            ส่งลิงก์แล้ว
          </h2>
          <p className="text-[#A5A5A5] mb-2">
            ส่งลิงก์รีเซ็ตรหัสผ่านไปที่{" "}
            <span className="text-[#F5F5F5]">{email}</span>
          </p>
          <p className="text-[#A5A5A5] text-sm mb-8">
            กรุณาตรวจสอบ inbox หรือ spam folder
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-[#D32F3A] text-sm font-semibold tracking-widest uppercase hover:text-[#F5F5F5] transition-colors"
          >
            กลับไปหน้า Login <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4 py-16">
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-50" />

      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <span
              className="text-2xl text-[#F5F5F5] tracking-widest group-hover:text-[#D32F3A] transition-colors"
              style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}
            >
              R U READY
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D32F3A]" />
          </Link>
          <h1
            className="text-[clamp(32px,7vw,48px)] leading-none text-[#F5F5F5] mt-4"
            style={{ fontFamily: "'Bebas Neue', 'Kanit', sans-serif" }}
          >
            ลืมรหัสผ่าน
          </h1>
          <p className="text-[#A5A5A5] text-sm mt-2">
            ใส่อีเมลที่ลงทะเบียนไว้ เราจะส่งลิงก์รีเซ็ตให้
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[#A5A5A5] text-xs font-semibold tracking-widest uppercase">
              อีเมล <span className="text-[#D32F3A]">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full bg-[#1A1A1C] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-4 py-3 outline-none transition-colors duration-200"
            />
          </div>

          {error && (
            <div className="bg-[#D32F3A]/10 border border-[#D32F3A]/30 px-4 py-3 text-[#D32F3A] text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 disabled:cursor-not-allowed text-[#F5F5F5] font-semibold text-sm px-6 py-4 tracking-widest uppercase transition-colors duration-200"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                ส่งลิงก์รีเซ็ต <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center mt-2">
            <Link
              href="/login"
              className="text-[#A5A5A5] hover:text-[#D32F3A] text-xs transition-colors uppercase tracking-widest"
            >
              ← กลับไปเข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
