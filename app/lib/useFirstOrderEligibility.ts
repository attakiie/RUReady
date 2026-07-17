"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/app/lib/supabase";

/**
 * Returns whether the current logged-in user is eligible for the
 * "new member" first-order discount — true only when they have an
 * account and have never placed an order before (any status,
 * including cancelled — once an order exists, they're no longer "new").
 * Guests (not logged in) are never eligible.
 */
export function useFirstOrderEligibility() {
  const [isFirstOrder, setIsFirstOrder] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (!cancelled) {
          setIsFirstOrder(false);
          setChecked(true);
        }
        return;
      }

      const { count } = await supabase
        .from("orders")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (!cancelled) {
        setIsFirstOrder((count ?? 0) === 0);
        setChecked(true);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, []);

  return { isFirstOrder, checked };
}
