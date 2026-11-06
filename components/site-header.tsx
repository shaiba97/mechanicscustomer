"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Heart,
  LogIn,
  Menu,
  Moon,
  Search,
  ShoppingBag,
  Sun,
  User,
  X,
} from "lucide-react";
import { cn } from "cn";
import { Logo } from "@/components/logo";
import { SignInMenu } from "@/components/sign-in-menu";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { useShop } from "@/hooks/use-shop";
import { useTheme } from "@/hooks/use-theme";
import { initials } from "@/lib/localized";

export function SiteHeader() {
  const pathname = usePathname();
  const { locale, setLocale, t } = useLocale();
  const { user, initializing, isAuthenticated } = useAuth();
  const { cartCount, wishlist } = useShop();
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const navItems = [
    { href: "/catalog", label: t("navCatalog") },
    { href: "/garage", label: t("navGarage") },
    { href: "/orders", label: t("navOrders") },
    { href: "/profile", label: t("navProfile") },
  ];

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b bg-background/90 backdrop-blur-xl transition-shadow duration-300",
          scrolled ? "border-border shadow-[0_10px_40px_-30px_rgba(0,0,0,.5)]" : "border-transparent",
        )}
      >
        <div className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center gap-4 px-5 md:h-[76px] md:px-8">
          <Logo />

          <nav className="ms-8 hidden items-center gap-1 lg:flex" aria-label={t("menu")}>
            {navItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-foreground text-background"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ms-auto flex items-center gap-1 sm:gap-1.5">
            <Link
              href="/catalog"
              aria-label={t("searchParts")}
              className="grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="size-[18px]" />
            </Link>

            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === "dark" ? t("lightMode") : t("darkMode")}
              className="hidden size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:grid"
            >
              {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
            </button>

            <button
              type="button"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="hidden h-9 items-center rounded-full border border-border px-3 text-[11px] font-semibold tracking-wider text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground sm:flex"
              aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
            >
              {locale === "ar" ? "EN" : "AR"}
            </button>

            <Link
              href="/catalog?wishlist=1"
              aria-label={t("wishlist")}
              className="relative grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Heart className="size-[19px]" />
              {wishlist.length > 0 ? (
                <span className="absolute end-1 top-1 size-2 rounded-full bg-foreground ring-2 ring-background" />
              ) : null}
            </Link>

            <Link
              href="/cart"
              aria-label={t("cart")}
              className="relative grid size-10 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ShoppingBag className="size-[19px]" />
              {cartCount > 0 ? (
                <span className="absolute -end-1 -top-1 grid min-w-5 place-items-center rounded-full bg-foreground px-1 text-[10px] font-semibold leading-5 text-background ring-2 ring-background">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            <div className="mx-1 hidden h-5 w-px bg-border sm:block" />

            {initializing ? (
              <span className="size-9 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated && user ? (
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-full border border-border py-1 pe-3 ps-1 transition-colors hover:border-foreground/30 sm:flex"
              >
                <span className="grid size-7 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                  {initials(user.fullName)}
                </span>
                <span className="max-w-24 truncate text-xs font-medium">
                  {user.fullName.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <div className="hidden sm:block">
                <SignInMenu />
              </div>
            )}

            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label={t("menu")}
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-full text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-[70] bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        className={cn(
          "fixed inset-y-0 end-0 z-[80] flex w-[88%] max-w-sm flex-col bg-background shadow-2xl transition-all duration-300 lg:hidden",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="flex h-[72px] items-center justify-between border-b px-5">
          <Logo />
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("closeMenu")}
            className="grid size-10 place-items-center rounded-full border border-border"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6">
          <Link
            href="/catalog"
            className="mb-6 flex h-12 items-center gap-3 rounded-2xl bg-foreground px-4 text-background"
          >
            <Search className="size-4" />
            <span className="text-sm font-semibold">{t("searchParts")}</span>
          </Link>

          <nav className="flex flex-col" aria-label={t("menu")}>
            <Link
              href="/"
              className="border-b border-border py-4 text-2xl font-semibold tracking-tight"
            >
              {t("navHome")}
            </Link>
            {navItems.map((item, index) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-baseline justify-between py-4 text-2xl font-semibold tracking-tight",
                  index < navItems.length - 1 && "border-b border-border",
                )}
              >
                {item.label}
                <span className="font-mono text-[10px] font-normal tracking-widest text-muted-foreground">
                  0{index + 2}
                </span>
              </Link>
            ))}
          </nav>

          <div className="mt-8 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
              className="flex h-12 items-center justify-center rounded-xl border border-border text-xs font-semibold"
            >
              {locale === "ar" ? "English" : "العربية"}
            </button>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border text-xs font-semibold"
            >
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              {theme === "dark" ? t("lightMode") : t("darkMode")}
            </button>
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-card p-5">
            {isAuthenticated && user ? (
              <>
                <p className="text-sm font-semibold">{user.fullName}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
                <Link
                  href="/profile"
                  className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-semibold text-background"
                >
                  <User className="size-4" />
                  {t("navProfile")}
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm font-semibold">{t("newHere")}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {t("authPanelDesc")}
                </p>
                <Link
                  href="/auth/login"
                  className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-semibold text-background"
                >
                  <LogIn className="size-4" />
                  {t("login")}
                </Link>
              </>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
