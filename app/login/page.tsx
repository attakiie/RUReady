"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] flex items-center justify-center px-4 py-16">
      {/* Red top stripe */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-[#D32F3A] z-50" />

      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-10">
          <Link href="/" className="inline-flex items-center gap-2 group">
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
            เข้าสู่ระบบ
          </h1>
          <p className="text-[#A5A5A5] text-sm mt-2">
            ยังไม่มีบัญชี?{" "}
            <Link
              href="/register"
              className="text-[#D32F3A] hover:text-[#F5F5F5] transition-colors"
            >
              สมัครสมาชิก
            </Link>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
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
              className={inputCls}
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[#A5A5A5] text-xs font-semibold tracking-widest uppercase">
                รหัสผ่าน <span className="text-[#D32F3A]">*</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[#A5A5A5] hover:text-[#D32F3A] text-xs transition-colors"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="รหัสผ่าน"
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
          </div>

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
                เข้าสู่ระบบ <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-4 mt-8">
          <div className="flex-1 h-px bg-[#2B2B2E]" />
          <span className="text-[#2B2B2E] text-xs tracking-widest uppercase">หรือ</span>
          <div className="flex-1 h-px bg-[#2B2B2E]" />
        </div>

        <p className="text-center mt-6">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#D32F3A] text-xs font-semibold px-6 py-3 tracking-widest uppercase transition-colors duration-200"
          >
            สมัครสมาชิกใหม่ <ArrowRight size={12} />
          </Link>
        </p>
      </div>
    </div>
  );
}

const inputCls =
  "w-full bg-[#1A1A1C] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-4 py-3 outline-none transition-colors duration-200";
