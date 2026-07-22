"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Star, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/app/lib/supabase";
import { useLanguage } from "@/app/contexts/LanguageContext";

type Review = {
  id: string;
  user_id: string;
  author_name: string;
  rating: number;
  comment: string;
  created_at: string;
};

const copy = {
  en: {
    heading: "Reviews",
    noReviews: "No reviews yet. Be the first to review this product.",
    writeReview: "Write a review",
    yourRating: "Your rating",
    commentPlaceholder: "Share your experience with this product…",
    submit: "Post review",
    submitting: "Posting…",
    loginPrompt: "Log in to write a review",
    login: "Log in",
    alreadyReviewed: "You've reviewed this product",
    delete: "Delete",
    anonymous: "Customer",
    basedOn: (n: number) => `Based on ${n} review${n === 1 ? "" : "s"}`,
    ratingRequired: "Please select a star rating",
    error: "Couldn't post your review, please try again",
  },
  th: {
    heading: "รีวิวสินค้า",
    noReviews: "ยังไม่มีรีวิว มาเป็นคนแรกที่รีวิวสินค้านี้กันเลย",
    writeReview: "เขียนรีวิว",
    yourRating: "ให้คะแนน",
    commentPlaceholder: "เล่าประสบการณ์การใช้สินค้านี้…",
    submit: "โพสต์รีวิว",
    submitting: "กำลังโพสต์…",
    loginPrompt: "เข้าสู่ระบบเพื่อเขียนรีวิว",
    login: "เข้าสู่ระบบ",
    alreadyReviewed: "คุณรีวิวสินค้านี้แล้ว",
    delete: "ลบ",
    anonymous: "ลูกค้า",
    basedOn: (n: number) => `จาก ${n} รีวิว`,
    ratingRequired: "กรุณาเลือกจำนวนดาว",
    error: "โพสต์รีวิวไม่สำเร็จ กรุณาลองใหม่",
  },
};

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(value) ? "text-[#f5b301]" : "text-[#2B2B2E]"}
          fill={i <= Math.round(value) ? "#f5b301" : "none"}
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { lang } = useLanguage();
  const t = copy[lang];

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");

  // form
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      const supabase = createClient();
      const [{ data: revs }, { data: { user } }] = await Promise.all([
        supabase
          .from("reviews")
          .select("id, user_id, author_name, rating, comment, created_at")
          .eq("product_id", productId)
          .order("created_at", { ascending: false }),
        supabase.auth.getUser(),
      ]);
      if (!active) return;
      setReviews((revs as Review[]) ?? []);
      setUserId(user?.id ?? null);
      if (user) {
        const { data: profile } = await supabase
          .from("profiles").select("first_name, last_name").eq("id", user.id).single();
        if (active && profile) setProfileName(`${profile.first_name} ${profile.last_name}`.trim());
      }
      if (active) setLoading(false);
    }
    load();
    return () => { active = false; };
  }, [productId, refreshKey]);

  const count = reviews.length;
  const avg = count ? reviews.reduce((s, r) => s + r.rating, 0) / count : 0;
  const myReview = reviews.find((r) => r.user_id === userId);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (rating < 1) { setError(t.ratingRequired); return; }
    if (!userId) return;
    setSubmitting(true);
    const supabase = createClient();
    const { error: insErr } = await supabase.from("reviews").insert({
      product_id: productId,
      user_id: userId,
      author_name: profileName || t.anonymous,
      rating,
      comment: comment.trim(),
    });
    setSubmitting(false);
    if (insErr) { setError(t.error); return; }
    setRating(0); setComment("");
    setRefreshKey((k) => k + 1);
  }

  async function deleteMine(id: string) {
    const supabase = createClient();
    const { error: delErr } = await supabase.from("reviews").delete().eq("id", id);
    if (!delErr) setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div className="mt-16">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <p className="text-[#D32F3A] text-xs font-semibold tracking-[0.2em] uppercase">{t.heading}</p>
        {count > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-[#F5F5F5] text-2xl font-bold">{avg.toFixed(1)}</span>
            <div>
              <Stars value={avg} />
              <p className="text-[#555] text-xs mt-0.5">{t.basedOn(count)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Write review */}
      {loading ? null : !userId ? (
        <div className="bg-[#1A1A1C] border border-[#2B2B2E] px-5 py-4 mb-8 flex items-center justify-between flex-wrap gap-3">
          <span className="text-[#A5A5A5] text-sm">{t.loginPrompt}</span>
          <Link href="/login" className="text-[#D32F3A] text-xs font-semibold tracking-widest uppercase hover:text-[#F5F5F5] transition-colors">
            {t.login} →
          </Link>
        </div>
      ) : myReview ? (
        <div className="bg-[#1A1A1C] border border-[#2B2B2E] px-5 py-4 mb-8 text-[#555] text-sm">
          {t.alreadyReviewed}
        </div>
      ) : (
        <form onSubmit={submit} className="bg-[#1A1A1C] border border-[#2B2B2E] p-5 mb-8">
          <p className="text-[#F5F5F5] text-sm font-semibold mb-3">{t.writeReview}</p>
          <div className="flex items-center gap-1 mb-4">
            <span className="text-[#555] text-xs uppercase tracking-widest mr-2">{t.yourRating}</span>
            {[1, 2, 3, 4, 5].map((i) => (
              <button key={i} type="button"
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}
                onClick={() => setRating(i)}
                className="p-0.5">
                <Star size={22}
                  className={i <= (hover || rating) ? "text-[#f5b301]" : "text-[#2B2B2E]"}
                  fill={i <= (hover || rating) ? "#f5b301" : "none"} />
              </button>
            ))}
          </div>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder={t.commentPlaceholder} rows={3}
            className="w-full bg-[#0F0F10] border border-[#2B2B2E] focus:border-[#D32F3A] text-[#F5F5F5] placeholder-[#3A3A3E] text-sm px-4 py-3 outline-none transition-colors resize-none" />
          {error && <p className="text-[#D32F3A] text-xs mt-2">{error}</p>}
          <button type="submit" disabled={submitting}
            className="mt-4 flex items-center gap-2 bg-[#D32F3A] hover:bg-[#A02029] disabled:opacity-50 text-[#F5F5F5] font-semibold text-xs px-5 py-3 tracking-widest uppercase transition-colors">
            {submitting ? <><Loader2 size={14} className="animate-spin" /> {t.submitting}</> : t.submit}
          </button>
        </form>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 className="animate-spin text-[#D32F3A]" /></div>
      ) : count === 0 ? (
        <p className="text-[#555] text-sm py-4">{t.noReviews}</p>
      ) : (
        <div className="flex flex-col gap-px bg-[#2B2B2E]">
          {reviews.map((r) => (
            <div key={r.id} className="bg-[#1A1A1C] px-5 py-4">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-3">
                  <span className="text-[#F5F5F5] text-sm font-semibold">{r.author_name || t.anonymous}</span>
                  <Stars value={r.rating} size={12} />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[#555] text-xs">{new Date(r.created_at).toLocaleDateString(lang === "th" ? "th-TH" : "en-US")}</span>
                  {r.user_id === userId && (
                    <button onClick={() => deleteMine(r.id)} title={t.delete}
                      className="text-[#555] hover:text-[#D32F3A] transition-colors">
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>
              </div>
              {r.comment && <p className="text-[#A5A5A5] text-sm leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
