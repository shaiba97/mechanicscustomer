"use client";

import * as React from "react";
import { Check } from "lucide-react";
import type { Part } from "@/hooks/use-parts";
import { useLocale } from "@/hooks/use-locale";

export type CartItem = {
  part: Part;
  quantity: number;
};

type ShopContextValue = {
  items: CartItem[];
  wishlist: string[];
  hydrated: boolean;
  cartCount: number;
  subtotal: number;
  addToCart: (part: Part, quantity?: number) => void;
  removeFromCart: (partId: string) => void;
  setQuantity: (partId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (part: Part) => void;
  isWishlisted: (partId: string) => boolean;
  notify: (message: string) => void;
};

type StoredShop = {
  items?: CartItem[];
  wishlist?: string[];
};

const STORAGE_KEY = "customer_shop";

const ShopContext = React.createContext<ShopContextValue | null>(null);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLocale();
  const [items, setItems] = React.useState<CartItem[]>([]);
  const [wishlist, setWishlist] = React.useState<string[]>([]);
  const [hydrated, setHydrated] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const toastTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as StoredShop;
        if (Array.isArray(stored.items)) setItems(stored.items);
        if (Array.isArray(stored.wishlist)) setWishlist(stored.wishlist);
      }
    } catch {}
    setHydrated(true);
  }, []);

  React.useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ items, wishlist }));
    } catch {}
  }, [items, wishlist, hydrated]);

  React.useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const notify = React.useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  const addToCart = React.useCallback(
    (part: Part, quantity = 1) => {
      if (part.stockQty <= 0) return;
      const currentStoreId = items[0]?.part.storeId;
      const changesStore = Boolean(
        currentStoreId && part.storeId && currentStoreId !== part.storeId,
      );
      setItems((current) => {
        if (changesStore) {
          return [{ part, quantity: Math.min(quantity, part.stockQty) }];
        }
        const existing = current.find((item) => item.part.id === part.id);
        if (!existing) {
          return [...current, { part, quantity: Math.min(quantity, part.stockQty) }];
        }
        return current.map((item) =>
          item.part.id === part.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, part.stockQty),
              }
            : item,
        );
      });
      notify(changesStore ? t("singleStoreCart") : t("addedToCart"));
    },
    [items, notify, t],
  );

  const removeFromCart = React.useCallback((partId: string) => {
    setItems((current) => current.filter((item) => item.part.id !== partId));
  }, []);

  const setQuantity = React.useCallback((partId: string, quantity: number) => {
    setItems((current) =>
      current.map((item) =>
        item.part.id === partId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.part.stockQty)),
            }
          : item,
      ),
    );
  }, []);

  const clearCart = React.useCallback(() => setItems([]), []);

  const toggleWishlist = React.useCallback(
    (part: Part) => {
      setWishlist((current) => {
        if (current.includes(part.id)) {
          notify(t("removedFromWishlist"));
          return current.filter((id) => id !== part.id);
        }
        notify(t("addedToWishlist"));
        return [...current, part.id];
      });
    },
    [notify, t],
  );

  const isWishlisted = React.useCallback(
    (partId: string) => wishlist.includes(partId),
    [wishlist],
  );

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce(
    (sum, item) => sum + item.part.priceSar * item.quantity,
    0,
  );

  const value = React.useMemo<ShopContextValue>(
    () => ({
      items,
      wishlist,
      hydrated,
      cartCount,
      subtotal,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      notify,
    }),
    [
      items,
      wishlist,
      hydrated,
      cartCount,
      subtotal,
      addToCart,
      removeFromCart,
      setQuantity,
      clearCart,
      toggleWishlist,
      isWishlisted,
      notify,
    ],
  );

  return (
    <ShopContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
      >
        {toast ? (
          <div className="animate-toast-in flex items-center gap-3 rounded-full border border-foreground/10 bg-foreground px-4 py-2.5 text-sm font-medium text-background shadow-2xl">
            <span className="flex size-5 items-center justify-center rounded-full bg-background/15">
              <Check className="size-3" strokeWidth={2.5} />
            </span>
            {toast}
          </div>
        ) : null}
      </div>
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = React.useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used inside ShopProvider.");
  }
  return context;
}
