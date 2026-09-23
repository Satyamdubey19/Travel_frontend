"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Calendar,
  CalendarCheck,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  IndianRupee,
  MapPinned,
  MoreVertical,
  RefreshCw,
  Search,
  Users,
  X,
  XCircle,
} from "lucide-react"
import {
  HostEmptyState,
  HostFilterTabs,
  HostPage,
  HostPill,
  HostSection,
  HostStatCard,
  Tone,
} from "@/components/host/HostUI"
import Spinner from "@/components/ui/Spinner"
import type { HostBooking as Booking } from "@/types/host-pages"
import api, { getApiErrorMessage } from "@/lib/axios"

const statusConfig: Record<
  string,
  { label: string; tone: Tone; description: string }
> = {
  pending: {
    label: "Pending Review",
    tone: "amber",
    description: "Awaiting host confirmation",
  },
  confirmed: {
    label: "Confirmed",
    tone: "emerald",
    description: "Ready for departure",
  },
  completed: {
    label: "Completed",
    tone: "cyan",
    description: "Trip concluded",
  },
  cancelled: {
    label: "Cancelled",
    tone: "rose",
    description: "Booking cancelled",
  },
  no_show: {
    label: "No Show",
    tone: "rose",
    description: "Guest failed to arrive",
  },
  refund_pending: {
    label: "Refund Pending",
    tone: "amber",
    description: "Refund in processing",
  },
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  })
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    void fetchBookings(false)
  }, [filterStatus, filterType])

  const fetchBookings = async (isManualRefresh = true) => {
    try {
      if (isManualRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const params = new URLSearchParams()
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (filterType !== "all") params.set("type", filterType)
      const url = `/host/bookings${params.toString() ? `?${params.toString()}` : ""}`

      const { data: payload } = await api.get(url)
      setBookings(payload.data || [])
      setStats(
        payload.meta?.stats ?? {
          totalBookings: 0,
          confirmedBookings: 0,
          pendingBookings: 0,
          totalRevenue: 0,
        }
      )
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const updateBookingStatus = async (booking: Booking, newStatus: string) => {
    let note: string | undefined
    if (["cancelled", "no_show"].includes(newStatus)) {
      const label = newStatus === "cancelled" ? "cancellation" : "no-show"
      const entered = window.prompt(
        `Enter the ${label} reason (at least 5 characters). This is shared with the traveler.`
      )
      if (entered === null) return
      note = entered.trim()
      if (note.length < 5) {
        window.alert("Please enter a clear reason of at least 5 characters.")
        return
      }
      if (
        newStatus === "cancelled" &&
        !window.confirm("Cancel this booking? Paid bookings will enter refund review.")
      ) {
        return
      }
    }

    try {
      await api.patch("/host/bookings", {
        bookingId: booking.id,
        status: newStatus,
        type: booking.bookingType,
        note,
      })
      void fetchBookings(true)
    } catch (error) {
      console.error("Error updating booking:", error)
      window.alert(getApiErrorMessage(error, "Failed to update booking"))
    }
  }

  const filteredBookings = useMemo(() => {
    if (!searchQuery.trim()) return bookings
    const q = searchQuery.toLowerCase().trim()
    return bookings.filter(
      (b) =>
        b.guest?.name?.toLowerCase().includes(q) ||
        b.guest?.email?.toLowerCase().includes(q) ||
        b.tour?.name?.toLowerCase().includes(q) ||
        b.id.toLowerCase().includes(q) ||
        b.bookingType?.toLowerCase().includes(q)
    )
  }, [bookings, searchQuery])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Spinner minimal />
      </div>
    )
  }

  return (
    <HostPage
      breadcrumbs={[
        { label: "Host Studio", href: "/host" },
        { label: "Operations" },
        { label: "Bookings Queue" },
      ]}
      eyebrow="Operations Desk"
      title="Booking Queue"
      description="Manage tour, activity, and rental guests with instant confirmation, live rosters, and automated payout tracking."
      badge={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Queue
        </span>
      }
      actions={
        <button
          onClick={() => fetchBookings(true)}
          disabled={refreshing}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-slate-900 active:scale-95 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          title="Refresh bookings"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HostStatCard
          label="Total bookings"
          value={stats.totalBookings}
          hint="All time"
          tone="cyan"
          icon={<CalendarCheck className="h-6 w-6" />}
        />
        <HostStatCard
          label="Confirmed guests"
          value={stats.confirmedBookings}
          hint="Ready for check-in"
          tone="emerald"
          trend={{
            value: `${
              stats.totalBookings > 0
                ? Math.round((stats.confirmedBookings / stats.totalBookings) * 100)
                : 100
            }% fulfillment`,
            positive: true,
          }}
          icon={<CheckCircle2 className="h-6 w-6" />}
        />
        <HostStatCard
          label="Pending review"
          value={stats.pendingBookings}
          hint={stats.pendingBookings > 0 ? "Requires review" : "All caught up"}
          tone="amber"
          icon={<Clock className="h-6 w-6" />}
        />
        <HostStatCard
          label="Gross captured value"
          value={formatCurrency(stats.totalRevenue)}
          hint="Verified earnings"
          tone="violet"
          icon={<IndianRupee className="h-6 w-6" />}
        />
      </section>

      <HostSection
        className="border-slate-200/90"
        contentClassName="p-4 sm:p-5"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <HostFilterTabs
              layoutId="booking-status-tab"
              active={filterStatus}
              onChange={setFilterStatus}
              tabs={[
                { id: "all", label: "All", count: stats.totalBookings },
                { id: "confirmed", label: "Confirmed", count: stats.confirmedBookings },
                { id: "pending", label: "Pending", count: stats.pendingBookings },
                { id: "completed", label: "Completed" },
                { id: "cancelled", label: "Cancelled" },
              ]}
            />

            <div className="flex items-center gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {filteredBookings.length} reservation
                {filteredBookings.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by guest, email, or trip..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-8 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-100 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-bold text-slate-400">Type:</span>
              {(
                [
                  ["all", "All Supply"],
                  ["tour", "Tours"],
                  ["activity", "Activities"],
                  ["rental", "Rentals"],
                ] as const
              ).map(([typeId, label]) => {
                const isActive = filterType === typeId
                return (
                  <button
                    key={typeId}
                    onClick={() => setFilterType(typeId)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                      isActive
                        ? "bg-slate-950 text-white shadow-xs dark:bg-white dark:text-slate-950"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/70 dark:bg-slate-800 dark:text-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </HostSection>

      <HostSection
        title="Guest Reservations"
        eyebrow="Guest manifest"
        description="All confirmed, pending, and completed reservations across your supply inventory."
        contentClassName="p-0"
      >
        {filteredBookings.length === 0 ? (
          <HostEmptyState
            icon={<CalendarCheck className="h-8 w-8 text-slate-400" />}
            title="No reservations found"
            description={
              searchQuery || filterStatus !== "all" || filterType !== "all"
                ? "No bookings match your selected criteria. Try adjusting filters or clearing search."
                : "New traveler bookings and reservation requests will appear here automatically."
            }
            action={
              (searchQuery || filterStatus !== "all" || filterType !== "all") && (
                <button
                  onClick={() => {
                    setFilterStatus("all")
                    setFilterType("all")
                    setSearchQuery("")
                  }}
                  className="mt-2 inline-flex items-center gap-1.5 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-slate-800"
                >
                  Clear Filters
                </button>
              )
            }
          />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[960px] text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-black uppercase tracking-[0.16em] text-slate-400 dark:border-slate-800 dark:bg-slate-800/60">
                  <tr>
                    <th className="px-6 py-3.5">Guest</th>
                    <th className="px-6 py-3.5">Experience / Supply</th>
                    <th className="px-6 py-3.5">Schedule</th>
                    <th className="px-6 py-3.5">Party</th>
                    <th className="px-6 py-3.5">Payment</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100/90 dark:divide-slate-800/80">
                  {filteredBookings.map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      onStatusChange={updateBookingStatus}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden dark:divide-slate-800">
              {filteredBookings.map((booking) => (
                <BookingCard
                  key={booking.id}
                  booking={booking}
                  onStatusChange={updateBookingStatus}
                />
              ))}
            </div>
          </>
        )}
      </HostSection>
    </HostPage>
  )
}

function BookingRow({
  booking,
  onStatusChange,
}: {
  booking: Booking
  onStatusChange: (booking: Booking, status: string) => void
}) {
  const cfg = statusConfig[booking.status] ?? statusConfig.pending
  const guestInitial = (booking.guest?.name?.slice(0, 1) || "G").toUpperCase()

  return (
    <tr className="group transition-colors hover:bg-sky-50/30 dark:hover:bg-slate-800/40">
      <td className="px-6 py-4.5">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-xs font-black text-slate-700 shadow-xs dark:from-slate-800 dark:to-slate-700 dark:text-slate-200">
            {guestInitial}
          </span>
          <div className="min-w-0">
            <Link
              href={`/host/bookings/${booking.id}?type=${booking.bookingType}`}
              className="font-bold text-slate-950 transition hover:text-sky-600 dark:text-white dark:hover:text-sky-400"
            >
              {booking.guest?.name || "Guest"}
            </Link>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">
              {booking.guest?.email || "No email"}
            </p>
          </div>
        </div>
      </td>

      <td className="px-6 py-4.5">
        <div className="flex items-start gap-2.5">
          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400">
            <MapPinned className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-900 dark:text-white">
              {booking.tour?.name ?? `${booking.bookingType} #${booking.id.slice(0, 6)}`}
            </span>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span
                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                  booking.bookingType === "tour"
                    ? "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300"
                    : booking.bookingType === "activity"
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300"
                    : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                }`}
              >
                {booking.bookingType}
              </span>
            </div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4.5">{formatBookingDates(booking)}</td>

      <td className="px-6 py-4.5">
        <span className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {booking.numberOfGuests} {booking.numberOfGuests === 1 ? "guest" : "guests"}
        </span>
      </td>

      <td className="px-6 py-4.5">
        <div>
          <span className="font-sans font-black text-slate-950 tabular-nums dark:text-white">
            {formatCurrency(booking.totalPrice)}
          </span>
          <span className="block text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            Captured
          </span>
        </div>
      </td>

      <td className="px-6 py-4.5">
        <HostPill tone={cfg.tone}>{cfg.label}</HostPill>
      </td>

      <td className="px-6 py-4.5 text-right">
        <BookingRowActions booking={booking} onStatusChange={onStatusChange} />
      </td>
    </tr>
  )
}

function BookingCard({
  booking,
  onStatusChange,
}: {
  booking: Booking
  onStatusChange: (booking: Booking, status: string) => void
}) {
  const cfg = statusConfig[booking.status] ?? statusConfig.pending
  const guestInitial = (booking.guest?.name?.slice(0, 1) || "G").toUpperCase()

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-black text-slate-800 dark:from-slate-800 dark:to-slate-700 dark:text-white">
            {guestInitial}
          </span>
          <div>
            <Link
              href={`/host/bookings/${booking.id}?type=${booking.bookingType}`}
              className="font-bold text-slate-950 transition hover:text-sky-600 dark:text-white"
            >
              {booking.guest?.name || "Guest"}
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {booking.tour?.name ?? booking.bookingType}
            </p>
          </div>
        </div>
        <HostPill tone={cfg.tone}>{cfg.label}</HostPill>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/50">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Schedule
          </span>
          <div className="mt-0.5">{formatBookingDates(booking)}</div>
        </div>
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
            Amount ({booking.numberOfGuests} guests)
          </span>
          <p className="mt-0.5 font-sans font-black text-slate-950 tabular-nums dark:text-white">
            {formatCurrency(booking.totalPrice)}
          </p>
        </div>
      </div>

      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
        <Link
          href={`/host/bookings/${booking.id}?type=${booking.bookingType}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-sky-600 hover:text-sky-700"
        >
          View details <ArrowRight className="h-3 w-3" />
        </Link>
        <BookingRowActions booking={booking} onStatusChange={onStatusChange} compact />
      </div>
    </div>
  )
}

function BookingRowActions({
  booking,
  onStatusChange,
  compact = false,
}: {
  booking: Booking
  onStatusChange: (booking: Booking, status: string) => void
  compact?: boolean
}) {
  const isTerminal = ["completed", "cancelled", "no_show", "refund_pending"].includes(
    booking.status
  )

  if (isTerminal) {
    return (
      <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
        Archived
      </span>
    )
  }

  if (booking.status === "pending") {
    return (
      <div className="inline-flex items-center gap-1.5">
        <button
          onClick={() => onStatusChange(booking, "confirmed")}
          className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 active:scale-95"
          title="Confirm this reservation"
        >
          <Check className="h-3.5 w-3.5" />
          <span>Confirm</span>
        </button>
        <button
          onClick={() => onStatusChange(booking, "cancelled")}
          className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-xs font-bold text-rose-700 transition hover:bg-rose-100 active:scale-95"
          title="Decline reservation"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1.5">
      <button
        onClick={() => onStatusChange(booking, "completed")}
        className="inline-flex items-center gap-1 rounded-xl bg-sky-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-sky-700 active:scale-95"
        title="Mark booking as successfully completed"
      >
        <CheckCircle2 className="h-3.5 w-3.5" />
        <span>Complete</span>
      </button>

      <StatusDropdownMenu
        booking={booking}
        onStatusChange={onStatusChange}
        compact={compact}
      />
    </div>
  )
}

function StatusDropdownMenu({
  booking,
  onStatusChange,
  compact = false,
}: {
  booking: Booking
  onStatusChange: (booking: Booking, status: string) => void
  compact?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center justify-center border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 ${
          compact ? "p-1 rounded-lg" : "p-1.5 rounded-xl"
        }`}
        aria-label="More actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 z-30 mt-1.5 w-44 origin-top-right rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xl ring-1 ring-black/5 dark:border-slate-700 dark:bg-slate-900"
            >
              <Link
                href={`/host/bookings/${booking.id}?type=${booking.bookingType}`}
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                <span>View Details</span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onStatusChange(booking, "no_show")
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-950/40"
              >
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                <span>Report No-Show</span>
              </button>
              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
              <button
                type="button"
                onClick={() => {
                  setOpen(false)
                  onStatusChange(booking, "cancelled")
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40"
              >
                <XCircle className="h-3.5 w-3.5 text-rose-500" />
                <span>Cancel & Refund</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

function formatBookingDates(booking: Booking) {
  const start = booking.checkInDate ?? booking.startDate
  const end = booking.checkOutDate ?? booking.endDate

  if (!start || !end) return <span className="text-slate-400 text-xs">-</span>

  return (
    <div className="flex items-center gap-2 text-xs">
      <Calendar className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div>
        <p className="font-semibold text-slate-800 dark:text-slate-200">
          {formatShortDate(start)}
        </p>
        <p className="text-[11px] text-slate-400">
          to {formatShortDate(end, true)}
        </p>
      </div>
    </div>
  )
}

function formatShortDate(value: string, includeYear = false) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    ...(includeYear ? { year: "numeric" } : {}),
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}