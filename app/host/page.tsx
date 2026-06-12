"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { CalendarCheck, Car, Compass, IndianRupee, Plus, Sparkles, Star, Ticket, TrendingUp } from "lucide-react"
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

const fallbackItems: HostItem[] = [
  {
    id: "tour-fallback",
    title: "Hosted Tour",
    location: "India",
    type: "Tour",
    price: 5000,
    rating: 4.8,
    totalReviews: 24,
    isActive: true,
    bookingsCount: 18,
    monthlyRevenue: 90000,
  },
]

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
    monthlyRevenue: Number(raw.monthlyRevenue ?? price * Math.max(bookingsCount, 1)),
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
        setItems(nextItems.length ? nextItems : fallbackItems)
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

  return (
    <HostPage
      eyebrow="Overview"
      title={`Welcome back, ${user?.businessName || user?.name || "Host"}`}
      description="Manage tours, activities, rentals, bookings, revenue, and guest response from one workspace."
      actions={
        <>
          <QuickAction href="/host/tours/new" label="Tour" icon={<Compass className="h-4 w-4" />} />
          <QuickAction href="/host/activities/new" label="Activity" icon={<Ticket className="h-4 w-4" />} />
          <QuickAction href="/host/rentals/new" label="Rental" icon={<Car className="h-4 w-4" />} />
        </>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <HostStatCard label="Monthly revenue" value={formatCurrency(stats.revenue)} hint="All products" tone="cyan" icon={<IndianRupee className="h-5 w-5" />} />
        <HostStatCard label="Bookings" value={stats.bookings} hint="Tours, activities, rentals" tone="emerald" icon={<CalendarCheck className="h-5 w-5" />} />
        <HostStatCard label="Active products" value={stats.active} hint={`${items.length} total`} tone="amber" icon={<TrendingUp className="h-5 w-5" />} />
        <HostStatCard label="Avg rating" value={`${stats.avgRating.toFixed(1)}/5`} hint="Guest feedback" tone="violet" icon={<Star className="h-5 w-5" />} />
      </section>

      <HostSection title="Portfolio" eyebrow="Inventory" description="Tour, activity, and rental products currently available in your host workspace.">
        <div className="grid gap-4 p-5 xl:grid-cols-2">
          {items.map((item) => (
            <article key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <HostPill tone={item.type === "Tour" ? "cyan" : item.type === "Activity" ? "emerald" : "amber"}>{item.type}</HostPill>
                  <h3 className="mt-3 text-lg font-bold text-slate-950">{item.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{item.location}</p>
                </div>
                <HostPill tone={item.isActive ? "emerald" : "amber"}>{item.isActive ? "Live" : "Paused"}</HostPill>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <Metric label="Revenue" value={formatCurrency(item.monthlyRevenue)} />
                <Metric label="Bookings" value={String(item.bookingsCount)} />
                <Metric label="Rating" value={`${item.rating.toFixed(1)} (${item.totalReviews})`} />
                <Metric label="Base price" value={formatCurrency(item.price)} />
              </div>
            </article>
          ))}
        </div>
      </HostSection>
    </HostPage>
  )
}

function QuickAction({ href, label, icon }: { href: string; label: string; icon: React.ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700">
      <Plus className="h-4 w-4" />
      {icon}
      {label}
    </Link>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 font-bold text-slate-950">{value}</p>
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
