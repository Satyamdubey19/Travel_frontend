"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Clock3, RefreshCw, ShieldAlert, UserRoundCheck } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";

type Status = "OPEN" | "TRIAGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type Incident = {
  id: string; referenceCode: string; category: string; severity: Severity; status: Status;
  title: string; description: string; immediateDanger: boolean; resolutionSummary: string | null;
  createdAt: string; updatedAt: string; ownerId: string | null;
  Reporter: { name: string; email: string }; Owner: { name: string; email: string } | null;
  Booking: { bookingCode: string; status: string }; Tour: { title: string; slug: string; status: string };
  Host: { businessName: string | null; isActive: boolean; isApproved: boolean };
  IncidentEvent: Array<{ id: string; action: string; note: string | null; oldStatus: Status | null; newStatus: Status | null; createdAt: string }>;
};

const filters = ["ACTIVE", "OPEN", "TRIAGED", "IN_PROGRESS", "RESOLVED", "CLOSED", "ALL"] as const;
const severityTone: Record<Severity, string> = { LOW: "bg-slate-100 text-slate-700", MEDIUM: "bg-amber-100 text-amber-800", HIGH: "bg-orange-100 text-orange-800", CRITICAL: "bg-rose-100 text-rose-800" };
const nextAction: Partial<Record<Status, string>> = { OPEN: "TRIAGE", TRIAGED: "START_INVESTIGATION", IN_PROGRESS: "RESOLVE", RESOLVED: "CLOSE" };

function date(value: string) { return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
function emailHint(value: string) { const [name, domain = ""] = value.split("@"); return `${name.slice(0, 2)}***@${domain}`; }

export default function AdminIncidentsPage() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("ACTIVE");
  const [items, setItems] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [notes, setNotes] = useState("");
  const [severity, setSeverity] = useState<Severity>("MEDIUM");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const selected = useMemo(() => items.find((item) => item.id === selectedId) ?? items[0] ?? null, [items, selectedId]);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const { data } = await api.get<{ data: Incident[] }>(`/admin/incidents?status=${filter}`); setItems(data.data); setSelectedId((current) => data.data.some((item) => item.id === current) ? current : (data.data[0]?.id ?? "")); }
    catch (cause) { setError(getApiErrorMessage(cause, "Incident queue could not be loaded.")); }
    finally { setLoading(false); }
  }, [filter]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { if (selected) setSeverity(selected.severity); }, [selected]);

  const act = async (action: string) => {
    if (!selected || notes.trim().length < (action === "RESOLVE" || action === "CLOSE" ? 40 : 20)) { setError(`${action === "RESOLVE" || action === "CLOSE" ? "Resolution" : "Action"} notes need more factual detail.`); return; }
    if (["PAUSE_TOUR", "SUSPEND_HOST"].includes(action) && !window.confirm("This restricts live marketplace supply and will be audited. Continue?")) return;
    setBusy(action); setError("");
    try { await api.patch(`/admin/incidents/${selected.id}`, { action, notes: notes.trim(), severity }); setNotes(""); await load(); }
    catch (cause) { setError(getApiErrorMessage(cause, "Incident action could not be saved.")); }
    finally { setBusy(""); }
  };

  const counts = useMemo(() => ({ critical: items.filter((item) => item.severity === "CRITICAL").length, unowned: items.filter((item) => !item.ownerId).length }), [items]);
  return (
    <main className="min-h-screen p-4 sm:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_85%_15%,rgba(244,63,94,.24),transparent_30%),radial-gradient(circle_at_10%_90%,rgba(6,182,212,.18),transparent_34%),#020617] p-6 text-white shadow-2xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[.22em] text-rose-300">Private operations · India MVP</p>
          <div className="mt-2 flex flex-col justify-between gap-5 lg:flex-row lg:items-end"><div><h1 className="text-3xl font-black sm:text-4xl">Safety incident control room</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Triage reports, record reasoned decisions and restrict supply when required. This queue supports operations; it does not replace 112 or local emergency services.</p></div><button onClick={() => void load()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-4 text-sm font-black backdrop-blur-xl"><RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />Refresh</button></div>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">{[{ label: "In this view", value: items.length, icon: ShieldAlert }, { label: "Critical", value: counts.critical, icon: AlertTriangle }, { label: "Unassigned", value: counts.unowned, icon: UserRoundCheck }].map(({ label, value, icon: Icon }) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[.07] p-4 backdrop-blur-xl"><div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-slate-400"><span>{label}</span><Icon className="size-5 text-cyan-300" /></div><p className="mt-3 text-3xl font-black">{value}</p></div>)}</div>
        </header>

        <div className="flex gap-2 overflow-x-auto rounded-2xl border border-white bg-white/80 p-3">{filters.map((item) => <button key={item} onClick={() => setFilter(item)} className={`min-h-10 shrink-0 rounded-full px-4 text-xs font-black ${filter === item ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600"}`}>{item.replaceAll("_", " ")}</button>)}</div>
        {error && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-bold text-rose-700">{error}</p>}
        {loading ? <div className="h-96 animate-pulse rounded-[2rem] bg-white/80" /> : !items.length ? <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white/80 p-12 text-center"><ShieldAlert className="mx-auto size-11 text-slate-300" /><h2 className="mt-4 text-xl font-black">No incidents in this view</h2></div> : (
          <div className="grid gap-5 xl:grid-cols-[23rem_1fr]">
            <aside className="space-y-3">{items.map((item) => <button key={item.id} onClick={() => setSelectedId(item.id)} className={`w-full rounded-3xl border p-4 text-left transition ${selected?.id === item.id ? "border-cyan-300 bg-white shadow-xl" : "border-white bg-white/75 hover:bg-white"}`}><div className="flex items-center justify-between gap-2"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${severityTone[item.severity]}`}>{item.severity}</span><span className="text-[10px] font-black text-slate-400">{item.status.replaceAll("_", " ")}</span></div><p className="mt-3 text-sm font-black text-slate-950">{item.title}</p><p className="mt-1 text-xs font-bold text-cyan-700">{item.referenceCode}</p><p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400"><Clock3 className="size-3" />{date(item.createdAt)}</p></button>)}</aside>
            {selected && <section className="rounded-[2rem] border border-white bg-white/90 p-5 shadow-xl sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[.16em] text-cyan-700">{selected.referenceCode} · {selected.category.replaceAll("_", " ")}</p><h2 className="mt-2 text-2xl font-black">{selected.title}</h2><p className="mt-2 text-sm text-slate-500">Booking {selected.Booking.bookingCode} · {selected.Tour.title}</p></div><span className={`rounded-full px-3 py-2 text-xs font-black ${severityTone[selected.severity]}`}>{selected.severity} · {selected.status.replaceAll("_", " ")}</span></div>
              {selected.immediateDanger && <p className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-black text-rose-800">Reporter marked possible immediate danger. Confirm that local emergency help was contacted; the platform is not an emergency service.</p>}
              <div className="mt-5 grid gap-4 sm:grid-cols-2"><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase text-slate-400">Reporter</p><p className="mt-2 font-black">{selected.Reporter.name}</p><p className="text-xs text-slate-500">{emailHint(selected.Reporter.email)}</p></div><div className="rounded-2xl bg-slate-50 p-4"><p className="text-xs font-black uppercase text-slate-400">Ownership</p><p className="mt-2 font-black">{selected.Owner?.name ?? "Unassigned"}</p><p className="text-xs text-slate-500">Host: {selected.Host.businessName ?? "Individual host"}</p></div></div>
              <div className="mt-5 rounded-2xl border border-slate-200 p-5"><p className="text-xs font-black uppercase tracking-wider text-slate-400">Private report</p><p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{selected.description}</p></div>
              <div className="mt-6"><h3 className="font-black">Evidence-preserving history</h3><div className="mt-3 space-y-3">{selected.IncidentEvent.map((event) => <div key={event.id} className="rounded-2xl bg-slate-50 p-4"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm">{event.action.replaceAll("_", " ")}</strong><span className="text-xs text-slate-400">{date(event.createdAt)}</span></div>{event.note && <p className="mt-2 text-sm leading-6 text-slate-600">{event.note}</p>}</div>)}</div></div>
              <div className="mt-6 border-t border-slate-100 pt-6"><div className="grid gap-3 sm:grid-cols-[12rem_1fr]"><label className="text-sm font-bold">Severity<select value={severity} onChange={(event) => setSeverity(event.target.value as Severity)} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3">{["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((value) => <option key={value}>{value}</option>)}</select></label><label className="text-sm font-bold">Required decision notes<textarea rows={4} maxLength={4000} value={notes} onChange={(event) => setNotes(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 p-3" placeholder="Record facts reviewed, decision, owner and next step. Do not add unrelated personal data." /></label></div>
                <div className="mt-4 flex flex-wrap gap-2"><button disabled={Boolean(busy) || Boolean(selected.ownerId)} onClick={() => void act("ASSIGN_SELF")} className="min-h-11 rounded-xl bg-cyan-700 px-4 text-xs font-black text-white disabled:opacity-40">Assign to me</button>{nextAction[selected.status] && <button disabled={Boolean(busy)} onClick={() => void act(nextAction[selected.status]!)} className="min-h-11 rounded-xl bg-slate-950 px-4 text-xs font-black text-white disabled:opacity-40">{nextAction[selected.status]!.replaceAll("_", " ")}</button>}<button disabled={Boolean(busy)} onClick={() => void act("ADD_NOTE")} className="min-h-11 rounded-xl border border-slate-200 px-4 text-xs font-black">Add note</button><button disabled={Boolean(busy) || selected.Tour.status === "PAUSED"} onClick={() => void act("PAUSE_TOUR")} className="min-h-11 rounded-xl border border-orange-200 bg-orange-50 px-4 text-xs font-black text-orange-800 disabled:opacity-40">Pause tour</button><button disabled={Boolean(busy) || !selected.Host.isActive} onClick={() => void act("SUSPEND_HOST")} className="min-h-11 rounded-xl border border-rose-200 bg-rose-50 px-4 text-xs font-black text-rose-800 disabled:opacity-40">Suspend host</button></div>
              </div>
            </section>}
          </div>
        )}
      </div>
    </main>
  );
}
