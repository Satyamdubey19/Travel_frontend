"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  Archive,
  CalendarDays,
  CheckCircle2,
  Edit3,
  MapPin,
  Plus,
  Search,
  Sparkles,
  Star,
  Ticket,
  Users,
} from "lucide-react"
import { HostPage, HostSection, HostStatCard, HostPill, HostEmptyState, type Tone } from "@/components/host/HostUI"
import api, { getApiErrorMessage } from "@/lib/axios"

type ActivityRow = {
  id: string
  title: string
  city: string
  area?: string | null
  category: string
  status: string
  isActive: boolean
  isApproved: boolean
  images?: string[]
  imageUrl?: string | null
  price: string | number
  totalBookings: number
  averageRating: number
  _count?: { ActivityBooking?: number; Review?: number }
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

export default function HostActivitiesPage() {
  const [rows, setRows] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    void api
      .get<{ data: ActivityRow[] }>("/activity?scope=mine")
      .then(({ data }) => setRows(data.data ?? []))
      .catch((requestError) =>
        setError(getApiErrorMessage(requestError, "Activities could not be loaded"))
      )
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(
    () =>
      rows.filter(
        (row) =>
          !query.trim() ||
          [row.title, row.city, row.category, row.status].some((value) =>
            value.toLowerCase().includes(query.trim().toLowerCase())
          )
      ),
    [query, rows]
  )

  const stats = useMemo(() => {
    const active = rows.filter((r) => r.status === "ACTIVE" && r.isApproved).length
    const bookings = rows.reduce(
      (sum, r) => sum + (r.totalBookings ?? r._count?.ActivityBooking ?? 0),
      0
    )
    const rated = rows.filter((r) => Number(r.averageRating) > 0)
    const avgRating = rated.length
      ? (rated.reduce((sum, r) => sum + Number(r.averageRating), 0) / rated.length).toFixed(1)
      : "0.0"
    return { active, bookings, avgRating }
  }, [rows])

  const archive = async (id: string) => {
    setBusy(id)
    try {
      await api.delete(`/activity/${id}`)
      setRows((items) =>
        items.map((item) =>
          item.id === id
            ? { ...item, status: "ARCHIVED", isActive: false, isApproved: false }
            : item
        )
      )
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Activity could not be archived"))
    } finally {
      setBusy(null)
    }
  }

  return (
    <HostPage
      breadcrumbs={[
        { label: "Host Studio", href: "/host" },
        { label: "Activities" },
      ]}
      eyebrow="Experience Operations"
      title="Host Activity Studio"
      description="Manage local experiences, moderation status, dated traveler capacity, and customer reviews."
      badge={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          {rows.length} Activities Listed
        </span>
      }
      actions={
        <Link
          href="/host/activities/new"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-emerald-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Plus className="size-4" />
          Add activity
        </Link>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HostStatCard
          label="Total activities"
          value={rows.length}
          hint="Created in your portfolio"
          tone="emerald"
          icon={<Ticket className="h-6 w-6" />}
        />
        <HostStatCard
          label="Approved & live"
          value={stats.active}
          hint="Bookable by travelers"
          tone="cyan"
          trend={{ value: "Live supply", positive: true }}
          icon={<CheckCircle2 className="h-6 w-6" />}
        />
        <HostStatCard
          label="Total bookings"
          value={stats.bookings}
          hint="Across all activity slots"
          tone="amber"
          icon={<Users className="h-6 w-6" />}
        />
        <HostStatCard
          label="Guest rating"
          value={stats.avgRating !== "0.0" ? `${stats.avgRating} / 5.0` : "No ratings"}
          hint="Verified traveler reviews"
          tone="violet"
          icon={<Star className="h-6 w-6" />}
        />
      </section>

      <HostSection
        title="Activity Inventory"
        eyebrow="Portfolio & Schedules"
        description="Filter and configure your bookable experiences, daily capacity, and pricing."
        actions={
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search experiences..."
              className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
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
            icon={<Sparkles className="size-8" />}
            title={query ? "No matching activities" : "No activities yet"}
            description={
              query
                ? `No activities found matching "${query}". Try adjusting your search query.`
                : "Create your first experience or guided activity with custom schedules and pricing."
            }
            action={
              !query ? (
                <Link
                  href="/host/activities/new"
                  className="inline-flex items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
                >
                  <Plus className="size-4" />
                  Create experience
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
                      src={row.images?.[0] || row.imageUrl || "/activity.jpg"}
                      alt={row.title}
                      className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    />
                    <div className="absolute left-3 top-3">
                      <HostPill tone={getStatusTone(row.status)} showDot>
                        {row.status.replaceAll("_", " ")}
                      </HostPill>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between p-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                        {row.category}
                      </p>
                      <h3 className="mt-1.5 text-lg font-bold text-slate-950 dark:text-white line-clamp-1">
                        {row.title}
                      </h3>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <MapPin className="size-3.5 text-slate-400" />
                        {row.area ? `${row.area}, ` : ""}
                        {row.city}
                      </p>

                      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-800/50">
                          <strong className="block text-sm font-extrabold text-slate-950 dark:text-white">
                            ₹{Number(row.price).toLocaleString("en-IN")}
                          </strong>
                          <span className="text-slate-500 dark:text-slate-400">/ guest</span>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-800/50">
                          <strong className="block text-sm font-extrabold text-slate-950 dark:text-white">
                            {row.totalBookings ?? row._count?.ActivityBooking ?? 0}
                          </strong>
                          <span className="text-slate-500 dark:text-slate-400">bookings</span>
                        </div>
                        <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-2 dark:border-slate-800 dark:bg-slate-800/50">
                          <strong className="block text-sm font-extrabold text-slate-950 dark:text-white">
                            {row._count?.Review ?? 0}
                          </strong>
                          <span className="text-slate-500 dark:text-slate-400">reviews</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <Link
                        href={`/host/activities/${row.id}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
                      >
                        <Edit3 className="size-3.5" />
                        Edit & slots
                      </Link>
                      {row.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          disabled={busy === row.id}
                          onClick={() => void archive(row.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-bold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          <Archive className="size-3.5" />
                          {busy === row.id ? "Archiving…" : "Archive"}
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
            <CalendarDays className="size-4 text-emerald-600 dark:text-emerald-400" />
            Use <strong>Edit & slots</strong> to configure date-specific session windows.
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Users className="size-4 text-emerald-600 dark:text-emerald-400" />
            Confirmed booked capacity is strictly protected against accidental deletion.
          </span>
        </div>
      </HostSection>
    </HostPage>
  )
}
