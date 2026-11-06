"use client";

import Link from "next/link";
import { cn } from "cn";
import { useLocale } from "@/hooks/use-locale";

type LogoProps = {
  className?: string;
  compact?: boolean;
  inverted?: boolean;
};

export function Logo({ className, compact = false, inverted = false }: LogoProps) {
  const { locale } = useLocale();

  return (
    <Link
      href="/"
      aria-label={locale === "ar" ? "ميكانيك — الرئيسية" : "Mechanic — Home"}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[0.65rem] transition-transform duration-300 group-hover:-rotate-6",
          inverted ? "bg-white text-[#0A0A0A]" : "bg-foreground text-background",
        )}
      >
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M5 18V7.5L12 13l7-5.5V18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <span
            className={cn(
              "text-[17px] font-semibold tracking-tight",
              locale === "ar" && "font-arabic",
            )}
          >
            {locale === "ar" ? "ميكانيك" : "Mechanic"}
          </span>
          <span
            className={cn(
              "mt-1 text-[9px] font-medium tracking-[0.26em]",
              inverted ? "text-white/55" : "text-muted-foreground",
            )}
          >
            {locale === "ar" ? "قطع غيار" : "PARTS"}
          </span>
        </span>
      ) : null}
    </Link>
  );
}
