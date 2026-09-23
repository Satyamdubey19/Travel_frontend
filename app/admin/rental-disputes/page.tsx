"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  FileSearch,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";

type Dispute = {
  id: string;
  stage: "PICKUP" | "RETURN";
  status: "DISPUTED" | "RESOLVED";
  odometerKm: number | null;
  fuelOrChargePercent: number | null;
  conditionNotes: string | null;
  damages: Array<{
    area: string;
    severity: string;
    description: string;
  }> | null;
  evidenceUrls: string[];
  disputeReason: string | null;
  disputedAt: string | null;
  resolution: string | null;
  resolutionNotes: string | null;
  resolvedAt: string | null;
  RentalBooking: {
    bookingCode: string;
    status: string;
    pickupDate: string;
    returnDate: string;
    User: { name: string; email: string };
    Host: { businessName: string };
    Rental: { title: string; city: string };
  };
};

const resolutions = [
  ["HOST_EVIDENCE_ACCEPTED", "Host evidence accepted"],
  ["TRAVELER_CLAIM_ACCEPTED", "Traveler claim accepted"],
  ["MUTUAL_SETTLEMENT", "Mutual settlement recorded"],
  ["NO_FINANCIAL_ACTION", "No financial action"],
] as const;

export default function RentalDisputesPage() {
  const [rows, setRows] = useState<Dispute[]>([]);
  const [status, setStatus] = useState("DISPUTED");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [forms, setForms] = useState<
    Record<string, { resolution: string; notes: string }>
  >({});
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get<{ data: Dispute[] }>(
        `/admin/rental-disputes?status=${status}`,
      );
      setRows(data.data);
    } catch (cause) {
      setError(
        getApiErrorMessage(cause, "Rental disputes could not be loaded"),
      );
    } finally {
      setLoading(false);
    }
  }, [status]);
  useEffect(() => {
    void load();
  }, [load]);
  const resolve = async (row: Dispute) => {
    const form = forms[row.id] ?? { resolution: "", notes: "" };
    if (!form.resolution || form.notes.trim().length < 20)
      return setError(
        "Choose an outcome and enter at least 20 characters of decision notes.",
      );
    if (
      !window.confirm(
        "Record this final evidence decision? This does not itself charge or refund either party.",
      )
    )
      return;
    setBusy(row.id);
    setError("");
    try {
      await api.patch(`/admin/rental-disputes/${row.id}`, form);
      await load();
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Dispute could not be resolved"));
    } finally {
      setBusy("");
    }
  };
  return (
    <main className="min-h-screen p-4 sm:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,.28),transparent_32%),#020617] p-7 text-white shadow-2xl sm:p-9">
          <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">
            Trust operations
          </p>
          <h1 className="mt-2 text-3xl font-black">Rental evidence disputes</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">
            Compare immutable pickup/return evidence and record a reasoned
            outcome. A resolution is an evidence decision only—refunds, deposit
            deductions and external claims require separate reviewed operations.
          </p>
        </header>
        <div className="flex gap-2 rounded-2xl bg-white/80 p-3 shadow-sm">
          {["DISPUTED", "RESOLVED", "ALL"].map((value) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={`rounded-full px-4 py-2 text-xs font-black ${status === value ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {value}
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
          <div className="grid min-h-64 place-items-center rounded-[2rem] bg-white">
            <Loader2 className="size-7 animate-spin text-cyan-600" />
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
            <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
            <h2 className="mt-3 text-xl font-black">
              No disputes in this view
            </h2>
          </div>
        ) : (
          <section className="space-y-5">
            {rows.map((row) => {
              const form = forms[row.id] ?? { resolution: "", notes: "" };
              return (
                <article
                  key={row.id}
                  className="rounded-[2rem] border border-white bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,.08)] sm:p-7"
                >
                  <div className="grid gap-6 xl:grid-cols-[1.25fr_.75fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-800">
                          {row.status}
                        </span>
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-800">
                          {row.stage}
                        </span>
                        <span className="text-xs text-slate-400">
                          {row.RentalBooking.bookingCode}
                        </span>
                      </div>
                      <h2 className="mt-3 text-xl font-black">
                        {row.RentalBooking.Rental.title}
                      </h2>
                      <p className="mt-1 text-sm text-slate-500">
                        {row.RentalBooking.Rental.city} · Traveler{" "}
                        {row.RentalBooking.User.name} · Host{" "}
                        {row.RentalBooking.Host.businessName}
                      </p>
                      <div className="mt-4 rounded-2xl border border-rose-100 bg-rose-50 p-4">
                        <p className="flex items-center gap-2 text-sm font-black text-rose-900">
                          <AlertTriangle className="size-4" />
                          Traveler-reported mismatch
                        </p>
                        <p className="mt-2 text-sm leading-6 text-rose-900">
                          {row.disputeReason}
                        </p>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <Metric
                          label="Odometer"
                          value={
                            row.odometerKm == null
                              ? "Not recorded"
                              : `${row.odometerKm.toLocaleString("en-IN")} km`
                          }
                        />
                        <Metric
                          label="Fuel/charge"
                          value={
                            row.fuelOrChargePercent == null
                              ? "Not recorded"
                              : `${row.fuelOrChargePercent}%`
                          }
                        />
                        <Metric
                          label="Booking"
                          value={row.RentalBooking.status}
                        />
                      </div>
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                          Host condition record
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {row.conditionNotes}
                        </p>
                        {row.damages?.map((damage, index) => (
                          <p key={index} className="mt-2 text-sm">
                            <strong>
                              {damage.area} · {damage.severity}:
                            </strong>{" "}
                            {damage.description}
                          </p>
                        ))}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {row.evidenceUrls.map((url, index) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="group relative aspect-square overflow-hidden rounded-2xl bg-slate-100"
                          >
                            <img
                              src={url}
                              alt={`Private condition evidence ${index + 1}`}
                              className="h-full w-full object-cover transition group-hover:scale-105"
                            />
                            <span className="absolute bottom-2 left-2 rounded-full bg-slate-950/75 px-2 py-1 text-[10px] font-black text-white">
                              Evidence {index + 1}
                            </span>
                          </a>
                        ))}
                      </div>
                    </div>
                    <aside className="h-fit rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      {row.status === "RESOLVED" ? (
                        <>
                          <p className="flex items-center gap-2 font-black text-emerald-800">
                            <ShieldCheck className="size-5" />
                            Resolved
                          </p>
                          <p className="mt-3 text-sm font-black">
                            {row.resolution?.replaceAll("_", " ")}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {row.resolutionNotes}
                          </p>
                          <p className="mt-3 text-xs text-slate-400">
                            {row.resolvedAt
                              ? new Date(row.resolvedAt).toLocaleString("en-IN")
                              : ""}
                          </p>
                        </>
                      ) : (
                        <>
                          <label className="block text-xs font-black">
                            Evidence outcome
                            <select
                              value={form.resolution}
                              onChange={(event) =>
                                setForms((current) => ({
                                  ...current,
                                  [row.id]: {
                                    ...form,
                                    resolution: event.target.value,
                                  },
                                }))
                              }
                              className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                            >
                              <option value="">Choose outcome</option>
                              {resolutions.map(([value, label]) => (
                                <option key={value} value={value}>
                                  {label}
                                </option>
                              ))}
                            </select>
                          </label>
                          <label className="mt-4 block text-xs font-black">
                            Decision notes
                            <textarea
                              value={form.notes}
                              onChange={(event) =>
                                setForms((current) => ({
                                  ...current,
                                  [row.id]: {
                                    ...form,
                                    notes: event.target.value,
                                  },
                                }))
                              }
                              rows={6}
                              className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm"
                              placeholder="Explain the evidence considered, decision, next steps and whether a separate financial review is needed."
                            />
                          </label>
                          <button
                            disabled={busy === row.id}
                            onClick={() => void resolve(row)}
                            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
                          >
                            {busy === row.id ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              <FileSearch className="size-4" />
                            )}
                            Record final decision
                          </button>
                        </>
                      )}
                    </aside>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-900">{value}</p>
    </div>
  );
}
