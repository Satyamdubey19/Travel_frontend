"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import api, { getApiErrorMessage } from "@/lib/axios";

const categories = ["SAFETY", "HARASSMENT", "MEDICAL", "TRANSPORT", "HOST_CONDUCT", "TRAVELER_CONDUCT", "LOST_PERSON", "PROPERTY", "OTHER"] as const;

export default function IncidentReportPanel({ bookingId, audience = "traveler" }: { bookingId: string; audience?: "traveler" | "host" }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const [form, setForm] = useState({ category: "SAFETY", severity: "MEDIUM", title: "", description: "", immediateDanger: false });

  const submit = async () => {
    if (form.title.trim().length < 10 || form.description.trim().length < 30) {
      setError("Add a clear title and at least 30 characters of factual detail.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const severity = form.immediateDanger && !["HIGH", "CRITICAL"].includes(form.severity) ? "HIGH" : form.severity;
      const { data } = await api.post<{ data: { referenceCode: string } }>("/incidents", { ...form, severity, bookingId, title: form.title.trim(), description: form.description.trim() });
      setReference(data.data.referenceCode);
      setOpen(false);
    } catch (cause) {
      setError(getApiErrorMessage(cause, "The incident report could not be submitted."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-[2rem] border border-rose-200 bg-white/90 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-rose-700"><ShieldAlert className="size-4" /> Private safety operations</p>
          <h2 className="mt-2 text-xl font-black text-slate-950">Report a trip incident</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Use this for a safety, medical, conduct, transport or property issue linked to this booking. Reports are visible to authorized operations staff, not the public community.</p>
        </div>
        <button type="button" onClick={() => setOpen((value) => !value)} className="min-h-11 shrink-0 rounded-2xl bg-rose-700 px-5 text-sm font-black text-white transition hover:bg-rose-800">{open ? "Close form" : "Report incident"}</button>
      </div>
      <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
        <p className="flex items-start gap-2 font-black"><AlertTriangle className="mt-0.5 size-4 shrink-0" /> If anyone is in immediate danger in India, call 112 and seek local emergency help first.</p>
        <p className="mt-1 pl-6 text-xs font-bold text-amber-800">Travels Pro records and escalates platform incidents; it is not an emergency-response or rescue service.</p>
      </div>
      {reference && <p role="status" className="mt-4 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm font-black text-emerald-800"><CheckCircle2 className="size-5" /> Submitted as {reference}. Keep this reference for follow-up.</p>}
      {error && <p role="alert" className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm font-bold text-rose-700">{error}</p>}
      {open && (
        <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-slate-700">Category<select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3">{categories.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm font-bold text-slate-700">Severity<select value={form.severity} onChange={(event) => setForm({ ...form, severity: event.target.value })} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 bg-white px-3">{["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="text-sm font-bold text-slate-700 sm:col-span-2">Short factual title<input maxLength={160} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder={audience === "host" ? "Example: Traveler missed the scheduled return check-in" : "Example: Unsafe vehicle condition before departure"} className="mt-2 min-h-12 w-full rounded-xl border border-slate-200 px-3" /></label>
          <label className="text-sm font-bold text-slate-700 sm:col-span-2">What happened?<textarea rows={6} maxLength={4000} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Describe what happened, when and where. Include actions already taken. Avoid unrelated identity or medical details." className="mt-2 w-full rounded-xl border border-slate-200 p-3 leading-6" /></label>
          <label className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-950 sm:col-span-2"><input type="checkbox" checked={form.immediateDanger} onChange={(event) => setForm({ ...form, immediateDanger: event.target.checked })} className="mt-1 size-4" /><span>Someone may be in immediate danger now. I understand I should contact 112/local emergency help first.</span></label>
          <button type="button" disabled={busy} onClick={() => void submit()} className="min-h-12 rounded-2xl bg-slate-950 px-5 font-black text-white disabled:opacity-50 sm:col-span-2">{busy ? "Submitting privately…" : "Submit private report"}</button>
        </div>
      )}
    </section>
  );
}
