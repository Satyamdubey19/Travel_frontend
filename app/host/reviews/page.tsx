"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  MessageSquare,
  Send,
  Star,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import {
  HostEmptyState,
  HostPage,
  HostPill,
  HostSection,
  HostStatCard,
} from "@/components/host/HostUI";
import Spinner from "@/components/ui/Spinner";
import api, { getApiErrorMessage } from "@/lib/axios";

type Review = {
  id: string;
  target: "TOUR" | "ACTIVITY" | "RENTAL";
  rating: number;
  title: string | null;
  comment: string;
  response: string | null;
  responseAt: string | null;
  isPublished: boolean;
  createdAt: string;
  User: { name: string };
  listing: { title: string } | null;
};
type Stats = {
  averageRating: number;
  totalReviews: number;
  positive: number;
  neutral: number;
  negative: number;
};

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]),
    [stats, setStats] = useState<Stats>({
      averageRating: 0,
      totalReviews: 0,
      positive: 0,
      neutral: 0,
      negative: 0,
    }),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [drafts, setDrafts] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<{
        data: Review[];
        meta: { stats: Stats };
      }>("/host/reviews");
      setReviews(data.data);
      setStats(data.meta.stats);
      setDrafts(
        Object.fromEntries(
          data.data.map((row) => [row.id, row.response ?? ""]),
        ),
      );
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Reviews could not be loaded"));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const distribution = useMemo(
    () =>
      [5, 4, 3, 2, 1].map((star) => {
        const count = reviews.filter((row) => row.rating === star).length;
        return {
          star,
          count,
          pct: reviews.length ? Math.round((count / reviews.length) * 100) : 0,
        };
      }),
    [reviews],
  );
  const respond = async (review: Review) => {
    const response = (drafts[review.id] ?? "").trim();
    if (response.length < 10)
      return setError("A public response must contain at least 10 characters.");
    setBusy(review.id);
    setError("");
    try {
      await api.put(`/host/reviews/${review.id}/response`, { response });
      await load();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Response could not be published"));
    } finally {
      setBusy("");
    }
  };
  if (loading) return <Spinner minimal />;
  return (
    <HostPage
      eyebrow="Reputation"
      title="Guest Reviews"
      description="Verified booking feedback across every listing, with truthful aggregates and one accountable host response."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HostStatCard
          label="Average rating"
          value={`${stats.averageRating}/5`}
          hint="All verified reviews"
          tone="amber"
          icon={<Star className="h-5 w-5" />}
        />
        <HostStatCard
          label="Total reviews"
          value={stats.totalReviews}
          tone="cyan"
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <HostStatCard
          label="Positive"
          value={stats.positive}
          hint="4–5 stars"
          tone="emerald"
          icon={<ThumbsUp className="h-5 w-5" />}
        />
        <HostStatCard
          label="Needs attention"
          value={stats.negative}
          hint="1–2 stars"
          tone="rose"
          icon={<ThumbsDown className="h-5 w-5" />}
        />
      </section>
      {error && (
        <p
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700"
        >
          {error}
        </p>
      )}
      <HostSection title="Rating breakdown" eyebrow="Stored distribution">
        <div className="space-y-3 p-5">
          {distribution.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-3">
              <div className="flex w-12 items-center gap-1 text-sm font-semibold">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                {star}
              </div>
              <div className="flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-2 rounded-full bg-amber-400 transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-16 text-right text-xs font-semibold text-slate-500">
                {count} · {pct}%
              </span>
            </div>
          ))}
        </div>
      </HostSection>
      <HostSection title="Verified guest feedback" eyebrow="Public reputation">
        {reviews.length === 0 ? (
          <HostEmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title="No reviews yet"
            description="Completed travelers can leave booking-linked reviews. Nothing is simulated here."
          />
        ) : (
          <div className="divide-y divide-slate-100">
            {reviews.map((review) => (
              <article key={review.id} className="p-5 sm:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-black text-slate-950">
                        {review.User.name}
                      </p>
                      <HostPill tone="emerald">Verified booking</HostPill>
                      {!review.isPublished && (
                        <HostPill tone="rose">Hidden by moderation</HostPill>
                      )}
                    </div>
                    <p className="mt-1 text-xs font-bold uppercase tracking-wide text-cyan-700">
                      {review.target} · {review.listing?.title ?? "Listing"}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-800">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {review.rating}
                  </span>
                </div>
                {review.title && (
                  <h3 className="mt-4 font-black">{review.title}</h3>
                )}
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {review.comment}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {new Date(review.createdAt).toLocaleDateString("en-IN")}
                </p>
                {review.isPublished ? (
                  <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                    <label className="text-xs font-black uppercase tracking-wide text-slate-500">
                      Your public response
                      <textarea
                        value={drafts[review.id] ?? ""}
                        onChange={(event) =>
                          setDrafts((current) => ({
                            ...current,
                            [review.id]: event.target.value,
                          }))
                        }
                        rows={3}
                        maxLength={1000}
                        className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm normal-case tracking-normal"
                        placeholder="Acknowledge the guest and explain what you improved."
                      />
                    </label>
                    <div className="mt-3 flex items-center justify-between gap-3">
                      <p className="text-xs text-slate-400">
                        {review.responseAt
                          ? `Last updated ${new Date(review.responseAt).toLocaleString("en-IN")}`
                          : "No response yet"}
                      </p>
                      <button
                        disabled={busy === review.id}
                        onClick={() => void respond(review)}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-black text-white disabled:opacity-50"
                      >
                        {busy === review.id ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <Send className="size-4" />
                        )}
                        {review.response
                          ? "Update response"
                          : "Publish response"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 text-xs font-semibold text-rose-700">
                    Public response is disabled while the review is hidden.
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </HostSection>
    </HostPage>
  );
}
