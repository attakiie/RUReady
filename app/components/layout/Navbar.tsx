"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag, Menu, X, User, LogOut, ChevronDown, Package, Shield, MapPin, ArrowRight } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { useCart } from "@/app/contexts/CartContext";
import { createClient } from "@/app/lib/supabase";
import type { User as SupabaseUser } from "@supabase/supabase-js";

const nav = {
  en: { shop: "Shop", categories: "Categories", about: "About", login: "Login", register: "Join", account: "My Account", logout: "Logout", orders: "Orders", addresses: "Addresses", security: "Security" },
  th: { shop: "ร้านค้า", categories: "หมวดหมู่", about: "เกี่ยวกับเรา", login: "เข้าสู่ระบบ", register: "สมัครสมาชิก", account: "บัญชีของฉัน", logout: "ออกจากระบบ", orders: "ออเดอร์", addresses: "ที่อยู่", security: "ความปลอดภัย" },
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
  const { count, setDrawerOpen } = useCart();

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setFirstName("");
    });
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const supabase = createClient();
    const { data } = await supabase.from("profiles").select("first_name").eq("id", userId).single();
    if (data?.first_name) setFirstName(data.first_name);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUserMenuOpen(false);
    setMenuOpen(false);
    setUser(null);
    setFirstName("");
    router.push("/");
    router.refresh();
  }

  function close() { setMenuOpen(false); }

  return (
    <>
      <nav
        style={{ top: "calc(3px + var(--announce-h, 0px))" }}
        className={`fixed left-0 right-0 z-50 transition-[background-color,backdrop-filter,border-color,top] duration-200 ${
          scrolled
            ? "bg-[#0F0F10]/90 backdrop-blur-md border-b border-[#D32F3A]/40"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="group flex items-center gap-2" onClick={close}>
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
            <div className="flex items-center gap-1 sm:gap-3">
              {/* Desktop: user menu */}
              {user ? (
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
                    <span className="text-sm font-medium">{firstName || "สมาชิก"}</span>
                    <ChevronDown size={14} className={`transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#1A1A1C] border border-[#2B2B2E] py-1 z-50">
                      <Link href="/account" onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#2B2B2E] transition-colors">
                        <User size={14} /> {t.account}
                      </Link>
                      <div className="h-px bg-[#2B2B2E] my-1" />
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#D32F3A] hover:bg-[#2B2B2E] transition-colors">
                        <LogOut size={14} /> {t.logout}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-3">
                  <Link href="/login" className="text-xs font-semibold tracking-widest text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200 uppercase">
                    {t.login}
                  </Link>
                  <Link href="/register" className="text-xs font-semibold tracking-widest bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] px-4 py-1.5 uppercase transition-colors duration-200">
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

              {/* Cart */}
              <button
                aria-label="Cart"
                onClick={() => setDrawerOpen(true)}
                className="relative p-2 text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200"
              >
                <ShoppingBag size={20} />
                {count > 0 ? (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-[#D32F3A] rounded-full text-[#F5F5F5] text-[10px] font-bold flex items-center justify-center px-1">
                    {count > 99 ? "99+" : count}
                  </span>
                ) : (
                  <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#D32F3A] rounded-full" />
                )}
              </button>

              {/* Hamburger — mobile only */}
              <button
                className="md:hidden p-2 text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label={menuOpen ? "ปิดเมนู" : "เปิดเมนู"}
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Full-screen mobile menu ── */}
      <div className={`fixed inset-0 z-[200] md:hidden transition-all duration-300 ${menuOpen ? "" : "pointer-events-none"}`}>
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={close}
        />

        {/* Slide panel — from right */}
        <div
          className={`absolute top-0 right-0 h-full w-[82%] max-w-[340px] bg-[#0F0F10] border-l border-[#2B2B2E] flex flex-col transition-transform duration-300 ease-out ${menuOpen ? "translate-x-0" : "translate-x-full"}`}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-5 border-b border-[#2B2B2E]">
            <span className="text-[#F5F5F5] text-xl tracking-widest" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              MENU
            </span>
            <button onClick={close} className="text-[#555] hover:text-[#F5F5F5] transition-colors p-1">
              <X size={22} />
            </button>
          </div>

          {/* User info — if logged in */}
          {user && (
            <div className="flex items-center gap-3 px-6 py-5 border-b border-[#2B2B2E] bg-[#1A1A1C]">
              <div className="w-10 h-10 rounded-full bg-[#D32F3A] flex items-center justify-center shrink-0">
                <span className="text-[#F5F5F5] font-bold text-base">
                  {firstName ? firstName.charAt(0).toUpperCase() : "?"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[#F5F5F5] font-semibold text-sm">{firstName || "สมาชิก"}</p>
                <p className="text-[#555] text-xs truncate">{user.email}</p>
              </div>
            </div>
          )}

          {/* Nav items */}
          <div className="flex-1 overflow-y-auto py-2">
            {/* Main nav */}
            <div className="px-3 py-2">
              <p className="text-[#3A3A3E] text-[10px] font-semibold tracking-[0.2em] uppercase px-3 mb-1">เมนูหลัก</p>
              <PanelLink href="/shop" onClick={close} icon={<ShoppingBag size={15} />}>{t.shop}</PanelLink>
              <PanelLink href="/categories" onClick={close} icon={<span className="w-4 h-4 flex items-center justify-center text-[10px] font-bold border border-current">4</span>}>{t.categories}</PanelLink>
              <PanelLink href="/about" onClick={close} icon={<span className="w-4 h-4 border-b border-current inline-block" />}>{t.about}</PanelLink>
            </div>

            <div className="h-px bg-[#1A1A1C] mx-3 my-2" />

            {/* Account nav */}
            {user ? (
              <div className="px-3 py-2">
                <p className="text-[#3A3A3E] text-[10px] font-semibold tracking-[0.2em] uppercase px-3 mb-1">บัญชี</p>
                <PanelLink href="/account" onClick={close} icon={<User size={15} />}>{t.account}</PanelLink>
                <PanelLink href="/account?tab=orders" onClick={close} icon={<Package size={15} />}>{t.orders}</PanelLink>
                <PanelLink href="/account?tab=addresses" onClick={close} icon={<MapPin size={15} />}>{t.addresses}</PanelLink>
                <PanelLink href="/account?tab=security" onClick={close} icon={<Shield size={15} />}>{t.security}</PanelLink>
              </div>
            ) : (
              <div className="px-6 py-4 flex flex-col gap-3">
                <Link href="/login" onClick={close}
                  className="w-full flex items-center justify-center gap-2 border border-[#2B2B2E] hover:border-[#D32F3A] text-[#A5A5A5] hover:text-[#F5F5F5] text-sm font-semibold tracking-widest uppercase py-3.5 transition-colors">
                  {t.login}
                </Link>
                <Link href="/register" onClick={close}
                  className="w-full flex items-center justify-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] text-[#F5F5F5] text-sm font-semibold tracking-widest uppercase py-3.5 transition-colors">
                  {t.register} <ArrowRight size={14} />
                </Link>
              </div>
            )}
          </div>

          {/* Panel footer */}
          <div className="border-t border-[#2B2B2E] px-6 py-4 flex items-center justify-between">
            {user ? (
              <button onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-[#D32F3A] font-semibold tracking-widest uppercase">
                <LogOut size={14} /> {t.logout}
              </button>
            ) : (
              <span className="text-[#3A3A3E] text-xs tracking-widest">R U READY</span>
            )}
            <button onClick={toggle}
              className="text-xs font-semibold tracking-widest text-[#A5A5A5] hover:text-[#F5F5F5] border border-[#2B2B2E] hover:border-[#F5F5F5] px-2.5 py-1 transition-colors uppercase">
              {lang === "en" ? "TH" : "EN"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="text-sm font-medium text-[#A5A5A5] hover:text-[#F5F5F5] transition-colors duration-200 tracking-wide uppercase">
      {children}
    </Link>
  );
}

function PanelLink({ href, onClick, icon, children }: { href: string; onClick: () => void; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Link href={href} onClick={onClick}
      className="flex items-center gap-3 px-3 py-3.5 text-sm font-medium text-[#A5A5A5] hover:text-[#F5F5F5] hover:bg-[#1A1A1C] rounded transition-colors tracking-wide uppercase">
      {icon && <span className="text-[#555] flex-shrink-0">{icon}</span>}
      {children}
    </Link>
  );
}
