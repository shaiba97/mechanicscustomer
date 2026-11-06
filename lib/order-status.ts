import type { Bilingual, Locale } from "@/lib/i18n";

export const ORDER_STATUS_LABELS: Record<string, Bilingual> = {
  pending: { ar: "قيد الانتظار", en: "Pending" },
  store_preparing: { ar: "المتجر يحضر الطلب", en: "Store preparing" },
  delivery_assigned: { ar: "تم تعيين سائق", en: "Driver assigned" },
  out_for_delivery: { ar: "قيد التوصيل الذاتي", en: "Out for Self-Delivery" },
  otp_generated: { ar: "رمز التسليم جاهز", en: "Handover code ready" },
  completed: { ar: "مكتمل", en: "Completed" },
  cancelled: { ar: "ملغي", en: "Cancelled" },
};

export const PAYMENT_STATUS_LABELS: Record<string, Bilingual> = {
  unpaid: { ar: "غير مدفوع", en: "Unpaid" },
  paid: { ar: "مدفوع", en: "Paid" },
  failed: { ar: "فشل الدفع", en: "Payment failed" },
  refunded: { ar: "مسترجع", en: "Refunded" },
};

/**
 * The customer-facing delivery tracker collapses the backend lifecycle into
 * four visual steps. Multiple backend statuses can map onto one step, e.g.
 * `delivery_assigned`, `out_for_delivery` and `otp_generated` are all shown
 * as step 3 (driver has the order; the handover PIN appears once generated).
 */
export const DELIVERY_STEPS: Array<{
  id: string;
  label: Bilingual;
  statuses: string[];
}> = [
  {
    id: "confirmed",
    label: {
      ar: "تم تأكيد الطلب ودفعه عبر مدى",
      en: "Order Confirmed & Paid via Mada",
    },
    statuses: ["pending"],
  },
  {
    id: "preparing",
    label: { ar: "التجهيز والتغليف", en: "Store Preparing & Packaging" },
    statuses: ["store_preparing"],
  },
  {
    id: "out_for_delivery",
    label: { ar: "قيد التوصيل الذاتي", en: "Out for Self-Delivery" },
    statuses: ["delivery_assigned", "out_for_delivery", "otp_generated"],
  },
  {
    id: "delivered",
    label: { ar: "تم التسليم والتأكيد", en: "Delivered & Confirmed" },
    statuses: ["completed"],
  },
];

export function orderStatusLabel(status: string, locale: Locale) {
  return ORDER_STATUS_LABELS[status]?.[locale] ?? status;
}

export function paymentStatusLabel(status: string, locale: Locale) {
  return PAYMENT_STATUS_LABELS[status]?.[locale] ?? status;
}

export function deliveryStepIndex(status: string) {
  const step = DELIVERY_STEPS.find((item) => item.statuses.includes(status));
  return step ? DELIVERY_STEPS.indexOf(step) : -1;
}

export function isDeliveryStepActive(status: string, stepIndex: number) {
  const step = DELIVERY_STEPS[stepIndex];
  return step ? step.statuses.includes(status) : false;
}

export function isDeliveryStepDone(status: string, stepIndex: number) {
  const current = deliveryStepIndex(status);
  return current !== -1 && current > stepIndex;
}
