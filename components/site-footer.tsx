"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "cn";
import { Logo } from "@/components/logo";
import { useLocale } from "@/hooks/use-locale";

export function SiteFooter() {
  const { locale, t } = useLocale();

  const shopLinks = [
    { href: "/catalog", label: t("allParts") },
    { href: "/catalog?wishlist=1", label: t("wishlist") },
    { href: "/catalog#vehicle-finder", label: t("vehicleSearch") },
    { href: "/cart", label: t("cart") },
  ];

  const accountLinks = [
    { href: "/profile", label: t("navProfile") },
    { href: "/orders", label: t("navOrders") },
    { href: "/garage", label: t("navGarage") },
    { href: "/auth/register", label: t("createOne") },
  ];

  const supportLinks = [
    { href: "/#how-it-works", label: t("howEyebrow") },
    { href: "/#assurance", label: t("assuranceEyebrow") },
    { href: "/#vehicle-finder", label: t("vehicleSearch") },
  ];

  return (
    <footer className="mt-auto bg-[#0A0A0A] text-white">
      <div className="mx-auto w-full max-w-[1440px] px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
          <div className="max-w-sm">
            <Logo inverted />
            <p className="mt-6 text-sm leading-7 text-white/55">{t("footerBlurb")}</p>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/15 px-3 py-1.5 text-[10px] font-medium tracking-[0.18em] text-white/55">
              <span className="size-1.5 rounded-full bg-white" />
              {t("madeInKsa")}
            </div>
          </div>

          <FooterColumn title={t("shopLinks")} links={shopLinks} />
          <FooterColumn title={t("accountLinks")} links={accountLinks} />
          <FooterColumn title={t("supportLinks")} links={supportLinks} />
        </div>

        <div className="mt-16 select-none overflow-hidden" aria-hidden="true">
          <p
            className={cn(
              "whitespace-nowrap text-[min(17vw,13rem)] font-semibold leading-[0.78] tracking-[-0.06em] text-white/[0.07]",
              locale === "ar" && "font-arabic tracking-normal",
            )}
          >
            {locale === "ar" ? "ميكانيك" : "MECHANIC"}
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-[11px] text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {locale === "ar" ? "ميكانيك" : "Mechanic"}.{" "}
            {t("footerRights")}.
          </p>
          <p className="font-mono tracking-wide">{t("paymentMethods")}</p>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: Array<{ href: string; label: string }>;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
        {title}
      </p>
      <ul className="mt-5 space-y-3.5">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="group inline-flex items-center gap-1.5 text-sm text-white/65 transition-colors hover:text-white"
            >
              {link.label}
              <ArrowUpRight className="size-3 opacity-0 transition-opacity group-hover:opacity-100" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
