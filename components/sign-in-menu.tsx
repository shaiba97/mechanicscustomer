"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, LogIn, Smartphone } from "lucide-react";
import { cn } from "cn";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";
import { isValidSaudiPhone, normalizeSaudiPhone } from "@/lib/validators";

export function SignInMenu() {
  const router = useRouter();
  const { locale, t } = useLocale();
  const { authenticate, loading } = useAuth();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [open, setOpen] = React.useState(false);
  const [phone, setPhone] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!event.target) return;
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKeyDown);
    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(focusTimer);
    };
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!isValidSaudiPhone(phone)) {
      setError(t("auth.invalidPhone"));
      return;
    }
    try {
      await authenticate(normalizeSaudiPhone(phone));
      setOpen(false);
      setPhone("");
      const next = new URLSearchParams(window.location.search).get("next");
      if (next && next !== "/" && next.startsWith("/") && !next.startsWith("//")) {
        router.push(next);
      }
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : t("auth.failed"));
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-xs font-semibold text-background transition-opacity hover:opacity-85"
      >
        <LogIn className="size-4" />
        {t("login")}
      </button>

      <div
        role="dialog"
        aria-label={t("signIn")}
        className={cn(
          "absolute end-0 top-[calc(100%+10px)] z-50 w-[22rem] max-w-[calc(100vw-2.5rem)] origin-top rounded-2xl border border-border bg-background p-5 shadow-2xl transition-all duration-200",
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0",
        )}
      >
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {t("account")}
        </p>
        <h2 className="mt-2 text-lg font-semibold tracking-tight">{t("signIn")}</h2>
        <p className="mt-1 text-[11px] leading-5 text-muted-foreground">
          {t("auth.dropdownDesc")}
        </p>

        {error ? (
          <div className="mt-4 flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-2.5 text-[11px] leading-5 text-destructive">
            <AlertCircle className="mt-0.5 size-3.5 shrink-0" />
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
              {t("phoneNumber")}
            </span>
            <span className="flex h-11 items-center gap-2 rounded-xl border border-border bg-background pe-3 ps-3 transition-colors focus-within:border-foreground/40">
              <span className="flex items-center gap-1.5 border-e border-border pe-2.5 text-[11px] font-semibold text-muted-foreground">
                <Smartphone className="size-3.5" />
                +966
              </span>
              <input
                ref={inputRef}
                type="tel"
                required
                inputMode="tel"
                autoComplete="tel-national"
                dir="ltr"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder={locale === "ar" ? "05xxxxxxxx" : "0512345678"}
                className="h-full w-full bg-transparent text-xs outline-none placeholder:text-muted-foreground/60"
              />
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {t("auth.continueWithPhone")}
          </button>
        </form>

        <p className="mt-3 text-center text-[10px] leading-5 text-muted-foreground">
          {t("auth.autoSignupNote")}
        </p>
      </div>
    </div>
  );
}
