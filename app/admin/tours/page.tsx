"use client"

import { useEffect, useMemo, useState } from "react"
import {
  AlertTriangle,
  Archive,
  Ban,
  BarChart3,
  CheckCircle2,
  Eye,
  FileWarning,
  MessageSquareText,
  Search,
  ShieldAlert,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react"
import Modal from "@/components/ui/Modal"
import StatusBadge from "@/components/ui/StatusBadge"
import api, { getApiErrorMessage } from "@/lib/axios"

type TourListing = {
  id: string
  type: "tour"
  title: string
  ownerName: string
  city: string
  status: string
  isActive: boolean
  isApproved: boolean
  price: number
  inventoryLabel: string
  inventoryDetails: { label: string; available: number; total: number }[]
  bookings: number
  reviews: number
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH"
  riskDisclosure: string | null
  meetingPoint: string | null
  eligibilityRequirements: string[]
  requiredEquipment: string[]
  emergencyPlan: string | null
  minimumAge: number
  requiresCaretaker: boolean
  createdAt: string
}

const statusTabs = ["all", "PENDING_REVIEW", "ACTIVE", "REJECTED", "PAUSED", "ARCHIVED"]

function riskFor(row: TourListing) {
  if (!row.riskDisclosure || !row.meetingPoint || !row.eligibilityRequirements.length) return { label: "Safety data missing", tone: "bg-red-50 text-red-700 ring-red-200", icon: ShieldAlert }
  if (row.riskLevel === "VERY_HIGH") return { label: "Very high · blocked", tone: "bg-red-50 text-red-700 ring-red-200", icon: ShieldAlert }
  if (row.riskLevel === "HIGH") return { label: "High", tone: "bg-orange-50 text-orange-700 ring-orange-200", icon: AlertTriangle }
  if (row.riskLevel === "MEDIUM") return { label: "Medium", tone: "bg-amber-50 text-amber-700 ring-amber-200", icon: AlertTriangle }
  return { label: "Low", tone: "bg-emerald-50 text-emerald-700 ring-emerald-200", icon: ShieldCheck }
}

export default function AdminTourModerationPage() {
  const [rows, setRows] = useState<TourListing[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("PENDING_REVIEW")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<TourListing | null>(null)
  const [reason, setReason] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ type: "tour", status, search, limit: "100" })
      const { data: payload } = await api.get(`/admin/listings?${params.toString()}`, {
        headers: { "Cache-Control": "no-store" },
      })
      setRows(payload.data || [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [status])

  const stats = useMemo(() => ({
    total: rows.length,
    pending: rows.filter((row) => row.status === "PENDING_REVIEW").length,
    approved: rows.filter((row) => row.status === "ACTIVE").length,
    flagged: rows.filter((row) => row.riskLevel === "HIGH" || row.riskLevel === "VERY_HIGH" || !row.riskDisclosure).length,
    bookings: rows.reduce((sum, row) => sum + row.bookings, 0),
    revenue: rows.reduce((sum, row) => sum + row.bookings * Number(row.price || 0), 0),
  }), [rows])

  const updateListing = async (row: TourListing, nextStatus: string, isActive: boolean) => {
    if ((reason.trim() || internalNotes.trim()).length < 5) {
      alert("Add a decision note of at least 5 characters for the audit trail.")
      return
    }
    setSaving(true)
    try {
      await api.patch(`/admin/listings/tour/${row.id}`, {
          status: nextStatus,
          isActive,
          reason: reason.trim() || internalNotes.trim() || undefined,
      })
      setSelected(null)
      setReason("")
      setInternalNotes("")
      await load()
    } catch (error) {
      alert(getApiErrorMessage(error, "Failed to update tour"))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">Admin moderation</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Tour review center</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Approve, reject, suspend, archive, and audit safety-sensitive group tours before they reach travelers.</p>
            </div>
            <div className="rounded-2xl bg-slate-950 px-5 py-4 text-white">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/60">Pending reviews</p>
              <p className="mt-1 text-3xl font-black">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Tours", value: stats.total, icon: BarChart3 },
            { label: "Approved", value: stats.approved, icon: CheckCircle2 },
            { label: "Flagged", value: stats.flagged, icon: ShieldAlert },
            { label: "Bookings", value: stats.bookings, icon: Users },
            { label: "Revenue", value: `INR ${stats.revenue.toLocaleString("en-IN")}`, icon: TrendingUp },
            { label: "Complaints", value: "Not tracked", icon: FileWarning },
          ].map((card) => {
            const Icon = card.icon
            return (
            <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{card.label}</p>
                <Icon className="h-4 w-4 text-cyan-700" />
              </div>
              <p className="mt-3 text-2xl font-black text-slate-950">{String(card.value)}</p>
            </div>
            )
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") void load() }} placeholder="Search tour, host, destination" className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
            </div>
            <button onClick={() => void load()} className="rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white transition hover:bg-cyan-700">Search</button>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {statusTabs.map((tab) => (
              <button key={tab} onClick={() => setStatus(tab)} className={`shrink-0 rounded-full px-4 py-2 text-xs font-black transition ${status === tab ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                {tab === "all" ? "All" : tab.replaceAll("_", " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          {loading ? (
            <div className="space-y-3 p-5">
              {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}
            </div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center">
              <ShieldCheck className="mx-auto h-10 w-10 text-slate-400" />
              <h2 className="mt-4 text-xl font-black text-slate-950">No tours in this queue</h2>
              <p className="mt-2 text-sm text-slate-600">Try another moderation status or search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-4 text-left font-black text-slate-900">Tour</th>
                    <th className="px-5 py-4 text-left font-black text-slate-900">Host</th>
                    <th className="px-5 py-4 text-left font-black text-slate-900">Risk</th>
                    <th className="px-5 py-4 text-left font-black text-slate-900">Status</th>
                    <th className="px-5 py-4 text-left font-black text-slate-900">Slots</th>
                    <th className="px-5 py-4 text-left font-black text-slate-900">Pricing</th>
                    <th className="px-5 py-4 text-left font-black text-slate-900">Reports</th>
                    <th className="px-5 py-4 text-left font-black text-slate-900">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rows.map((row) => {
                    const risk = riskFor(row)
                    const RiskIcon = risk.icon
                    return (
                      <tr key={row.id} className="transition hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <p className="max-w-xs font-black text-slate-950">{row.title}</p>
                          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{row.city || "Destination"}</p>
                        </td>
                        <td className="px-5 py-4 text-slate-700">{row.ownerName}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-black ring-1 ${risk.tone}`}><RiskIcon className="h-3.5 w-3.5" />{risk.label}</span>
                        </td>
                        <td className="px-5 py-4"><StatusBadge status={row.status} /></td>
                        <td className="px-5 py-4 font-bold text-slate-900">{row.inventoryLabel}</td>
                        <td className="px-5 py-4 font-bold text-slate-900">INR {Number(row.price || 0).toLocaleString("en-IN")}</td>
                        <td className="px-5 py-4 text-slate-500">Not connected</td>
                        <td className="px-5 py-4">
                          <button onClick={() => setSelected(row)} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white transition hover:bg-cyan-700">
                            <Eye className="h-3.5 w-3.5" />
                            Review
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950">
          <p className="font-black">Known data boundary</p>
          <p className="mt-1">Complaint counts and historical quality trends are not shown because incident case management is not connected yet. Risk labels now come from the host&apos;s explicit classification and required safety fields; administrators must evaluate the evidence and cannot publish very-high-risk supply yet.</p>
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Tour moderation review" maxWidth="max-w-4xl">
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Tour preview</p>
                    <h2 className="mt-2 text-2xl font-black text-slate-950">{selected.title}</h2>
                    <p className="mt-2 text-sm font-semibold text-slate-600">{selected.city} by {selected.ownerName}</p>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {[
                    { label: "Bookings", value: selected.bookings, icon: Users },
                    { label: "Reviews", value: selected.reviews, icon: Star },
                    { label: "Price", value: `INR ${Number(selected.price || 0).toLocaleString("en-IN")}`, icon: TrendingUp },
                    { label: "Slots", value: selected.inventoryLabel, icon: ShieldCheck },
                  ].map((card) => {
                    const Icon = card.icon
                    return (
                    <div key={card.label} className="rounded-2xl bg-white p-4">
                      <Icon className="h-4 w-4 text-cyan-700" />
                      <p className="mt-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">{card.label}</p>
                      <p className="mt-1 text-sm font-black text-slate-950">{String(card.value)}</p>
                    </div>
                    )
                  })}
                </div>
              </div>
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-700">Declared risk</p>
                <p className="mt-3 text-2xl font-black text-red-950">{selected.riskLevel.replaceAll("_", " ")}</p>
                <dl className="mt-4 space-y-3 text-sm">
                  <div><dt className="text-xs font-bold text-red-600">Minimum age</dt><dd className="font-black text-red-950">{selected.minimumAge} years</dd></div>
                  <div><dt className="text-xs font-bold text-red-600">Caretaker required</dt><dd className="font-black text-red-950">{selected.requiresCaretaker ? "Yes" : "No"}</dd></div>
                  <div><dt className="text-xs font-bold text-red-600">Join controls</dt><dd className="font-black text-red-950">Server policy validates high-risk restrictions on approval</dd></div>
                </dl>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Risk disclosure</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{selected.riskDisclosure || "Missing — approval is blocked"}</p>
                <h3 className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Meeting guidance</h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">{selected.meetingPoint || "Missing — approval is blocked"}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <h3 className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Eligibility and equipment</h3>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">{selected.eligibilityRequirements.map((item) => <li key={item}>• {item}</li>)}</ul>
                <ul className="mt-3 space-y-1 text-sm text-slate-700">{selected.requiredEquipment.map((item) => <li key={item}>• {item}</li>)}</ul>
                {selected.emergencyPlan && <><h3 className="mt-4 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Emergency plan</h3><p className="mt-2 text-sm leading-6 text-slate-700">{selected.emergencyPlan}</p></>}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Host-visible decision note</span>
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={3} placeholder="Rejection reason or requested changes visible to host" className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Internal notes</span>
                <textarea value={internalNotes} onChange={(event) => setInternalNotes(event.target.value)} rows={3} placeholder="Fraud indicators, risk context, or traveler complaints" className="w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
              </label>
            </div>

            <div className="sticky bottom-0 -mx-4 -mb-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                <button disabled={saving} onClick={() => updateListing(selected, "ACTIVE", true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:opacity-50"><CheckCircle2 className="h-4 w-4" />Approve</button>
                <button disabled={saving} onClick={() => updateListing(selected, "REJECTED", false)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-700 px-4 py-3 text-sm font-black text-white hover:bg-red-800 disabled:opacity-50"><XCircle className="h-4 w-4" />Reject</button>
                <button disabled={saving} onClick={() => updateListing(selected, "PAUSED", false)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Ban className="h-4 w-4" />Suspend</button>
                <button disabled={saving} onClick={() => updateListing(selected, "ARCHIVED", false)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"><Archive className="h-4 w-4" />Archive</button>
                <button disabled={saving} onClick={() => updateListing(selected, "PENDING_REVIEW", false)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50 disabled:opacity-50"><MessageSquareText className="h-4 w-4" />Changes</button>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  )
}

