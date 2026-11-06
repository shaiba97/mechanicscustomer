"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  Check,
  Clock3,
  Flag,
  Lock,
  MapPin,
  Package,
  ReceiptText,
  ShieldCheck,
  Store,
  Truck,
  Wallet,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { useOrderSocket } from "@/hooks/use-order-socket";
import { useOrders, type Order } from "@/hooks/use-orders";
import { formatSar } from "@/lib/i18n";
import { getKsaCity } from "@/lib/ksa-cities";
import {
  DELIVERY_STEPS,
  deliveryStepIndex,
  isDeliveryStepActive,
  isDeliveryStepDone,
  orderStatusLabel,
  paymentStatusLabel,
} from "@/lib/order-status";
import type { OrderStatusEvent } from "@/lib/socket";
import { ReviewSection } from "@/components/reviews";

type PaymentNotice = "success" | "pending" | "failed" | "cod" | null;

export default function OrderDetailPage() {
  return (
    <React.Suspense fallback={<OrderDetailSkeleton />}>
      <OrderDetailContent />
    </React.Suspense>
  );
}

function OrderDetailContent() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const orderId = params?.id ?? "";
  const { t, locale } = useLocale();
  const { user, initializing } = useAuth();
  const { fetchOrder } = useOrders(false);

  const [order, setOrder] = React.useState<Order | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const payment = searchParams.get("payment");
  const intent = searchParams.get("payment_intent");
  const [paymentNotice, setPaymentNotice] = React.useState<PaymentNotice>(
    payment === "success" ? "success" : payment === "cod" ? "cod" : null,
  );
  const [confirming, setConfirming] = React.useState(
    payment === "return" && Boolean(intent),
  );
  const confirmedRef = React.useRef(false);

  const orderRef = React.useRef(order);
  orderRef.current = order;
  const reviewRef = React.useRef<HTMLDivElement>(null);

  const handleStatusEvent = React.useCallback(
    (event: OrderStatusEvent) => {
      if (event.orderId !== orderId) return;
      const prev = orderRef.current;
      setOrder((current) => {
        if (!current) return current;
        const next = { ...current, status: event.status };
        if (event.handoverOtp) next.handover_otp = event.handoverOtp;
        return next;
      });
      if (
        event.status === "completed" &&
        prev &&
        prev.status !== "completed"
      ) {
        void reviewRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    },
    [orderId],
  );

  useOrderSocket(orderId, handleStatusEvent);

  const loadOrder = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchOrder(orderId);
      setOrder(data);
    } catch (err: unknown) {
      setError(
        err instanceof Error && err.message ? err.message : t("orderNotFound"),
      );
      setOrder(null);
    } finally {
      setLoading(false);
    }
  }, [fetchOrder, orderId, t]);

  React.useEffect(() => {
    if (!user) return;
    void loadOrder();
  }, [user, loadOrder]);

  const cancelled = order?.status === "cancelled";
  const itemCount = order?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-16">
      <Link
        href="/orders"
        className="inline-flex items-center gap-2 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5 rtl:rotate-180" />
        {t("backToOrders")}
      </Link>

      {initializing || (user && loading && !order) ? (
        <OrderDetailSkeleton />
      ) : !user ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-border bg-background">
            <Lock className="size-6" strokeWidth={1.5} />
          </span>
          <h1 className="mt-6 text-xl font-semibold">{t("signInOrders")}</h1>
          <Link
            href={`/auth/login?next=/orders/${orderId}`}
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
          >
            {t("signIn")}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      ) : error ? (
        <div className="mt-8 flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-xs leading-6 text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {error}
        </div>
      ) : !order ? (
        <div className="mt-8 flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
          <span className="grid size-14 place-items-center rounded-full border border-border bg-background">
            <ReceiptText className="size-6" strokeWidth={1.5} />
          </span>
          <h1 className="mt-6 text-xl font-semibold">{t("orderNotFound")}</h1>
          <Link
            href="/orders"
            className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
          >
            {t("backToOrders")}
            <ArrowUpRight className="size-3.5" />
          </Link>
        </div>
      ) : (
        <>
          {paymentNotice || confirming ? (
            <div
              className={`mt-6 flex gap-3 rounded-xl border p-4 text-[11px] leading-6 ${
                confirming || paymentNotice === "pending"
                  ? "border-border bg-card"
                  : paymentNotice === "failed"
                    ? "border-destructive/25 bg-destructive/5 text-destructive"
                    : "border-foreground/15 bg-foreground text-background"
              }`}
            >
              {confirming || paymentNotice === "pending" ? (
                <Clock3 className="mt-0.5 size-4 shrink-0" />
              ) : (
                <ShieldCheck className="mt-0.5 size-4 shrink-0" />
              )}
              <div>
                <p className="font-semibold">
                  {confirming
                    ? locale === "ar"
                      ? "جارٍ تأكيد الدفع..."
                      : "Confirming payment..."
                    : paymentNotice === "pending"
                      ? locale === "ar"
                        ? "الدفع قيد المعالجة"
                        : "Payment is processing"
                      : paymentNotice === "failed"
                        ? locale === "ar"
                          ? "تعذر تأكيد الدفع"
                          : "Payment could not be confirmed"
                        : paymentNotice === "cod"
                          ? locale === "ar"
                            ? "تم إنشاء الطلب"
                            : "Order placed"
                          : locale === "ar"
                            ? "تم استلام الدفع"
                            : "Payment received"}
                </p>
                {!confirming ? (
                  <p className="mt-0.5 opacity-70">
                    {paymentNotice === "pending"
                      ? locale === "ar"
                        ? "قد يستغرق التأكيد لحظات. حدّث الصفحة بعد قليل."
                        : "Confirmation can take a moment. Refresh shortly."
                      : paymentNotice === "failed"
                        ? locale === "ar"
                          ? "تواصل مع الدعم إذا استمرت المشكلة."
                          : "Contact support if the issue continues."
                        : paymentNotice === "cod"
                          ? paymentStatusLabel(order?.payment_status ?? "", locale)
                          : locale === "ar"
                            ? "سيبدأ المتجر بتحضير طلبك."
                            : "The store will start preparing your order."}
                  </p>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-6 flex flex-col justify-between gap-5 border-b border-border pb-7 sm:flex-row sm:items-end">
            <div>
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-foreground/30" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                  {t("orderDetails")}
                </p>
              </div>
              <h1 className="mt-4 font-mono text-3xl font-semibold tracking-[-0.04em] md:text-4xl">
                #{order.id.slice(-6).toUpperCase()}
              </h1>
              <p className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-muted-foreground">
                <Clock3 className="size-3" />
                {formatDate(order.created_at, locale)}
                <span>·</span>
                <span>
                  {itemCount} {t("items").toLowerCase()}
                </span>
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-medium ${
                  cancelled
                    ? "border-destructive/25 bg-destructive/5 text-destructive"
                    : order.status === "completed"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-card"
                }`}
              >
                <span
                  className={`size-1.5 rounded-full ${
                    cancelled
                      ? "bg-destructive"
                      : order.status === "completed"
                        ? "bg-background"
                        : "bg-foreground"
                  }`}
                />
                {orderStatusLabel(order.status, locale)}
              </span>
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-[10px] text-muted-foreground">
                {t("paymentStatus")}: {paymentStatusLabel(order.payment_status, locale)}
              </span>
            </div>
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
            <div className="space-y-4">
              {!cancelled ? (
                <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                  <h2 className="text-sm font-semibold">{t("orderProgress")}</h2>
                  <div className="mt-6">
                    {DELIVERY_STEPS.map((step, index) => {
                      const done = isDeliveryStepDone(order.status, index);
                      const active = isDeliveryStepActive(order.status, index);
                      const reached = done || active;
                      const stepIcons: Record<string, React.ReactNode> = {
                        confirmed: <ReceiptText className="size-3.5" />,
                        preparing: <Package className="size-3.5" />,
                        out_for_delivery: <Truck className="size-3.5" />,
                        delivered: <Flag className="size-3.5" />,
                      };

                      return (
                        <div key={step.id} className="relative flex gap-4 pb-7 last:pb-0">
                          {index < DELIVERY_STEPS.length - 1 ? (
                            <span
                              aria-hidden="true"
                              className={`absolute start-[15px] top-8 h-[calc(100%-32px)] w-px ${
                                done ? "bg-foreground" : "bg-border"
                              }`}
                            />
                          ) : null}
                          <span
                            className={`relative z-10 shrink-0 grid size-8 place-items-center rounded-full border text-[10px] font-semibold ${
                              reached
                                ? "border-foreground bg-foreground text-background shadow-[0_0_0_6px_rgba(255,255,255,0.25)]"
                                : "border-border bg-background text-muted-foreground"
                            } ${active ? "ring-2 ring-blue-600/40 animate-pulse" : ""}`}
                          >
                            {done ? (
                              <Check className="size-3.5" />
                            ) : active ? (
                              stepIcons[step.id]
                            ) : (
                              index + 1
                            )}
                          </span>
                          <div className="pt-1">
                            <p
                              className={`text-xs font-medium ${
                                reached ? "text-foreground" : "text-muted-foreground"
                              }`}
                            >
                              {step.label[locale]}
                            </p>
                            {index === 0 && reached && (
                              <p className="mt-0.5 text-[10px] text-muted-foreground">
                                {order.payment_status === "paid"
                                  ? order.payment_method === "moyasar"
                                    ? "مدفوع عبر مدى · Paid via Mada"
                                    : "مدفوع · Paid"
                                  : locale === "ar"
                                    ? "في انتظار تأكيد الدفع"
                                    : "Awaiting payment confirmation"}
                              </p>
                            )}
                            {active && (
                              <p className="mt-1 flex items-center gap-1.5 text-[10px] font-semibold rounded-full border px-2.5 py-0.5 border-blue-200 bg-blue-50 text-blue-700">
                                {locale === "ar" ? "الحالة" : "Status"}:
                                {orderStatusLabel(order.status, locale)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              ) : (
                <section className="rounded-2xl border border-destructive/25 bg-destructive/5 p-5 text-destructive md:p-6">
                  <div className="flex gap-3">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <h2 className="text-sm font-semibold">{t("cancelled")}</h2>
                      <p className="mt-1 text-[11px] leading-6 opacity-80">
                        {locale === "ar"
                          ? "تم إلغاء هذا الطلب. إذا كنت بحاجة إلى مساعدة، تواصل مع الدعم."
                          : "This order was cancelled. Contact support if you need help."}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {Boolean(order.handover_otp) &&
                order.status !== "completed" &&
                order.status !== "cancelled" ? (
                <section className="rounded-2xl border-2 border-foreground bg-foreground p-5 text-background md:p-6">
                  <div className="flex gap-3">
                    <Truck className="mt-0.5 size-4 shrink-0" />
                    <div>
                      <h2 className="text-sm font-semibold">
                        {t("handoverOTP")}
                      </h2>
                      <p className="mt-1 text-[11px] leading-6 opacity-80">
                        {locale === "ar"
                          ? "أعطِ هذا الرمز لمندوب التوصيل عند استلام القطعة لتأكيد التسليم."
                          : "Give this code to the driver upon receiving your part to confirm delivery."}
                      </p>
                      <p className="mt-0.5 text-[10px] opacity-60">
                        {locale === "ar"
                          ? "لا تشارك هذا الرمز مع أي شخص."
                          : "Do not share this code with anyone."}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 flex gap-2" dir="ltr">
                    {order.handover_otp.split("").map((digit, index) => (
                      <span
                        key={`${digit}-${index}`}
                        className="grid size-11 flex-1 place-items-center rounded-lg border border-white/30 bg-white/10 font-mono text-lg font-semibold"
                      >
                        {digit}
                      </span>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-4 md:px-6">
                  <h2 className="text-sm font-semibold">{t("orderItems")}</h2>
                  <span className="text-[10px] text-muted-foreground">
                    {((order?.items) || []).length} {t("items").toLowerCase()}
                  </span>
                </div>
                <div className="divide-y divide-border px-5 md:px-6">
                  {((order?.items) || []).map((item) => (
                    <div key={item.id} className="flex items-center gap-3.5 py-4">
                      <span className="grid size-10 shrink-0 place-items-center rounded-xl border border-border bg-background">
                        <Package className="size-4 text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium">{item.part_name}</p>
                        <p className="mt-1 font-mono text-[9px] text-muted-foreground">
                          {item.part_number} · {formatSar(item.unit_price_sar, locale)} ×{" "}
                          {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 text-xs font-semibold">
                        {formatSar(item.line_total_sar, locale)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className="space-y-4 lg:sticky lg:top-28">
              <section className="rounded-2xl border border-border bg-card p-5">
                <h2 className="text-sm font-semibold">{t("orderSummary")}</h2>
                <div className="mt-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("subtotal")}</span>
                    <span>{formatSar(order.total_sar, locale)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{t("checkout.deliveryFee")}</span>
                    <span>
                      {order.delivery_fee_sar
                        ? formatSar(Number(order.delivery_fee_sar), locale)
                        : "—"}
                    </span>
                  </div>
                  <p className="text-[9px] leading-5 text-muted-foreground">
                    {t("checkout.cityFeeNote")}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm font-semibold">{t("checkout.grandTotal")}</span>
                  <span className="text-xl font-semibold tracking-tight">
                    {formatSar(
                      order.grand_total_sar ? Number(order.grand_total_sar) : Number(order.total_sar),
                      locale,
                    )}
                  </span>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-background px-3.5 py-3">
                  <span className="text-[10px] text-muted-foreground">
                    {t("paymentStatus")}
                  </span>
                  <span className="text-[10px] font-medium">
                    {paymentStatusLabel(order.payment_status, locale)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between rounded-xl border border-border bg-background px-3.5 py-3">
                  <span className="text-[10px] text-muted-foreground">
                    {t("orders.paymentGateway")}
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-medium">
                    {order.payment_method === "cod" ? (
                      <Banknote className="size-3.5" />
                    ) : (
                      <Wallet className="size-3.5" />
                    )}
                    {t(
                      order.payment_method === "cod"
                        ? "orders.gateway.cod"
                        : order.payment_method === "moyasar"
                          ? "orders.gateway.moyasar"
                          : "orders.gateway.stripe",
                    )}
                  </span>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-background">
                    <MapPin className="size-4" />
                  </span>
                  <div>
                    <p className="text-[9px] text-muted-foreground">
                      {t("orders.deliveryAddress")}
                    </p>
                    <p className="mt-0.5 text-xs font-medium">
                      {order.city || order.street
                        ? [
                            order.street,
                            getKsaCity(order.city)
                              ? locale === "ar"
                                ? getKsaCity(order.city)!.ar
                                : getKsaCity(order.city)!.en
                              : order.city,
                          ]
                            .filter(Boolean)
                            .join("، ") || "—"
                        : t("orders.noDelivery")}
                    </p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-background">
                    <Store className="size-4" />
                  </span>
                  <div>
                    <p className="text-[9px] text-muted-foreground">{t("seller")}</p>
                    <p className="mt-0.5 text-xs font-medium">
                      {order.store_name || t("verifiedSeller")}
                    </p>
                  </div>
                </div>
                <dl className="mt-4 space-y-2 border-t border-border pt-3">
                  <Row label={t("orders.orderedOn")} value={formatDate(order.created_at, locale)} />
                  <Row label={t("orders.updated")} value={formatDate(order.updated_at, locale)} />
                </dl>
              </section>

              {order.status === "completed" ? (
                <section ref={reviewRef} className="rounded-2xl border border-border bg-card p-5">
                  <ReviewSection order={order} />
                </section>
              ) : null}

              <Link
                href="/catalog"
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-card text-[11px] font-semibold transition-colors hover:border-foreground/30"
              >
                {t("browseCatalog")}
                <ArrowUpRight className="size-3.5" />
              </Link>
            </aside>
          </div>
        </>
      )}
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="mt-8">
      <div className="h-10 w-40 animate-pulse rounded-lg bg-muted" />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-card" />
          <div className="h-56 animate-pulse rounded-2xl border border-border bg-card" />
        </div>
        <div className="h-64 animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-[10px] text-muted-foreground">{label}</dt>
      <dd className="truncate text-xs font-medium">{value}</dd>
    </div>
  );
}

function formatDate(value: string, locale: "ar" | "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-SA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}
