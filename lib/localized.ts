import type { Locale } from "@/lib/i18n";

export type LocalizedValue =
  | string
  | {
      ar?: string | null;
      en?: string | null;
    }
  | null
  | undefined;

export function localize(value: LocalizedValue, locale: Locale, fallback = ""): string {
  if (!value) return fallback;
  if (typeof value === "string") return value;

  const preferred = locale === "ar" ? value.ar : value.en;
  return preferred || value.en || value.ar || fallback;
}

export const CONDITION_LABELS: Record<string, { ar: string; en: string }> = {
  OEM_ORIGINAL: { ar: "أصلي من المصنع", en: "OEM Original" },
  AFTERMARKET_COMMERCIAL: { ar: "بديل تجاري", en: "Aftermarket" },
  USED: { ar: "مستعمل مفحوص", en: "Inspected Used" },
};

export function conditionLabel(condition: string, locale: Locale): string {
  return CONDITION_LABELS[condition]?.[locale] ?? condition;
}

export function initials(name: string | null | undefined): string {
  if (!name) return "M";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}
