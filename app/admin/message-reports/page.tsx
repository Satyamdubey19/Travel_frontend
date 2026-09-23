"use client"

import { useCallback, useEffect, useState } from "react"
import { Flag, MessageSquareWarning, ShieldCheck } from "lucide-react"
import api, { getApiErrorMessage } from "@/lib/axios"

type ReportStatus = "OPEN" | "IN_REVIEW" | "ACTIONED" | "DISMISSED"

type MessageReport = {
  id: string
  reason: string
  details: string | null
  status: ReportStatus
  resolutionNotes: string | null
  reviewedAt: string | null
  createdAt: string
  Tour: { id: string; title: string }
  Reporter: { id: string; name: string }
  ReportedUser: { id: string; name: string }
  Message: { id: string; message: string | null; messageType: string; createdAt: string; deletedAt: string | null }
  Reviewer: { id: string; name: string } | null
}

const filters = ["OPEN", "IN_REVIEW", "ACTIONED", "DISMISSED", "ALL"] as const

export default function AdminMessageReportsPage() {
  const [reports, setReports] = useState<MessageReport[]>([])
  const [filter, setFilter] = useState<(typeof filters)[number]>("OPEN")
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [nextStatus, setNextStatus] = useState<Record<string, ReportStatus>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState("")
  const [error, setError] = useState("")

  const load = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const query = filter === "ALL" ? "" : `?status=${filter}`
      const { data } = await api.get<{ data: MessageReport[] }>(`/admin/message-reports${query}`)
      setReports(data.data)
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Message reports could not be loaded"))
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => { void load() }, [load])

  const review = async (report: MessageReport) => {
    const status = nextStatus[report.id] ?? (report.status === "OPEN" ? "IN_REVIEW" : "ACTIONED")
    const resolutionNotes = (notes[report.id] ?? "").trim()
    setBusy(report.id)
    setError("")
    try {
      await api.patch(`/admin/message-reports/${report.id}`, { status, resolutionNotes })
      await load()
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Message report review failed"))
    } finally {
      setBusy("")
    }
  }

  return (
    <main className="min-h-screen p-4 sm:p-7">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="relative overflow-hidden border border-slate-800 bg-slate-950 p-7 text-white shadow-[0_24px_80px_rgba(15,23,42,.18)]">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(225,29,72,.2),transparent_64%)]" />
          <div className="relative">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-rose-300">Community safety desk</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Trip Circle message reports</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-300">Review private conduct reports without exposing the reporter. Actioning a report hides the stored message and records the decision in the audit trail.</p>
          </div>
        </header>

        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200" aria-label="Report status">
          {filters.map((value) => <button key={value} onClick={() => setFilter(value)} className={`border-b-2 px-4 py-3 text-xs font-black tracking-wide ${filter === value ? "border-rose-600 text-rose-700" : "border-transparent text-slate-500 hover:text-slate-900"}`}>{value.replaceAll("_", " ")}</button>)}
        </nav>

        {error ? <p role="alert" className="border-l-2 border-rose-600 bg-rose-50 p-4 text-sm font-bold text-rose-800">{error}</p> : null}

        {loading ? <div className="h-64 animate-pulse bg-white" /> : reports.length === 0 ? (
          <section className="border border-dashed border-slate-300 bg-white p-12 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-emerald-600" />
            <h2 className="mt-4 text-xl font-black text-slate-950">No reports in this queue</h2>
            <p className="mt-2 text-sm text-slate-500">New reports will appear here in oldest-first order.</p>
          </section>
        ) : (
          <section className="grid gap-5 xl:grid-cols-2">
            {reports.map((report) => {
              const terminal = report.status === "ACTIONED" || report.status === "DISMISSED"
              return (
                <article key={report.id} className="border border-slate-200 bg-white p-5 shadow-[0_16px_44px_rgba(15,23,42,.06)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">{report.reason.replaceAll("_", " ")}</p>
                      <h2 className="mt-2 font-black text-slate-950">{report.Tour.title}</h2>
                      <p className="mt-1 text-xs text-slate-500">Reported by {report.Reporter.name} · subject {report.ReportedUser.name}</p>
                    </div>
                    <span className="border border-slate-200 px-2.5 py-1 text-[11px] font-black text-slate-700">{report.status.replaceAll("_", " ")}</span>
                  </div>
                  <blockquote className="mt-4 border-l-2 border-slate-300 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">{report.Message.message ?? "Non-text message"}</blockquote>
                  {report.details ? <p className="mt-3 text-sm text-slate-600"><strong>Reporter context:</strong> {report.details}</p> : null}
                  {terminal ? (
                    <div className="mt-4 border-t border-slate-200 pt-4 text-sm text-slate-600"><strong>Decision:</strong> {report.resolutionNotes}<br /><span className="text-xs text-slate-500">Reviewed by {report.Reviewer?.name ?? "Administrator"}</span></div>
                  ) : (
                    <div className="mt-5 space-y-3 border-t border-slate-200 pt-4">
                      <div className="grid gap-3 sm:grid-cols-[170px_1fr]">
                        <select value={nextStatus[report.id] ?? (report.status === "OPEN" ? "IN_REVIEW" : "ACTIONED")} onChange={(event) => setNextStatus((current) => ({ ...current, [report.id]: event.target.value as ReportStatus }))} className="h-11 border border-slate-300 bg-white px-3 text-sm font-bold">
                          {report.status === "OPEN" ? <option value="IN_REVIEW">Start review</option> : null}
                          <option value="ACTIONED">Action and hide</option>
                          <option value="DISMISSED">Dismiss report</option>
                        </select>
                        <input value={notes[report.id] ?? ""} onChange={(event) => setNotes((current) => ({ ...current, [report.id]: event.target.value }))} maxLength={2000} placeholder="Evidence considered and reason for decision" className="h-11 border border-slate-300 px-3 text-sm outline-none focus:border-rose-600" />
                      </div>
                      <button disabled={busy === report.id} onClick={() => void review(report)} className="inline-flex h-10 items-center gap-2 bg-slate-950 px-4 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-40">{report.status === "OPEN" ? <Flag className="h-4 w-4" /> : <MessageSquareWarning className="h-4 w-4" />}Save audited decision</button>
                    </div>
                  )}
                </article>
              )
            })}
          </section>
        )}
      </div>
    </main>
  )
}
