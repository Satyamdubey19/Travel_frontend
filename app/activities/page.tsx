"use client"

import { Suspense, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import ResponsiveFilter from "@/components/ui/ResponsiveFilter"
import { activities as defaultActivities, type Activity, type ActivityCategory } from "@/lib/activities"
import api, { getApiErrorMessage } from "@/lib/axios"
import {
  ArrowRight,
  CalendarDays,
  Clock,
  Compass,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
} from "lucide-react"

const categoryOptions: { label: string; value: "all" | ActivityCategory }[] = [
  { label: "All", value: "all" },
  { label: "Adventure", value: "adventure" },
  { label: "Water", value: "water" },
  { label: "Heritage", value: "heritage" },
  { label: "Wellness", value: "wellness" },
  { label: "Food", value: "food" },
  { label: "Culture", value: "culture" },
  { label: "Nature", value: "nature" },
  { label: "Sports", value: "sports" },
]

function ActivitiesContent() {
  const searchParams = useSearchParams()
  const urlQ = searchParams.get("q") || searchParams.get("destination") || ""
  const urlCategory = searchParams.get("category") || "all"

  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [city, setCity] = useState("")
  const [userQuery, setUserQuery] = useState<string | null>(null)
  const [userCategory, setUserCategory] = useState<("all" | ActivityCategory) | null>(null)
  const [difficulty, setDifficulty] = useState("all")
  const [maxPrice, setMaxPrice] = useState(5000)
  const [sort, setSort] = useState("recommended")

  const query = userQuery ?? urlQ
  const category =
    userCategory ??
    (categoryOptions.some((opt) => opt.value === urlCategory)
      ? (urlCategory as "all" | ActivityCategory)
      : "all")

  useEffect(() => {
    void api
      .get<{ data: Activity[] }>("/activity")
      .then(({ data }) => {
        if (Array.isArray(data.data) && data.data.length > 0) {
          setActivities(data.data)
        } else {
          setActivities(defaultActivities)
        }
      })
      .catch((requestError) => {
        setActivities(defaultActivities)
        setError(getApiErrorMessage(requestError, "Showing curated activities"))
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredActivities = useMemo(() => {
    const normalizedCity = city.trim().toLowerCase()
    const normalizedQuery = query.trim().toLowerCase()

    return activities
      .filter((activity) => !normalizedCity || activity.city.toLowerCase().includes(normalizedCity))
      .filter((activity) => category === "all" || activity.category === category)
      .filter((activity) => difficulty === "all" || activity.difficulty === difficulty)
      .filter((activity) => activity.price <= maxPrice)
      .filter((activity) => {
        if (!normalizedQuery) return true
        return [
          activity.title,
          activity.area,
          activity.city,
          activity.category,
          ...activity.highlights,
        ].some((item) => item.toLowerCase().includes(normalizedQuery))
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price
        if (sort === "rating-desc") return b.rating - a.rating
        return b.reviews - a.reviews
      })
  }, [activities, category, city, difficulty, maxPrice, query, sort])

  const activityCities = useMemo(
    () => Array.from(new Set(activities.map((item) => item.city))).sort(),
    [activities]
  )
  const citySuggestions = city
    ? activityCities.filter((item) => item.toLowerCase().includes(city.toLowerCase()))
    : activityCities

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const elem = document.getElementById("activity-results")
    elem?.scrollIntoView({ behavior: "smooth" })
  }

  const handleResetFilters = () => {
    setCity("")
    setUserQuery("")
    setUserCategory("all")
    setDifficulty("all")
    setMaxPrice(5000)
    setSort("recommended")
  }

  return (
    <main>
      <section className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
            <div>
              <p className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white dark:border-slate-700 dark:bg-slate-800">
                <Sparkles size={14} />
                Book local experiences
              </p>
              <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.035em] text-slate-950 dark:text-white sm:text-5xl">
                Book the city beyond the checklist.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-slate-400">
                Search a city, filter by category, compare timings and difficulty, then reserve a
                real activity-style booking from verified local hosts.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_60%,#164e63_100%)] p-5 text-white shadow-xl shadow-slate-200 dark:shadow-none">
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: "Hosts", value: "Verified", icon: ShieldCheck },
                  { label: "Catalog", value: "Live supply", icon: Compass },
                  { label: "Instant plan", value: "Slots shown", icon: CalendarDays },
                ].map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/[.06] p-4">
                    <item.icon size={20} className="text-orange-200" />
                    <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSearchSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-800/80">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Search city, e.g. Goa, Rishikesh, Jaipur"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-700 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <label className="relative block">
                <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(event) => setUserQuery(event.target.value)}
                  placeholder="Search rafting, surfing, treks, yoga..."
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-cyan-700 focus:bg-white dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                />
              </label>
              <button
                type="submit"
                className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-cyan-900 shadow-md dark:bg-sky-600 dark:hover:bg-sky-500"
              >
                Search activities
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Popular:
              </span>
              {citySuggestions.slice(0, 7).map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() => {
                    setCity(item === city ? "" : item)
                    const elem = document.getElementById("activity-results")
                    elem?.scrollIntoView({ behavior: "smooth" })
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    city === item
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      <section id="activity-results" className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
        {error && (
          <div
            role="alert"
            className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-300"
          >
            {error}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-[19rem_1fr] items-start">
          {/* Responsive Filter (Sticky Sidebar on Desktop, Slide-over Drawer on Mobile) */}
          <aside className="w-full">
            <ResponsiveFilter
              title="Filters & Preferences"
              categories={categoryOptions}
              selectedCategory={category}
              onCategoryChange={(val) => setUserCategory(val as "all" | ActivityCategory)}
              difficulties={[
                { label: "Any difficulty", value: "all" },
                { label: "Easy", value: "Easy" },
                { label: "Moderate", value: "Moderate" },
                { label: "High", value: "High" },
              ]}
              selectedDifficulty={difficulty}
              onDifficultyChange={setDifficulty}
              minPrice={500}
              maxPrice={5000}
              priceRange={maxPrice}
              onPriceChange={setMaxPrice}
              sortOptions={[
                { label: "Recommended", value: "recommended" },
                { label: "Price: Low to High", value: "price-asc" },
                { label: "Top Rated", value: "rating-desc" },
              ]}
              selectedSort={sort}
              onSortChange={setSort}
              onReset={handleResetFilters}
              totalResults={filteredActivities.length}
              resultLabel="Experiences"
            />
          </aside>

          <div aria-busy={loading} className="min-w-0">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {filteredActivities.length} experiences available
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-950 dark:text-white">
                  Bookable activities
                </h2>
              </div>
              <p className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                {city ? `Showing ${city}` : "All service cities"}
              </p>
            </div>

            {loading ? (
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {[1, 2, 3].map((item) => (
                  <div
                    key={item}
                    className="h-[28rem] animate-pulse rounded-[1.5rem] bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-800 dark:ring-slate-700"
                  />
                ))}
              </div>
            ) : filteredActivities.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-amber-300 bg-amber-50/50 p-10 text-center dark:border-amber-700 dark:bg-amber-950/20">
                <Compass className="mx-auto size-10 text-amber-500" />
                <h3 className="mt-4 text-xl font-black text-slate-950 dark:text-white">
                  No activities match this search
                </h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Try adjusting filters or picking a different city to see exciting experiences!
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 rounded-xl bg-slate-950 px-5 py-2.5 text-xs font-bold text-white shadow-md hover:bg-cyan-700 transition dark:bg-white dark:text-slate-950"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredActivities.map((activity) => (
                  <Link
                    key={activity.slug}
                    href={`/activities/${activity.slug}`}
                    className="group flex flex-col h-full overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.07)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_22px_48px_-12px_rgba(15,23,42,0.18)]"
                  >
                    <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <Image
                        src={activity.image || "/tour1.jpg"}
                        alt={activity.title}
                        fill
                        sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 100vw"
                        className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/35" />

                      <div className="absolute top-3.5 left-3.5 z-10">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 backdrop-blur-md px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white border border-white/20 shadow-md">
                          <span className="size-1.5 rounded-full bg-cyan-400" />
                          {activity.category}
                        </span>
                      </div>

                      <div className="absolute top-3.5 right-3.5 z-10">
                        <span className="inline-flex items-center rounded-full bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-2.5 py-1 text-[10.5px] font-bold text-slate-800 dark:text-slate-200 shadow-sm border border-white/30 dark:border-white/10">
                          {activity.difficulty}
                        </span>
                      </div>

                      <div className="absolute bottom-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/95 border border-white/15 shadow-sm">
                        <Clock className="size-3 text-cyan-300" />
                        {activity.duration}
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col justify-between p-5 gap-3">
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                            <MapPin className="size-3.5 text-cyan-600 shrink-0" />
                            <span className="truncate">{activity.area || activity.city}, {activity.city}</span>
                          </div>

                          <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300 shrink-0">
                            <Star className="size-3.5 fill-amber-400 text-amber-400" />
                            <span>{activity.rating}</span>
                            <span className="font-normal text-slate-400 dark:text-slate-500">({activity.reviews})</span>
                          </div>
                        </div>

                        <h3 className="text-[17px] sm:text-lg font-extrabold text-slate-950 dark:text-white tracking-tight leading-snug mt-2 line-clamp-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                          {activity.title}
                        </h3>

                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {activity.highlights.slice(0, 2).map((item) => (
                            <span
                              key={item}
                              className="rounded-md bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50 truncate max-w-[150px]"
                            >
                              {item}
                            </span>
                          ))}
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500">
                          <Users className="size-3 text-cyan-600" />
                          <span>{activity.groupSize}</span>
                        </div>
                      </div>

                      <div className="flex items-end justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800 mt-auto">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                            Starting from
                          </p>
                          <div className="mt-0.5 flex items-baseline gap-1">
                            <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                              ₹{activity.price.toLocaleString("en-IN")}
                            </span>
                            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">/ person</span>
                          </div>
                        </div>

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 px-4 py-2 text-xs font-bold shadow-sm transition-all duration-300 group-hover:bg-cyan-700 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 group-hover:shadow-md shrink-0">
                          Book Now
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

export default function ActivitiesPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <Header />
      <Suspense
        fallback={
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="size-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
          </div>
        }
      >
        <ActivitiesContent />
      </Suspense>
      <Footer />
    </div>
  )
}