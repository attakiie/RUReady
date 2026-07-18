"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase";

const SESSION_KEY = "ru-ready-visit-counted";

/**
 * Retro-style hit counter. Increments the shared site_stats.total_visits
 * counter once per browser tab session (via increment_visit_count RPC,
 * a SECURITY DEFINER function — anon/auth clients never get direct
 * UPDATE access to the table). On repeat renders within the same
 * session it just re-reads the current count instead of incrementing again.
 */
export default function VisitCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    const supabase = createClient();

    async function run() {
      let alreadyCounted = false;
      try {
        alreadyCounted = sessionStorage.getItem(SESSION_KEY) === "1";
      } catch {}

      if (!alreadyCounted) {
        const { data, error } = await supabase.rpc("increment_visit_count");
        if (!active) return;
        if (!error && typeof data === "number") {
          setCount(data);
          try {
            sessionStorage.setItem(SESSION_KEY, "1");
          } catch {}
          return;
        }
      }

      // Already counted this session (or the increment call failed) —
      // just read the current total instead.
      const { data: row } = await supabase
        .from("site_stats")
        .select("count")
        .eq("key", "total_visits")
        .single();
      if (!active) return;
      if (row?.count != null) setCount(row.count);
    }

    run();
    return () => {
      active = false;
    };
  }, []);

  const digits = String(count ?? 0).padStart(5, "0").slice(-5);

  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[#555] text-[9px] font-semibold tracking-[0.2em] uppercase">
        Shooter Visits
      </span>
      <div className="flex items-center gap-2 bg-black border border-[#2B2B2E] rounded px-3 py-1.5 shadow-inner">
        <span
          className="w-1.5 h-1.5 rounded-full bg-[#ff2d2d] animate-pulse shrink-0"
          style={{ boxShadow: "0 0 6px 1px rgba(255,45,45,0.85)" }}
          aria-hidden="true"
        />
        <div className="relative font-mono text-lg leading-none tracking-[0.15em]">
          {/* unlit LED segments — gives the digits a real display housing feel */}
          <span className="text-[#2a0808] select-none" aria-hidden="true">
            88888
          </span>
          <span
            className="absolute inset-0 text-[#ff3333]"
            style={{ textShadow: "0 0 4px rgba(255,51,51,0.9), 0 0 12px rgba(255,51,51,0.5)" }}
          >
            {count == null ? "" : digits}
          </span>
        </div>
      </div>
    </div>
  );
}
