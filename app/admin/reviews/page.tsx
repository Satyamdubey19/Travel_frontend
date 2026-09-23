"use client";

import { useCallback, useEffect, useState } from "react";
import { Eye, EyeOff, MessageSquare, Star } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";

type Review = {
  id: string;
  target: string;
  rating: number;
  title: string | null;
  comment: string;
  response: string | null;
  isPublished: boolean;
  createdAt: string;
  User: { name: string };
  Host: { businessName: string } | null;
  listing: { title: string } | null;
};

export default function AdminReviewsPage() {
  const [rows, setRows] = useState<Review[]>([]),
    [filter, setFilter] = useState("ALL"),
    [loading, setLoading] = useState(true),
    [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [reasons, setReasons] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<{ data: Review[] }>(
        `/admin/reviews?status=${filter}`,
      );
      setRows(data.data);
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Reviews could not be loaded"));
    } finally {
      setLoading(false);
    }
  }, [filter]);
  useEffect(() => {
    void load();
  }, [load]);
  const moderate = async (row: Review) => {
    const reason = (reasons[row.id] ?? "").trim();
    if (reason.length < 10)
      return setError("Moderation notes must contain at least 10 characters.");
    setBusy(row.id);
    setError("");
    try {
      await api.patch(`/admin/reviews/${row.id}`, {
        isPublished: !row.isPublished,
        reason,
      });
      await load();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Review moderation failed"));
    } finally {
      setBusy("");
    }
  };
  return (
    <main className="min-h-screen p-4 sm:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,.24),transparent_32%),#020617] p-7 text-white shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-amber-300">
            Marketplace trust
          </p>
          <h1 className="mt-2 text-3xl font-black">
            Verified review moderation
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Every review is linked to a completed booking. Hide policy-breaking
            content with an auditable reason, restore it after review, and
            preserve legitimate criticism.
          </p>
        </header>
        <div className="flex gap-2 overflow-x-auto rounded-2xl bg-white/80 p-3">
          {["ALL", "PUBLISHED", "HIDDEN", "LOW_RATING"].map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`rounded-full px-4 py-2 text-xs font-black ${filter === value ? "bg-amber-500 text-slate-950" : "bg-slate-100 text-slate-600"}`}
            >
              {value.replaceAll("_", " ")}
            </button>
          ))}
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700"
          >
            {error}
          </p>
        )}
        {loading ? (
          <div className="h-64 animate-pulse rounded-[2rem] bg-white" />
        ) : rows.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
            <MessageSquare className="mx-auto size-10 text-slate-300" />
            <h2 className="mt-3 text-xl font-black">No reviews in this view</h2>
          </div>
        ) : (
          <section className="grid gap-5 xl:grid-cols-2">
            {rows.map((row) => (
              <article
                key={row.id}
                className="rounded-[2rem] border border-white bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,.07)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800">
                        {row.target}
                      </span>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${row.isPublished ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}
                      >
                        {row.isPublished ? "PUBLISHED" : "HIDDEN"}
                      </span>
                    </div>
                    <h2 className="mt-3 text-lg font-black">
                      {row.listing?.title ?? "Listing"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {row.User.name} · host{" "}
                      {row.Host?.businessName ?? "Unknown"}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-black text-amber-800">
                    <Star className="size-4 fill-amber-400 text-amber-400" />
                    {row.rating}
                  </span>
                </div>
                {row.title && <h3 className="mt-4 font-black">{row.title}</h3>}
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  {row.comment}
                </p>
                {row.response && (
                  <div className="mt-3 rounded-xl bg-slate-50 p-3 text-sm">
                    <strong>Host response:</strong> {row.response}
                  </div>
                )}
                <label className="mt-4 block text-xs font-black">
                  Moderation reason
                  <input
                    value={reasons[row.id] ?? ""}
                    onChange={(event) =>
                      setReasons((current) => ({
                        ...current,
                        [row.id]: event.target.value,
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                    placeholder={
                      row.isPublished
                        ? "Policy violated and evidence considered"
                        : "Reason content is safe to restore"
                    }
                  />
                </label>
                <button
                  disabled={busy === row.id}
                  onClick={() => void moderate(row)}
                  className={`mt-3 inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-black text-white disabled:opacity-50 ${row.isPublished ? "bg-rose-600" : "bg-emerald-600"}`}
                >
                  {row.isPublished ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                  {row.isPublished ? "Hide review" : "Restore review"}
                </button>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
