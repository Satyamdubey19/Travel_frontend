"use client"

import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Camera,
  CloudSun,
  Compass,
  Landmark,
  Leaf,
  MapPinned,
  Mountain,
  Navigation,
  Sparkles,
  Utensils,
} from "lucide-react"
import type { CityFact } from "@/types/sections"

const cityFacts: Record<string, CityFact[]> = {
  dehradun: [
    {
      title: "Best Stay Zone",
      value: "Rajpur Road",
      detail: "Central cafes, shopping streets, and quick access toward Mussoorie.",
      icon: MapPinned,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Weather Mood",
      value: "Valley breeze",
      detail: "Mornings are great for walks; evenings cool down fast around the hills.",
      icon: CloudSun,
      color: "from-amber-500 to-orange-400",
    },
    {
      title: "Local Bite",
      value: "Bakery trail",
      detail: "Try old-school bakeries and mountain-style cafes near the city center.",
      icon: Utensils,
      color: "from-rose-500 to-pink-400",
    },
    {
      title: "Quick Escape",
      value: "30-40 min",
      detail: "Sahastradhara and forest drives are easy half-day plans from most stays.",
      icon: Navigation,
      color: "from-emerald-500 to-teal-400",
    },
  ],
  mussoorie: [
    {
      title: "View Point",
      value: "Camel Back",
      detail: "Pick hillside stays for sunrise views and quieter evening walks.",
      icon: Mountain,
      color: "from-indigo-500 to-violet-400",
    },
    {
      title: "Best Window",
      value: "Mar-Jun",
      detail: "Peak pleasant weather, with early bookings recommended for weekends.",
      icon: CalendarDays,
      color: "from-emerald-500 to-lime-400",
    },
    {
      title: "Photo Stop",
      value: "Landour",
      detail: "Colonial lanes, cafes, and pine views make it a slow-travel favorite.",
      icon: Camera,
      color: "from-sky-500 to-blue-400",
    },
    {
      title: "Travel Tip",
      value: "Walk more",
      detail: "Mall Road parking is limited; choose stays with pickup or close access.",
      icon: Compass,
      color: "from-fuchsia-500 to-rose-400",
    },
  ],
  rishikesh: [
    {
      title: "Trip Style",
      value: "Riverfront",
      detail: "Book near Tapovan for cafes, yoga, rafting counters, and bridge access.",
      icon: Leaf,
      color: "from-emerald-500 to-teal-400",
    },
    {
      title: "Adventure Pulse",
      value: "Rafting",
      detail: "Morning slots are usually calmer and leave the day open for exploring.",
      icon: Navigation,
      color: "from-blue-500 to-cyan-400",
    },
    {
      title: "Evening Plan",
      value: "Ganga aarti",
      detail: "Reach early for better seating and a quieter riverside experience.",
      icon: Landmark,
      color: "from-amber-500 to-orange-400",
    },
    {
      title: "Stay Note",
      value: "Quiet lanes",
      detail: "Hill-facing boutique stays are better for remote work and longer visits.",
      icon: Sparkles,
      color: "from-violet-500 to-purple-400",
    },
  ],
  india: [
    {
      title: "Smart Booking",
      value: "Compare areas",
      detail: "Check location, cancellation, and host rating before locking a stay.",
      icon: MapPinned,
      color: "from-blue-500 to-indigo-400",
    },
    {
      title: "Best Value",
      value: "Weekdays",
      detail: "Mid-week stays often have calmer inventory and better deal pricing.",
      icon: CalendarDays,
      color: "from-emerald-500 to-teal-400",
    },
    {
      title: "Local First",
      value: "Ask hosts",
      detail: "Hosts can help with transfers, food recommendations, and nearby tours.",
      icon: Compass,
      color: "from-rose-500 to-orange-400",
    },
    {
      title: "Trip Comfort",
      value: "Plan buffers",
      detail: "Keep extra time for traffic, check-in windows, and weather changes.",
      icon: CloudSun,
      color: "from-violet-500 to-fuchsia-400",
    },
  ],
}

function getCachedCity() {
  if (typeof window === "undefined") return "India"

  try {
    const saved = JSON.parse(localStorage.getItem("userLocation") || "null")
    return saved?.city || "India"
  } catch {
    return "India"
  }
}

function resolveFacts(city: string) {
  const normalizedCity = city.toLowerCase()
  const matchedKey = Object.keys(cityFacts).find((key) => normalizedCity.includes(key))
  return cityFacts[matchedKey ?? "india"]
}

export default function CityFactsCarousel() {
  const [city, setCity] = useState("India")
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const facts = useMemo(() => resolveFacts(city), [city])

  useEffect(() => {
    const syncLocation = () => {
      const nextCity = getCachedCity()
      setCity((currentCity) => (currentCity === nextCity ? currentCity : nextCity))
      setActiveIndex(0)
    }

    const timeout = window.setTimeout(syncLocation, 0)
    window.addEventListener("storage", syncLocation)
    const interval = window.setInterval(syncLocation, 5000)

    return () => {
      window.clearTimeout(timeout)
      window.removeEventListener("storage", syncLocation)
      window.clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (isPaused) return

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % facts.length)
    }, 3200)

    return () => window.clearInterval(interval)
  }, [facts.length, isPaused])

  const previous = () => setActiveIndex((current) => (current - 1 + facts.length) % facts.length)
  const next = () => setActiveIndex((current) => (current + 1) % facts.length)

  const activeFact = facts[activeIndex]
  const ActiveIcon = activeFact.icon

  return (
    <section
      className="overflow-hidden bg-[#0d1424] py-16 text-white lg:py-20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-300">City pulse</p>
            <h2 className="mt-3 max-w-xl text-3xl font-black tracking-tight sm:text-4xl">
              Discover the hidden side of {city}.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
              Interactive insights and location-aware facts to help you choose your next destination.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {facts.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`rounded-2xl border p-5 text-left transition ${
                    index === activeIndex
                      ? "border-teal-300/50 bg-white/[0.11]"
                      : "border-white/10 bg-white/[0.06] hover:border-white/25"
                  }`}
                >
                  <item.icon className="size-5 text-teal-300" />
                  <p className="mt-4 text-sm font-bold">{item.title}</p>
                  <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-300">{item.detail}</p>
                </button>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-3">
              <button
                type="button"
                onClick={previous}
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-white transition hover:bg-white/15"
                aria-label="Previous city fact"
              >
                <ArrowLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="flex size-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.07] text-white transition hover:bg-white/15"
                aria-label="Next city fact"
              >
                <ArrowRight className="size-4" />
              </button>
              <div className="flex items-center gap-2 pl-2">
                {facts.map((fact, index) => (
                  <button
                    key={fact.title}
                    type="button"
                    onClick={() => setActiveIndex(index)}
                    className={`h-2 rounded-full transition-all ${
                      activeIndex === index ? "w-8 bg-teal-300" : "w-2 bg-white/25"
                    }`}
                    aria-label={`Show ${fact.title}`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="relative min-h-[420px] overflow-hidden rounded-[28px] bg-slate-900 shadow-2xl shadow-black/25">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-75"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#0d1424]/35 via-[#0d1424]/20 to-[#0d1424]/85" />
            <div className="absolute bottom-8 left-6 right-6 max-w-sm rounded-2xl bg-white p-6 text-slate-950 shadow-2xl sm:left-8">
              <ActiveIcon className="size-6 text-teal-700" />
              <p className="mt-5 text-sm font-semibold">Did you know?</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {activeFact.value}: {activeFact.detail}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
