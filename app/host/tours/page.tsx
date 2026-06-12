"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Archive,
  CalendarDays,
  Copy,
  Edit3,
  Eye,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
} from "lucide-react"
import StatusBadge from "@/components/ui/StatusBadge"
import api from "@/lib/axios"

type HostTour = {
  id: string
  slug: string
  title: string
  destination: string
  city?: string
  status: string
  isActive?: boolean
  isApproved?: boolean
  images?: string[]
  startDate?: string
  endDate?: string
  totalSlots?: number
  availableSlots?: number
  totalBookings?: number
  averageRating?: number
  pricePerPerson?: number
  _count?: { Booking?: number; Review?: number }
}

const fallbackImage = "/tour1.jpg"

function formatDate(value?: string) {
  if (!value) return "Dates not set"
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value))
}

export default function HostToursDashboard() {
  const [tours, setTours] = useState<HostTour[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [sort, setSort] = useState("newest")

  useEffect(() => {
    const load = async () => {
      try {
        const { data: payload } = await api.get("/tour?scope=mine", {
          headers: { "Cache-Control": "no-store" },
        })
        setTours(payload.data || [])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim()
    const rows = tours.filter((tour) => {
      const matchesQuery = !query || [tour.title, tour.destination, tour.city, tour.status].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
      const matchesStatus = status === "all" || tour.status === status
      return matchesQuery && matchesStatus
    })
    return [...rows].sort((a, b) => {
      if (sort === "slots") return (a.availableSlots ?? 0) - (b.availableSlots ?? 0)
      if (sort === "rating") return (b.averageRating ?? 0) - (a.averageRating ?? 0)
      if (sort === "bookings") return ((b.totalBookings ?? b._count?.Booking) || 0) - ((a.totalBookings ?? a._count?.Booking) || 0)
      return String(b.id).localeCompare(String(a.id))
    })
  }, [search, sort, status, tours])

  const stats = useMemo(() => {
    const active = tours.filter((tour) => tour.status === "ACTIVE").length
    const upcoming = tours.filter((tour) => tour.startDate && new Date(tour.startDate) >= new Date()).length
    const bookings = tours.reduce((sum, tour) => sum + ((tour.totalBookings ?? tour._count?.Booking) || 0), 0)
    const revenue = tours.reduce((sum, tour) => sum + (((tour.totalBookings ?? tour._count?.Booking) || 0) * Number(tour.pricePerPerson || 0)), 0)
    const ratingRows = tours.filter((tour) => Number(tour.averageRating) > 0)
    const avgRating = ratingRows.length ? (ratingRows.reduce((sum, tour) => sum + Number(tour.averageRating || 0), 0) / ratingRows.length).toFixed(1) : "0.0"
    const pending = tours.filter((tour) => tour.status === "PENDING_REVIEW").length
    return { active, upcoming, bookings, revenue, avgRating, pending }
  }, [tours])

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">Tour operations</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">Host tour dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Manage group tours, approval status, participants, chat, inventory, and traveler-facing content from one workspace.</p>
            </div>
            <Link href="/host/tours/new" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-cyan-700">
              <Plus className="h-4 w-4" />
              Create tour
            </Link>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {[
            { label: "Active tours", value: stats.active, icon: ShieldCheck },
            { label: "Upcoming", value: stats.upcoming, icon: CalendarDays },
            { label: "Bookings", value: stats.bookings, icon: Users },
            { label: "Revenue", value: `INR ${stats.revenue.toLocaleString("en-IN")}`, icon: Star },
            { label: "Avg rating", value: stats.avgRating, icon: Star },
            { label: "Pending", value: stats.pending, icon: Eye },
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
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search tours by title, destination, status" className="w-full rounded-2xl border border-slate-200 bg-white px-11 py-3 text-sm font-semibold outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" />
            </div>
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-500">
              {["all", "DRAFT", "PENDING_REVIEW", "ACTIVE", "PAUSED", "REJECTED", "ARCHIVED"].map((item) => <option key={item} value={item}>{item === "all" ? "All statuses" : item.replaceAll("_", " ")}</option>)}
            </select>
            <select value={sort} onChange={(event) => setSort(event.target.value)} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-cyan-500">
              <option value="newest">Newest first</option>
              <option value="bookings">Most bookings</option>
              <option value="rating">Highest rating</option>
              <option value="slots">Lowest slots left</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <SlidersHorizontal className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-xl font-black text-slate-950">No tours found</h2>
            <p className="mt-2 text-sm text-slate-600">Create a tour or clear filters to see your listings.</p>
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-2">
            {filtered.map((tour) => {
              const image = tour.images?.find(Boolean) || fallbackImage
              const bookings = (tour.totalBookings ?? tour._count?.Booking) || 0
              const slotsLeft = Math.max(0, Number(tour.availableSlots ?? 0))
              return (
                <article key={tour.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(15,23,42,0.1)]">
                  <div className="grid sm:grid-cols-[220px_1fr]">
                    <div className="relative h-56 sm:h-full">
                      <img src={image} alt={tour.title} className="h-full w-full object-cover" />
                      <div className="absolute left-3 top-3"><StatusBadge status={tour.status} /></div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h2 className="line-clamp-2 text-lg font-black text-slate-950">{tour.title}</h2>
                          <p className="mt-1 text-sm font-semibold text-slate-500">{tour.city || tour.destination}</p>
                        </div>
                        <p className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700">{slotsLeft} slots left</p>
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Dates</p>
                          <p className="mt-1 font-black text-slate-900">{formatDate(tour.startDate)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Bookings</p>
                          <p className="mt-1 font-black text-slate-900">{bookings}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Rating</p>
                          <p className="mt-1 font-black text-slate-900">{Number(tour.averageRating || 0).toFixed(1)}</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-3">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Price</p>
                          <p className="mt-1 font-black text-slate-900">INR {Number(tour.pricePerPerson || 0).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-wrap gap-2">
                        <Link href={`/host/tours/${tour.id}`} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-black text-white hover:bg-cyan-700"><Edit3 className="h-3.5 w-3.5" />Edit</Link>
                        <Link href={`/host/tours/${tour.id}/participants`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"><Users className="h-3.5 w-3.5" />Participants</Link>
                        <Link href={`/host/tours/${tour.id}/chat`} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"><MessageCircle className="h-3.5 w-3.5" />Chat</Link>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"><Copy className="h-3.5 w-3.5" />Duplicate</button>
                        <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-50"><Archive className="h-3.5 w-3.5" />Archive</button>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
