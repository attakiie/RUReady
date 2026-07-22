"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { createClient } from "@/app/lib/supabase";

type WishlistContextValue = {
  ids: Set<string>;                          // product ids the user has favorited
  count: number;
  ready: boolean;                            // finished initial load
  isLoggedIn: boolean;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const WishlistContext = createContext<WishlistContextValue>({
  ids: new Set(),
  count: 0,
  ready: false,
  isLoggedIn: false,
  isWishlisted: () => false,
  toggle: async () => {},
  refresh: async () => {},
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<Set<string>>(new Set());
  const [ready, setReady] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const loadFor = useCallback(async (uid: string | null) => {
    if (!uid) {
      setIds(new Set());
      setReady(true);
      return;
    }
    const supabase = createClient();
    const { data } = await supabase
      .from("wishlist")
      .select("product_id")
      .eq("user_id", uid);
    setIds(new Set((data ?? []).map((r: { product_id: string }) => r.product_id)));
    setReady(true);
  }, []);

  useEffect(() => {
    let active = true;
    const supabase = createClient();
    async function init() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!active) return;
      setUserId(user?.id ?? null);
      await loadFor(user?.id ?? null);
    }
    init();

    // Keep in sync with auth changes (login / logout)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const uid = session?.user?.id ?? null;
      setUserId(uid);
      loadFor(uid);
    });
    return () => { active = false; sub.subscription.unsubscribe(); };
  }, [loadFor]);

  const isWishlisted = useCallback((productId: string) => ids.has(productId), [ids]);

  const toggle = useCallback(async (productId: string) => {
    if (!userId) return; // caller handles the logged-out case (link to login)
    const supabase = createClient();
    const already = ids.has(productId);
    // optimistic update
    setIds((prev) => {
      const next = new Set(prev);
      if (already) next.delete(productId); else next.add(productId);
      return next;
    });
    if (already) {
      const { error } = await supabase.from("wishlist").delete()
        .eq("user_id", userId).eq("product_id", productId);
      if (error) setIds((prev) => new Set(prev).add(productId)); // revert
    } else {
      const { error } = await supabase.from("wishlist")
        .insert({ user_id: userId, product_id: productId });
      if (error) setIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    }
  }, [userId, ids]);

  const refresh = useCallback(() => loadFor(userId), [loadFor, userId]);

  return (
    <WishlistContext.Provider
      value={{
        ids,
        count: ids.size,
        ready,
        isLoggedIn: !!userId,
        isWishlisted,
        toggle,
        refresh,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
