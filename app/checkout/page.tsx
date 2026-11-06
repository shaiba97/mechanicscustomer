"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Banknote,
  CreditCard,
  Lock,
  MapPin,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Truck,
} from "lucide-react";
import { cn } from "cn";
import { PartVisual } from "@/components/part-visual";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { useOrders } from "@/hooks/use-orders";
import { useShop } from "@/hooks/use-shop";
import { formatSar } from "@/lib/i18n";
import { KSA_CITIES, getKsaCity } from "@/lib/ksa-cities";
import { localize } from "@/lib/localized";
import { errorMessage } from "@/lib/utils";

type PaymentMethod = "cod" | "moyasar";

export default function CheckoutPage() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { user, initializing } = useAuth();
  const { items, hydrated, subtotal, clearCart } = useShop();
  const { checkout, loading: submitting } = useOrders(false);

  const [step, setStep] = React.useState<1 | 2>(1);
  const [city, setCity] = React.useState("");
  const [street, setStreet] = React.useState("");
  const [stepError, setStepError] = React.useState<string | null>(null);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = React.useState(false);
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [clientSecret, setClientSecret] = React.useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>("cod");

  React.useEffect(() => {
    if (user?.city && getKsaCity(user.city)) setCity(user.city);
    if (user?.street) setStreet(user.street);
  }, [user?.city, user?.street]);

  const storeIds = Array.from(
    new Set(
      items
        .map((item) => item.part.storeId)
        .filter((value): value is string => Boolean(value)),
    ),
  );
  const storeId =
    storeIds.length === 1 && items.every((item) => item.part.storeId === storeIds[0])
      ? storeIds[0]
      : null;
  const storeName = storeId
    ? items.find((item) => item.part.storeId === storeId)?.part.storeName ?? null
    : null;

  const selectedCity = getKsaCity(city);
  const deliveryFee = selectedCity?.fee ?? 0;
  const grandTotal = subtotal + deliveryFee;

  const goToPaymentStep = () => {
    setStepError(null);
    if (!selectedCity) {
      setStepError(t("checkout.selectCityError"));
      return;
    }
    if (!street.trim()) {
      setStepError(t("checkout.streetError"));
      return;
    }
    setStep(2);
  };

  const createOrder = async () => {
    if (!storeId || items.length === 0 || orderId) return;
    if (!selectedCity || !street.trim()) {
      setStep(1);
      setStepError(t("checkout.selectCityError"));
      return;
    }
    setSubmitError(null);
    setCreatingOrder(true);

    try {
      const result = await checkout({
        items: items.map((item) => ({
          inventory_item_id: item.part.id,
          quantity: item.quantity,
        })),
        store_id: storeId,
        city,
        street: street.trim(),
        payment_method: paymentMethod,
      });
      setOrderId(result.orderId);
      setClientSecret(result.clientSecret ?? null);

      if (paymentMethod === "cod") {
        clearCart();
        router.push(`/orders/${result.orderId}?payment=cod`);
      } else if (paymentMethod === "moyasar") {
        // Mada payment - redirect to Mada payment page
        if (result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else if (result.clientSecret) {
          // If we get a client secret, redirect to Mada checkout
          router.push(`/api/store/payments/mada/checkout?paymentIntentId=${result.clientSecret}&orderId=${result.orderId}`);
        }
      }
    } catch (err: unknown) {
      setSubmitError(errorMessage(err, t("checkoutError")));
    } finally {
      setCreatingOrder(false);
    }
  };

  if (initializing || !hydrated) {
    return <CheckoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-24 text-center md:py-32">
        <span className="grid size-16 place-items-center rounded-full border border-border bg-card">
          <Lock className="size-7" strokeWidth={1.5} />
        </span>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight">{t("checkoutNeedsAuth")}</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
          {locale === "ar"
            ? "سجّل الدخول أو أنشئ حساباً لإتمام الطلب ومتابعته."
            : "Sign in or create an account to complete and track your order."}
        </p>
        <Link
          href="/auth/login?next=/checkout"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
        >
          {t("signIn")}
          <ArrowRight className="size-3.5 rtl:rotate-180" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-5 py-24 text-center md:py-32">
        <span className="grid size-16 place-items-center rounded-full border border-border bg-card">
          <ShoppingBag className="size-7" strokeWidth={1.5} />
        </span>
        <h1 className="mt-7 text-3xl font-semibold tracking-tight">{t("emptyCheckout")}</h1>
        <Link
          href="/catalog"
          className="mt-7 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
        >
          {t("browseCatalog")}
          <ArrowRight className="size-3.5 rtl:rotate-180" />
        </Link>
      </div>
    );
  }

  const canCreateOrder = Boolean(storeId) && !orderId;
  const actionDisabled = submitting || creatingOrder || (!orderId && !canCreateOrder);
  const codActive = paymentMethod === "cod" && !clientSecret;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-16">
      <nav className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Link href="/" className="hover:text-foreground">
          {t("home")}
        </Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-foreground">
          {t("cart")}
        </Link>
        <span>/</span>
        <span className="text-foreground">{t("secureCheckout")}</span>
      </nav>

      <div className="mt-7">
        <div className="flex items-center gap-3">
          <span className="h-px w-8 bg-foreground/30" />
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            {t("checkoutEyebrow")}
          </p>
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
          {t("checkoutHeading")}
        </h1>
        <div className="mt-6 flex items-center gap-3">
          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors",
              step === 1 ? "bg-foreground text-background" : "border border-border text-muted-foreground",
            )}
          >
            {t("checkout.stepDelivery")}
          </span>
          <span className="h-px w-8 bg-border" />
          <span
            className={cn(
              "rounded-full px-3 py-1.5 text-[10px] font-semibold transition-colors",
              step === 2 ? "bg-foreground text-background" : "border border-border text-muted-foreground",
            )}
          >
            {t("checkout.stepPayment")}
          </span>
        </div>
      </div>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-4">
          {step === 1 ? (
            <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-background">
                    <MapPin className="size-4" />
                  </span>
                  <h2 className="text-sm font-semibold">{t("checkout.stepDelivery")}</h2>
                </div>
                <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[9px] text-muted-foreground sm:flex">
                  <Truck className="size-3" />
                  {t("checkout.ksaOnly")}
                </span>
              </div>

              <div className="mt-5 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
                    {t("checkout.chooseCity")}
                  </span>
                  <select
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none transition-colors focus:border-foreground/40"
                  >
                    <option value="">{locale === "ar" ? "اختر المدينة…" : "Select a city…"}</option>
                    {KSA_CITIES.map((option) => (
                      <option key={option.slug} value={option.slug}>
                        {locale === "ar" ? option.ar : option.en} — {formatSar(option.fee, locale)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
                    {t("checkout.streetLabel")}
                  </span>
                  <input
                    type="text"
                    value={street}
                    onChange={(event) => setStreet(event.target.value)}
                    placeholder={t("checkout.streetPlaceholder")}
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
                  />
                </label>
              </div>

              {storeName ? (
                <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background px-3.5 py-3">
                  <span className="text-[10px] text-muted-foreground">{t("seller")}</span>
                  <span className="text-xs font-medium">{storeName || t("verifiedSeller")}</span>
                </div>
              ) : null}

              {stepError ? (
                <div className="mt-4 flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-[11px] leading-6 text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {stepError}
                </div>
              ) : null}

              <button
                type="button"
                onClick={goToPaymentStep}
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-85"
              >
                {t("checkout.next")}
                <ArrowLeft className="size-4 rtl:rotate-180" />
              </button>
            </section>
          ) : (
            <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-background">
                    <CreditCard className="size-4" />
                  </span>
                  <h2 className="text-sm font-semibold">{t("checkout.stepPayment")}</h2>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setClientSecret(null);
                    setOrderId(null);
                  }}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
                >
                  <ArrowRight className="size-3 rtl:rotate-180" />
                  {t("checkout.back")}
                </button>
              </div>

              <div className="mt-5 space-y-3">
                <PaymentOption
                  selected={paymentMethod === "cod"}
                  onSelect={() => setPaymentMethod("cod")}
                  icon={<Banknote className="size-4" />}
                  title={t("checkout.pay.cod")}
                  description={t("checkout.pay.codDesc")}
                  disabled={Boolean(orderId) && paymentMethod !== "cod"}
                />
                <PaymentOption
                  selected={paymentMethod === "moyasar"}
                  onSelect={() => setPaymentMethod("moyasar")}
                  icon={<Smartphone className="size-4" />}
                  title={t("checkout.pay.moyasar")}
                  description={t("checkout.pay.madaDesc")}
                  disabled={Boolean(orderId) && paymentMethod !== "moyasar"}
                />
              </div>

              {submitError ? (
                <div className="mt-4 flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-[11px] leading-6 text-destructive">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {submitError}
                </div>
              ) : null}

              {codActive ? (
                <>
                  <p className="mt-4 text-[10px] leading-5 text-muted-foreground">
                    {t("checkout.codNote")}
                  </p>
                  <button
                    type="button"
                    onClick={createOrder}
                    disabled={actionDisabled}
                    className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    <Lock className="size-4" />
                    {creatingOrder || submitting ? t("processingOrder") : t("checkout.placeCod")}
                  </button>
                </>
              ) : null}

              {paymentMethod === "moyasar" ? (
                <button
                  type="button"
                  onClick={createOrder}
                  disabled={actionDisabled}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-sm font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-35"
                >
                  <Lock className="size-4" />
                  {creatingOrder || submitting ? t("processingOrder") : t("checkout.pay.moyasar")}
                </button>
              ) : null}
            </section>
          )}
        </div>

        <aside className="rounded-2xl border border-border bg-card p-5 lg:sticky lg:top-28">
          <h2 className="text-sm font-semibold">{t("orderSummary")}</h2>
          <div className="mt-4 max-h-80 space-y-3 overflow-y-auto pe-1">
            {items.map((item) => (
              <div key={item.part.id} className="flex gap-3">
                <div className="w-14 shrink-0 overflow-hidden rounded-lg border border-border">
                  <PartVisual part={item.part} className="aspect-square w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-medium">
                    {localize(item.part.name, locale, item.part.sku)}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                    {item.part.sku} × {item.quantity}
                  </p>
                </div>
                <p className="shrink-0 text-[11px] font-medium">
                  {formatSar(item.part.priceSar * item.quantity, locale)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-5 space-y-3 border-t border-border pt-5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-medium">{formatSar(subtotal, locale)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t("checkout.deliveryFee")}</span>
              {selectedCity ? (
                <span className="font-medium">{formatSar(deliveryFee, locale)}</span>
              ) : (
                <span className="text-[10px] text-muted-foreground">
                  {locale === "ar" ? "اختر المدينة" : "Select city"}
                </span>
              )}
            </div>
            <p className="text-[9px] leading-5 text-muted-foreground">{t("checkout.cityFeeNote")}</p>
            <div className="flex items-center justify-between border-t border-border pt-3">
              <span className="text-sm font-semibold">{t("checkout.grandTotal")}</span>
              <span className="text-xl font-semibold tracking-tight">
                {formatSar(grandTotal, locale)}
              </span>
            </div>
          </div>

          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[9px] text-muted-foreground">
            <ShieldCheck className="size-3" />
            {t("cartNote")}
          </p>
        </aside>
      </div>
    </div>
  );
}

function PaymentOption({
  selected,
  onSelect,
  icon,
  title,
  description,
  disabled,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-start transition-colors disabled:cursor-not-allowed disabled:opacity-60",
        selected ? "border-foreground bg-background" : "border-border bg-background hover:border-foreground/30",
      )}
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-9 place-items-center rounded-lg border transition-colors",
            selected ? "border-foreground bg-foreground text-background" : "border-border bg-card",
          )}
        >
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold">{title}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">{description}</p>
        </div>
      </div>
      <span
        className={cn(
          "grid size-4 shrink-0 place-items-center rounded-full border transition-colors",
          selected ? "border-foreground bg-foreground" : "border-border",
        )}
      >
        {selected ? <span className="size-1.5 rounded-full bg-background" /> : null}
      </span>
    </button>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-16 md:px-8">
      <div className="h-12 w-72 animate-pulse rounded-xl bg-muted" />
      <div className="mt-9 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="h-40 animate-pulse rounded-2xl border border-border bg-card" />
        </div>
        <div className="h-80 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    </div>
  );
}
