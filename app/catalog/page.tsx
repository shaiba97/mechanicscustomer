"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronDown,
  Heart,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { cn } from "cn";
import { ProductCard } from "@/components/product-card";
import { useCatalogMeta } from "@/hooks/use-catalog";
import { useLocale } from "@/hooks/use-locale";
import { useParts } from "@/hooks/use-parts";
import { useShop } from "@/hooks/use-shop";
import { CONDITION_LABELS, localize } from "@/lib/localized";

type Sort = "recommended" | "price-asc" | "price-desc" | "stock";

function CatalogContent() {
  const searchParams = useSearchParams();
  const { locale, t } = useLocale();
  const { brands, categories } = useCatalogMeta();
  const { wishlist, isWishlisted } = useShop();
  const { parts, loading, error, search } = useParts();

  const [query, setQuery] = React.useState(searchParams.get("q") ?? "");
  const [vin, setVin] = React.useState(searchParams.get("vin") ?? "");
  const [make, setMake] = React.useState(searchParams.get("make") ?? "");
  const [model, setModel] = React.useState(searchParams.get("model") ?? "");
  const [year, setYear] = React.useState(searchParams.get("year") ?? "");
  const [categoryId, setCategoryId] = React.useState(searchParams.get("categoryId") ?? "");
  const [brandId, setBrandId] = React.useState(searchParams.get("brandId") ?? "");
  const [condition, setCondition] = React.useState(searchParams.get("condition") ?? "");
  const [wishlistOnly, setWishlistOnly] = React.useState(searchParams.get("wishlist") === "1");
  const [sort, setSort] = React.useState<Sort>((searchParams.get("sort") as Sort) || "recommended");
  const [showFilters, setShowFilters] = React.useState(false);
  const deferredQuery = React.useDeferredValue(query);

  React.useEffect(() => {
    void search({ vin, make, model, year, categoryId });
  }, [search, vin, make, model, year, categoryId]);

  React.useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (vin) params.set("vin", vin);
    if (make) params.set("make", make);
    if (model) params.set("model", model);
    if (year) params.set("year", year);
    if (categoryId) params.set("categoryId", categoryId);
    if (brandId) params.set("brandId", brandId);
    if (condition) params.set("condition", condition);
    if (wishlistOnly) params.set("wishlist", "1");
    if (sort !== "recommended") params.set("sort", sort);
    const next = params.toString() ? `/catalog?${params.toString()}` : "/catalog";
    window.history.replaceState(null, "", next);
  }, [
    query,
    vin,
    make,
    model,
    year,
    categoryId,
    brandId,
    condition,
    wishlistOnly,
    sort,
  ]);

  const filtered = React.useMemo(() => {
    const needle = deferredQuery.trim().toLowerCase();
    const selectedBrand = brands.find((brand) => brand.id === brandId);
    const selectedBrandName = selectedBrand
      ? localize(selectedBrand.name, locale).toLowerCase()
      : "";

    const result = parts.filter((part) => {
      if (brandId && part.brandId !== brandId) return false;
      if (condition && part.condition !== condition) return false;
      if (wishlistOnly && !wishlist.includes(part.id)) return false;

      if (!needle) return true;

      const haystack = [
        localize(part.name, "ar"),
        localize(part.name, "en"),
        part.sku,
        localize(part.brandName, "ar"),
        localize(part.brandName, "en"),
        localize(part.categoryName, "ar"),
        localize(part.categoryName, "en"),
        selectedBrandName,
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(needle);
    });

    if (sort === "price-asc") return [...result].sort((a, b) => a.priceSar - b.priceSar);
    if (sort === "price-desc") return [...result].sort((a, b) => b.priceSar - a.priceSar);
    if (sort === "stock") return [...result].sort((a, b) => b.stockQty - a.stockQty);
    return result;
  }, [parts, brandId, condition, wishlistOnly, wishlist, deferredQuery, sort, brands, locale]);

  const selectedBrand = brands.find((brand) => brand.id === brandId);
  const selectedCategory = categories.find((category) => category.id === categoryId);
  const hasFilters = Boolean(
    vin || make || model || year || categoryId || brandId || condition || wishlistOnly || query.trim(),
  );

  const clearAll = () => {
    setQuery("");
    setVin("");
    setMake("");
    setModel("");
    setYear("");
    setCategoryId("");
    setBrandId("");
    setCondition("");
    setWishlistOnly(false);
    setSort("recommended");
  };

  const filtersPanel = (
    <div className="space-y-7">
      <div>
        <label className="block">
          <span className="text-[11px] font-semibold">{t("brandName")}</span>
          <div className="relative mt-2">
            <select
              value={brandId}
              onChange={(event) => setBrandId(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3 pe-9 text-xs outline-none transition-colors focus:border-foreground/40"
            >
              <option value="">{t("anyBrand")}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {localize(brand.name, locale, brand.code)}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </label>
      </div>

      <div>
        <label className="block">
          <span className="text-[11px] font-semibold">{t("categoryLabel")}</span>
          <div className="relative mt-2">
            <select
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3 pe-9 text-xs outline-none transition-colors focus:border-foreground/40"
            >
              <option value="">{t("anyCategory")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {localize(category.name, locale, "Category")}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </label>
      </div>

      <div>
        <label className="block">
          <span className="text-[11px] font-semibold">{t("condition")}</span>
          <div className="relative mt-2">
            <select
              value={condition}
              onChange={(event) => setCondition(event.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-border bg-background px-3 pe-9 text-xs outline-none transition-colors focus:border-foreground/40"
            >
              <option value="">{t("anyCondition")}</option>
              {Object.entries(CONDITION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label[locale]}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </label>
      </div>

      <div className="border-t border-border pt-5">
        <label className="flex cursor-pointer items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-medium">
            <Heart className="size-3.5" />
            {t("myWishlist")}
          </span>
          <span
            className={cn(
              "relative h-6 w-10 rounded-full border transition-colors",
              wishlistOnly ? "border-foreground bg-foreground" : "border-border bg-background",
            )}
          >
            <input
              type="checkbox"
              checked={wishlistOnly}
              onChange={(event) => setWishlistOnly(event.target.checked)}
              className="sr-only"
            />
            <span
              className={cn(
                "absolute top-0.5 size-4.5 rounded-full transition-all",
                wishlistOnly
                  ? "start-[1.15rem] bg-background"
                  : "start-0.5 bg-muted-foreground/40",
              )}
            />
          </span>
        </label>
        <p className="mt-2 text-[10px] leading-5 text-muted-foreground">
          {locale === "ar"
            ? `${wishlist.length} قطعة محفوظة في هذا المتصفح`
            : `${wishlist.length} parts saved in this browser`}
        </p>
      </div>

      {(vin || make || model || year) && (
        <div className="rounded-xl border border-border bg-muted/40 p-3">
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            {locale === "ar" ? "البحث الحالي" : "Current search"}
          </p>
          {vin ? (
            <p className="mt-1.5 break-all font-mono text-[10px]" dir="ltr">
              {vin}
            </p>
          ) : (
            <p className="mt-1.5 text-[11px] font-medium">
              {[make?.toUpperCase(), model, year].filter(Boolean).join(" • ")}
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              setVin("");
              setMake("");
              setModel("");
              setYear("");
            }}
            className="mt-2 text-[10px] underline underline-offset-4"
          >
            {t("clearAll")}
          </button>
        </div>
      )}

      {hasFilters ? (
        <button
          type="button"
          onClick={clearAll}
          className="flex h-10 w-full items-center justify-center rounded-xl border border-border text-[11px] font-semibold transition-colors hover:bg-muted"
        >
          {t("clearAll")}
        </button>
      ) : null}
    </div>
  );

  return (
    <>
      <section className="border-b border-border bg-card">
        <div className="mx-auto w-full max-w-[1440px] px-5 pb-10 pt-8 md:px-8 md:pb-14 md:pt-12">
          <nav className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              {t("home")}
            </Link>
            <span>/</span>
            <span className="text-foreground">{t("navCatalog")}</span>
          </nav>

          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-foreground/30" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {t("catalogEyebrow")}
                </p>
              </div>
              <h1 className="mt-4 text-[clamp(2.5rem,5vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
                {t("catalogHeading")}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-[15px]">
                {t("catalogIntro")}
              </p>
            </div>

            <div className="flex w-full shrink-0 items-center gap-2 rounded-2xl border border-border bg-background p-1.5 lg:max-w-sm">
              <Search className="ms-2.5 size-4 shrink-0 text-muted-foreground" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t("searchPlaceholder")}
                aria-label={t("searchPlaceholder")}
                className="h-10 min-w-0 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
              />
              {query ? (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label={t("clearAll")}
                  className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-8 md:px-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-[230px_1fr] lg:gap-12">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <div className="flex items-center gap-2 border-b border-border pb-4">
                <SlidersHorizontal className="size-3.5" />
                <p className="text-xs font-semibold">{t("filters")}</p>
              </div>
              <div className="pt-5">{filtersPanel}</div>
            </div>
          </aside>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowFilters((current) => !current)}
                  className="inline-flex h-9 items-center gap-2 rounded-full border border-border px-3.5 text-[11px] font-medium lg:hidden"
                >
                  <SlidersHorizontal className="size-3.5" />
                  {showFilters ? t("hideFilters") : t("showFilters")}
                </button>
                <p className="text-xs text-muted-foreground">
                  <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                  {t("resultsCount")}
                </p>
              </div>

              <label className="flex items-center gap-2">
                <span className="text-[10px] text-muted-foreground">{t("sortBy")}</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as Sort)}
                    className="h-9 appearance-none rounded-full border border-border bg-card ps-3 pe-8 text-[11px] font-medium outline-none focus:border-foreground/40"
                  >
                    <option value="recommended">{t("sortRecommended")}</option>
                    <option value="price-asc">{t("sortPriceLow")}</option>
                    <option value="price-desc">{t("sortPriceHigh")}</option>
                    <option value="stock">{t("sortStock")}</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute end-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                </div>
              </label>
            </div>

            {showFilters ? (
              <div className="mt-4 rounded-2xl border border-border bg-card p-5 lg:hidden">
                {filtersPanel}
              </div>
            ) : null}

            {hasFilters && (selectedBrand || selectedCategory || condition || wishlistOnly) ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedBrand ? (
                  <ActiveChip
                    label={localize(selectedBrand.name, locale, selectedBrand.code)}
                    onRemove={() => setBrandId("")}
                  />
                ) : null}
                {selectedCategory ? (
                  <ActiveChip
                    label={localize(selectedCategory.name, locale, "Category")}
                    onRemove={() => setCategoryId("")}
                  />
                ) : null}
                {condition ? (
                  <ActiveChip
                    label={CONDITION_LABELS[condition]?.[locale] ?? condition}
                    onRemove={() => setCondition("")}
                  />
                ) : null}
                {wishlistOnly ? (
                  <ActiveChip label={t("myWishlist")} onRemove={() => setWishlistOnly(false)} />
                ) : null}
              </div>
            ) : null}

            <div className="mt-6">
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-[390px] animate-pulse rounded-2xl border border-border bg-card"
                    />
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {filtered.map((part) => (
                    <ProductCard
                      key={part.id}
                      part={part}
                      className={cn(isWishlisted(part.id) && "border-foreground/15")}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border bg-card px-6 py-16 text-center">
                  <span className="mx-auto grid size-12 place-items-center rounded-full border border-border">
                    {wishlistOnly ? (
                      <Heart className="size-5" />
                    ) : (
                      <Search className="size-5" />
                    )}
                  </span>
                  <h2 className="mt-5 text-lg font-semibold">{t("noResultsTitle")}</h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                    {error ? t("catalogError") : t("noResultsDesc")}
                  </p>
                  <div className="mt-6 flex justify-center gap-2">
                    {hasFilters ? (
                      <button
                        type="button"
                        onClick={clearAll}
                        className="inline-flex h-10 items-center rounded-full border border-border px-4 text-xs font-semibold"
                      >
                        {t("clearAll")}
                      </button>
                    ) : null}
                    <Link
                      href="/catalog"
                      onClick={clearAll}
                      className="inline-flex h-10 items-center rounded-full bg-foreground px-4 text-xs font-semibold text-background"
                    >
                      {t("browseCatalog")}
                    </Link>
                  </div>
                  {error ? (
                    <button
                      type="button"
                      onClick={() => void search({ vin, make, year, categoryId })}
                      className="mt-3 text-[11px] underline underline-offset-4"
                    >
                      {t("retry")}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-foreground px-2.5 text-[10px] font-medium text-background">
      {label}
      <button type="button" onClick={onRemove} className="rounded-full p-0.5 hover:bg-background/15">
        <X className="size-3" />
      </button>
    </span>
  );
}

export default function CatalogPage() {
  return (
    <React.Suspense fallback={<CatalogSkeleton />}>
      <CatalogContent />
    </React.Suspense>
  );
}

function CatalogSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-5 py-16 md:px-8">
      <div className="h-12 w-2/3 animate-pulse rounded-xl bg-muted" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-[390px] animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
    </div>
  );
}
