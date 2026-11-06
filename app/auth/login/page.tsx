"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Check, Loader2, XCircle } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { useAuth } from "@/hooks/use-auth";
import { useLocale } from "@/hooks/use-locale";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<AuthLoading />}>
      <LoginContent />
    </React.Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, locale } = useLocale();
  const { user, initializing, authenticate, loading, error } = useAuth();

  const nextParam = searchParams.get("next");
  const next =
    nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
      ? nextParam
      : "/";
  const [phone, setPhone] = React.useState("");
  const [mode, setMode] = React.useState<"signup" | "login">("signup");
  const [localError, setLocalError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!initializing && user) router.replace(next);
  }, [initializing, user, next, router]);

  // Detect if this is first visit (no user in session) → start with signup mode
  React.useEffect(() => {
    if (!initializing && user) {
      setMode("login");
    } else {
      setMode("signup");
    }
  }, [initializing, user]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLocalError(null);

    try {
      const result = await authenticate(phone.trim());
      setMode(result.mode === "login" ? "login" : "signup");

      if (result.ok) {
        // Auto-login after signup or existing login
        router.replace(next);
        return;
      }
      // Fallback error if backend returns ok:false
      setLocalError(t("auth_failed"));
    } catch (e: unknown) {
      setLocalError(e instanceof Error && e.message ? e.message : t("login_failed"));
    }
  };

  const loginHref = next === "/" ? "/auth" : `/auth?next=${encodeURIComponent(next)}`;

  return (
    <AuthShell>
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-foreground/30" />
        <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
          {t("account")}
        </p>
      </div>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
        {mode === "signup" ? t("createAccount") : t("signIn")}
      </h1>
      <p className="mt-2 text-xs leading-6 text-muted-foreground">
        {locale === "ar"
          ? mode === "signup"
            ? "أنشئ حسابك برقمphone طريقك للطلبات والمركبات."
            : "أدخل رقم هاتفك لمتابعة طلباتك ومركباتك."
          : mode === "signup"
            ? "Create your account with your phone number to track orders, save cars, and find compatible parts."
            : "Enter your phone number to continue to your orders and cars."}
      </p>

      {localError ? (
        <div className="mt-6 flex gap-2 rounded-xl border border-destructive/25 bg-destructive/5 p-3 text-[11px] leading-6 text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          {localError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="mt-7 space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-[10px] font-medium text-muted-foreground">
            {t("phoneNumber")}
          </span>
          <span className="relative block">
            <XCircle className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="tel"
              required
              autoComplete="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t("phonePlaceholder")}
              dir="ltr"
              className="h-11 w-full rounded-xl border border-border bg-background ps-10 pe-3 text-xs outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
            />
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-xs font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading ? t("loading") : mode === "signup" ? t("createAccount") : t("signIn")}
          {!loading ? <Check className="size-3.5 rtl:rotate-180" /> : null}
        </button>
      </form>

      <div className="mt-7 flex items-center justify-between border-t border-border pt-5 text-[11px]">
        <span className="text-muted-foreground">{t("newHere")}</span>
        {mode === "signup" ? (
          <Link
            href="/auth/login"
            className="font-semibold underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
          >
            {t("alreadyHaveAccount")}
          </Link>
        ) : (
          <>
            <span className="font-semibold underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground">
              {t("createAccount")}
            </span>
            <Link
              href="/auth/login"
              className="ml-2 font-semibold underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"
            >
              {t("signIn")}
            </Link>
          </>
        )}
      </div>
    </AuthShell>
  );
}

function AuthLoading() {
  return (
    <AuthShell>
      <div className="space-y-4">
        <div className="h-3 w-20 animate-pulse rounded-full bg-muted" />
        <div className="h-9 w-44 animate-pulse rounded-lg bg-muted" />
        <div className="h-11 animate-pulse rounded-xl bg-muted" />
        <div className="h-11 animate-pulse rounded-xl bg-muted" />
        <div className="h-24 animate-pulse rounded-xl bg-muted" />
      </div>
    </AuthShell>
  );
}