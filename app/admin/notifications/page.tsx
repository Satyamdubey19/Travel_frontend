"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  MailCheck,
  RefreshCw,
  RotateCcw,
  Send,
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";

type DeliveryStatus =
  | "PENDING"
  | "PROCESSING"
  | "DELIVERED"
  | "FAILED"
  | "DEAD_LETTER";
type Delivery = {
  id: string;
  channel: "EMAIL";
  status: DeliveryStatus;
  attempts: number;
  availableAt: string;
  lockedAt: string | null;
  deliveredAt: string | null;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
  Notification: { type: string; title: string };
  user: { name: string; emailHint: string };
};
type DeliveryResponse = {
  summary: {
    counts: Record<DeliveryStatus, number>;
    oldestActionableAt: string | null;
  };
  deliveries: Delivery[];
};

const statuses: Array<"ALL" | DeliveryStatus> = [
  "ALL",
  "PENDING",
  "PROCESSING",
  "FAILED",
  "DEAD_LETTER",
  "DELIVERED",
];

const statusStyles: Record<DeliveryStatus, string> = {
  PENDING: "border-amber-200 bg-amber-50 text-amber-800",
  PROCESSING: "border-cyan-200 bg-cyan-50 text-cyan-800",
  DELIVERED: "border-emerald-200 bg-emerald-50 text-emerald-800",
  FAILED: "border-orange-200 bg-orange-50 text-orange-800",
  DEAD_LETTER: "border-rose-200 bg-rose-50 text-rose-800",
};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function AdminNotificationDeliveriesPage() {
  const [data, setData] = useState<DeliveryResponse | null>(null);
  const [filter, setFilter] = useState<(typeof statuses)[number]>("ALL");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await api.get<{ data: DeliveryResponse }>(
        `/admin/notification-deliveries?status=${filter}`,
      );
      setData(response.data.data);
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Delivery health could not be loaded"));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void load();
  }, [load]);

  const actionable = useMemo(
    () =>
      (data?.summary.counts.PENDING ?? 0) +
      (data?.summary.counts.PROCESSING ?? 0) +
      (data?.summary.counts.FAILED ?? 0) +
      (data?.summary.counts.DEAD_LETTER ?? 0),
    [data],
  );

  const replay = async (delivery: Delivery) => {
    const reason = (reasons[delivery.id] ?? "").trim();
    if (reason.length < 10) {
      setError("Replay reason must contain at least 10 characters.");
      return;
    }
    setBusy(delivery.id);
    setError("");
    try {
      await api.patch(`/admin/notification-deliveries/${delivery.id}`, {
        action: "retry",
        reason,
      });
      setReasons((current) => ({ ...current, [delivery.id]: "" }));
      await load();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Delivery could not be queued again"));
    } finally {
      setBusy("");
    }
  };

  const cards = [
    {
      label: "Delivered",
      value: data?.summary.counts.DELIVERED ?? 0,
      icon: CheckCircle2,
      tone: "text-emerald-300",
    },
    {
      label: "Actionable",
      value: actionable,
      icon: Send,
      tone: "text-cyan-300",
    },
    {
      label: "Failed",
      value: data?.summary.counts.FAILED ?? 0,
      icon: AlertTriangle,
      tone: "text-orange-300",
    },
    {
      label: "Dead letter",
      value: data?.summary.counts.DEAD_LETTER ?? 0,
      icon: MailCheck,
      tone: "text-rose-300",
    },
  ];

  return (
    <main className="min-h-screen p-4 sm:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_15%,rgba(34,211,238,.25),transparent_26%),radial-gradient(circle_at_15%_85%,rgba(99,102,241,.24),transparent_32%),#020617] p-6 text-white shadow-2xl sm:p-8">
          <div className="pointer-events-none absolute -right-12 -top-12 size-44 rounded-full border border-cyan-300/20 motion-safe:animate-pulse" />
          <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">
                Communication control room
              </p>
              <h1 className="mt-2 text-3xl font-black sm:text-4xl">
                Notification delivery health
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
                See durable email attempts without exposing private notification
                messages. Failed deliveries can be queued again only with an
                auditable reason.
              </p>
            </div>
            <button
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-black backdrop-blur-xl transition hover:bg-white/20 disabled:opacity-50"
            >
              <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
              Refresh health
            </button>
          </div>
          <section className="relative mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map(({ label, value, icon: Icon, tone }) => (
              <div
                key={label}
                className="rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur-xl"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {label}
                  </span>
                  <Icon className={`size-5 ${tone}`} />
                </div>
                <p className="mt-3 text-3xl font-black tabular-nums">{value}</p>
              </div>
            ))}
          </section>
        </header>

        <section className="flex flex-col gap-3 rounded-[1.6rem] border border-white bg-white/75 p-3 shadow-[0_18px_50px_rgba(15,23,42,.06)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-black transition ${filter === status ? "bg-slate-950 text-white shadow-lg" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {status.replaceAll("_", " ")}
              </button>
            ))}
          </div>
          <p className="flex items-center gap-2 px-2 text-xs font-bold text-slate-500">
            <Clock3 className="size-4" /> Oldest actionable: {formatDate(data?.summary.oldestActionableAt ?? null)}
          </p>
        </section>

        {error && (
          <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700">
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-64 animate-pulse rounded-[2rem] bg-white/80" />
            ))}
          </div>
        ) : !data?.deliveries.length ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-12 text-center">
            <MailCheck className="mx-auto size-11 text-slate-300" />
            <h2 className="mt-4 text-xl font-black">No deliveries in this view</h2>
            <p className="mt-2 text-sm text-slate-500">The selected queue is clear.</p>
          </div>
        ) : (
          <section className="grid gap-4 xl:grid-cols-2">
            {data.deliveries.map((delivery) => {
              const replayable = delivery.status === "FAILED" || delivery.status === "DEAD_LETTER";
              return (
                <article
                  key={delivery.id}
                  className="rounded-[2rem] border border-white bg-white/90 p-5 shadow-[0_18px_55px_rgba(15,23,42,.07)] backdrop-blur-xl transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,.1)] motion-reduce:transform-none"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black ${statusStyles[delivery.status]}`}>
                        {delivery.status.replaceAll("_", " ")}
                      </span>
                      <h2 className="mt-3 text-lg font-black text-slate-950">
                        {delivery.Notification.title}
                      </h2>
                      <p className="mt-1 text-xs font-medium text-slate-500">
                        {delivery.Notification.type.replaceAll("_", " ")} · {delivery.channel}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-slate-950 px-3 py-2 text-right text-white">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Attempts</p>
                      <p className="text-xl font-black tabular-nums">{delivery.attempts}/5</p>
                    </div>
                  </div>

                  <dl className="mt-5 grid gap-3 rounded-2xl bg-slate-50 p-4 text-xs sm:grid-cols-2">
                    <div><dt className="font-bold text-slate-400">Recipient</dt><dd className="mt-1 font-black text-slate-700">{delivery.user.name} · {delivery.user.emailHint}</dd></div>
                    <div><dt className="font-bold text-slate-400">Created</dt><dd className="mt-1 font-black text-slate-700">{formatDate(delivery.createdAt)}</dd></div>
                    <div><dt className="font-bold text-slate-400">Next attempt</dt><dd className="mt-1 font-black text-slate-700">{formatDate(delivery.availableAt)}</dd></div>
                    <div><dt className="font-bold text-slate-400">Delivered</dt><dd className="mt-1 font-black text-slate-700">{formatDate(delivery.deliveredAt)}</dd></div>
                  </dl>

                  {delivery.lastError && (
                    <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50/70 p-3">
                      <p className="text-[10px] font-black uppercase tracking-wider text-rose-500">Last provider error</p>
                      <p className="mt-1 break-words text-xs leading-5 text-rose-800">{delivery.lastError}</p>
                    </div>
                  )}

                  {replayable && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <label className="block text-xs font-black text-slate-700">
                        Replay reason
                        <input
                          value={reasons[delivery.id] ?? ""}
                          onChange={(event) => setReasons((current) => ({ ...current, [delivery.id]: event.target.value }))}
                          maxLength={500}
                          placeholder="Provider issue reviewed; safe to retry"
                          className="mt-2 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
                        />
                      </label>
                      <button
                        onClick={() => void replay(delivery)}
                        disabled={busy === delivery.id}
                        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 px-4 text-xs font-black text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 motion-reduce:transform-none"
                      >
                        <RotateCcw className={`size-4 ${busy === delivery.id ? "animate-spin" : ""}`} />
                        Queue delivery again
                      </button>
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}
