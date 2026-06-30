"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { createClient } from "@/app/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const nav = {
  en: { shop: "Shop", categories: "Categories", about: "About", login: "Login", register: "Join", account: "My Account", logout: "Logout" },
  th: { shop: "ร้านค้า", categories: "หมวดหมู่", about: "เกี่ยวกับเรา", login: "เข้าสู่ระบบ", register: "สมัครสมาชิก", account: "บัญชีของฉัน", logout: "ออกจากระบบ" },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [firstName, setFirstName] = useState("");
  const { lang, toggle } = useLanguage();
  const t = nav[lang];
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setFirstName("");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const supabase = createClient();
    const { data } = await supabase
      .from("profiles")
      .select("first_name")
      .eq("id", userId)
      .single();
    if (data?.first_name) setFirstName(data.first_name);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setUser(null);
    setFirstName("");
    router.push("/");
    router.refresh();
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#0F0F10]/90 backdrop-blur-md border-b border-[#D32F3A]/40"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2">
            <span
              className="font-display text-2xl text-[#F5F5F5] tracking-widest group-hover:text-[#D32F3A] transition-colors duration-200"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              R U READY
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#D32F3A] mb-0.5" />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="/shop">{t.shop}</NavLink>
            <NavLink href="/categories">{t.categories}</NavLink>
            <NavLink href="/about">{t.about}</NavLink>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              /* ── Logged in ── */
              <div className="hidden md:flex items-center gap-3 relative">
                <button
                  onClick={() => setUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200"
                >
                  <div className="w-7 h-7 rounded-full bg-[#D32F3A] flex items-center justify-center">
                    <span className="text-[#F5F5F5] text-xs font-bold">
                      {firstName ? firstName.charAt(0).toUpperCase() : <User size={12} />}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {firstName || "สมาชิก"}
                  </span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1A1C] border border-[#2B2B2E] py-1 z-50">
                    <Link
                      href="/account"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors"
                    >
                      <User size={14} /> {t.account}
                    </Link>
                    <div className="h-px bg-[#2B2B2E] my-1" />
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#D32F3A] hover:bg-[#2B2B2E] transition-colors"
                    >
                      <LogOut size={14} /> {t.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* ── Not logged in ── */
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-xs font-semibold tracking-widest text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200 uppercase"
                >
                  {t.login}
                </Link>
                <Link
                  href="/register"
                  className="text-xs font-semibold tracking-widest bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] px-4 py-1.5 uppercase transition-colors duration-200"
                >
                  {t.register}
                </Link>
              </div>
            )}

            {/* Language Toggle */}
            <button
              onClick={toggle}
              aria-label="Toggle language"
              className="text-xs font-semibold tracking-widest text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200 uppercase border border-[#2B2B2E] hover:border-[#F5F5F5] px-2 py-1"
            >
              {lang === "en" ? "TH" : "EN"}
            </button>

            <button
              aria-label="Cart"
              className="relative p-2 text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200"
            >
              <ShoppingBag size={20} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#D32F3A] rounded-full" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              className="md:hidden p-2 text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#1A1A1C] border-t border-[#2B2B2E]">
          <div className="px-4 py-4 flex flex-col gap-4">
            <MobileNavLink href="/shop" onClick={() => setMenuOpen(false)}>{t.shop}</MobileNavLink>
            <MobileNavLink href="/categories" onClick={() => setMenuOpen(false)}>{t.categories}</MobileNavLink>
            <MobileNavLink href="/about" onClick={() => setMenuOpen(false)}>{t.about}</MobileNavLink>
            <div className="h-px bg-[#2B2B2E]" />
            {user ? (
              <>
                <MobileNavLink href="/account" onClick={() => setMenuOpen(false)}>
                  <User size={14} className="inline mr-2" />{firstName || "สมาชิก"}
                </MobileNavLink>
                <button
                  onClick={() => { setMenuOpen(false); handleLogout(); }}
                  className="text-left text-base font-medium text-[#D32F3A] tracking-wide uppercase py-2 flex items-center gap-2"
                >
                  <LogOut size={14} /> {t.logout}
                </button>
              </>
            ) : (
              <>
                <MobileNavLink href="/login" onClick={() => setMenuOpen(false)}>{t.login}</MobileNavLink>
                <Link
                  href="/register"
                  onClick={() => setMenuOpen(false)}
                  className="inline-flex items-center gap-2 bg-[#D32F3A] text-[#F5F5F5] font-semibold text-sm px-4 py-2.5 tracking-widest uppercase"
                >
                  <User size={14} /> {t.register}
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200 tracking-wide uppercase"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, onClick, children }: { href: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-base font-medium text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200 tracking-wide uppercase py-2"
    >
      {children}
    </Link>
  );
}
