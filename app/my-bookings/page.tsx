"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  CalendarDays,
  Car,
  Clock3,
  Compass,
  IndianRupee,
  Layers,
  MapPin,
  Sparkles,
  Ticket,
} from "lucide-react"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import type { BookingCategory, UnifiedBookingRecord } from "@/types/my-bookings"
import api from "@/lib/axios"

type FilterType = "ALL" | BookingCategory

const categoryMeta: Record<BookingCategory, { label: string; icon: typeof Compass; tone: string }> = {
  TOUR: { label: "Tour", icon: Compass, tone: "bg-violet-50 text-violet-700 ring-violet-200" },
  RENTAL: { label: "Rental", icon: Car, tone: "bg-amber-50 text-amber-700 ring-amber-200" },
  ACTIVITY: { label: "Activity", icon: Sparkles, tone: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
}

const statusTone: Record<string, string> = {
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  CONFIRMED: "bg-sky-50 text-sky-700 ring-sky-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  CANCELLED: "bg-rose-50 text-rose-700 ring-rose-200",
  CHECKED_IN: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  CHECKED_OUT: "bg-slate-100 text-slate-700 ring-slate-200",
}

function formatDateRange(startDate: string | null, endDate: string | null) {
  if (!startDate && !endDate) return "Date not available"

  const start = startDate ? new Date(startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "-"
  const end = endDate ? new Date(endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : null

  return end ? `${start} -> ${end}` : start
}

function BookingFilterButton({
  label,
  active,
  onClick,
  count,
}: {
  label: string
  active: boolean
  onClick: () => void
  count: number
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
        active
          ? "border-slate-900 bg-slate-900 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
      }`}
    >
      {label}
      <span
        className={`rounded-full px-2 py-0.5 text-xs font-bold ${
          active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
        }`}
      >
        {count}
      </span>
    </button>
  )
}

export default function MyBookingsPage() {
  const { isAuthenticated, loading } = useAuth()
  const [bookings, setBookings] = useState<UnifiedBookingRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterType>("ALL")

  useEffect(() => {
    if (loading || !isAuthenticated) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    api.get("/my-bookings")
      .then(({ data: payload }) => Array.isArray(payload.data) ? payload.data as UnifiedBookingRecord[] : [])
      .then((data) => setBookings(data))
      .catch(() => setError("Could not load your bookings right now."))
      .finally(() => setIsLoading(false))
  }, [isAuthenticated, loading])

  const filteredBookings = useMemo(() => {
    if (filter === "ALL") return bookings
    return bookings.filter((booking) => booking.bookingType === filter)
  }, [bookings, filter])

  const counts = useMemo(() => ({
    ALL: bookings.length,
    TOUR: bookings.filter((b) => b.bookingType === "TOUR").length,
    RENTAL: bookings.filter((b) => b.bookingType === "RENTAL").length,
    ACTIVITY: bookings.filter((b) => b.bookingType === "ACTIVITY").length,
  }), [bookings])

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[radial-gradient(circle_at_5%_10%,rgba(14,165,233,0.12),transparent_28%),radial-gradient(circle_at_95%_0%,rgba(99,102,241,0.1),transparent_26%),linear-gradient(180deg,#f8fbff_0%,#f5f7fb_48%,#ffffff_100%)] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <section className="rounded-[28px] border border-white/70 bg-white/85 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-slate-700">
                  <Ticket className="h-3.5 w-3.5" />
                  My trips
                </p>
                <h1 className="mt-4 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">My Bookings</h1>
                <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                  Track all your tours, rentals, and activities in one clean timeline.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm">
                {counts.ALL} total booking{counts.ALL !== 1 ? "s" : ""}
              </div>
            </div>
          </section>

          <section className="mt-5 flex flex-wrap gap-2">
            <BookingFilterButton label="All" active={filter === "ALL"} onClick={() => setFilter("ALL")} count={counts.ALL} />
            <BookingFilterButton label="Tours" active={filter === "TOUR"} onClick={() => setFilter("TOUR")} count={counts.TOUR} />
            <BookingFilterButton label="Rentals" active={filter === "RENTAL"} onClick={() => setFilter("RENTAL")} count={counts.RENTAL} />
            <BookingFilterButton label="Activities" active={filter === "ACTIVITY"} onClick={() => setFilter("ACTIVITY")} count={counts.ACTIVITY} />
          </section>

          <section className="mt-5 space-y-4">
            {loading || isLoading ? (
              Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="h-40 animate-pulse rounded-3xl border border-slate-200 bg-slate-100" />
              ))
            ) : null}

            {!loading && !isLoading && error ? (
              <Card className="rounded-3xl border border-rose-200 bg-rose-50">
                <CardContent className="p-8 text-center">
                  <p className="text-sm font-semibold text-rose-700">{error}</p>
                </CardContent>
              </Card>
            ) : null}

            {!loading && !isLoading && !error && filteredBookings.length === 0 ? (
              <Card className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <CardContent className="p-10 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                    <Layers className="h-6 w-6" />
                  </div>
                  <h2 className="mt-4 text-xl font-bold text-slate-900">No bookings found</h2>
                  <p className="mt-2 text-sm text-slate-500">Try another filter or start your next trip.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <Button asChild className="rounded-xl bg-slate-950 text-white hover:bg-slate-800">
                      <Link href="/tours">Explore Tours</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-xl border-slate-200 bg-white">
                      <Link href="/activities">Explore Activities</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : null}

            {!loading && !isLoading && !error && filteredBookings.map((booking) => {
              const meta = categoryMeta[booking.bookingType]
              const TypeIcon = meta.icon

              return (
                <Card key={`${booking.bookingType}-${booking.id}`} className="rounded-3xl border border-white/70 bg-white/90 shadow-[0_18px_45px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(15,23,42,0.1)]">
                  <CardContent className="p-5 sm:p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${meta.tone}`}>
                            <TypeIcon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusTone[booking.status] ?? "bg-slate-100 text-slate-700 ring-slate-200"}`}>
                            <Clock3 className="h-3.5 w-3.5" />
                            {booking.status}
                          </span>
                          {booking.paymentStatus ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              Payment: {booking.paymentStatus}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="truncate text-xl font-black text-slate-950">{booking.title}</h3>
                        <p className="mt-1 text-sm font-medium text-slate-500">{booking.subtitle}</p>

                        <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-3">
                          <p className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            {formatDateRange(booking.startDate, booking.endDate)}
                          </p>
                          <p className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                            <MapPin className="h-4 w-4 text-slate-400" />
                            {booking.location ?? "Location pending"}
                          </p>
                          <p className="inline-flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
                            <Ticket className="h-4 w-4 text-slate-400" />
                            {booking.bookingCode}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 flex-col gap-2 lg:items-end">
                        <p className="inline-flex items-center gap-1 text-2xl font-black text-slate-950">
                          <IndianRupee className="h-5 w-5" />
                          {booking.totalAmount.toLocaleString("en-IN")}
                        </p>
                        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-400">{booking.currency}</p>
                        <Button asChild className="mt-1 h-9 rounded-xl bg-slate-950 px-4 text-white hover:bg-blue-700">
                          <Link href={booking.href}>View details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
