"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { CarFront, ChevronDown, ScanLine, Search } from "lucide-react";
import { cn } from "cn";
import { useCatalogMeta } from "@/hooks/use-catalog";
import { useLocale } from "@/hooks/use-locale";
import { localize } from "@/lib/localized";
import { vinSchema } from "@/lib/validators";

type Mode = "vehicle" | "vin";

export function VehicleFinder({
  className,
  id = "vehicle-finder",
}: {
  className?: string;
  id?: string;
}) {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { brands, cars, loading } = useCatalogMeta();
  const [mode, setMode] = React.useState<Mode>("vehicle");
  const [brandId, setBrandId] = React.useState("");
  const [year, setYear] = React.useState("");
  const [vin, setVin] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  const years = React.useMemo(
    () => Array.from(new Set(cars.map((car) => car.year))).sort((a, b) => b - a),
    [cars],
  );

  const filteredYears = React.useMemo(() => {
    if (!brandId) return years;
    return Array.from(
      new Set(cars.filter((car) => car.brandId === brandId).map((car) => car.year)),
    ).sort((a, b) => b - a);
  }, [brandId, cars, years]);

  const handleBrandChange = (value: string) => {
    setBrandId(value);
    if (year && !cars.some((car) => car.brandId === value && String(car.year) === year)) {
      setYear("");
    }
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (mode === "vin") {
      const parsed = vinSchema.safeParse(vin.trim().toUpperCase());
      if (!parsed.success) {
        setError(
          locale === "ar"
            ? "أدخل رقم هيكل صحيحاً من ١٧ خانة."
            : "Enter a valid 17-character VIN.",
        );
        return;
      }
      router.push(`/catalog?vin=${encodeURIComponent(parsed.data)}`);
      return;
    }

    const brand = brands.find((item) => item.id === brandId);
    if (!brand) {
      setError(locale === "ar" ? "اختر الماركة أولاً." : "Choose a make first.");
      return;
    }

    const query = new URLSearchParams({ make: brand.code });
    if (year) query.set("year", year);
    router.push(`/catalog?${query.toString()}`);
  };

  return (
    <div
      id={id}
      className={cn(
        "rounded-3xl border border-border bg-card p-2 shadow-soft",
        className,
      )}
    >
      <div className="flex gap-1 px-1 pt-1" role="tablist" aria-label={t("vehicleSearch")}>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "vehicle"}
          onClick={() => {
            setMode("vehicle");
            setError(null);
          }}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-xs font-medium transition-colors",
            mode === "vehicle"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <CarFront className="size-3.5" />
          {locale === "ar" ? "الماركة والسنة" : "Make & year"}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "vin"}
          onClick={() => {
            setMode("vin");
            setError(null);
          }}
          className={cn(
            "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-xs font-medium transition-colors",
            mode === "vin"
              ? "bg-foreground text-background"
              : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <ScanLine className="size-3.5" />
          {t("vinShort")}
        </button>
      </div>

      <form onSubmit={submit} className="p-2 pt-3">
        {mode === "vehicle" ? (
          <div className="grid gap-2 sm:grid-cols-[1fr_0.7fr_auto]">
            <div className="relative">
              <label htmlFor="finder-brand" className="sr-only">
                {t("make")}
              </label>
              <select
                id="finder-brand"
                value={brandId}
                onChange={(event) => handleBrandChange(event.target.value)}
                disabled={loading}
                className="h-12 w-full appearance-none rounded-2xl border border-border bg-background px-4 pe-10 text-sm font-medium outline-none transition-colors focus:border-foreground/40 disabled:opacity-60"
              >
                <option value="">{t("selectMake")}</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {localize(brand.name, locale, brand.code)}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="relative">
              <label htmlFor="finder-year" className="sr-only">
                {t("year")}
              </label>
              <select
                id="finder-year"
                value={year}
                onChange={(event) => setYear(event.target.value)}
                disabled={loading}
                className="h-12 w-full appearance-none rounded-2xl border border-border bg-background px-4 pe-10 text-sm font-medium outline-none transition-colors focus:border-foreground/40 disabled:opacity-60"
              >
                <option value="">{t("selectYear")}</option>
                {filteredYears.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute end-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            </div>

            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-85"
            >
              <Search className="size-4" />
              {t("findMyParts")}
            </button>
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <label htmlFor="finder-vin" className="sr-only">
                {t("vinShort")}
              </label>
              <input
                id="finder-vin"
                value={vin}
                onChange={(event) => setVin(event.target.value.toUpperCase())}
                placeholder={locale === "ar" ? "مثال: JTDBR32E720123456" : "e.g. JTDBR32E720123456"}
                maxLength={17}
                autoComplete="off"
                spellCheck={false}
                dir="ltr"
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-start font-mono text-sm tracking-[0.12em] outline-none transition-colors placeholder:tracking-normal placeholder:text-muted-foreground focus:border-foreground/40"
              />
              <span className="pointer-events-none absolute end-4 top-1/2 -translate-y-1/2 font-mono text-[10px] text-muted-foreground">
                {vin.length}/17
              </span>
            </div>
            <button
              type="submit"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-foreground px-6 text-sm font-semibold text-background transition-opacity hover:opacity-85"
            >
              <Search className="size-4" />
              {locale === "ar" ? "ابحث بالهيكل" : "Search VIN"}
            </button>
          </div>
        )}

        <div className="flex min-h-5 items-center justify-between gap-3 px-1 pt-2">
          <p className={cn("text-[10px]", error ? "text-destructive" : "text-muted-foreground")}>
            {error ||
              (mode === "vehicle"
                ? locale === "ar"
                  ? "نطابق القطع حسب الماركة والسنة المتاحة."
                  : "Parts are matched by make and available year."
                : t("vinHint"))}
          </p>
          {error ? (
            <button type="button" onClick={() => setError(null)} className="text-[10px] underline">
              {locale === "ar" ? "إغلاق" : "Dismiss"}
            </button>
          ) : null}
        </div>
      </form>
    </div>
  );
}
