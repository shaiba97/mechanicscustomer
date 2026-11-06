"use client";

import * as React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Car,
  Lock,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useCatalogMeta } from "@/hooks/use-catalog";
import { useGarage, type Vehicle } from "@/hooks/use-garage";
import { useLocale } from "@/hooks/use-locale";
import { useShop } from "@/hooks/use-shop";
import { localize, type LocalizedValue } from "@/lib/localized";
import { errorMessage } from "@/lib/utils";

type FormState = {
  nickname: string;
  vin: string;
  make: string;
  model: string;
  year: string;
  isPrimary: boolean;
};

const emptyForm: FormState = {
  nickname: "",
  vin: "",
  make: "",
  model: "",
  year: "",
  isPrimary: false,
};

export default function GaragePage() {
  const { t, locale } = useLocale();
  const { user, initializing } = useAuth();
  const { brands, cars } = useCatalogMeta();
  const { vehicles, loading, error, addVehicle, removeVehicle } = useGarage(Boolean(user));
  const { notify } = useShop();

  const [formOpen, setFormOpen] = React.useState(false);
  const [form, setForm] = React.useState<FormState>(emptyForm);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [confirmRemove, setConfirmRemove] = React.useState<string | null>(null);
  const [removing, setRemoving] = React.useState<string | null>(null);

  const selectedBrand = brands.find((brand) => brand.code === form.make);
  const modelOptions = React.useMemo(() => {
    const source = selectedBrand
      ? cars.filter((car) => car.brandId === selectedBrand.id)
      : cars;
    const seen = new Set<string>();
    return source
      .map((car) => localize(car.model, "en"))
      .filter((model) => {
        const key = model.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => a.localeCompare(b));
  }, [cars, selectedBrand]);

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
    setFormError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);

    if (!form.make.trim() || !form.model.trim()) {
      setFormError(locale === "ar" ? "أدخل الماركة والموديل." : "Enter the make and model.");
      return;
    }

    if (form.vin.trim() && form.vin.trim().length !== 17) {
      setFormError(locale === "ar" ? "رقم الهيكل يجب أن يكون 17 خانة." : "VIN must be 17 characters.");
      return;
    }

    const year = form.year ? Number(form.year) : null;
    if (year && (year < 1980 || year > 2030)) {
      setFormError(locale === "ar" ? "أدخل سنة بين 1980 و2030." : "Enter a year between 1980 and 2030.");
      return;
    }

    setSaving(true);
    try {
      await addVehicle({
        nickname: form.nickname.trim(),
        vin: form.vin.trim().toUpperCase(),
        make: form.make.trim(),
        model: form.model.trim(),
        year,
        is_primary: form.isPrimary,
      });
      setForm(emptyForm);
      setFormOpen(false);
      notify(t("vehicleAdded"));
    } catch (err: unknown) {
      setFormError(errorMessage(err, t("error")));
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (vehicleId: string) => {
    setRemoving(vehicleId);
    try {
      await removeVehicle(vehicleId);
      setConfirmRemove(null);
      notify(t("vehicleRemoved"));
    } catch (err: unknown) {
      notify(errorMessage(err, t("error")));
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-16">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-foreground/30" />
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {t("garageEyebrow")}
            </p>
          </div>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
            {t("garageHeading")}
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">
            {t("garageIntro")}
          </p>
        </div>
        {user ? (
          <button
            type="button"
            onClick={() => setFormOpen((open) => !open)}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background transition-opacity hover:opacity-85"
          >
            {formOpen ? <X className="size-3.5" /> : <Plus className="size-3.5" />}
            {formOpen ? t("cancel") : t("addVehicle")}
          </button>
        ) : null}
      </div>

      {initializing || (user && loading && vehicles.length === 0) ? (
        <GarageSkeleton />
      ) : !user ? (
        <div className="mt-9 flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-border bg-background">
            <Lock className="size-6" strokeWidth={1.5} />
          </span>
          <h2 className="mt-6 text-xl font-semibold">{t("signInGarage")}</h2>
          <Link
            href="/auth/login?next=/garage"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
          >
            {t("signIn")}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <>
          {formOpen ? (
            <form
              onSubmit={handleSubmit}
              className="mt-8 overflow-hidden rounded-2xl border border-border bg-card"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-6">
                <div>
                  <h2 className="text-sm font-semibold">{t("addVehicle")}</h2>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {locale === "ar"
                      ? "أضف ماركة وموديل السيارة للوصول الأسرع إلى القطع المتوافقة."
                      : "Add your car's make and model for faster compatible parts."}
                  </p>
                </div>
                <Car className="size-5 text-muted-foreground" strokeWidth={1.5} />
              </div>

              <div className="grid gap-4 p-5 sm:grid-cols-2 md:p-6 lg:grid-cols-3">
                <Field label={t("brandLabel")}>
                  <select
                    value={form.make}
                    onChange={(event) => update("make", event.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none transition-colors focus:border-foreground/40"
                  >
                    <option value="">
                      {locale === "ar" ? "اختر الماركة" : "Select make"}
                    </option>
                    {brands.map((brand) => (
                      <option key={brand.id} value={brand.code}>
                        {localize(brand.name, locale, brand.code)}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label={t("modelLabel")}>
                  <input
                    value={form.model}
                    onChange={(event) => update("model", event.target.value)}
                    list="garage-model-options"
                    placeholder={locale === "ar" ? "كامري" : "Camry"}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
                  />
                  <datalist id="garage-model-options">
                    {modelOptions.map((model) => (
                      <option key={model} value={model} />
                    ))}
                  </datalist>
                </Field>

                <Field label={t("yearLabel")}>
                  <input
                    type="number"
                    min={1980}
                    max={2030}
                    inputMode="numeric"
                    value={form.year}
                    onChange={(event) => update("year", event.target.value)}
                    placeholder="2022"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
                  />
                </Field>

                <Field label={t("vehicleNickname")} hint={locale === "ar" ? "اختياري" : "Optional"}>
                  <input
                    value={form.nickname}
                    onChange={(event) => update("nickname", event.target.value)}
                    placeholder={t("vehicleNicknamePlaceholder")}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
                  />
                </Field>

                <Field label={t("vinLabel")} hint={locale === "ar" ? "اختياري" : "Optional"}>
                  <input
                    value={form.vin}
                    onChange={(event) => update("vin", event.target.value.toUpperCase())}
                    maxLength={17}
                    dir="ltr"
                    placeholder="1HGCM82633A123456"
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
                  />
                </Field>

                <label className="flex h-11 cursor-pointer items-center gap-3 self-end rounded-xl border border-border bg-background px-3.5">
                  <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={(event) => update("isPrimary", event.target.checked)}
                    className="size-4 accent-foreground"
                  />
                  <span className="text-xs font-medium">{t("primaryVehicle")}</span>
                </label>
              </div>

              {formError ? (
                <div className="mx-5 mb-5 flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-[11px] leading-6 text-destructive md:mx-6">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {formError}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-2 border-t border-border bg-background/40 px-5 py-4 md:px-6">
                <button
                  type="button"
                  onClick={() => {
                    setForm(emptyForm);
                    setFormError(null);
                    setFormOpen(false);
                  }}
                  className="h-10 rounded-full px-4 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  {t("cancel")}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 rounded-full bg-foreground px-5 text-[11px] font-semibold text-background disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {saving ? t("loading") : t("save")}
                </button>
              </div>
            </form>
          ) : null}

          {error ? (
            <div className="mt-6 flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-xs leading-6 text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {error}
            </div>
          ) : null}

          {vehicles.length === 0 ? (
            <div className="mt-8 flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
              <span className="grid size-14 place-items-center rounded-full border border-border bg-background">
                <Car className="size-6" strokeWidth={1.5} />
              </span>
              <h2 className="mt-6 text-xl font-semibold">{t("noVehicles")}</h2>
              <p className="mt-2 max-w-sm text-xs leading-6 text-muted-foreground">
                {t("addFirstVehicle")}
              </p>
              <button
                type="button"
                onClick={() => setFormOpen(true)}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
              >
                <Plus className="size-3.5" />
                {t("addFirstVehicleShort")}
              </button>
            </div>
          ) : (
            <>
              <div className="mt-8 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{t("savedVehicles")}</h2>
                <span className="text-[10px] text-muted-foreground">
                  {vehicles.length} {locale === "ar" ? "مركبة" : "vehicles"}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    brandLabel={brandLabel(vehicle.make, brands, locale)}
                    confirming={confirmRemove === vehicle.id}
                    removing={removing === vehicle.id}
                    onConfirm={() => setConfirmRemove(vehicle.id)}
                    onCancel={() => setConfirmRemove(null)}
                    onRemove={() => handleRemove(vehicle.id)}
                  />
                ))}
              </div>
            </>
          )}

          <div className="mt-10 flex gap-3 rounded-2xl border border-border bg-card p-5">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
            <p className="text-[10px] leading-6 text-muted-foreground">
              {locale === "ar"
                ? "مركباتك محفوظة في حسابك فقط وتُستخدم لتحسين مطابقة القطع."
                : "Your vehicles are saved to your account only and used to improve parts matching."}
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function VehicleCard({
  vehicle,
  brandLabel,
  confirming,
  removing,
  onConfirm,
  onCancel,
  onRemove,
}: {
  vehicle: Vehicle;
  brandLabel: string;
  confirming: boolean;
  removing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onRemove: () => void;
}) {
  const { t, locale } = useLocale();
  const title = vehicle.nickname || [brandLabel, vehicle.model].filter(Boolean).join(" ");
  const partsHref = `/catalog?make=${encodeURIComponent(vehicle.make)}&year=${
    vehicle.year ?? ""
  }`;

  return (
    <article className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-xl border border-border bg-background">
            <Car className="size-5" strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-sm font-semibold">{title}</h3>
            <p className="mt-0.5 text-[10px] text-muted-foreground">
              {brandLabel || t("savedVehicle")}
              {vehicle.model ? ` · ${vehicle.model}` : ""}
            </p>
          </div>
        </div>
        {vehicle.is_primary ? (
          <span className="shrink-0 rounded-full border border-foreground/15 bg-foreground px-2.5 py-1 text-[9px] font-medium text-background">
            {t("primaryVehicle")}
          </span>
        ) : null}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl border border-border bg-background px-3 py-2.5">
          <p className="text-[9px] text-muted-foreground">{t("yearLabel")}</p>
          <p className="mt-0.5 text-xs font-medium">{vehicle.year ?? "—"}</p>
        </div>
        <div className="rounded-xl border border-border bg-background px-3 py-2.5">
          <p className="text-[9px] text-muted-foreground">VIN</p>
          <p className="mt-0.5 truncate font-mono text-[10px]" dir="ltr">
            {vehicle.vin || "—"}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <Link
          href={partsHref}
          className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-3 text-[11px] font-semibold text-background transition-opacity hover:opacity-85"
        >
          <Search className="size-3.5" />
          {t("viewPartsForCar")}
          <ArrowUpRight className="size-3" />
        </Link>
        {confirming ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onRemove}
              disabled={removing}
              className="h-10 rounded-full border border-destructive/25 bg-destructive/5 px-3 text-[10px] font-medium text-destructive disabled:opacity-50"
            >
              {removing ? t("loading") : locale === "ar" ? "تأكيد" : "Confirm"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
              aria-label={t("cancel")}
            >
              <X className="size-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onConfirm}
            className="grid size-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/25 hover:text-destructive"
            aria-label={t("removeVehicle")}
          >
            <Trash2 className="size-3.5" />
          </button>
        )}
      </div>
    </article>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
        {label}
        {hint ? <span className="font-normal">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function GarageSkeleton() {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-2">
      {[0, 1].map((item) => (
        <div key={item} className="h-60 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
    </div>
  );
}

function brandLabel(
  make: string,
  brands: Array<{ code: string; name: LocalizedValue }>,
  locale: "ar" | "en",
) {
  const brand = brands.find((item) => item.code === make);
  return brand ? localize(brand.name, locale, brand.code) : make;
}
