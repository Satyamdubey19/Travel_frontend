"use client"

import { useEffect, useState } from "react"
import { BarChart3, CalendarCheck, CheckCircle2, ChevronDown, Clock, Filter, Hotel, IndianRupee, Users } from "lucide-react"
import { HostEmptyState, HostPage, HostPill, HostSection, HostStatCard } from "@/components/host/HostUI"
import Spinner from "@/components/ui/Spinner"
import type { HostBooking as Booking, HostBookingActionProps } from "@/types/host-pages"
import api from "@/lib/axios"

const statusConfig = {
  pending: { label: "Pending", tone: "amber" },
  confirmed: { label: "Confirmed", tone: "emerald" },
  completed: { label: "Completed", tone: "cyan" },
  cancelled: { label: "Cancelled", tone: "rose" },
} as const

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
  })
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    void fetchBookings()
  }, [filterStatus, filterType])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterStatus !== "all") params.set("status", filterStatus)
      if (filterType !== "all") params.set("type", filterType)
      const url = `/host/bookings${params.toString() ? `?${params.toString()}` : ""}`

      const { data: payload } = await api.get(url)
      setBookings(payload.data || [])
      setStats(payload.meta?.stats ?? {
        totalBookings: 0,
        confirmedBookings: 0,
        pendingBookings: 0,
        totalRevenue: 0,
      })
    } catch (error) {
      console.error("Error fetching bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await api.put("/host/bookings", { bookingId, status: newStatus })
      void fetchBookings()
    } catch (error) {
      console.error("Error updating booking:", error)
      alert("Failed to update booking")
    }
  }

  if (loading) return <Spinner minimal />

  return (
    <HostPage
      eyebrow="Operations"
      title="Booking Queue"
      description="Review requests, confirm arrivals, and keep guest operations moving without leaving the host workspace."
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HostStatCard label="Total bookings" value={stats.totalBookings} tone="cyan" icon={<BarChart3 className="h-5 w-5" />} />
        <HostStatCard label="Confirmed" value={stats.confirmedBookings} tone="emerald" icon={<CheckCircle2 className="h-5 w-5" />} />
        <HostStatCard label="Pending review" value={stats.pendingBookings} tone="amber" icon={<Clock className="h-5 w-5" />} />
        <HostStatCard label="Total revenue" value={formatCurrency(stats.totalRevenue)} tone="violet" icon={<IndianRupee className="h-5 w-5" />} />
      </section>

      <HostSection>
        <div className="flex flex-wrap items-center gap-3 p-4">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-600">
            <Filter className="h-4 w-4" />
            Filter
          </span>
          <SelectFilter value={filterStatus} onChange={setFilterStatus} options={[
            ["all", "All statuses"],
            ["pending", "Pending"],
            ["confirmed", "Confirmed"],
            ["completed", "Completed"],
            ["cancelled", "Cancelled"],
          ]} />
          <SelectFilter value={filterType} onChange={setFilterType} options={[
            ["all", "All types"],
            ["hotel", "Hotels"],
            ["tour", "Tours"],
          ]} />
          <span className="ml-auto rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-600">
            {bookings.length} result{bookings.length !== 1 ? "s" : ""}
          </span>
        </div>
      </HostSection>

      <HostSection title="Reservations" eyebrow="Guest flow">
        {bookings.length === 0 ? (
          <HostEmptyState icon={<CalendarCheck className="h-6 w-6" />} title="No bookings found" description="Adjust your filters or wait for new reservation requests." />
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[900px] text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Guest</th>
                    <th className="px-5 py-3 text-left">Property</th>
                    <th className="px-5 py-3 text-left">Rooms</th>
                    <th className="px-5 py-3 text-left">Dates</th>
                    <th className="px-5 py-3 text-left">Guests</th>
                    <th className="px-5 py-3 text-left">Amount</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {bookings.map(booking => (
                    <BookingRow key={booking.id} booking={booking} onStatusChange={updateBookingStatus} />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-slate-100 lg:hidden">
              {bookings.map(booking => (
                <BookingCard key={booking.id} booking={booking} onStatusChange={updateBookingStatus} />
              ))}
            </div>
          </>
        )}
      </HostSection>
    </HostPage>
  )
}

function BookingRow({ booking, onStatusChange }: HostBookingActionProps) {
  const cfg = statusConfig[booking.status] ?? statusConfig.pending

  return (
    <tr className="transition hover:bg-slate-50">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700">
            {booking.guest.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="font-bold text-slate-950">{booking.guest.name}</p>
            <p className="text-xs text-slate-500">{booking.guest.email}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <Hotel className="h-4 w-4 shrink-0 text-slate-400" />
          <span className="font-semibold text-slate-800">{booking.hotel?.name ?? booking.tour?.name ?? "-"}</span>
        </div>
      </td>
      <td className="px-5 py-4">
        <RoomInventory rooms={booking.rooms} />
      </td>
      <td className="px-5 py-4">{formatBookingDates(booking)}</td>
      <td className="px-5 py-4">
        <span className="inline-flex items-center gap-1.5 font-semibold text-slate-800">
          <Users className="h-3.5 w-3.5 text-slate-400" />
          {booking.numberOfGuests}
        </span>
      </td>
      <td className="px-5 py-4 font-bold text-slate-950">{formatCurrency(booking.totalPrice)}</td>
      <td className="px-5 py-4">
        <HostPill tone={cfg.tone}>{cfg.label}</HostPill>
      </td>
      <td className="px-5 py-4">
        <SelectFilter
          compact
          value={booking.status}
          onChange={value => onStatusChange(booking.id, value)}
          options={[
            ["pending", "Pending"],
            ["confirmed", "Confirm"],
            ["completed", "Complete"],
            ["cancelled", "Cancel"],
          ]}
        />
      </td>
    </tr>
  )
}

function BookingCard({ booking, onStatusChange }: HostBookingActionProps) {
  const cfg = statusConfig[booking.status] ?? statusConfig.pending

  return (
    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-black text-slate-700">
            {booking.guest.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <p className="font-bold text-slate-950">{booking.guest.name}</p>
            <p className="text-xs text-slate-500">{booking.hotel?.name ?? booking.tour?.name ?? "-"}</p>
          </div>
        </div>
        <HostPill tone={cfg.tone}>{cfg.label}</HostPill>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
        <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" />{booking.numberOfGuests} guests</span>
        <span className="font-bold text-slate-950">{formatCurrency(booking.totalPrice)}</span>
      </div>
      <div className="mt-3">
        <RoomInventory rooms={booking.rooms} />
      </div>
      <div className="mt-3">
        <SelectFilter
          compact
          value={booking.status}
          onChange={value => onStatusChange(booking.id, value)}
          options={[
            ["pending", "Pending"],
            ["confirmed", "Confirm"],
            ["completed", "Complete"],
            ["cancelled", "Cancel"],
          ]}
        />
      </div>
    </div>
  )
}

function RoomInventory({ rooms }: { rooms?: Booking["rooms"] }) {
  if (!rooms?.length) return <span className="text-xs text-slate-400">-</span>

  return (
    <div className="space-y-1">
      {rooms.map((room) => (
        <div key={room.id} className="text-xs">
          <p className="font-bold text-slate-800">{room.name} x{room.quantity}</p>
          <p className="text-slate-500">{room.availableRooms} available / {room.bookedRooms} booked</p>
        </div>
      ))}
    </div>
  )
}

function SelectFilter({
  value,
  onChange,
  options,
  compact = false,
}: {
  value: string
  onChange: (value: string) => void
  options: [string, string][]
  compact?: boolean
}) {
  return (
    <div className="relative inline-block">
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className={`appearance-none rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100 ${
          compact ? "py-2 pl-3 pr-8 text-xs" : "py-2.5 pl-4 pr-9 text-sm"
        }`}
      >
        {options.map(([optionValue, label]) => (
          <option key={optionValue} value={optionValue}>{label}</option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
    </div>
  )
}

function formatBookingDates(booking: Booking) {
  const start = booking.checkInDate ?? booking.startDate
  const end = booking.checkOutDate ?? booking.endDate

  if (!start || !end) return <span className="text-slate-400">-</span>

  return (
    <div className="flex items-center gap-1.5">
      <CalendarCheck className="h-3.5 w-3.5 shrink-0 text-slate-400" />
      <div>
        <p className="font-semibold text-slate-800">{formatShortDate(start)}</p>
        <p className="text-xs text-slate-500">to {formatShortDate(end, true)}</p>
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
