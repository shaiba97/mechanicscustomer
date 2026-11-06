"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowUpRight,
  BadgeCheck,
  Check,
  ChevronDown,
  CircleDot,
  Cog,
  Disc3,
  Droplets,
  Lightbulb,
  Search,
  ShieldCheck,
  Sparkles,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import { cn } from "cn";
import { PartVisual } from "@/components/part-visual";
import { ProductCarousel } from "@/components/product-carousel";
import { SectionHeading } from "@/components/section-heading";
import { VehicleFinder } from "@/components/vehicle-finder";
import { useCatalogMeta, type Category } from "@/hooks/use-catalog";
import { useLocale } from "@/hooks/use-locale";
import { useParts } from "@/hooks/use-parts";
import { localize } from "@/lib/localized";

const categoryIcons = [Disc3, Cog, CircleDot, Zap, Droplets, Wind, Lightbulb, Wrench];

function iconForCategory(category: Category, index: number) {
  const english =
    typeof category.name === "object" && category.name ? category.name.en ?? "" : "";
  const name = english.toLowerCase();
  if (name.includes("brake")) return Disc3;
  if (name.includes("engine") || name.includes("motor")) return Cog;
  if (name.includes("suspension") || name.includes("steer")) return CircleDot;
  if (name.includes("electric") || name.includes("battery")) return Zap;
  if (name.includes("oil") || name.includes("fluid") || name.includes("filter")) return Droplets;
  if (name.includes("air") || name.includes("cool")) return Wind;
  if (name.includes("light") || name.includes("lamp")) return Lightbulb;
  return categoryIcons[index % categoryIcons.length];
}

export default function HomePage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { categories, brands, cars, loading: metaLoading } = useCatalogMeta();
  const { parts, loading, error, search } = useParts();
  const [makeId, setMakeId] = React.useState("");
  const [model, setModel] = React.useState("");
  const [year, setYear] = React.useState("");

  React.useEffect(() => {
    void search({});
  }, [search]);

  const featured = parts.slice(0, 8);
  const visibleCategories = categories.slice(0, 8);

  const modelOptions = React.useMemo(() => {
    const filtered = cars.filter((car) => !makeId || car.brandId === makeId);
    const seen = new Map<string, string>();
    filtered.forEach((car) => {
      const value = localize(car.model, "en");
      if (!value) return;
      if (!seen.has(value)) seen.set(value, localize(car.model, locale, value));
    });
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [cars, makeId, locale]);

  const yearOptions = React.useMemo(() => {
    const filtered = cars.filter((car) => {
      if (makeId && car.brandId !== makeId) return false;
      if (model && localize(car.model, "en") !== model) return false;
      return true;
    });
    return Array.from(new Set(filtered.map((car) => car.year))).sort((a, b) => b - a);
  }, [cars, makeId, model]);

  const handleMakeChange = (value: string) => {
    setMakeId(value);
    setModel("");
    setYear("");
  };

  const handleModelChange = (value: string) => {
    setModel(value);
    setYear("");
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const brand = brands.find((item) => item.id === makeId);
    if (!brand) return;
    const params = new URLSearchParams({ make: brand.code });
    if (model) params.set("model", model);
    if (year) params.set("year", year);
    router.push(`/catalog?${params.toString()}`);
  };

  return (
    <>
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-grid bg-grid-fade opacity-70" aria-hidden="true" />
        <div className="relative mx-auto w-full max-w-[1440px] px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="animate-rise">
              <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-[10px] font-medium tracking-[0.18em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-foreground" />
                {t("homeEyebrow")}
              </div>

              <h1 className="mt-7 max-w-[12ch] text-[clamp(3rem,7vw,6.2rem)] font-semibold leading-[0.94] tracking-[-0.065em]">
                {t("homeTitleA")}
                <br />
                <span className="text-muted-foreground">{t("homeTitleB")}</span>
              </h1>

              <p className="mt-7 max-w-xl text-[15px] leading-8 text-muted-foreground md:text-base">
                {t("homeSubtitle")}
              </p>

              <form
                onSubmit={submitSearch}
                className="mt-8 max-w-2xl rounded-2xl border border-border bg-card p-2 shadow-soft"
              >
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.8fr_auto]">
                  <div className="relative">
                    <label htmlFor="hero-make" className="sr-only">
                      {t("make")}
                    </label>
                    <select
                      id="hero-make"
                      required
                      value={makeId}
                      onChange={(event) => handleMakeChange(event.target.value)}
                      disabled={metaLoading}
                      className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 pe-10 text-sm font-medium outline-none transition-colors focus:border-foreground/40 disabled:opacity-60"
                    >
                      <option value="">{t("selectMake")}</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {localize(brand.name, locale, brand.code)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  <div className="relative">
                    <label htmlFor="hero-model" className="sr-only">
                      {t("modelLabel")}
                    </label>
                    <select
                      id="hero-model"
                      value={model}
                      onChange={(event) => handleModelChange(event.target.value)}
                      disabled={!makeId || metaLoading}
                      className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 pe-10 text-sm font-medium outline-none transition-colors focus:border-foreground/40 disabled:opacity-60"
                    >
                      <option value="">{t("selectModel")}</option>
                      {modelOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  <div className="relative">
                    <label htmlFor="hero-year" className="sr-only">
                      {t("year")}
                    </label>
                    <select
                      id="hero-year"
                      value={year}
                      onChange={(event) => setYear(event.target.value)}
                      disabled={!makeId || metaLoading}
                      className="h-12 w-full appearance-none rounded-xl border border-border bg-background px-4 pe-10 text-sm font-medium outline-none transition-colors focus:border-foreground/40 disabled:opacity-60"
                    >
                      <option value="">{t("selectYear")}</option>
                      {yearOptions.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  </div>

                  <button
                    type="submit"
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-5 text-sm font-semibold text-background transition-opacity hover:opacity-85"
                  >
                    <Search className="size-4" />
                    {t("showMatchingParts")}
                  </button>
                </div>
              </form>

              <p className="mt-2.5 px-1 text-[10px] text-muted-foreground">{t("heroVehicleHint")}</p>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                {[t("verifiedSources"), t("fitmentChecked"), t("clearPricing")].map((item) => (
                  <span
                    key={item}
                    className="inline-flex items-center gap-2 text-[11px] font-medium text-muted-foreground"
                  >
                    <Check className="size-3.5 text-foreground" strokeWidth={2.5} />
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="absolute -inset-4 rounded-[2.5rem] border border-border/70" aria-hidden="true" />
              <div className="relative overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
                    MECHANIC / FITMENT ENGINE
                  </span>
                  <span className="flex items-center gap-1.5 text-[9px] font-medium tracking-wide">
                    <span className="size-1.5 rounded-full bg-foreground" />
                    LIVE
                  </span>
                </div>
                <div className="group relative">
                  <PartVisual detailed className="aspect-square w-full" />
                  <div className="absolute start-5 top-16 rounded-xl border border-border bg-background/90 px-3.5 py-2.5 backdrop-blur-md">
                    <p className="font-mono text-[8px] tracking-[0.18em] text-muted-foreground">
                      VIN MATCH
                    </p>
                    <p className="mt-1 text-xs font-semibold">17 / 17</p>
                  </div>
                  <div className="absolute bottom-16 end-5 rounded-xl border border-border bg-background/90 px-3.5 py-2.5 backdrop-blur-md">
                    <p className="font-mono text-[8px] tracking-[0.18em] text-muted-foreground">
                      BRAND COVERAGE
                    </p>
                    <p className="mt-1 text-xs font-semibold">
                      {brands.length > 0 ? `${brands.length} ${locale === "ar" ? "ماركة" : "makes"}` : "—"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 divide-x divide-border border-t border-border rtl:divide-x-reverse">
                  {[
                    { label: locale === "ar" ? "المصدر" : "SOURCE", value: locale === "ar" ? "متاجر موثقة" : "Verified" },
                    { label: locale === "ar" ? "السعر" : "PRICE", value: locale === "ar" ? "بالريال" : "SAR" },
                    { label: locale === "ar" ? "التوافق" : "FITMENT", value: locale === "ar" ? "مفحوص" : "Checked" },
                  ].map((cell) => (
                    <div key={cell.label} className="px-2 py-3 text-center">
                      <p className="font-mono text-[8px] tracking-[0.14em] text-muted-foreground">
                        {cell.label}
                      </p>
                      <p className="mt-1 text-[10px] font-medium">{cell.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-20 md:px-8 md:py-28">
        <SectionHeading
          eyebrow={t("categoriesEyebrow")}
          title={t("categoriesTitle")}
          description={t("categoriesSubtitle")}
          action={
            <Link
              href="/catalog"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-xs font-semibold transition-colors hover:border-foreground hover:bg-foreground hover:text-background"
            >
              {t("viewAll")}
              <ArrowUpRight className="size-3.5" />
            </Link>
          }
        />

        <div className="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4">
          {metaLoading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="h-44 animate-pulse rounded-2xl border border-border bg-card" />
            ))
          ) : visibleCategories.length > 0 ? (
            visibleCategories.map((category, index) => {
              const Icon = iconForCategory(category, index);
              return (
                <Link
                  key={category.id}
                  href={`/catalog?categoryId=${category.id}`}
                  className="group relative flex min-h-44 flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-soft"
                >
                  <div className="flex items-start justify-between">
                    <span className="grid size-11 place-items-center rounded-full border border-border bg-background transition-colors group-hover:bg-foreground group-hover:text-background">
                      <Icon className="size-5" strokeWidth={1.6} />
                    </span>
                    <span className="font-mono text-[9px] tracking-widest text-muted-foreground">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <p className="mt-auto pt-6 text-[15px] font-semibold tracking-tight">
                    {localize(category.name, locale, "Category")}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted-foreground">
                    <span>{locale === "ar" ? "استعرض الفئة" : "Browse category"}</span>
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              {locale === "ar"
                ? "ستظهر الفئات هنا عند إضافة بيانات الكتالوج."
                : "Categories will appear here when catalog data is available."}
            </div>
          )}
        </div>
      </section>

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-20 md:px-8 md:py-24 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-20">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-foreground/30" />
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                {t("vehicleEyebrow")}
              </p>
            </div>
            <h2 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-[-0.045em] md:text-5xl">
              {t("vehicleTitle")}
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground md:text-[15px]">
              {t("vehicleSubtitle")}
            </p>
            <div className="mt-8 space-y-4">
              {[
                {
                  icon: BadgeCheck,
                  title: locale === "ar" ? "نتائج من المخزون الفعلي" : "Results from real stock",
                  desc:
                    locale === "ar"
                      ? "لا نعرض إلا القطع النشطة والمتوفرة لدى المتاجر."
                      : "Only active parts in stock at connected stores.",
                },
                {
                  icon: ShieldCheck,
                  title: locale === "ar" ? "بحث بالهيكل أو بالماركة" : "Search by VIN or make",
                  desc:
                    locale === "ar"
                      ? "استخدم رقم الهيكل لدقة أعلى، أو ابدأ من الماركة والسنة."
                      : "Use a VIN for precision, or start from make and year.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-background">
                    <item.icon className="size-4" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-xs leading-6 text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <VehicleFinder />
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 py-20 md:px-8 md:py-28">
        <SectionHeading
          eyebrow={t("featuredEyebrow")}
          title={t("featuredTitle")}
          description={t("featuredSubtitle")}
          action={
            <Link
              href="/catalog"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-85"
            >
              {t("browseCatalog")}
              <ArrowUpRight className="size-3.5" />
            </Link>
          }
        />

        <div className="mt-10">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="h-[390px] animate-pulse rounded-2xl border border-border bg-card" />
              ))}
            </div>
          ) : featured.length > 0 ? (
            <ProductCarousel parts={featured} />
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-10 text-center md:p-16">
              <span className="mx-auto grid size-12 place-items-center rounded-full border border-border">
                <Search className="size-5" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{t("noResultsTitle")}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-muted-foreground">
                {error
                  ? t("catalogError")
                  : locale === "ar"
                    ? "سيظهر هنا أول ما يتوفر مخزون في المتاجر المتصلة."
                    : "New stock from connected stores will appear here."}
              </p>
              <Link
                href="/catalog"
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
              >
                {t("browseCatalog")}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="overflow-hidden border-y border-border py-12 md:py-16">
        <div className="mx-auto mb-8 w-full max-w-[1440px] px-5 md:px-8">
          <div className="flex items-center justify-between gap-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {t("brandsEyebrow")}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {brands.length > 0 ? `${brands.length} ${locale === "ar" ? "ماركة" : "brands"}` : "—"}
            </p>
          </div>
        </div>
        {brands.length > 0 ? (
          <div className="flex w-max animate-marquee items-center hover:[animation-play-state:paused]">
            {[...brands, ...brands].map((brand, index) => (
              <div key={`${brand.id}-${index}`} className="flex items-center">
                <span
                  className={cn(
                    "whitespace-nowrap px-8 text-2xl font-semibold tracking-tight text-foreground/45 md:px-12 md:text-3xl",
                    locale === "ar" && "font-arabic",
                  )}
                >
                  {localize(brand.name, locale, brand.code)}
                </span>
                <span className="size-1 rounded-full bg-foreground/20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="mx-auto w-full max-w-[1440px] px-5 md:px-8">
            <div className="h-10 w-2/3 animate-pulse rounded-full bg-muted" />
          </div>
        )}
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-[1440px] px-5 py-20 md:px-8 md:py-28">
        <SectionHeading
          eyebrow={t("howEyebrow")}
          title={t("howTitle")}
          description={
            locale === "ar"
              ? "لا خطوات مخفية ولا أسعار مفاجئة. فقط طريق واضح من البحث إلى التسليم."
              : "No hidden steps and no surprise pricing. Just a clear route from search to handover."
          }
        />

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {[
            {
              n: "01",
              title: t("howStep1Title"),
              desc: t("howStep1Desc"),
              icon: Search,
            },
            {
              n: "02",
              title: t("howStep2Title"),
              desc: t("howStep2Desc"),
              icon: Sparkles,
            },
            {
              n: "03",
              title: t("howStep3Title"),
              desc: t("howStep3Desc"),
              icon: ShieldCheck,
            },
          ].map((step, index) => (
            <div
              key={step.n}
              className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              <div className="flex items-start justify-between">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground">
                  {step.n}
                </span>
                <step.icon className="size-5 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h3 className="mt-12 text-xl font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 max-w-xs text-sm leading-7 text-muted-foreground">{step.desc}</p>
              {index < 2 ? (
                <ArrowLeft className="absolute -start-3 top-1/2 hidden size-5 -translate-y-1/2 text-muted-foreground/40 rtl:block md:block ltr:hidden" />
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section id="assurance" className="mx-auto w-full max-w-[1440px] px-5 pb-20 md:px-8 md:pb-28">
        <div className="relative overflow-hidden rounded-[2rem] bg-[#0A0A0A] px-6 py-12 text-white md:px-12 md:py-16 lg:px-16">
          <div className="absolute inset-0 bg-grid opacity-[0.08]" aria-hidden="true" />
          <div className="absolute -end-24 -top-24 size-80 rounded-full border border-white/10" aria-hidden="true" />
          <div className="absolute -end-10 -top-10 size-52 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
                {t("assuranceEyebrow")}
              </p>
              <h2 className="mt-5 max-w-sm text-4xl font-semibold leading-[1.05] tracking-[-0.04em] md:text-5xl">
                {t("assuranceTitle")}
              </h2>
              <p className="mt-5 max-w-md text-sm leading-7 text-white/55">{t("assuranceDesc")}</p>
              <Link
                href="/catalog"
                className="mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-xs font-semibold text-black transition-opacity hover:opacity-85"
              >
                {t("browseCatalog")}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-3">
              {[
                { title: t("promiseFit"), desc: t("promiseFitDesc"), icon: BadgeCheck },
                { title: t("promiseDelivery"), desc: t("promiseDeliveryDesc"), icon: ShieldCheck },
                { title: t("promiseSupport"), desc: t("promiseSupportDesc"), icon: Sparkles },
              ].map((item) => (
                <div key={item.title} className="bg-[#0A0A0A] p-6">
                  <item.icon className="size-5 text-white/65" strokeWidth={1.5} />
                  <h3 className="mt-8 text-sm font-semibold">{item.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-white/45">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-[1440px] px-5 pb-20 md:px-8 md:pb-28">
        <div className="grid items-center gap-8 rounded-[2rem] border border-border bg-card px-6 py-10 md:px-12 md:py-12 lg:grid-cols-[1fr_auto]">
          <div>
            <h2 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">{t("finalCtaTitle")}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{t("finalCtaDesc")}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/catalog"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-85"
            >
              {t("browseCatalog")}
              <ArrowUpRight className="size-4" />
            </Link>
            <Link
              href="/garage"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-border px-6 text-sm font-semibold transition-colors hover:bg-muted"
            >
              {t("navGarage")}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
