"use client";

import Link from "next/link";
import { ArrowLeft, CarFront, Heart, PackageCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { useLocale } from "@/hooks/use-locale";

export function AuthShell({ children }: { children: React.ReactNode }) {
  const { t, locale } = useLocale();

  const points =
    locale === "ar"
      ? [
          "تابع طلباتك من التحضير حتى التسليم.",
          "احفظ سياراتك للوصول الأسرع إلى القطع.",
          "احتفظ بالقطع التي تهمك في مكان واحد.",
        ]
      : [
          "Follow orders from preparation to handover.",
          "Save your cars for faster parts matching.",
          "Keep the parts you care about in one place.",
        ];

  const icons = [PackageCheck, CarFront, Heart];

  return (
    <div className="mx-auto w-full max-w-[1160px] px-5 py-10 md:px-8 md:py-16">
      <Link
        href="/"
        className="mb-6 inline-flex items-center gap-2 text-[10px] text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-3.5 rtl:rotate-180" />
        {t("backHome")}
      </Link>

      <div className="grid overflow-hidden rounded-3xl border border-border bg-card lg:grid-cols-[1fr_1.05fr]">
        <aside className="relative hidden flex-col justify-between overflow-hidden bg-[#0A0A0A] p-10 text-white lg:flex">
          <div className="bg-grid pointer-events-none absolute inset-0 opacity-[0.14]" />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-24 -end-24 size-72 rounded-full border border-white/10"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -end-12 size-48 rounded-full border border-white/10"
          />

          <div className="relative">
            <Logo inverted />
          </div>

          <div className="relative mt-16">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/45">
              {t("authPanelEyebrow")}
            </p>
            <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-tight tracking-[-0.04em]">
              {t("authPanelTitle")}
            </h2>
            <p className="mt-4 max-w-sm text-xs leading-7 text-white/55">
              {t("authPanelDesc")}
            </p>

            <ul className="mt-8 space-y-4">
              {points.map((point, index) => {
                const Icon = icons[index];
                return (
                  <li key={point} className="flex items-start gap-3">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full border border-white/15 bg-white/5">
                      <Icon className="size-3.5 text-white/75" strokeWidth={1.5} />
                    </span>
                    <span className="pt-1.5 text-[11px] leading-5 text-white/65">{point}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="relative mt-16 flex items-center gap-3 text-[9px] uppercase tracking-[0.2em] text-white/35">
            <span className="h-px w-8 bg-white/20" />
            {t("madeInKsa")}
          </div>
        </aside>

        <div className="flex items-center px-6 py-9 sm:px-10 md:py-14 lg:px-14">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}
