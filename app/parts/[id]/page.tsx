"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Heart,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from "lucide-react";
import { cn } from "cn";
import { PartVisual } from "@/components/part-visual";
import { PartReviews } from "@/components/reviews";
import { ProductCard } from "@/components/product-card";
import { useLocale } from "@/hooks/use-locale";
import { usePart } from "@/hooks/use-parts";
import { useShop } from "@/hooks/use-shop";
import { formatSar } from "@/lib/i18n";
import { conditionLabel, localize } from "@/lib/localized";

export default function PartDetailPage() {
  const params = useParams<{ id: string }>();
  const partId = Array.isArray(params.id) ? params.id[0] : params.id;
  const { locale, t } = useLocale();
  const { part, parts, loading, error } = usePart(partId);
  const { addToCart, toggleWishlist, isWishlisted } = useShop();
  const [quantity, setQuantity] = React.useState(1);

  React.useEffect(() => {
    setQuantity(1);
  }, [partId]);

  if (loading) {
    return <PartDetailSkeleton />;
  }

  if (!part) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-24 text-center md:py-32">
        <span className="grid size-14 place-items-center rounded-full border border-border bg-card">
          <ShoppingBag className="size-6" />
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight">
          {error ? t("catalogError") : t("notFoundTitle")}
        </h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
          {error || t("notFoundDesc")}
        </p>
        <Link
          href="/catalog"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
        >
          {t("backToCatalog")}
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
    );
  }

  const name = localize(part.name, locale, part.sku);
  const brand = localize(part.brandName, locale);
  const category = localize(part.categoryName, locale);
  const saved = isWishlisted(part.id);
  const soldOut = part.stockQty <= 0;
  const related = parts
    .filter((item) => item.id !== part.id && item.categoryId === part.categoryId)
    .slice(0, 4);

  const increment = () =>
    setQuantity((current) => Math.min(current + 1, Math.max(part.stockQty, 1)));
  const decrement = () => setQuantity((current) => Math.max(1, current - 1));

  return (
    <>
      <div className="mx-auto w-full max-w-[1440px] px-5 pb-24 pt-6 md:px-8 md:pb-16 md:pt-8">
        <nav className="flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            {t("home")}
          </Link>
          <span>/</span>
          <Link href="/catalog" className="transition-colors hover:text-foreground">
            {t("navCatalog")}
          </Link>
          {category ? (
            <>
              <span>/</span>
              <Link
                href={`/catalog?categoryId=${part.categoryId}`}
                className="transition-colors hover:text-foreground"
              >
                {category}
              </Link>
            </>
          ) : null}
          <span>/</span>
          <span className="max-w-52 truncate text-foreground">{part.sku}</span>
        </nav>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 xl:gap-20">
          <div>
            <div className="group overflow-hidden rounded-[1.75rem] border border-border bg-card">
              <PartVisual part={part} detailed className="aspect-square w-full" />
            </div>

            <div className="mt-3 grid grid-cols-3 gap-3">
              {[
                { label: t("condition"), value: conditionLabel(part.condition, locale) },
                { label: t("partNumber"), value: part.sku },
                {
                  label: locale === "ar" ? "التوافق" : "Fitment",
                  value: `${part.compatibilityVins.length} ${locale === "ar" ? "هيكل" : "VINs"}`,
                },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border bg-card px-3 py-3">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1.5 truncate font-mono text-[10px] font-medium">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-background">
                  <ShieldCheck className="size-4" />
                </span>
                <div>
                  <p className="text-sm font-semibold">{t("fitmentNote")}</p>
                  <p className="mt-1 text-xs leading-6 text-muted-foreground">
                    {locale === "ar"
                      ? "استخدم مركبة محفوظة أو ابحث بالهيكل للتأكد قبل إتمام الطلب."
                      : "Use a saved vehicle or VIN search to confirm before checkout."}
                  </p>
                  <Link
                    href="/garage"
                    className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold underline underline-offset-4"
                  >
                    {t("navGarage")}
                    <ArrowUpRight className="size-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:pt-2">
            <div className="flex flex-wrap items-center gap-2">
              {brand ? (
                <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium">
                  {brand}
                </span>
              ) : null}
              {category ? (
                <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[10px] font-medium text-muted-foreground">
                  {category}
                </span>
              ) : null}
              <span className="rounded-full bg-foreground px-2.5 py-1 text-[10px] font-medium text-background">
                {conditionLabel(part.condition, locale)}
              </span>
            </div>

            <h1 className="mt-5 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.045em]">
              {name}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
              <span className="font-mono">{part.sku}</span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className={cn(
                    "size-1.5 rounded-full",
                    soldOut ? "bg-muted-foreground/40" : "bg-foreground",
                  )}
                />
                {soldOut
                  ? t("outOfStock")
                  : `${part.stockQty} ${t("inStockCount")}`}
              </span>
            </div>

            <div className="mt-6 border-y border-border py-6">
              <p className="text-3xl font-semibold tracking-tight">
                {formatSar(part.priceSar, locale)}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">{t("taxIncluded")}</p>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-card p-5">
              <h3 className="text-[11px] uppercase tracking-wider mb-4 text-muted-foreground">{t("technicalSpecs")}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("partNumber")}</p>
                  <p className="mt-1 font-mono text-[10px] font-medium">{part.sku}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("category")}</p>
                  <p className="mt-1 text-[10px]">{localize(part.categoryName, locale)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("makeVehicle")}</p>
                  <p className="mt-1 text-[10px]">{localize(part.brandName, locale)}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("model")}</p>
                  <p className="mt-1 text-[10px]">{t("tiggo2Pro")}</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("yearsCompatibility")}</p>
                  <p className="mt-1 text-[10px]">{part.compatibilityVins.length > 0 ? "2022-2025" : "—"}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("fitment")}</p>
                  <p className="mt-1 text-[10px]">
                    {part.compatibilityVins.length > 0
                      ? locale === "ar" ? "تويغو 2 برو" : "Chery Tiggo 2 Pro"
                      : "Chery Tiggo 2 Pro"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("type")}</p>
                  <p className="mt-1 text-[10px]">{t("original")}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{t("availability")}</p>
                  <p className="mt-1 text-[10px] font-medium">{t("available")}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold">{t("quantity")}</p>
                <span className="text-[10px] text-muted-foreground">
                  {locale === "ar"
                    ? `الحد الأقصى ${part.stockQty}`
                    : `Max ${part.stockQty}`}
                </span>
              </div>
              <div className="mt-2 flex items-center gap-3">
                <div className="inline-flex h-12 items-center rounded-xl border border-border bg-card">
                  <button
                    type="button"
                    onClick={decrement}
                    disabled={quantity <= 1}
                    aria-label={locale === "ar" ? "تقليل الكمية" : "Decrease quantity"}
                    className="grid size-11 place-items-center disabled:opacity-35"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    onClick={increment}
                    disabled={quantity >= part.stockQty}
                    aria-label={locale === "ar" ? "زيادة الكمية" : "Increase quantity"}
                    className="grid size-11 place-items-center disabled:opacity-35"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => addToCart(part, quantity)}
                  disabled={soldOut}
                  className="inline-flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <ShoppingBag className="size-4" />
                  {soldOut ? t("outOfStock") : t("addToCartShort")}
                </button>

                <button
                  type="button"
                  onClick={() => toggleWishlist(part)}
                  aria-label={saved ? t("saved") : t("saveForLater")}
                  aria-pressed={saved}
                  className={cn(
                    "grid size-12 shrink-0 place-items-center rounded-xl border transition-colors",
                    saved
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card hover:border-foreground/40",
                  )}
                >
                  <Heart className={cn("size-4", saved && "fill-current")} />
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
              <div className="flex gap-3 bg-card p-4">
                <Truck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">{t("deliveryEstimate")}</p>
                  <p className="mt-1 text-xs font-medium">{t("deliveryEstimateValue")}</p>
                </div>
              </div>
              <div className="flex gap-3 bg-card p-4">
                <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground">{t("returns")}</p>
                  <p className="mt-1 text-xs font-medium">{t("returnsValue")}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-background">
                  <Store className="size-4" />
                </span>
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold">
                    {part.storeName || t("verifiedSeller")}
                    <ShieldCheck className="size-3.5" />
                  </p>
                  <p className="mt-0.5 text-[10px] text-muted-foreground">{t("sellerNote")}</p>
                </div>
              </div>
            </div>

            <div className="mt-8 divide-y divide-border border-y border-border">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4">
                  <span className="text-sm font-semibold">{t("reviews.title")}</span>
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="pb-5">
                  {partId ? <PartReviews partId={partId} /> : null}
                </div>
              </details>

              <details className="group" open>
                <summary className="flex cursor-pointer list-none items-center justify-between py-4">
                  <span className="text-sm font-semibold">{t("compatibilityTitle")}</span>
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>

                <div className="pb-5">
                  <p className="text-xs leading-6 text-muted-foreground">{t("compatibilityDesc")}</p>
                  {part.compatibilityVins.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {part.compatibilityVins.slice(0, 16).map((vin) => (
                        <span
                          key={vin}
                          dir="ltr"
                          className="rounded-md border border-border bg-background px-2 py-1 font-mono text-[9px] tracking-wide"
                        >
                          {vin}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-xs leading-6 text-muted-foreground">
                      {t("noCompatibility")}
                    </p>
                  )}
                </div>
              </details>

              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4">
                  <span className="text-sm font-semibold">{t("deliveryDetails")}</span>
                  <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                </summary>
                <div className="space-y-2 pb-5">
                  <p className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("deliveryEstimate")}</span>
                    <span className="font-medium">{t("deliveryEstimateValue")}</span>
                  </p>
                  <p className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{t("returns")}</span>
                    <span className="font-medium">{t("returnsValue")}</span>
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>

        {related.length > 0 ? (
          <section className="mt-20 border-t border-border pt-12 md:mt-28">
            <div className="flex items-end justify-between gap-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {t("relatedParts")}
                </p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                  {category || t("featuredTitle")}
                </h2>
              </div>
              <Link
                href={`/catalog?categoryId=${part.categoryId}`}
                className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-xs font-semibold sm:inline-flex"
              >
                {t("viewAll")}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} part={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="min-w-0">
            <p className="truncate text-[10px] text-muted-foreground">{name}</p>
            <p className="mt-0.5 text-lg font-semibold tracking-tight">
              {formatSar(part.priceSar, locale)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => addToCart(part, quantity)}
            disabled={soldOut}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-semibold text-background disabled:opacity-35"
          >
            <ShoppingBag className="size-4" />
            {soldOut ? t("outOfStock") : t("addToCartShort")}
          </button>
        </div>
      </div>
    </>
  );
}

function PartDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-8 md:px-8">
      <div className="h-3 w-40 animate-pulse rounded-full bg-muted" />
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-[1.75rem] border border-border bg-card" />
        <div className="space-y-4 pt-4">
          <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
          <div className="h-12 w-4/5 animate-pulse rounded-xl bg-muted" />
          <div className="h-4 w-48 animate-pulse rounded-full bg-muted" />
          <div className="h-20 w-full animate-pulse rounded-xl bg-muted" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-muted" />
        </div>
      </div>
    </div>
  );
}
