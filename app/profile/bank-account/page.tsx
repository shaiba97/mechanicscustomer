"use client";

import * as React from "react";
import { Banknote, Building2, Check, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocale } from "@/hooks/use-locale";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { errorMessage } from "@/lib/utils";

export type StoreBankAccount = {
  id: string;
  bankName: string;
  accountHolderName: string;
  iban: string;
  isVerified: boolean;
};

export default function StoreBankAccountPage() {
  const { t } = useLocale();
  const { user } = useAuth();
  const [store, setStore] = React.useState<StoreBankAccount | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<boolean>(false);

  const [formData, setFormData] = React.useState({
    bankName: "",
    accountHolderName: "",
    iban: "",
  });

  React.useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api
      .get<StoreBankAccount>("/api/store/bank-account")
      .then((data) => {
        if (!cancelled) setStore(data);
      })
      .catch(() => {
        if (!cancelled) setError(t("profile.failed"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user, t]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      const data = await api.post<StoreBankAccount>("/api/store/bank-account", {
        bankName: formData.bankName.trim(),
        accountHolderName: formData.accountHolderName.trim(),
        iban: formData.iban.trim(),
      });
      setSuccess(true);
      setSaving(false);
      if (data) setStore(data);
    } catch (err: unknown) {
      setError(errorMessage(err, t("profile.failed")));
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[600px] px-5 py-10 md:px-8 md:py-16">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-full bg-background">
            <Building2 className="size-4 text-primary" />
          </span>
          <div className="grid leading-none">
            <span className="text-sm font-semibold">{t("profile.bankAccount")}</span>
            <span className="text-[10px] font-medium text-muted-foreground">
              {t("profile.bankAccountDesc")}
            </span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="mt-8 flex items-center justify-center py-12">
          <span className="h-12 w-12 animate-pulse rounded-full bg-muted" />
        </div>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{t("profile.bankAccount")}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {t("profile.bankAccountDesc")}
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="bankName">{t("profile.bankName")}</Label>
                  <Input
                    id="bankName"
                    type="text"
                    value={formData.bankName}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, bankName: event.target.value }))}
                    placeholder={t("profile.bankNamePlaceholder")}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="accountHolderName">{t("profile.accountHolderName")}</Label>
                  <Input
                    id="accountHolderName"
                    type="text"
                    value={formData.accountHolderName}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        accountHolderName: event.target.value,
                      }))}
                    placeholder={t("profile.accountHolderNamePlaceholder")}
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="iban">{t("profile.iban")}</Label>
                  <Input
                    id="iban"
                    type="text"
                    value={formData.iban}
                    onChange={(event) =>
                      setFormData((prev) => ({ ...prev, iban: event.target.value.toUpperCase() }))}
                    placeholder={t("profile.ibanPlaceholder")}
                    dir="ltr"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || !formData.bankName || !formData.accountHolderName || !formData.iban}
                  className="w-full rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                >
                  {saving ? t("profile.saving") : t("profile.save")}
                </button>
              </form>
            </CardContent>
          </Card>

          {store && (
            <div className="mt-6 rounded-xl border border-border bg-card p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="grid size-9 place-items-center rounded-full bg-background">
                    <Building2 className="size-4 text-primary" />
                  </span>
                  <span className="text-sm font-bold text-foreground">{store.bankName}</span>
                </div>
                {store.isVerified ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 px-2 py-1 text-[10px] font-semibold">
                    <ShieldCheck className="size-3.5" />
                    {t("profile.verified")}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground">
                    <span className="text-[10px]">{t("profile.unverified")}</span>
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <div className="flex justify-between gap-3 text-sm">
                  <span className="text-muted-foreground">{t("profile.bankName")}</span>
                  <span className="font-medium">{store.bankName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {t("profile.accountHolderName")}
                  </span>
                  <span className="font-medium">{store.accountHolderName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    {t("profile.iban")}
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground" dir="ltr">
                    {store.iban}
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
