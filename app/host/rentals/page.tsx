"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Archive,
  Car,
  CheckCircle2,
  Edit3,
  Gauge,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react"
import {
  HostPage,
  HostSection,
  HostStatCard,
  HostPill,
  HostEmptyState,
  type Tone,
} from "@/components/host/HostUI"
import api, { getApiErrorMessage } from "@/lib/axios"

type RentalRow = {
  id: string
  slug: string
  title: string
  brand: string
  city: string
  vehicleType: string
  status: string
  isApproved: boolean
  isActive: boolean
  images?: string[]
  imageUrl?: string | null
  pricePerDay: string | number
  totalUnits: number
  availableUnits: number
  averageRating: number
  _count?: { RentalBooking?: number; Review?: number }
}

function getStatusTone(status: string): Tone {
  switch (status) {
    case "ACTIVE":
      return "emerald"
    case "PENDING_REVIEW":
    case "UNDER_REVIEW":
      return "amber"
    case "REJECTED":
      return "rose"
    case "ARCHIVED":
      return "slate"
    default:
      return "cyan"
  }
}

export default function HostRentalsPage() {
  const [rows, setRows] = useState<RentalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [archiving, setArchiving] = useState<string | null>(null)

  const load = () =>
    api
      .get<{ data: RentalRow[] }>("/rental?scope=mine", {
        headers: { "Cache-Control": "no-store" },
      })
      .then(({ data }) => setRows(data.data ?? []))
      .catch((requestError) =>
        setError(getApiErrorMessage(requestError, "Rentals could not be loaded"))
      )
      .finally(() => setLoading(false))

  useEffect(() => {
    void load()
  }, [])

  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          !query.trim() ||
          [row.title, row.brand, row.city, row.status, row.vehicleType].some((value) =>
            value.toLowerCase().includes(query.trim().toLowerCase())
          )
      ),
    [query, rows]
  )

  const archive = async (id: string) => {
    setArchiving(id)
    setError("")
    try {
      await api.delete(`/rental/${id}`)
      setRows((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, status: "ARCHIVED", isActive: false, isApproved: false }
            : item
        )
      )
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Rental could not be archived"))
    } finally {
      setArchiving(null)
    }
  }

  const stats = useMemo(() => {
    const active = rows.filter((r) => r.status === "ACTIVE" && r.isApproved).length
    const totalUnits = rows.reduce((sum, r) => sum + (Number(r.totalUnits) || 0), 0)
    const bookings = rows.reduce((sum, r) => sum + (r._count?.RentalBooking ?? 0), 0)
    return { active, totalUnits, bookings }
  }, [rows])

  return (
    <HostPage
      breadcrumbs={[
        { label: "Host Studio", href: "/host" },
        { label: "Fleet & Rentals" },
      ]}
      eyebrow="Fleet Operations"
      title="Host Rental Studio"
      description="Build verified vehicle listings, monitor RC and roadworthiness moderation, and manage traveler fleet inventory."
      badge={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 shadow-xs dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
          {rows.length} Fleet Vehicles
        </span>
      }
      actions={
        <Link
          href="/host/rentals/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-sky-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Plus className="size-4" />
          Add vehicle
        </Link>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HostStatCard
          label="Fleet models"
          value={rows.length}
          hint="Catalog models listed"
          tone="cyan"
          icon={<Car className="h-6 w-6" />}
        />
        <HostStatCard
          label="Approved & live"
          value={stats.active}
          hint="Roadworthy & verified"
          tone="emerald"
          trend={{ value: "Verified fleet", positive: true }}
          icon={<ShieldCheck className="h-6 w-6" />}
        />
        <HostStatCard
          label="Total fleet units"
          value={stats.totalUnits}
          hint="Bookable vehicle inventory"
          tone="amber"
          icon={<Gauge className="h-6 w-6" />}
        />
        <HostStatCard
          label="Total bookings"
          value={stats.bookings}
          hint="Completed & active trips"
          tone="violet"
          icon={<Users className="h-6 w-6" />}
        />
      </section>

      <HostSection
        title="Fleet Inventory"
        eyebrow="Vehicles & Compliance"
        description="Filter and maintain individual vehicle units, pricing per day, and statutory moderation status."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search fleet by brand, model..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-sky-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>
        }
      >
        {error && (
          <p
            role="alert"
            className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="grid gap-6 lg:grid-cols-2">
            {[1, 2, 3, 4].map((v) => (
              <div
                key={v}
                className="h-56 animate-pulse rounded-3xl bg-slate-100 dark:bg-slate-800/60"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <HostEmptyState
            icon={<Car className="size-8" />}
            title={query ? "No matching vehicles" : "No vehicles in fleet yet"}
            description={
              query
                ? `No vehicles found matching "${query}". Check your spelling or clear filters.`
                : "Add your first vehicle with registration papers, insurance certificate, and daily rental pricing."
            }
            action={
              !query ? (
                <Link
                  href="/host/rentals/new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-sky-700"
                >
                  <Plus className="size-4" />
                  Add vehicle
                </Link>
              ) : undefined
            }
          />
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {visible.map((row) => (
              <article
                key={row.id}
                className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white transition duration-200 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/90"
              >
                <div className="grid sm:grid-cols-[13rem_1fr]">
                  <div className="relative min-h-52 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={row.images?.[0] || row.imageUrl || "/car-rental.jpg"}
                      alt={row.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3 flex flex-col gap-1.5">
                      <HostPill tone={getStatusTone(row.status)} showDot>
                        {row.status.replaceAll("_", " ")}
                      </HostPill>
                    </div>
                  </div>

                  <div className="flex flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                          {row.brand}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {row.vehicleType}
                        </span>
                      </div>
                      <h3 className="mt-1.5 text-lg font-bold text-slate-950 dark:text-white line-clamp-1">
                        {row.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="size-3.5 text-slate-400" />
                        {row.city}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-800/50">
                          <strong className="block text-sm font-extrabold text-slate-950 dark:text-white">
                            ₹{Number(row.pricePerDay).toLocaleString("en-IN")}
                          </strong>
                          <span className="text-slate-500 dark:text-slate-400">/ day</span>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-800/50">
                          <strong className="block text-sm font-extrabold text-slate-950 dark:text-white">
                            {row.availableUnits}/{row.totalUnits}
                          </strong>
                          <span className="text-slate-500 dark:text-slate-400">units</span>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-800/50">
                          <strong className="block text-sm font-extrabold text-slate-950 dark:text-white">
                            {row._count?.RentalBooking ?? 0}
                          </strong>
                          <span className="text-slate-500 dark:text-slate-400">bookings</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Link
                        href={`/host/rentals/${row.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-sky-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                      >
                        <Edit3 className="size-3.5" />
                        Edit vehicle
                      </Link>
                      {row.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          disabled={archiving === row.id}
                          onClick={() => void archive(row.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Archive className="size-3.5" />
                          {archiving === row.id ? "Archiving…" : "Archive"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
          <span className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="size-4 text-sky-600 dark:text-sky-400" />
            Vehicles require valid RC, fitness certificate, and active commercial insurance.
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <CheckCircle2 className="size-4 text-sky-600 dark:text-sky-400" />
            All reservations include statutory pre-delivery vehicle condition inspections.
          </span>
        </div>
      </HostSection>
    </HostPage>
  )
}
