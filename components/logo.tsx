"use client";

import Link from "next/link";
import { cn } from "cn";
import { useLocale } from "@/hooks/use-locale";
import { AveroLogo } from "./avero-logo";

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
      aria-label={locale === "ar" ? "أفيرو — الرئيسية" : "Avero — Home"}
      className={cn("group inline-flex items-center gap-3", className)}
    >
      <span
        className={cn(
          "grid size-9 shrink-0 place-items-center rounded-[0.65rem] transition-transform duration-300 group-hover:-rotate-6",
          inverted ? "bg-white text-[#0A0A0A]" : "bg-foreground text-background",
        )}
      >
        <AveroLogo variant="mark" size="sm" inverted={inverted} />
      </span>
      {!compact ? (
        <span className="flex flex-col leading-none">
          <AveroLogo variant="wordmark" size="sm" locale={locale} inverted={inverted} />
        </span>
      ) : null}
    </Link>
  );
}
