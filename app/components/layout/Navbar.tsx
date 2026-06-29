"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const nav = {
  en: { shop: "Shop", categories: "Categories", about: "About" },
  th: { shop: "ร้านค้า", categories: "หมวดหมู่", about: "เกี่ยวกับเรา" },
};

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggle } = useLanguage();
  const t = nav[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#0F0F10]/90 backdrop-blur-md border-b border-[#2B2B2E]"
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
          <div className="flex items-center gap-4">
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
              {/* Cart badge */}
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

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
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
