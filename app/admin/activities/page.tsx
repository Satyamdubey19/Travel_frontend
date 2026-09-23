"use client";
import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";
type Row = {
  id: string;
  title: string;
  ownerName: string;
  city: string;
  status: string;
  price: number;
  inventoryLabel: string;
  bookings: number;
  reviews: number;
  createdAt: string;
};
export default function AdminActivitiesPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState("PENDING_REVIEW");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        type: "activity",
        status,
        search: query,
        limit: "100",
      });
      const { data } = await api.get(`/admin/listings?${params}`);
      setRows(data.data ?? []);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Activity queue could not be loaded"),
      );
    } finally {
      setLoading(false);
    }
  }, [query, status]);
  useEffect(() => {
    void load();
  }, [load]);
  const decide = async (row: Row, next: string) => {
    const reason = notes[row.id]?.trim();
    if (!reason || reason.length < 5) {
      setError("Add a decision note of at least 5 characters.");
      return;
    }
    setBusy(row.id);
    try {
      await api.patch(`/admin/listings/activity/${row.id}`, {
        status: next,
        isActive: next === "ACTIVE",
        reason,
      });
      setRows((items) => items.filter((item) => item.id !== row.id));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Decision failed"));
    } finally {
      setBusy(null);
    }
  };
  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] bg-slate-950 p-7 text-white">
          <p className="text-xs font-black uppercase tracking-[.2em] text-emerald-300">
            Trust operations
          </p>
          <h1 className="mt-2 text-3xl font-black">Activity moderation</h1>
          <p className="mt-2 text-sm text-slate-300">
            Review local experience content, price, capacity and safety terms
            before publication.
          </p>
        </header>
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <label className="relative block">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search activity, host or city"
              className="h-12 w-full rounded-2xl border border-slate-200 pl-12 pr-4"
            />
          </label>
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {[
              "PENDING_REVIEW",
              "ACTIVE",
              "REJECTED",
              "PAUSED",
              "ARCHIVED",
              "all",
            ].map((value) => (
              <button
                key={value}
                onClick={() => setStatus(value)}
                className={`rounded-full px-4 py-2 text-xs font-black ${status === value ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"}`}
              >
                {value.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700"
          >
            {error}
          </p>
        )}
        {loading ? (
          <div className="h-72 animate-pulse rounded-3xl bg-white" />
        ) : rows.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
            <ShieldCheck className="mx-auto size-10 text-emerald-500" />
            <h2 className="mt-4 text-xl font-black">Queue is clear</h2>
          </div>
        ) : (
          <section className="space-y-4">
            {rows.map((row) => (
              <article
                key={row.id}
                className="rounded-[2rem] bg-white p-5 shadow-sm"
              >
                <div className="grid gap-5 lg:grid-cols-[1fr_auto]">
                  <div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-800">
                      {row.status.replaceAll("_", " ")}
                    </span>
                    <h2 className="mt-3 text-xl font-black">{row.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {row.ownerName} · {row.city}
                    </p>
                    <p className="mt-3 text-sm font-semibold">
                      ₹{row.price.toLocaleString("en-IN")} ·{" "}
                      {row.inventoryLabel} · {row.bookings} bookings ·{" "}
                      {row.reviews} reviews
                    </p>
                    <input
                      value={notes[row.id] ?? ""}
                      onChange={(e) =>
                        setNotes((current) => ({
                          ...current,
                          [row.id]: e.target.value,
                        }))
                      }
                      placeholder="Required audit note"
                      className="mt-4 h-11 w-full max-w-2xl rounded-xl border border-slate-200 px-3"
                    />
                  </div>
                  <div className="flex flex-wrap content-start gap-2">
                    <button
                      disabled={busy === row.id}
                      onClick={() => void decide(row, "ACTIVE")}
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white"
                    >
                      <CheckCircle2 className="size-4" />
                      Approve
                    </button>
                    <button
                      disabled={busy === row.id}
                      onClick={() => void decide(row, "REJECTED")}
                      className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white"
                    >
                      <XCircle className="size-4" />
                      Reject
                    </button>
                    <button
                      disabled={busy === row.id}
                      onClick={() => void decide(row, "PAUSED")}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-black text-amber-800"
                    >
                      <Clock3 className="size-4" />
                      Pause
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
