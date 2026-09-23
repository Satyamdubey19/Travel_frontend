"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowRight, Car, Gauge, MapPin, Search, ShieldCheck, Sparkles, Star, Zap } from "lucide-react"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import api, { getApiErrorMessage } from "@/lib/axios"
import { rentals as defaultRentals, type Rental, type RentalType } from "@/lib/rentals"

import ResponsiveFilter from "@/components/ui/ResponsiveFilter"

function CarRentalContent() {
  const searchParams = useSearchParams()
  const urlQ = searchParams.get("q") || searchParams.get("destination") || ""
  const urlType = (searchParams.get("type") as "all" | RentalType) || "all"

  const [rentals, setRentals] = useState<Rental[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userQuery, setUserQuery] = useState<string | null>(null)
  const [userType, setUserType] = useState<("all" | RentalType) | null>(null)
  const [sort, setSort] = useState("recommended")
  const [maxPrice, setMaxPrice] = useState(25000)

  const query = userQuery ?? urlQ
  const type = userType ?? urlType

  useEffect(() => {
    void api
      .get<{ data: Rental[] }>("/rental")
      .then(({ data }) => {
        if (Array.isArray(data.data) && data.data.length > 0) {
          setRentals(data.data)
        } else {
          setRentals(defaultRentals)
        }
      })
      .catch((requestError) => {
        setRentals(defaultRentals)
        setError(getApiErrorMessage(requestError, "Showing curated rentals"))
      })
      .finally(() => setLoading(false))
  }, [])

  const visible = useMemo(
    () =>
      rentals
        .filter((rental) => {
          const needle = query.trim().toLowerCase()
          return (
            (type === "all" || rental.type === type) &&
            rental.pricePerDay <= maxPrice &&
            (!needle ||
              [rental.title, rental.brand, rental.city, rental.pickupArea].some((value) =>
                value.toLowerCase().includes(needle)
              ))
          )
        })
        .sort((a, b) =>
          sort === "price"
            ? a.pricePerDay - b.pricePerDay
            : sort === "rating"
            ? b.rating - a.rating
            : b.reviews - a.reviews
        ),
    [query, rentals, sort, type, maxPrice]
  )

  return (
    <main>
      <section className="border-b border-white/60 px-4 py-12 sm:px-6 lg:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_.8fr] lg:items-end">
          <div>
            <p className="inline-flex items-center gap-2 rounded-lg border border-cyan-200/60 bg-white/70 px-3 py-1.5 text-xs font-bold uppercase tracking-[.2em] text-cyan-900 backdrop-blur-xl">
              <Sparkles className="size-4" /> Verified local mobility
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl font-extrabold tracking-[-.035em] text-slate-950 sm:text-6xl">
              The right ride, with the terms visible.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
              Book active vehicles only from approved local hosts. Dates, price, documents,
              deposit and cancellation terms stay visible before payment.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-slate-800 bg-slate-700 shadow-[0_24px_70px_rgba(15,23,42,.12)]">
            {[
              { icon: ShieldCheck, value: "Reviewed", label: "supply" },
              { icon: Zap, value: "Clear", label: "terms" },
              { icon: Gauge, value: "Live", label: "availability" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="bg-slate-950 p-4 text-white">
                <Icon className="size-5 text-cyan-300" />
                <p className="mt-4 text-sm font-bold">{value}</p>
                <p className="text-[11px] text-white/55">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-9 flex max-w-7xl flex-col gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-xl shadow-slate-200/50 backdrop-blur-2xl sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setUserQuery(event.target.value)}
              placeholder="Search city, area, brand or vehicle model..."
              className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none focus:border-cyan-700 focus:bg-white"
            />
          </label>
          <select
            value={type}
            onChange={(event) => setUserType(event.target.value as "all" | RentalType)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none"
          >
            <option value="all">All vehicles</option>
            <option value="car">Cars &amp; SUVs</option>
            <option value="bike">Bikes &amp; scooters</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 outline-none"
          >
            <option value="recommended">Recommended</option>
            <option value="price">Lowest price</option>
            <option value="rating">Top rated</option>
          </select>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        {error && (
          <p role="alert" className="mb-5 rounded-2xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700">
            {error}
          </p>
        )}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-cyan-700">{visible.length} bookable options</p>
            <h2 className="text-2xl font-black text-slate-950">Choose your ride</h2>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[18rem_1fr] items-start">
          {/* Responsive Filter (Sticky Sidebar on Desktop, Slide-over Drawer on Mobile) */}
          <aside className="w-full">
            <ResponsiveFilter
              title="Vehicle Filters"
              categories={[
                { label: "All vehicles", value: "all" },
                { label: "Cars & SUVs", value: "car" },
                { label: "Bikes & Scooters", value: "bike" },
              ]}
              selectedCategory={type}
              onCategoryChange={(val) => setUserType(val as "all" | RentalType)}
              difficulties={[]}
              minPrice={500}
              maxPrice={25000}
              priceRange={maxPrice}
              onPriceChange={(val) => setMaxPrice(val)}
              currencyPrefix="₹"
              sortOptions={[
                { label: "Recommended", value: "recommended" },
                { label: "Lowest price", value: "price" },
                { label: "Top rated", value: "rating" },
                { label: "Most reviewed", value: "reviews" },
              ]}
              selectedSort={sort}
              onSortChange={(val) => setSort(val)}
              onReset={() => {
                setUserQuery("")
                setUserType("all")
                setMaxPrice(25000)
                setSort("recommended")
              }}
              totalResults={visible.length}
              resultLabel="Vehicles"
            />
          </aside>

          {/* Vehicles Content Grid */}
          <div className="min-w-0">
            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-[30rem] animate-pulse rounded-2xl bg-white/70" />
                ))}
              </div>
            ) : visible.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-amber-300 bg-amber-50/50 p-12 text-center max-w-xl mx-auto">
                <Car className="mx-auto size-12 text-amber-500" />
                <h3 className="mt-4 text-2xl font-black text-slate-950">No verified rentals match</h3>
                <p className="mt-2 text-sm text-slate-600">
                  &ldquo;Dil chahta hai Ladakh bike expedition, par iss jagah gaadi nahi mili!&rdquo; 🏍️💸
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Try searching for popular hubs like Goa, Manali, Leh, or Rishikesh.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setUserQuery("")
                    setUserType("all")
                    setMaxPrice(25000)
                    setSort("recommended")
                  }}
                  className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-cyan-700 transition"
                >
                  Show All Vehicles
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {visible.map((rental) => (
              <Link
                key={rental.slug}
                href={`/car-rental/${rental.slug}`}
                className="group flex flex-col h-full overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.07)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_22px_48px_-12px_rgba(15,23,42,0.18)]"
              >
                {/* Visual Image Header */}
                <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <Image
                    src={rental.image}
                    alt={rental.title}
                    fill
                    sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/35" />

                  {/* Top Left Vehicle Type */}
                  <div className="absolute top-3.5 left-3.5 z-10">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 backdrop-blur-md px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white border border-white/20 shadow-md">
                      <span className="size-1.5 rounded-full bg-cyan-400" />
                      {rental.type}
                    </span>
                  </div>

                  {/* Top Right Brand Pill */}
                  <div className="absolute top-3.5 right-3.5 z-10">
                    <span className="inline-flex items-center rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200 shadow-sm border border-white/30 dark:border-white/10">
                      {rental.brand}
                    </span>
                  </div>

                  {/* Bottom Left Pickup Location */}
                  <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/95 border border-white/15 shadow-sm truncate max-w-[75%]">
                    <MapPin className="size-3 text-cyan-300 shrink-0" />
                    <span className="truncate">{rental.pickupArea}, {rental.city}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-5 gap-3">
                  <div>
                    {/* Header City & Rating */}
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {rental.city} Hub
                      </p>

                      <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300 shrink-0">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        <span>{rental.rating || "4.9"}</span>
                        <span className="font-normal text-slate-400 dark:text-slate-500">({rental.reviews || 48})</span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-[17px] sm:text-lg font-extrabold text-slate-950 dark:text-white tracking-tight leading-snug mt-1.5 line-clamp-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                      {rental.title}
                    </h3>

                    {/* Specs Pills */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {[rental.transmission, rental.fuel, rental.engine]
                        .filter(Boolean)
                        .slice(0, 3)
                        .map((spec) => (
                          <span
                            key={spec}
                            className="rounded-md bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                          >
                            {spec}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Pricing & CTA */}
                  <div className="flex items-end justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800 mt-auto">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                        Starting from
                      </p>
                      <div className="mt-0.5 flex items-baseline gap-1">
                        <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                          ₹{rental.pricePerDay.toLocaleString("en-IN")}
                        </span>
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ day</span>
                      </div>
                    </div>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-4 py-2 text-xs font-bold shadow-sm transition-all duration-300 group-hover:bg-cyan-700 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 group-hover:shadow-md shrink-0">
                      Book Ride
                      <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
          </div>
        </div>
      </section>
    </main>
  )
}

export default function CarRentalPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_8%_5%,rgba(6,182,212,.16),transparent_28%),radial-gradient(circle_at_90%_0%,rgba(99,102,241,.14),transparent_24%),#f8fafc]">
      <Header />
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        }
      >
        <CarRentalContent />
      </Suspense>
      <Footer />
    </div>
  )
}
