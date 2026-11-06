"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { PartVisual } from "@/components/part-visual";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { useShop } from "@/hooks/use-shop";
import { formatSar } from "@/lib/i18n";
import { conditionLabel, localize } from "@/lib/localized";

export default function CartPage() {
  const { locale, t } = useLocale();
  const { user, initializing } = useAuth();
  const { items, hydrated, cartCount, subtotal, removeFromCart, setQuantity, clearCart } =
    useShop();

  if (!hydrated) {
    return (
      <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8">
        <div className="h-12 w-64 animate-pulse rounded-xl bg-muted" />
        <div className="mt-10 h-48 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-24 text-center md:py-32">
        <span className="grid size-16 place-items-center rounded-full border border-border bg-card">
          <ShoppingBag className="size-7" strokeWidth={1.5} />
        </span>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight md:text-4xl">
          {t("emptyCartTitle")}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
          {t("emptyCartDesc")}
        </p>
        <div className="mt-7 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/catalog"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
          >
            {t("browseCatalog")}
            <ArrowUpRight className="size-3.5" />
          </Link>
          <Link
            href="/garage"
            className="inline-flex h-11 items-center justify-center rounded-full border border-border px-5 text-xs font-semibold"
          >
            {t("navGarage")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-16">
      <nav className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{t("cart")}</span>
      </nav>

      <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.045em] md:text-5xl">{t("cartTitle")}</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {cartCount} {t("itemsInCart")} · {t("cartSubtitle")}
          </p>
        </div>
        <button
          type="button"
          onClick={clearCart}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-3.5 text-[11px] font-medium text-muted-foreground transition-colors hover:border-destructive/30 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
          {locale === "ar" ? "إفراغ السلة" : "Clear cart"}
        </button>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="overflow-hidden rounded-2xl border border-border bg-card">
          {items.map((item) => {
            const name = localize(item.part.name, locale, item.part.sku);
            return (
              <div
                key={item.part.id}
                className="flex gap-4 border-b border-border p-4 last:border-b-0 md:p-5"
              >
                <Link
                  href={`/parts/${item.part.id}`}
                  className="w-24 shrink-0 overflow-hidden rounded-xl border border-border md:w-28"
                >
                  <PartVisual part={item.part} className="aspect-square w-full" />
                </Link>

                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[10px] text-muted-foreground">
                        {localize(item.part.brandName, locale)}
                      </p>
                      <Link
                        href={`/parts/${item.part.id}`}
                        className="mt-1 block truncate text-sm font-semibold hover:underline"
                      >
                        {name}
                      </Link>
                      <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                        {item.part.sku} · {conditionLabel(item.part.condition, locale)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.part.id)}
                      aria-label={t("remove")}
                      className="grid size-8 shrink-0 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>

                  <div className="mt-auto flex flex-wrap items-end justify-between gap-3 pt-5">
                    <div className="inline-flex h-9 items-center rounded-lg border border-border">
                      <button
                        type="button"
                        onClick={() => setQuantity(item.part.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label={locale === "ar" ? "تقليل الكمية" : "Decrease quantity"}
                        className="grid size-8 place-items-center disabled:opacity-35"
                      >
                        <Minus className="size-3" />
                      </button>
                      <span className="w-7 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity(item.part.id, item.quantity + 1)}
                        disabled={item.quantity >= item.part.stockQty}
                        aria-label={locale === "ar" ? "زيادة الكمية" : "Increase quantity"}
                        className="grid size-8 place-items-center disabled:opacity-35"
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                    <p className="text-sm font-semibold">
                      {formatSar(item.part.priceSar * item.quantity, locale)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28">
          <h2 className="text-sm font-semibold">{t("orderSummary")}</h2>
          <div className="mt-5 space-y-3 border-b border-border pb-5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-medium">{formatSar(subtotal, locale)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("shipping")}</span>
              <span className="text-[10px]">
                {locale === "ar" ? "تُحدد مع المتجر" : "Set by the store"}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between py-5">
            <span className="text-sm font-semibold">{t("totalLabel")}</span>
            <span className="text-xl font-semibold tracking-tight">
              {formatSar(subtotal, locale)}
            </span>
          </div>

          {initializing ? (
            <div className="h-12 animate-pulse rounded-xl bg-muted" />
          ) : user ? (
            <Link
              href="/checkout"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-85"
            >
              {t("secureCheckout")}
              <ArrowUpRight className="size-4" />
            </Link>
          ) : (
            <Link
              href="/auth/login?next=/checkout"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-85"
            >
              {t("signInToCheckout")}
              <ArrowUpRight className="size-4" />
            </Link>
          )}

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] text-muted-foreground">
            <ShieldCheck className="size-3" />
            {t("cartNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}
