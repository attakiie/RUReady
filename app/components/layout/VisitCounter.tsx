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

  if (count == null) return null;

  return (
    <p className="text-[#2B2B2E] text-[10px] tracking-widest uppercase font-mono">
      Shooter Visits: {count.toLocaleString()}
    </p>
  );
}
