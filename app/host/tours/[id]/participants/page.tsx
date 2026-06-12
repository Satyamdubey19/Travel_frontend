"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, Check, MessageSquare, Search, ShieldAlert, Star, UserCheck, Users, X } from "lucide-react"

const participants = [
  { id: "p1", name: "Aarohi Sharma", status: "PENDING", trust: 92, gender: "Female", verified: true, language: "Hindi, English", bio: "Solo traveler, mountain routes, slow travel.", alert: false },
  { id: "p2", name: "Kabir Mehta", status: "APPROVED", trust: 86, gender: "Male", verified: true, language: "English", bio: "Backpacker and food trail explorer.", alert: false },
  { id: "p3", name: "Naina Kapoor", status: "PENDING", trust: 71, gender: "Female", verified: false, language: "English, Punjabi", bio: "First group tour, prefers women-safe stays.", alert: true },
]

export default function TourParticipantsPage() {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState(participants[0])
  const filtered = useMemo(() => participants.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Link href="/host/tours" className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50"><ArrowLeft className="h-5 w-5" /></Link>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">Participant safety</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Tour participants</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">Review join requests, verification signals, trust score, notes, and safety alerts.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white hover:bg-emerald-800"><Check className="mr-2 inline h-4 w-4" />Bulk approve</button>
              <button className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"><X className="mr-2 inline h-4 w-4" />Bulk reject</button>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-4">
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search participant" className="w-full rounded-2xl border border-slate-200 px-11 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
              </div>
            </div>
            <div className="divide-y divide-slate-200">
              {filtered.map((person) => (
                <button key={person.id} onClick={() => setSelected(person)} className="flex w-full flex-col gap-4 p-4 text-left transition hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700"><Users className="h-5 w-5" /></div>
                    <div>
                      <p className="font-black text-slate-950">{person.name}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{person.gender} · {person.language}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {person.verified ? <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700 ring-1 ring-emerald-200"><BadgeCheck className="mr-1 inline h-3.5 w-3.5" />Verified</span> : null}
                    {person.alert ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700 ring-1 ring-amber-200"><ShieldAlert className="mr-1 inline h-3.5 w-3.5" />Review</span> : null}
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{person.status}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6 lg:h-fit">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Profile preview</p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">{selected.name}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{selected.bio}</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-slate-50 p-4"><Star className="h-4 w-4 text-cyan-700" /><p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Trust</p><p className="text-xl font-black">{selected.trust}</p></div>
              <div className="rounded-2xl bg-slate-50 p-4"><UserCheck className="h-4 w-4 text-cyan-700" /><p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Status</p><p className="text-xl font-black">{selected.status}</p></div>
            </div>
            <textarea placeholder="Private participant notes" rows={4} className="mt-5 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-black text-white hover:bg-emerald-800">Approve</button>
              <button className="rounded-2xl bg-red-700 px-4 py-3 text-sm font-black text-white hover:bg-red-800">Reject</button>
              <button className="col-span-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-black text-slate-700 hover:bg-slate-50"><MessageSquare className="mr-2 inline h-4 w-4" />Message traveler</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
