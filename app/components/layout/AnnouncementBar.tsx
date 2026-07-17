"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Gift, X } from "lucide-react";
import { useLanguage } from "@/app/contexts/LanguageContext";

const STORAGE_KEY = "ru-ready-announcement-dismissed";
const BAR_HEIGHT = 40; // px — keep in sync with the h-10 class below

const copy = {
  en: {
    text: "First Order Discount — Get 30 THB OFF on your first purchase. One discount per account.",
  },
  th: {
    text: "ส่วนลดออเดอร์แรก — รับส่วนลด 30 บาท ในการสั่งซื้อครั้งแรก จำกัด 1 สิทธิ์ต่อบัญชี",
  },
};

export default function AnnouncementBar() {
  const { lang } = useLanguage();
  const t = copy[lang];
  const [show, setShow] = useState(false);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(STORAGE_KEY) === "1";
    } catch {}
    if (!dismissed) setShow(true);
  }, []);

  // Keep the shared CSS variable (read by Navbar + root layout) in sync
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--announce-h",
      show ? `${BAR_HEIGHT}px` : "0px"
    );
    return () => {
      document.documentElement.style.setProperty("--announce-h", "0px");
    };
  }, [show]);

  function dismiss() {
    setShow(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {}
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -BAR_HEIGHT, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -BAR_HEIGHT, opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          role="region"
          aria-label={lang === "th" ? "ประกาศโปรโมชั่น" : "Promotion announcement"}
          className="fixed top-[3px] left-0 right-0 z-[95] h-10 bg-[#D32F3A] text-[#F5F5F5]"
        >
          <div className="max-w-7xl mx-auto h-full px-3 sm:px-6 lg:px-8 flex items-center justify-center gap-2 relative">
            <Gift size={14} className="shrink-0" aria-hidden />
            <p className="text-[11px] sm:text-xs font-medium tracking-wide text-center truncate">
              {t.text}
            </p>
            <button
              onClick={dismiss}
              aria-label={lang === "th" ? "ปิดประกาศ" : "Close announcement"}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 p-1 text-[#F5F5F5]/80 hover:text-[#F5F5F5] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
