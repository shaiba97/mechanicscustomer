"use client";

import Link from "next/link";
import {
  AlertCircle,
  ArrowUpRight,
  Clock3,
  Lock,
  Package,
  ReceiptText,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { useOrders } from "@/hooks/use-orders";
import { formatSar } from "@/lib/i18n";
import { orderStatusLabel, paymentStatusLabel } from "@/lib/order-status";

export default function OrdersPage() {
  const { t, locale } = useLocale();
  const { user, initializing } = useAuth();
  const { orders, loading, error } = useOrders(Boolean(user));

  return (
    <div className="mx-auto w-full max-w-[1200px] px-5 py-10 md:px-8 md:py-16">
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-foreground/30" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {t("ordersEyebrow")}
        </p>
      </div>
      <div className="mt-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-4xl font-semibold tracking-[-0.045em] md:text-5xl">
            {t("ordersHeading")}
          </h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">{t("ordersIntro")}</p>
        </div>
        {user && !loading ? (
          <div className="flex items-baseline gap-2 rounded-full border border-border bg-card px-4 py-2">
            <span className="text-lg font-semibold">{orders.length}</span>
            <span className="text-[10px] text-muted-foreground">{t("orderCount")}</span>
          </div>
        ) : null}
      </div>

      <div className="mt-9">
        {initializing || (user && loading) ? (
          <OrdersSkeleton />
        ) : !user ? (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <span className="grid size-14 place-items-center rounded-full border border-border bg-background">
              <Lock className="size-6" strokeWidth={1.5} />
            </span>
            <h2 className="mt-6 text-xl font-semibold">{t("signInOrders")}</h2>
            <Link
              href="/auth/login?next=/orders"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
            >
              {t("signIn")}
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        ) : error ? (
          <div className="flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-xs leading-6 text-destructive">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <span className="grid size-14 place-items-center rounded-full border border-border bg-background">
              <ReceiptText className="size-6" strokeWidth={1.5} />
            </span>
            <h2 className="mt-6 text-xl font-semibold">{t("noOrders")}</h2>
            <p className="mt-2 max-w-sm text-xs leading-6 text-muted-foreground">
              {locale === "ar"
                ? "لم تقم بأي طلبات بعد. ابدأ من الكتالوج أو ابحث بسيارتك."
                : "You have not placed an order yet. Start from the catalog or search by your car."}
            </p>
            <Link
              href="/catalog"
              className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-xs font-semibold text-background"
            >
              {t("browseCatalog")}
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <div className="flex flex-col gap-4 border-b border-border p-5 sm:flex-row sm:items-center sm:justify-between md:px-6">
                  <div className="flex items-center gap-3.5">
                    <span className="grid size-11 place-items-center rounded-xl border border-border bg-background font-mono text-[10px] font-semibold">
                      #{order.id.slice(-4)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">
                        {t("orderNumber")} #{order.id.slice(-6).toUpperCase()}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock3 className="size-3" />
                        {formatDate(order.created_at, locale)}
                        {order.store_name ? (
                          <>
                            <span>·</span>
                            <span className="truncate">{order.store_name}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={order.status} label={orderStatusLabel(order.status, locale)} />
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[9px] font-medium ${
                        order.payment_status === "paid"
                          ? "border-foreground/15 bg-foreground text-background"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      {paymentStatusLabel(order.payment_status, locale)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-border px-5 md:px-6">
                  {(order?.items || []).slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3 py-3">
                      <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-border bg-background">
                        <Package className="size-3.5 text-muted-foreground" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium">{item.part_name}</p>
                        <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">
                          {item.part_number} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-[11px] font-medium">
                        {formatSar(item.line_total_sar, locale)}
                      </p>
                    </div>
                  ))}
                  {(order?.items || []).length > 3 ? (
                    <p className="py-2.5 text-[10px] text-muted-foreground">
                      {locale === "ar"
                        ? `+${(order?.items || []).length - 3} قطع أخرى`
                        : `+${(order?.items || []).length - 3} more items`}
                    </p>
                  ) : null}
                </div>

                <div className="flex flex-col gap-3 border-t border-border bg-background/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
                  <div>
                    <p className="text-[9px] text-muted-foreground">{t("total")}</p>
                    <p className="mt-0.5 text-lg font-semibold tracking-tight">
                      {formatSar(order.total_sar, locale)}
                    </p>
                  </div>
                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border px-4 text-[11px] font-semibold transition-colors hover:border-foreground/30"
                  >
                    {t("viewOrder")}
                    <ArrowUpRight className="size-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, label }: { status: string; label: string }) {
  const tone =
    status === "completed"
      ? "border-foreground bg-foreground text-background"
      : status === "cancelled"
        ? "border-destructive/25 bg-destructive/5 text-destructive"
        : "border-border bg-background text-foreground";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-medium ${tone}`}
    >
      <span
        className={`size-1.5 rounded-full ${
          status === "completed"
            ? "bg-background"
            : status === "cancelled"
              ? "bg-destructive"
              : "bg-foreground"
        }`}
      />
      {label}
    </span>
  );
}

function OrdersSkeleton() {
  return (
    <div className="space-y-4">
      {[0, 1].map((item) => (
        <div key={item} className="h-48 animate-pulse rounded-2xl border border-border bg-card" />
      ))}
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
