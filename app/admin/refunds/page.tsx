"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";

type RefundRow = {
  id: string;
  product: "activity" | "rental";
  bookingCode: string;
  listingTitle: string;
  travelerName: string;
  travelerEmail: string;
  requestedAmount: number;
  approvedAmount: number | null;
  currency: string;
  status: string;
  reason: string | null;
  policySnapshot: string;
  providerRefundId: string | null;
  canExecute: boolean;
  failureReason: string | null;
  createdAt: string;
};

export default function AdminRefundsPage() {
  const [rows, setRows] = useState<RefundRow[]>([]);
  const [status, setStatus] = useState("REVIEW_PENDING");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get(`/admin/refunds?status=${status}`);
      setRows(data.data ?? []);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Refund queue could not be loaded"),
      );
    } finally {
      setLoading(false);
    }
  }, [status]);
  useEffect(() => {
    void load();
  }, [load]);
  const act = async (
    row: RefundRow,
    action: "approve" | "reject" | "execute" | "reconcile",
  ) => {
    if (
      action === "execute" &&
      !window.confirm(
        `Send the approved ${row.currency} ${row.approvedAmount?.toFixed(2)} refund to Razorpay now?`,
      )
    )
      return;
    setBusy(row.id);
    setError("");
    try {
      await api.patch(`/admin/refunds/${row.product}/${row.id}`, {
        action,
        approvedAmount:
          action === "approve"
            ? (amounts[row.id] ?? row.requestedAmount)
            : undefined,
        reason: reasons[row.id],
      });
      await load();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Refund operation failed"));
    } finally {
      setBusy(null);
    }
  };
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,.12),transparent_30%),#f8fafc] p-4 sm:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl">
          <p className="text-xs font-black uppercase tracking-[.2em] text-cyan-300">
            Payment operations
          </p>
          <h1 className="mt-2 text-3xl font-black">Refund control center</h1>
          <p className="mt-2 max-w-3xl text-sm text-slate-300">
            Review the captured cancellation policy, approve an exact amount,
            execute through Razorpay and reconcile delayed provider status.
            Every action is audited.
          </p>
        </header>
        <div className="flex gap-2 overflow-x-auto rounded-2xl bg-white/80 p-3 shadow-sm">
          {[
            "REVIEW_PENDING",
            "APPROVED",
            "PROCESSING",
            "FAILED",
            "COMPLETED",
            "REJECTED",
            "all",
          ].map((value) => (
            <button
              key={value}
              onClick={() => setStatus(value)}
              className={`rounded-full px-4 py-2 text-xs font-black ${status === value ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {value.replaceAll("_", " ")}
            </button>
          ))}
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
          <div className="space-y-3">
            {[1, 2, 3].map((v) => (
              <div
                key={v}
                className="h-52 animate-pulse rounded-3xl bg-white"
              />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-12 text-center">
            <CheckCircle2 className="mx-auto size-10 text-emerald-500" />
            <h2 className="mt-4 text-xl font-black">No refunds in this view</h2>
          </div>
        ) : (
          <section className="space-y-4">
            {rows.map((row) => (
              <article
                key={row.id}
                className="rounded-[2rem] border border-white bg-white/90 p-5 shadow-[0_18px_50px_rgba(15,23,42,.07)]"
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase text-cyan-800">
                        {row.product}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black">
                        {row.status.replaceAll("_", " ")}
                      </span>
                      <span className="text-xs text-slate-400">
                        {row.bookingCode}
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-black">
                      {row.listingTitle}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {row.travelerName} · {row.travelerEmail}
                    </p>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-black uppercase tracking-[.16em] text-slate-500">
                        Policy captured at cancellation
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {row.policySnapshot}
                      </p>
                      <p className="mt-3 text-sm">
                        <strong>Traveler reason:</strong>{" "}
                        {row.reason || "Not recorded"}
                      </p>
                    </div>
                    {row.failureReason && (
                      <p className="mt-3 flex items-start gap-2 text-sm font-semibold text-rose-700">
                        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
                        {row.failureReason}
                      </p>
                    )}
                    {row.providerRefundId && (
                      <p className="mt-3 text-xs text-slate-500">
                        Provider refund: {row.providerRefundId}
                      </p>
                    )}
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Requested</p>
                    <p className="text-3xl font-black">
                      ₹{row.requestedAmount.toLocaleString("en-IN")}
                    </p>
                    {row.approvedAmount != null && (
                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        Approved ₹{row.approvedAmount.toLocaleString("en-IN")}
                      </p>
                    )}
                    {row.status === "REVIEW_PENDING" && (
                      <>
                        <label className="mt-4 block text-xs font-black">
                          Approved amount
                          <input
                            type="number"
                            min="0.01"
                            max={row.requestedAmount}
                            step="0.01"
                            value={
                              amounts[row.id] ?? String(row.requestedAmount)
                            }
                            onChange={(e) =>
                              setAmounts((current) => ({
                                ...current,
                                [row.id]: e.target.value,
                              }))
                            }
                            className="mt-1 h-11 w-full rounded-xl border border-slate-200 bg-white px-3"
                          />
                        </label>
                        <label className="mt-3 block text-xs font-black">
                          Reason if rejecting
                          <textarea
                            value={reasons[row.id] ?? ""}
                            onChange={(e) =>
                              setReasons((current) => ({
                                ...current,
                                [row.id]: e.target.value,
                              }))
                            }
                            rows={2}
                            className="mt-1 w-full rounded-xl border border-slate-200 bg-white p-3"
                          />
                        </label>
                        <div className="mt-4 flex gap-2">
                          <button
                            disabled={busy === row.id}
                            onClick={() => void act(row, "approve")}
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-black text-white"
                          >
                            <CheckCircle2 className="size-4" />
                            Approve
                          </button>
                          <button
                            disabled={busy === row.id}
                            onClick={() => void act(row, "reject")}
                            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-black text-white"
                          >
                            <XCircle className="size-4" />
                            Reject
                          </button>
                        </div>
                      </>
                    )}
                    {["APPROVED", "FAILED"].includes(row.status) && (
                      <button
                        disabled={busy === row.id || !row.canExecute}
                        onClick={() => void act(row, "execute")}
                        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 text-sm font-black text-white disabled:opacity-50"
                      >
                        <CreditCard className="size-4" />
                        Execute refund
                      </button>
                    )}
                    {row.providerRefundId &&
                      ["PROCESSING", "FAILED"].includes(row.status) && (
                        <button
                          disabled={busy === row.id}
                          onClick={() => void act(row, "reconcile")}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black"
                        >
                          <RefreshCw className="size-4" />
                          Reconcile provider
                        </button>
                      )}
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
