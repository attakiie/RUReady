"use client";

import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { useWishlist } from "@/app/contexts/WishlistContext";

/**
 * Heart toggle button.
 * - Logged in: toggles the product in the user's wishlist (optimistic).
 * - Logged out: sends the user to /login.
 *
 * `variant="icon"` — bare heart (for product cards, absolute-positioned).
 * `variant="button"` — bordered pill with label (for product detail page).
 */
export default function WishlistButton({
  productId,
  variant = "icon",
  className = "",
  labelOn = "อยู่ในรายการโปรด",
  labelOff = "เพิ่มในรายการโปรด",
}: {
  productId: string;
  variant?: "icon" | "button";
  className?: string;
  labelOn?: string;
  labelOff?: string;
}) {
  const router = useRouter();
  const { isWishlisted, toggle, isLoggedIn, ready } = useWishlist();
  const active = isWishlisted(productId);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) { router.push("/login"); return; }
    toggle(productId);
  }

  if (variant === "button") {
    return (
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={active}
        className={`flex items-center justify-center gap-2 h-10 px-4 border text-xs font-semibold tracking-widest uppercase transition-colors ${
          active
            ? "border-[#D32F3A] text-[#D32F3A] bg-[#D32F3A]/10"
            : "border-[#2B2B2E] text-[#A5A5A5] hover:border-[#D32F3A] hover:text-[#D32F3A]"
        } ${className}`}
      >
        <Heart size={15} fill={active ? "#D32F3A" : "none"} />
        {active ? labelOn : labelOff}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? labelOn : labelOff}
      className={`w-9 h-9 flex items-center justify-center bg-[#0F0F10]/70 backdrop-blur-sm border border-[#2B2B2E] hover:border-[#D32F3A] transition-colors ${
        ready ? "" : "opacity-0"
      } ${className}`}
    >
      <Heart
        size={16}
        className={active ? "text-[#D32F3A]" : "text-[#A5A5A5]"}
        fill={active ? "#D32F3A" : "none"}
      />
    </button>
  );
}
