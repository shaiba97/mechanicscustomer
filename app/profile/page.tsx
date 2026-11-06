"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowUpRight, Building2, Car, Check, Heart, Lock, LogOut, Mail, PackageCheck, Pencil, ReceiptText, ShieldCheck, ShoppingBag, User, X } from "lucide-react";
import { cn } from "cn";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { isPhoneAccount, type UserPayload } from "@/hooks/use-auth";
import { useGarage } from "@/hooks/use-garage";
import { useLocale } from "@/hooks/use-locale";
import { useOrders } from "@/hooks/use-orders";
import { useShop } from "@/hooks/use-shop";
import { KSA_CITIES } from "@/lib/ksa-cities";
import { initials } from "@/lib/localized";
import { errorMessage } from "@/lib/utils";
import { isValidSaudiPhone, normalizeSaudiPhone, profileSchema } from "@/lib/validators";

type StoreProfile = {
  storeId: string | null;
  commercialNameAr?: string;
  commercialNameEn?: string;
  crNumber?: string;
  city?: string;
  isVerified?: boolean;
  createdAt?: string;
};

export default function ProfilePage() {
  const router = useRouter();
  const { t, locale } = useLocale();
  const { user, initializing, logout } = useAuth();
  const { orders, loading: ordersLoading } = useOrders(Boolean(user));
  const { vehicles, loading: garageLoading } = useGarage(Boolean(user));
  const { wishlist } = useShop();

  const [store, setStore] = React.useState<StoreProfile | null>(null);
  const [storeLoading, setStoreLoading] = React.useState(true);
  const [storeError, setStoreError] = React.useState<string | null>(null);
  const [signingOut, setSigningOut] = React.useState(false);

  React.useEffect(() => {
    if (!user) return;

    if (!user.storeId) {
      setStore(null);
      setStoreError(null);
      setStoreLoading(false);
      return;
    }

    let cancelled = false;

    api
      .get<StoreProfile>("/api/store/profile")
      .then((profile) => {
        if (!cancelled) setStore(profile);
      })
      .catch((err: unknown) => {
        if (!cancelled) setStoreError(errorMessage(err, t("storeUnavailable")));
      })
      .finally(() => {
        if (!cancelled) setStoreLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user, t]);

  const handleLogout = async () => {
    setSigningOut(true);
    try {
      await logout();
      router.push("/");
    } finally {
      setSigningOut(false);
    }
  };

  const storeName =
    locale === "ar"
      ? store?.commercialNameAr || store?.commercialNameEn
      : store?.commercialNameEn || store?.commercialNameAr;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-16">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-foreground/30" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {t("profileEyebrow")}
        </p>
      </div>

      {initializing ? (
        <ProfileSkeleton />
      ) : !user ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-border bg-background">
            <Lock className="size-6" strokeWidth={1.5} />
          </span>
          <h1 className="mt-6 text-xl font-semibold">{t("signInProfile")}</h1>
          <Link
            href="/auth/login?next=/profile"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
          >
            {t("signIn")}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-4 flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
            <div className="flex items-center gap-4">
              <span className="grid size-16 shrink-0 place-items-center rounded-2xl border border-border bg-card text-lg font-semibold tracking-wide">
                {initials(user.fullName)}
              </span>
              <div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                  {user.fullName}
                </h1>
                <p className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                  <Mail className="size-3" />
                  <span dir="ltr">{user.email}</span>
                  <span>·</span>
                  <span>
                    {t("memberSince")} {formatMonth(user.createdAt, locale)}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              disabled={signingOut}
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-border px-4 text-[11px] font-medium text-muted-foreground transition-colors hover:border-destructive/25 hover:text-destructive disabled:opacity-50"
            >
              <LogOut className="size-3.5" />
              {signingOut ? t("loading") : t("signOut")}
            </button>
          </div>

          <div className="mt-7 grid gap-4 sm:grid-cols-3">
            <StatCard
              href="/orders"
              icon={ReceiptText}
              label={t("navOrders")}
              value={ordersLoading ? "—" : String(orders.length)}
            />
            <StatCard
              href="/garage"
              icon={Car}
              label={t("savedVehicles")}
              value={garageLoading ? "—" : String(vehicles.length)}
            />
            <StatCard
              href="/catalog?wishlist=1"
              icon={Heart}
              label={t("savedParts")}
              value={String(wishlist.length)}
            />
          </div>

          <div
            className={`mt-6 grid gap-4 ${user.storeId ? "lg:grid-cols-[1.1fr_0.9fr] lg:items-start" : ""}`}
          >
            <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <AccountDetailsSection user={user} />
            </section>

            {user.storeId ? (
            <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-background">
                    <Building2 className="size-4" />
                  </span>
                  <h2 className="text-sm font-semibold">{t("storeDetails")}</h2>
                </div>
                {store?.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-foreground/15 bg-foreground px-2.5 py-1 text-[9px] font-medium text-background">
                    <ShieldCheck className="size-2.5" />
                    {t("verifiedSeller")}
                  </span>
                ) : null}
              </div>

              {storeLoading ? (
                <div className="mt-5 space-y-3">
                  <div className="h-10 animate-pulse rounded-lg bg-muted" />
                  <div className="h-10 animate-pulse rounded-lg bg-muted" />
                </div>
              ) : storeError ? (
                <div className="mt-5 flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-[11px] leading-6 text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {storeError}
                </div>
              ) : store ? (
                <dl className="mt-5 space-y-4">
                  <Row
                    label={t("storeNameLabel")}
                    value={storeName || t("verifiedSeller")}
                  />
                  <Row label={t("crNumberLabel")} value={store.crNumber || "—"} dir="ltr" />
                  <Row label={t("cityLabel")} value={store.city || "—"} />
                </dl>
              ) : (
                <p className="mt-5 text-[11px] leading-6 text-muted-foreground">
                  {locale === "ar"
                    ? "لا توجد بيانات متجر مرتبطة بهذا الحساب."
                    : "No store profile is linked to this account."}
                </p>
              )}
            </section>
            ) : null}
          </div>

          <section className="mt-6 rounded-2xl border border-border bg-card p-5 md:p-6">
            <h2 className="text-sm font-semibold">{t("quickLinks")}</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
              <QuickLink href="/orders" icon={ReceiptText} label={t("navOrders")} />
              <QuickLink href="/garage" icon={Car} label={t("navGarage")} />
              <QuickLink href="/catalog" icon={PackageCheck} label={t("browseCatalog")} />
              <QuickLink href="/cart" icon={ShoppingBag} label={t("cart")} />
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function AccountDetailsSection({ user }: { user: UserPayload }) {
  const { t, locale } = useLocale();
  const { updateProfile } = useAuth();
  const phoneAccount = isPhoneAccount(user);

  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [fullName, setFullName] = React.useState(user.fullName);
  const [phone, setPhone] = React.useState(user.email);
  const [email, setEmail] = React.useState(user.email);
  const [city, setCity] = React.useState(user.city || "");
  const [street, setStreet] = React.useState(user.street || "");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [savedAt, setSavedAt] = React.useState(false);

  React.useEffect(() => {
    if (!editing) {
      setFullName(user.fullName);
      setPhone(user.email);
      setEmail(user.email);
      setCity(user.city || "");
      setStreet(user.street || "");
    }
  }, [editing, user.fullName, user.email, user.city, user.street]);

  const startEdit = () => {
    setFormError(null);
    setSavedAt(false);
    setEditing(true);
  };

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError(null);
    setSavedAt(false);

    if (!editing) return;

    try {
      const parsed = profileSchema.parse({ fullName, city: city || undefined, street });
      if (phoneAccount && phone && phone !== user.email) {
        if (!isValidSaudiPhone(phone)) {
          throw new Error(t("auth.invalidPhone"));
        }
      }
      const payload: Record<string, string> = {
        fullName: parsed.fullName,
      };
      if (city) payload.city = city;
      payload.street = parsed.street ?? "";
      if (phoneAccount && phone !== user.email) {
        payload.phone = normalizeSaudiPhone(phone);
      }
      if (!phoneAccount && email !== user.email) {
        payload.email = email.trim().toLowerCase();
      }

      setSaving(true);
      await updateProfile(payload);
      setEditing(false);
      setSavedAt(true);
    } catch (err: unknown) {
      if (err && typeof err === "object" && "issues" in err && Array.isArray(err.issues)) {
        setFormError(String((err.issues as Array<{ message?: string }>)[0]?.message) || t("profile.failed"));
      } else {
        setFormError(err instanceof Error && err.message ? err.message : t("profile.failed"));
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center rounded-full bg-background">
            <User className="size-4" />
          </span>
          <h2 className="text-sm font-semibold">{t("accountDetails")}</h2>
        </div>
        {!editing ? (
          <button
            type="button"
            onClick={startEdit}
            className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-[10px] font-semibold text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <Pencil className="size-3" />
            {t("profile.edit")}
          </button>
        ) : null}
      </div>

      {savedAt ? (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-600/25 bg-emerald-600/5 px-3 py-2.5 text-[11px] font-medium text-emerald-700">
          <Check className="size-3.5" />
          {t("profile.saved")}
        </div>
      ) : null}

      {editing ? (
        <form onSubmit={handleSave} className="mt-5 space-y-4">
          {formError ? (
            <div className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-[11px] leading-6 text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              {formError}
            </div>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
              {t("fullName")}
            </span>
            <input
              type="text"
              required
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder={t("namePlaceholder")}
              className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none transition-colors focus:border-foreground/40"
            />
          </label>

          {phoneAccount ? (
            <label className="block">
              <span className="mb-1.5 flex items-center justify-between text-[10px] font-medium text-muted-foreground">
                {t("phoneNumber")}
              </span>
              <span className="flex h-11 items-center rounded-xl border border-border bg-background ps-3 pe-3 transition-colors focus-within:border-foreground/40">
                <span className="me-2 border-e border-border pe-2 text-[11px] font-semibold text-muted-foreground" dir="ltr">
                  +966
                </span>
                <input
                  type="tel"
                  dir="ltr"
                  inputMode="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="0512345678"
                  className="h-full w-full bg-transparent text-xs outline-none"
                />
              </span>
              <span className="mt-1.5 block text-[9px] text-muted-foreground">
                {t("profile.phoneHint")}
              </span>
            </label>
          ) : (
            <Row label={t("email")} value={email} dir="ltr" />
          )}

          <div>
            <span className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
              {t("profile.defaultAddress")}
            </span>
            <div className="grid gap-3 sm:grid-cols-2">
              <select
                value={city}
                onChange={(event) => setCity(event.target.value)}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none transition-colors focus:border-foreground/40"
                aria-label={t("cityLabel")}
              >
                <option value="">{locale === "ar" ? "اختر المدينة…" : "Select a city…"}</option>
                {KSA_CITIES.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {locale === "ar" ? option.ar : option.en}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={street}
                onChange={(event) => setStreet(event.target.value)}
                placeholder={t("checkout.streetPlaceholder")}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
                aria-label={t("profile.streetLabel")}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {saving ? t("profile.saving") : t("profile.save")}
            </button>
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                setFormError(null);
              }}
              disabled={saving}
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border px-4 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground disabled:opacity-40"
            >
              <X className="size-3.5" />
              {t("profile.cancel")}
            </button>
          </div>
        </form>
      ) : (
        <dl className="mt-5 space-y-4">
          <Row label={t("fullName")} value={user.fullName || "—"} />
          <Row label={phoneAccount ? t("phoneNumber") : t("email")} value={user.email} dir="ltr" />
          <Row
            label={t("profile.accountType")}
            value={
              user.storeId
                ? locale === "ar" ? "حساب متجر" : "Store account"
                : locale === "ar" ? "عميل" : "Customer"
            }
          />
          {user.city || user.street ? (
            <Row
              label={t("profile.defaultAddress")}
              value={[user.street, cityLabel(user.city, locale)].filter(Boolean).join(" · ")}
            />
          ) : null}
          <Row label={t("memberSince")} value={formatDate(user.createdAt, locale)} />
        </dl>
      )}
    </div>
  );
}

function cityLabel(slug: string, locale: "ar" | "en") {
  if (!slug) return "";
  const found = KSA_CITIES.find((city) => city.slug === slug.toLowerCase());
  if (!found) return slug;
  return locale === "ar" ? found.ar : found.en;
}

function StatCard({
  href,
  icon: Icon,
  label,
  value,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-2xl border border-border bg-card p-5 transition-colors hover:border-foreground/25"
    >
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="mt-1.5 text-2xl font-semibold tracking-tight">{value}</p>
      </div>
      <span className="grid size-10 place-items-center rounded-xl border border-border bg-background transition-transform group-hover:-translate-y-0.5">
        <Icon className="size-4" />
      </span>
    </Link>
  );
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3.5 py-3 text-[11px] font-medium transition-colors hover:border-foreground/25"
    >
      <span className="flex items-center gap-2.5">
        <Icon className="size-3.5 text-muted-foreground" />
        {label}
      </span>
      <ArrowUpRight className="size-3 text-muted-foreground" />
    </Link>
  );
}

function Row({ label, value, dir }: { label: string; value: string; dir?: "ltr" }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
      <dd className="truncate text-xs font-medium" dir={dir}>
        {value}
      </dd>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="mt-8">
      <div className="h-16 w-64 animate-pulse rounded-xl bg-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-28 animate-pulse rounded-2xl border border-border bg-card" />
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    </div>
  );
}

function formatDate(value: string, locale: "ar" | "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-SA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatMonth(value: string, locale: "ar" | "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-SA", {
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}
