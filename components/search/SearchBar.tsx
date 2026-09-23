"use client"

import { useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  CalendarDays,
  Compass,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
  X,
  ArrowRight,
  Flame,
} from "lucide-react"
import LocationInput from "./LocationInput"
import DatePicker from "@/components/ui/DatePicker"

export interface SearchBarProps {
  onSearch?: (query: string) => void
  onSearchSubmit?: (filters: {
    destination: string
    departure: string
    returnDate: string
    checkIn?: string
    checkOut?: string
    guests: number
  }) => void
  initialDestination?: string
  initialGuests?: number
  initialDeparture?: string
  initialReturn?: string
  initialCheckIn?: string
  initialCheckOut?: string
  variant?: "hero" | "compact" | "flat"
  className?: string
}

const POPULAR_DESTINATIONS = [
  "Spiti Valley",
  "Goa",
  "Manali",
  "Varkala Cliff",
  "Rishikesh",
  "Jaisalmer",
]

const SearchBar = ({
  onSearch,
  onSearchSubmit,
  initialDestination = "",
  initialGuests = 1,
  initialDeparture = "",
  initialReturn = "",
  initialCheckIn = "",
  initialCheckOut = "",
  variant = "hero",
  className = "",
}: SearchBarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [destination, setDestination] = useState(
    initialDestination || searchParams.get("q") || searchParams.get("destination") || ""
  )
  const [departure, setDeparture] = useState(
    initialDeparture ||
      initialCheckIn ||
      searchParams.get("departure") ||
      searchParams.get("checkIn") ||
      ""
  )
  const [returnDate, setReturnDate] = useState(
    initialReturn ||
      initialCheckOut ||
      searchParams.get("return") ||
      searchParams.get("checkOut") ||
      ""
  )
  const [guests, setGuests] = useState(
    initialGuests || Number(searchParams.get("guests")) || 1
  )
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const today = (() => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })()

  const executeSearch = (overrideDestination?: string) => {
    const query = (overrideDestination !== undefined ? overrideDestination : destination).trim()
    const validDeparture = departure >= today ? departure : ""
    const minReturn = validDeparture || today
    const validReturn = returnDate >= minReturn ? returnDate : ""

    onSearch?.(query)
    onSearchSubmit?.({
      destination: query,
      departure: validDeparture,
      returnDate: validReturn,
      checkIn: validDeparture,
      checkOut: validReturn,
      guests,
    })

    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (validDeparture) {
      params.set("departure", validDeparture)
      params.set("checkIn", validDeparture)
    }
    if (validReturn) {
      params.set("return", validReturn)
      params.set("checkOut", validReturn)
    }
    if (guests > 0) params.set("guests", String(guests))

    const isToursOrActivities = pathname === "/tours" || pathname === "/activities"
    const targetBase = isToursOrActivities ? pathname : "/tours"
    const target = params.toString() ? `${targetBase}?${params.toString()}` : targetBase

    setMobileDrawerOpen(false)

    if (pathname !== target) {
      router.push(target)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeSearch()
  }

  const travelersLabel = `${guests} ${guests === 1 ? "traveller" : "travellers"}`
  const isCompact = variant === "compact"

  return (
    <div className={`mx-auto w-full max-w-7xl ${className}`}>
      {/* ====================================================================
          1. MOBILE VIEW (< 1024px): SLEEK FLOATING CAPSULE & SLIDE-UP DRAWER
          ==================================================================== */}
      <div className="block lg:hidden">
        {/* Compact Floating Capsule Pill */}
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setMobileDrawerOpen(true)}
          className="relative flex h-13 w-full cursor-pointer items-center justify-between rounded-full border border-white/60 bg-white/95 px-3.5 shadow-[0_12px_32px_-4px_rgba(2,6,23,0.18)] backdrop-blur-2xl transition-all hover:border-cyan-400 hover:shadow-[0_16px_36px_-4px_rgba(6,182,212,0.22)] dark:border-slate-800 dark:bg-slate-900/95"
        >
          {/* Left Search Icon with Glowing Ring */}
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-md shadow-cyan-500/30">
              <Search className="size-4" />
            </span>

            {/* Middle Text Details */}
            <div className="min-w-0 text-left">
              <p className="truncate text-xs font-black tracking-tight text-slate-950 dark:text-white">
                {destination ? destination : "Where to in India?"}
              </p>
              <p className="truncate text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {departure ? `${departure} · ` : "Anytime · "}
                {travelersLabel}
              </p>
            </div>
          </div>

          {/* Right Filter Icon */}
          <div className="flex size-8.5 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-slate-50 text-slate-700 shadow-sm transition hover:bg-cyan-50 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <SlidersHorizontal className="size-3.5" />
          </div>
        </motion.div>

        {/* Mobile Slide-Up Modal Drawer */}
        <AnimatePresence>
          {mobileDrawerOpen && (
            <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileDrawerOpen(false)}
                className="absolute inset-0 bg-slate-950/70 backdrop-blur-md"
              />

              {/* Drawer Sheet */}
              <motion.div
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", damping: 28, stiffness: 300 }}
                className="relative z-10 flex max-h-[88vh] w-full max-w-lg flex-col overflow-hidden rounded-t-[2.25rem] border border-white/20 bg-white p-5 shadow-2xl sm:rounded-[2.25rem] dark:bg-slate-900 dark:border-slate-800"
              >
                {/* Drag Handle */}
                <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden" />

                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7.5 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                      <Compass className="size-4" />
                    </span>
                    <h3 className="text-base font-extrabold text-slate-950 dark:text-white">
                      Search Journeys
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(false)}
                    aria-label="Close search drawer"
                    className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  >
                    <X className="size-4" />
                  </button>
                </div>

                {/* Funny Meme Travel Tip */}
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-900 dark:text-amber-300">
                  <Flame className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                  <span className="text-[11px] font-semibold leading-tight">
                    Travel Truth: That Goa WhatsApp group will cancel unless you book the tickets now! 🌴
                  </span>
                </div>

                {/* Form Fields Container */}
                <div className="mt-3.5 space-y-3.5 overflow-y-auto pr-0.5 max-h-[58vh]">
                  {/* Location Input */}
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 focus-within:border-cyan-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-cyan-500/20 dark:border-slate-800 dark:bg-slate-850">
                    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      <MapPin className="size-3 text-cyan-600 dark:text-cyan-400" />
                      <span>Destination</span>
                    </label>
                    <LocationInput
                      value={destination}
                      onChange={(val) => setDestination(val)}
                      placeholder="e.g. Spiti Valley, Kerala, Goa"
                      className="mt-1 w-full border-0 bg-transparent p-0 text-sm font-bold text-slate-950 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white"
                    />

                    {/* Quick Pick Chips */}
                    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-slate-200/60 pt-2 dark:border-slate-800">
                      {POPULAR_DESTINATIONS.map((place) => (
                        <button
                          key={place}
                          type="button"
                          onClick={() => setDestination(place)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                            destination === place
                              ? "bg-cyan-600 text-white shadow-sm"
                              : "bg-white text-slate-700 hover:bg-cyan-50 hover:text-cyan-800 dark:bg-slate-800 dark:text-slate-300"
                          }`}
                        >
                          {place}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Dates Row: Departure & Return */}
                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Departure (formerly Check In) */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-850">
                      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <CalendarDays className="size-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Departure</span>
                      </label>
                      <div className="mt-1">
                        <DatePicker
                          value={departure}
                          onChange={(val: string) => {
                            if (val < today) return
                            setDeparture(val)
                            if (returnDate && val && returnDate <= val) setReturnDate("")
                          }}
                          min={today}
                          placeholder="Select date"
                          variant="inline"
                          hideCalendarIcon
                          hideTrailingIcon
                          align="center"
                        />
                      </div>
                    </div>

                    {/* Return (formerly Check Out) */}
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-850">
                      <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <CalendarDays className="size-3 text-violet-600 dark:text-violet-400" />
                        <span>Return</span>
                      </label>
                      <div className="mt-1">
                        <DatePicker
                          value={returnDate}
                          onChange={(val: string) => {
                            if (val < (departure || today)) return
                            setReturnDate(val)
                          }}
                          min={departure || today}
                          placeholder="Select date"
                          variant="inline"
                          hideCalendarIcon
                          hideTrailingIcon
                          align="center"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Travellers Counter */}
                  <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-850">
                    <div>
                      <p className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        <Users className="size-3 text-indigo-600 dark:text-indigo-400" />
                        <span>Travellers</span>
                      </p>
                      <p className="mt-0.5 text-sm font-bold text-slate-950 dark:text-white">
                        {travelersLabel}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setGuests((v) => Math.max(1, v - 1))}
                        disabled={guests <= 1}
                        className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-white font-bold text-slate-700 shadow-sm disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        -
                      </button>
                      <span className="min-w-[2rem] text-center text-sm font-black text-slate-950 dark:text-white">
                        {guests}
                      </span>
                      <button
                        type="button"
                        onClick={() => setGuests((v) => v + 1)}
                        className="flex size-8 items-center justify-center rounded-xl border border-slate-200 bg-white font-bold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Search CTA */}
                <div className="mt-4 pt-1">
                  <button
                    type="button"
                    onClick={() => executeSearch()}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 text-sm font-black text-white shadow-xl shadow-cyan-600/30 transition-all hover:shadow-cyan-600/40 active:scale-[0.98]"
                  >
                    <Search className="size-4" />
                    <span>Search Verified Journeys</span>
                    <ArrowRight className="size-4" />
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ====================================================================
          2. DESKTOP VIEW (>= 1024px): FROSTED GLASS HORIZON SEGMENTED PILL
             CRITICAL: hidden lg:grid PREVENTS STACKED DISPLAY ON MOBILE!
          ==================================================================== */}
      <form
        onSubmit={handleSubmit}
        className="relative z-20 hidden w-full items-stretch rounded-full border border-white/80 bg-white/90 p-2 shadow-[0_20px_50px_-10px_rgba(2,6,23,0.18)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_25px_65px_-8px_rgba(6,182,212,0.2)] lg:grid lg:grid-cols-[minmax(240px,1.3fr)_minmax(190px,0.9fr)_minmax(165px,0.8fr)_minmax(165px,0.8fr)_auto] dark:border-slate-800 dark:bg-slate-900/90"
      >
        {/* Destination / Location */}
        <div className="group relative flex items-center gap-3 rounded-full px-5 py-2.5 transition-all duration-200 hover:bg-slate-100/80 focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-cyan-500/30 dark:hover:bg-slate-800 dark:focus-within:bg-slate-800">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-700 transition group-hover:bg-cyan-500/20 group-hover:scale-105 dark:bg-cyan-400/10 dark:text-cyan-300">
            <MapPin className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Destination
            </p>
            <LocationInput
              value={destination}
              onChange={(value) => {
                setDestination(value)
                onSearch?.(value)
              }}
              placeholder="Where are you going?"
              className="w-full border-0 bg-transparent p-0 text-sm font-bold text-slate-950 placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-0 dark:text-white"
            />
          </div>
          <span className="pointer-events-none absolute right-0 h-8 w-[1px] bg-slate-200/80 group-hover:opacity-0 dark:bg-slate-800" />
        </div>

        {/* Travellers */}
        <div className="group relative flex items-center gap-3 rounded-full px-5 py-2.5 transition-all duration-200 hover:bg-slate-100/80 focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-indigo-500/30 dark:hover:bg-slate-800 dark:focus-within:bg-slate-800">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-700 transition group-hover:bg-indigo-500/20 group-hover:scale-105 dark:bg-indigo-400/10 dark:text-indigo-300">
            <Users className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Travellers
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <button
                type="button"
                onClick={() => setGuests((value) => Math.max(1, value - 1))}
                className="flex size-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 active:scale-95 disabled:opacity-30 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                disabled={guests <= 1}
                aria-label="Remove guest"
              >
                -
              </button>
              <span className="min-w-[5.2rem] text-center text-xs font-black text-slate-950 dark:text-white">
                {travelersLabel}
              </span>
              <button
                type="button"
                onClick={() => setGuests((value) => value + 1)}
                className="flex size-6 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100 active:scale-95 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                aria-label="Add guest"
              >
                +
              </button>
            </div>
          </div>
          <span className="pointer-events-none absolute right-0 h-8 w-[1px] bg-slate-200/80 group-hover:opacity-0 dark:bg-slate-800" />
        </div>

        {/* Departure (formerly Check in) */}
        <div className="group relative flex items-center gap-3 rounded-full px-5 py-2.5 transition-all duration-200 hover:bg-slate-100/80 focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-emerald-500/30 dark:hover:bg-slate-800 dark:focus-within:bg-slate-800">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-700 transition group-hover:bg-emerald-500/20 group-hover:scale-105 dark:bg-emerald-400/10 dark:text-emerald-300">
            <CalendarDays className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Departure
            </p>
            <DatePicker
              value={departure}
              onChange={(value: string) => {
                if (value < today) return
                setDeparture(value)
                if (returnDate && value && returnDate <= value) setReturnDate("")
              }}
              min={today}
              placeholder="Select date"
              variant="inline"
              hideCalendarIcon
              hideTrailingIcon
              align="left"
            />
          </div>
          <span className="pointer-events-none absolute right-0 h-8 w-[1px] bg-slate-200/80 group-hover:opacity-0 dark:bg-slate-800" />
        </div>

        {/* Return (formerly Check out) */}
        <div className="group relative flex items-center gap-3 rounded-full px-5 py-2.5 transition-all duration-200 hover:bg-slate-100/80 focus-within:bg-white focus-within:shadow-md focus-within:ring-2 focus-within:ring-violet-500/30 dark:hover:bg-slate-800 dark:focus-within:bg-slate-800">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-700 transition group-hover:bg-violet-500/20 group-hover:scale-105 dark:bg-violet-400/10 dark:text-violet-300">
            <CalendarDays className="size-4.5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              Return
            </p>
            <DatePicker
              value={returnDate}
              onChange={(value: string) => {
                if (value < (departure || today)) return
                setReturnDate(value)
              }}
              min={departure || today}
              placeholder="Select date"
              variant="inline"
              hideCalendarIcon
              hideTrailingIcon
              align="right"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center pl-2">
          <button
            type="submit"
            className={`group/btn relative flex items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 px-7 font-black text-white shadow-[0_12px_28px_rgba(6,182,212,0.35)] transition-all duration-300 hover:shadow-[0_16px_36px_rgba(6,182,212,0.5)] hover:scale-[1.02] active:scale-[0.98] before:absolute before:inset-y-0 before:-left-1/3 before:w-1/4 before:-skew-x-12 before:bg-white/30 before:blur-sm before:transition-all before:duration-700 hover:before:left-[115%] ${
              isCompact ? "h-11 text-xs" : "h-12 text-sm"
            }`}
            aria-label="Search Catalog"
          >
            <Search className="size-4 transition-transform duration-300 group-hover/btn:scale-110" />
            <span>Search</span>
            <Sparkles className="size-3 text-cyan-200 opacity-70 transition-opacity group-hover/btn:opacity-100" />
          </button>
        </div>
      </form>
    </div>
  )
}

export { SearchBar }
export default SearchBar
