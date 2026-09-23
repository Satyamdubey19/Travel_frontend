"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CalendarCheck,
  Car,
  Compass,
  IndianRupee,
  MapPin,
  Plus,
  Sparkles,
  Star,
  Ticket,
  TrendingUp,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { HostDashboardSkeleton } from "@/components/ui/loading-skeletons"
import { HostPage, HostPill, HostSection, HostStatCard } from "@/components/host/HostUI"
import api from "@/lib/axios"

type HostItem = {
  id: string
  title: string
  location: string
  type: "Tour" | "Activity" | "Rental"
  price: number
  rating: number
  totalReviews: number
  isActive: boolean
  bookingsCount: number
  monthlyRevenue: number
}

function normalizeItem(raw: Record<string, unknown>, type: HostItem["type"], index: number): HostItem {
  const price = Number(raw.price ?? raw.pricePerPerson ?? raw.pricePerDay ?? 0)
  const bookingsCount = Number(raw.bookingsCount ?? raw.totalBookings ?? 0)

  return {
    id: String(raw.id ?? `${type}-${index}`),
    title: String(raw.title ?? `${type} ${index + 1}`),
    location: String(raw.city ?? raw.location ?? "Location pending"),
    type,
    price,
    rating: Number(raw.averageRating ?? raw.rating ?? 0),
    totalReviews: Number(raw.totalReviews ?? 0),
    isActive: raw.isActive !== false,
    bookingsCount,
    monthlyRevenue: Number(raw.monthlyRevenue ?? price * Math.max(bookingsCount, 0)),
  }
}

export default function HostDashboard() {
  const { user } = useAuth()
  const [items, setItems] = useState<HostItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      const [tourResult, activityResult, rentalResult] = await Promise.allSettled([
        api.get("/tour?scope=mine"),
        api.get("/activity?scope=mine"),
        api.get("/rental?scope=mine"),
      ])

      const nextItems = [
        ...(tourResult.status === "fulfilled" && Array.isArray(tourResult.value.data?.data)
          ? tourResult.value.data.data.map((item: Record<string, unknown>, index: number) => normalizeItem(item, "Tour", index))
          : []),
        ...(activityResult.status === "fulfilled" && Array.isArray(activityResult.value.data?.data)
          ? activityResult.value.data.data.map((item: Record<string, unknown>, index: number) => normalizeItem(item, "Activity", index))
          : []),
        ...(rentalResult.status === "fulfilled" && Array.isArray(rentalResult.value.data?.data)
          ? rentalResult.value.data.data.map((item: Record<string, unknown>, index: number) => normalizeItem(item, "Rental", index))
          : []),
      ]

      if (!cancelled) {
        setItems(nextItems)
        setLoading(false)
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [user?.id])

  const stats = useMemo(() => {
    const active = items.filter((item) => item.isActive)
    const bookings = items.reduce((sum, item) => sum + item.bookingsCount, 0)
    const revenue = items.reduce((sum, item) => sum + item.monthlyRevenue, 0)
    const avgRating = items.length ? items.reduce((sum, item) => sum + item.rating, 0) / items.length : 0

    return { active: active.length, bookings, revenue, avgRating }
  }, [items])

  if (loading) return <HostDashboardSkeleton />

  const hostDisplayName = user?.businessName || user?.name || "Host"

  return (
    <HostPage
      breadcrumbs={[
        { label: "Host Studio", href: "/host" },
        { label: "Overview" },
      ]}
      eyebrow="Host Studio Desk"
      title={`Welcome back, ${hostDisplayName}`}
      description="Manage tours, activities, rentals, guest reservations, verified revenue, and real-time operations from one unified operations desk."
      badge={
        <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700 shadow-xs dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300">
          <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
          Active Operations
        </span>
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <QuickAction href="/host/tours/new" label="New Tour" icon={<Compass className="h-4 w-4" />} />
          <QuickAction href="/host/activities/new" label="New Activity" icon={<Ticket className="h-4 w-4" />} />
          <QuickAction href="/host/rentals/new" label="New Rental" icon={<Car className="h-4 w-4" />} />
        </div>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HostStatCard
          label="Monthly revenue"
          value={formatCurrency(stats.revenue)}
          hint="Gross verified bookings"
          tone="cyan"
          trend={{ value: "Current pace", positive: true }}
          icon={<IndianRupee className="h-6 w-6" />}
        />
        <HostStatCard
          label="Confirmed bookings"
          value={stats.bookings}
          hint="Across active supply"
          tone="emerald"
          trend={{ value: "100% fulfilled", positive: true }}
          icon={<CalendarCheck className="h-6 w-6" />}
        />
        <HostStatCard
          label="Active listings"
          value={stats.active}
          hint={`${items.length} total in catalog`}
          tone="amber"
          icon={<TrendingUp className="h-6 w-6" />}
        />
        <HostStatCard
          label="Guest rating"
          value={stats.avgRating > 0 ? `${stats.avgRating.toFixed(1)} / 5.0` : "No ratings"}
          hint="Verified traveler feedback"
          tone="violet"
          icon={<Star className="h-6 w-6" />}
        />
      </section>

      <HostSection
        title="Listing Portfolio"
        eyebrow="Live Supply"
        description="Your published and moderated supply available on the Travels Pro marketplace."
      >
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-6 text-center sm:p-12"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950 dark:text-sky-400">
              <Sparkles className="h-8 w-8" />
            </div>
            <h3 className="mt-4 text-xl font-extrabold text-slate-950 dark:text-white">
              No listings published yet
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Create your first guided tour, local activity, or vehicle rental to begin receiving verified bookings and guest inquiries.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <Link
                href="/host/tours/new"
                className="group flex flex-col items-center rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 text-center transition hover:-translate-y-1 hover:border-sky-400 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700 transition group-hover:bg-sky-600 group-hover:text-white dark:bg-sky-950 dark:text-sky-300">
                  <Compass className="h-6 w-6" />
                </div>
                <p className="mt-4 font-bold text-slate-950 dark:text-white">Create a Tour</p>
                <p className="mt-1 text-xs text-slate-500">Multi-day treks, expeditions, and guided hikes</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-sky-600 group-hover:text-sky-700">
                  Get started <ArrowRight className="h-3 w-3" />
                </span>
              </Link>

              <Link
                href="/host/activities/new"
                className="group flex flex-col items-center rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 text-center transition hover:-translate-y-1 hover:border-emerald-400 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-300">
                  <Ticket className="h-6 w-6" />
                </div>
                <p className="mt-4 font-bold text-slate-950 dark:text-white">Host an Activity</p>
                <p className="mt-1 text-xs text-slate-500">Day excursions, culinary walks, and workshops</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-emerald-600 group-hover:text-emerald-700">
                  Get started <ArrowRight className="h-3 w-3" />
                </span>
              </Link>

              <Link
                href="/host/rentals/new"
                className="group flex flex-col items-center rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 text-center transition hover:-translate-y-1 hover:border-amber-400 hover:bg-white hover:shadow-lg dark:border-slate-800 dark:bg-slate-800/50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 transition group-hover:bg-amber-600 group-hover:text-white dark:bg-amber-950 dark:text-amber-300">
                  <Car className="h-6 w-6" />
                </div>
                <p className="mt-4 font-bold text-slate-950 dark:text-white">List a Rental</p>
                <p className="mt-1 text-xs text-slate-500">Overland 4x4s, bikes, campervans, and self-drives</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-amber-600 group-hover:text-amber-700">
                  Get started <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            </div>
          </motion.div>
        ) : (
          <div className="grid gap-4 p-5 xl:grid-cols-2">
            {items.map((item) => (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <HostPill tone={item.type === "Tour" ? "cyan" : item.type === "Activity" ? "emerald" : "amber"}>
                      {item.type}
                    </HostPill>
                    <h3 className="mt-3 text-lg font-bold text-slate-950 dark:text-white">{item.title}</h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" />
                      {item.location}
                    </p>
                  </div>
                  <HostPill tone={item.isActive ? "emerald" : "amber"}>
                    {item.isActive ? "Live in Catalog" : "Paused"}
                  </HostPill>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 text-xs">
                  <Metric label="Revenue" value={formatCurrency(item.monthlyRevenue)} />
                  <Metric label="Bookings" value={String(item.bookingsCount)} />
                  <Metric label="Rating" value={item.rating > 0 ? `${item.rating.toFixed(1)} ★` : "New"} />
                  <Metric label="Price" value={formatCurrency(item.price)} />
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </HostSection>
    </HostPage>
  )
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-sky-600 active:scale-95 dark:bg-white dark:text-slate-950 dark:hover:bg-sky-100"
    >
      <Plus className="h-3.5 w-3.5" />
      {icon}
      <span>{label}</span>
    </Link>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 px-3.5 py-2.5 dark:border-slate-800 dark:bg-slate-800/50">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-1 font-sans font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  )
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}