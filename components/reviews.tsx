"use client";

import * as React from "react";
import { AlertCircle, Check, Loader2, MessageSquare, Pencil } from "lucide-react";
import { RatingStars } from "@/components/rating-stars";
import { useAuth } from "@/hooks/use-auth";
import { fetchPartReviews, upsertReview, type ReviewPayload } from "@/hooks/use-reviews";
import type { Order } from "@/hooks/use-orders";
import { useLocale } from "@/hooks/use-locale";
import { errorMessage } from "@/lib/utils";

export function ReviewSection({ order }: { order: Order }) {
  const { t, locale } = useLocale();
  const { user } = useAuth();

  return (
    <div>
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-full bg-background">
          <MessageSquare className="size-4" />
        </span>
        <h2 className="text-sm font-semibold">{t("reviews.title")}</h2>
      </div>
      <p className="mt-3 text-[10px] leading-5 text-muted-foreground">{t("reviews.yourRating")}</p>
      <div className="mt-3 space-y-3">
        {(order?.items || []).map((item) => (
          <ItemReviewCard key={item.id} orderItem={item} userId={user?.id ?? null} locale={locale} />
        ))}
      </div>
    </div>
  );
}

function ItemReviewCard({
  orderItem,
  userId,
  locale,
}: {
  orderItem: { id: string; inventory_item_id: string; part_name: string };
  userId: string | null;
  locale: "ar" | "en";
}) {
  const { t } = useLocale();
  const [state, setState] = React.useState<{
    loading: boolean;
    mine: ReviewPayload | null;
    error: string | null;
  }>({ loading: true, mine: null, error: null });

  const load = React.useCallback(async () => {
    setState({ loading: true, mine: null, error: null });
    try {
      const res = await fetchPartReviews(orderItem.inventory_item_id);
      const mine = userId ? res.results.find((review) => review.user_id === userId) ?? null : null;
      setState({ loading: false, mine, error: null });
    } catch (err: unknown) {
      setState({ loading: false, mine: null, error: errorMessage(err, t("reviews.failed")) });
    }
  }, [orderItem.inventory_item_id, userId]);

  React.useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <p className="truncate text-[11px] font-medium">{orderItem.part_name}</p>
      <p className="mt-0.5 font-mono text-[9px] text-muted-foreground">{orderItem.inventory_item_id.slice(0, 8)}</p>
      {state.loading ? (
        <div className="mt-3 flex items-center gap-2 text-[10px] text-muted-foreground">
          <Loader2 className="size-3 animate-spin" />
          {t("loading")}
        </div>
      ) : state.error ? (
        <p className="mt-3 flex items-center gap-1.5 text-[10px] text-destructive">
          <AlertCircle className="size-3" />
          {state.error}
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          {state.mine ? (
            <div className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-3">
                <RatingStars value={state.mine.rating} size={13} />
                <button
                  type="button"
                  onClick={() => setState({ loading: false, mine: null, error: null })}
                  className="flex items-center gap-1 text-[10px] font-semibold text-muted-foreground underline decoration-border underline-offset-4 hover:text-foreground"
                >
                  <Pencil className="size-3" />
                  {t("reviews.editMine")}
                </button>
              </div>
              {state.mine.comment ? (
                <p className="mt-2 text-[11px] leading-5 text-muted-foreground">{state.mine.comment}</p>
              ) : null}
            </div>
          ) : (
            <ReviewForm
              orderItemId={orderItem.id}
              saved={() => {
                setState({ loading: false, mine: null, error: null });
                void load();
              }}
              locale={locale}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function ReviewForm({
  orderItemId,
  saved,
  locale,
}: {
  orderItemId: string;
  saved: () => void;
  locale: "ar" | "en";
}) {
  const { t } = useLocale();
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [savedFlash, setSavedFlash] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaving(true);
    try {
      await upsertReview({ orderItemId, rating, comment: comment.trim() });
      setSavedFlash(true);
      saved();
    } catch (err: unknown) {
      setError(errorMessage(err, t("reviews.failed")));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {savedFlash ? (
        <p className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-700">
          <Check className="size-3" />
          {t("reviews.saved")}
        </p>
      ) : null}
      {error ? (
        <p className="flex items-center gap-1.5 text-[10px] text-destructive">
          <AlertCircle className="size-3" />
          {error}
        </p>
      ) : null}
      <RatingStars value={rating} size={20} interactive onChange={setRating} />
      <textarea
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder={t("reviews.commentPlaceholder")}
        rows={3}
        maxLength={1000}
        className="w-full resize-none rounded-xl border border-border bg-background p-3 text-[11px] leading-5 outline-none transition-colors placeholder:text-muted-foreground/60 focus:border-foreground/40"
        aria-label={t("reviews.comment")}
      />
      <button
        type="submit"
        disabled={saving}
        className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-foreground text-[11px] font-semibold text-background transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {saving && locale ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            {t("reviews.updating")}
          </>
        ) : (
          t("reviews.submit")
        )}
      </button>
    </form>
  );
}

export function PartReviews({ partId }: { partId: string }) {
  const { t, locale } = useLocale();
  const [state, setState] = React.useState<{
    loading: boolean;
    data: ReviewPayload[] | null;
    average: number | null;
    count: number;
    error: string | null;
  }>({ loading: true, data: null, average: null, count: 0, error: null });

  React.useEffect(() => {
    let cancelled = false;
    setState({ loading: true, data: null, average: null, count: 0, error: null });
    fetchPartReviews(partId)
      .then((res) => {
        if (cancelled) return;
        setState({ loading: false, data: res.results, average: res.average, count: res.count, error: null });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setState({ loading: false, data: null, average: null, count: 0, error: errorMessage(err, t("reviews.failed")) });
      });
    return () => {
      cancelled = true;
    };
  }, [partId, t]);

  if (state.loading) {
    return (
      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        {t("loading")}
      </div>
    );
  }

  if (state.error) {
    return (
      <p className="flex items-center gap-1.5 text-[10px] text-destructive">
        <AlertCircle className="size-3" />
        {state.error}
      </p>
    );
  }

  if (!state.data || state.count === 0) {
    return <p className="text-[11px] leading-6 text-muted-foreground">{t("reviews.empty")}</p>;
  }

  return (
    <div className="space-y-3">
      {state.average !== null ? (
        <div className="flex items-center gap-2">
          <RatingStars value={Math.round(state.average)} size={14} />
          <span className="text-[11px] font-medium">
            {state.average} · <span className="text-muted-foreground">{state.count}</span>
          </span>
        </div>
      ) : null}
      {state.data.map((review) => (
        <div key={review.id} className="rounded-xl border border-border bg-background p-3.5">
          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-[11px] font-medium">{review.user_name}</span>
            <span className="shrink-0 text-[9px] text-muted-foreground">
              {formatShortDate(review.created_at, locale)}
            </span>
          </div>
          <div className="mt-1.5">
            <RatingStars value={review.rating} size={12} />
          </div>
          {review.comment ? (
            <p className="mt-1.5 text-[11px] leading-5 text-muted-foreground">{review.comment}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function formatShortDate(value: string, locale: "ar" | "en") {
  return new Intl.DateTimeFormat(locale === "ar" ? "ar-SA-u-ca-gregory" : "en-SA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}
