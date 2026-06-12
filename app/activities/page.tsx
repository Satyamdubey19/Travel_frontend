"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import { activities, activityCities, ActivityCategory } from "@/lib/activities"
import {
  CalendarDays,
  Compass,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Timer,
  Users,
} from "lucide-react"

const categoryOptions: { label: string; value: "all" | ActivityCategory }[] = [
  { label: "All", value: "all" },
  { label: "Adventure", value: "adventure" },
  { label: "Water", value: "water" },
  { label: "Heritage", value: "heritage" },
  { label: "Wellness", value: "wellness" },
  { label: "Food", value: "food" },
]

export default function ActivitiesPage() {
  const [city, setCity] = useState("")
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<"all" | ActivityCategory>("all")
  const [difficulty, setDifficulty] = useState("all")
  const [maxPrice, setMaxPrice] = useState(4000)
  const [sort, setSort] = useState("recommended")

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
        return [activity.title, activity.area, activity.city, activity.category, ...activity.highlights].some((item) =>
          item.toLowerCase().includes(normalizedQuery),
        )
      })
      .sort((a, b) => {
        if (sort === "price-asc") return a.price - b.price
        if (sort === "rating-desc") return b.rating - a.rating
        return b.reviews - a.reviews
      })
  }, [category, city, difficulty, maxPrice, query, sort])

  const citySuggestions = city ? activityCities.filter((item) => item.toLowerCase().includes(city.toLowerCase())) : activityCities

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main>
        <section className="border-b border-slate-200 bg-white">
          <div className="container mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-14">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
              <div>
                <p className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  <Sparkles size={14} />
                  Book local experiences
                </p>
                <h1 className="mt-5 text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Activities, tours, and city experiences.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  Search a city, filter by category, compare timings and difficulty, then reserve a real activity-style booking from the detail page.
                </p>
              </div>

              <div className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,#0f172a_0%,#1f2937_52%,#7c2d12_100%)] p-5 text-white shadow-xl shadow-slate-200">
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    { label: "Hosts", value: "Verified", icon: ShieldCheck },
                    { label: "Categories", value: "5 types", icon: Compass },
                    { label: "Instant plan", value: "Slots shown", icon: CalendarDays },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/10 p-4">
                      <item.icon size={20} className="text-orange-200" />
                      <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">{item.label}</p>
                      <p className="mt-1 text-sm font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm">
              <div className="grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                <label className="relative block">
                  <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    placeholder="Search city, e.g. Goa, Rishikesh, Jaipur"
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </label>
                <label className="relative block">
                  <SlidersHorizontal className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search rafting, food, fort, yoga..."
                    className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 pl-12 pr-4 text-sm font-medium text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
                  />
                </label>
                <Link
                  href="#activity-results"
                  className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800"
                >
                  Search activities
                </Link>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {citySuggestions.slice(0, 7).map((item) => (
                  <button
                    key={item}
                    onClick={() => setCity(item)}
                    className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-950 hover:text-white"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="activity-results" className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12">
          <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
            <aside className="h-fit rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-24">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-950">Filters</h2>
                <button
                  onClick={() => {
                    setCity("")
                    setQuery("")
                    setCategory("all")
                    setDifficulty("all")
                    setMaxPrice(4000)
                    setSort("recommended")
                  }}
                  className="text-xs font-bold text-slate-500 hover:text-slate-950"
                >
                  Reset
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Category</p>
                  <div className="flex flex-wrap gap-2">
                    {categoryOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setCategory(option.value)}
                        className={`rounded-full border px-3 py-2 text-xs font-bold capitalize transition ${
                          category === option.value ? "border-slate-950 bg-slate-950 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Difficulty</p>
                  <select
                    value={difficulty}
                    onChange={(event) => setDifficulty(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
                  >
                    <option value="all">Any difficulty</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Max price</p>
                    <span className="text-xs font-bold text-slate-900">Rs. {maxPrice.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="500"
                    max="5000"
                    step="100"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(Number(event.target.value))}
                    className="w-full accent-slate-950"
                  />
                </div>

                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Sort</p>
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                    className="h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none"
                  >
                    <option value="recommended">Recommended</option>
                    <option value="price-asc">Price low to high</option>
                    <option value="rating-desc">Top rated</option>
                  </select>
                </div>
              </div>
            </aside>

            <div>
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
                <div>
                  <p className="text-sm font-semibold text-slate-500">{filteredActivities.length} experiences available</p>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">Bookable activities</h2>
                </div>
                <p className="rounded-full bg-white px-4 py-2 text-xs font-bold text-slate-600 shadow-sm ring-1 ring-slate-200">
                  {city ? `Showing ${city}` : "All service cities"}
                </p>
              </div>

              {filteredActivities.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white p-10 text-center">
                  <Compass className="mx-auto size-10 text-slate-300" />
                  <h3 className="mt-4 text-lg font-bold text-slate-950">No activities match this search</h3>
                  <p className="mt-2 text-sm text-slate-500">Try a nearby city, category, or higher price limit.</p>
                </div>
              ) : (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {filteredActivities.map((activity) => (
                    <Link
                      key={activity.slug}
                      href={`/activities/${activity.slug}`}
                      className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
                    >
                      <div className="relative h-56 overflow-hidden bg-slate-100">
                        <img src={activity.image} alt={activity.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold capitalize text-slate-900 shadow-sm">
                          {activity.category}
                        </span>
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/70">{activity.city}</p>
                          <h3 className="mt-1 text-xl font-black">{activity.title}</h3>
                        </div>
                      </div>
                      <div className="p-5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                            <Star className="size-4 fill-amber-400 text-amber-400" />
                            {activity.rating} <span className="font-medium text-slate-400">({activity.reviews})</span>
                          </span>
                          <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-700">{activity.difficulty}</span>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                          <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-2 font-semibold"><Timer size={14} />{activity.duration}</span>
                          <span className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-2 font-semibold"><Users size={14} />{activity.groupSize}</span>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {activity.highlights.slice(0, 2).map((item) => (
                            <span key={item} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{item}</span>
                          ))}
                        </div>
                        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
                          <div>
                            <p className="text-xs font-semibold text-slate-400">Per person</p>
                            <p className="text-xl font-black text-slate-950">Rs. {activity.price.toLocaleString()}</p>
                          </div>
                          <span className="rounded-xl bg-slate-950 px-4 py-2 text-xs font-bold text-white">View details</span>
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
      <Footer />
    </div>
  )
}
