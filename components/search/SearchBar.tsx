"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { CalendarDays, MapPin, Search, Users } from "lucide-react"
import LocationInput from "./LocationInput"
import DatePicker from "./DatePicker"
import type { SearchBarProps } from "@/types/search"

const SearchBar = ({ onSearch }: SearchBarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const [destination, setDestination] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [guests, setGuests] = useState(1)

  const today = (() => {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  })()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const query = destination.trim()
    const validCheckIn = checkIn >= today ? checkIn : ""
    const minCheckOut = validCheckIn || today
    const validCheckOut = checkOut >= minCheckOut ? checkOut : ""

    onSearch?.(query)

    const params = new URLSearchParams()
    if (query) params.set("q", query)
    if (validCheckIn) params.set("checkIn", validCheckIn)
    if (validCheckOut) params.set("checkOut", validCheckOut)
    if (guests > 0) params.set("guests", String(guests))

    const target = params.toString() ? `/tours?${params.toString()}` : "/tours"
    if (pathname !== target) router.push(target)
  }

  const inputClass =
    "w-full border-0 bg-transparent p-0 text-sm font-semibold text-slate-800 outline-none placeholder:font-medium placeholder:text-slate-400 focus:ring-0"

  const travelersLabel = `${guests} ${guests === 1 ? "traveller" : "travellers"}`

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <form
        onSubmit={handleSubmit}
        className="relative z-20 mx-auto grid w-full gap-2 overflow-visible rounded-[28px] border border-white/80 bg-white p-2 shadow-[0_24px_70px_rgba(15,23,42,0.16)] ring-1 ring-slate-900/5"
        style={{ gridTemplateColumns: "minmax(260px, 1.35fr) minmax(220px, 0.9fr) minmax(190px, 1fr) minmax(190px, 1fr) minmax(140px, auto)" }}
      >
        <div className="group flex min-w-0 items-center gap-3 rounded-3xl border border-transparent bg-slate-50 px-4 py-3 transition hover:border-rose-100 hover:bg-white hover:shadow-sm focus-within:border-rose-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-50">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-rose-600 shadow-sm ring-1 ring-slate-200/80">
            <MapPin className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Location</p>
            <LocationInput
              value={destination}
              onChange={(value) => {
                setDestination(value)
                onSearch?.(value)
              }}
              placeholder="Where are you going?"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-3xl border border-transparent bg-slate-50 px-4 py-3 transition hover:border-rose-100 hover:bg-white hover:shadow-sm">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200/80">
            <Users className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Travellers</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setGuests((value) => Math.max(1, value - 1))}
                className="flex size-7 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                disabled={guests <= 1}
                aria-label="Remove guest"
              >
                -
              </button>
              <span className="min-w-[6.5rem] text-center text-sm font-semibold text-slate-800">{travelersLabel}</span>
              <button
                type="button"
                onClick={() => setGuests((value) => value + 1)}
                className="flex size-7 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-black text-slate-500 transition hover:border-slate-300 hover:text-slate-900"
                aria-label="Add guest"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3 rounded-3xl border border-transparent bg-slate-50 px-4 py-3 transition hover:border-rose-100 hover:bg-white hover:shadow-sm focus-within:border-rose-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-50">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200/80">
            <CalendarDays className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Check in</p>
            <DatePicker
              value={checkIn}
              onChange={(value: string) => {
                if (value < today) return
                setCheckIn(value)
                if (checkOut && value && checkOut <= value) setCheckOut("")
              }}
              min={today}
              placeholder="Add date"
              hideTrailingIcon
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-3 rounded-3xl border border-transparent bg-slate-50 px-4 py-3 transition hover:border-rose-100 hover:bg-white hover:shadow-sm focus-within:border-rose-200 focus-within:bg-white focus-within:ring-4 focus-within:ring-rose-50">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-indigo-700 shadow-sm ring-1 ring-slate-200/80">
            <CalendarDays className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Check out</p>
            <DatePicker
              value={checkOut}
              onChange={(value: string) => {
                if (value < (checkIn || today)) return
                setCheckOut(value)
              }}
              min={checkIn || today}
              placeholder="Add date"
              hideTrailingIcon
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-stretch">
          <button
            type="submit"
            className="flex min-h-14 w-full items-center justify-center gap-2 rounded-3xl bg-slate-950 px-6 text-sm font-black text-white shadow-[0_16px_34px_rgba(15,23,42,0.26)] transition hover:bg-rose-600 hover:shadow-[0_18px_38px_rgba(225,29,72,0.28)] active:scale-[0.98] md:min-w-[8.5rem]"
            aria-label="Search Tours"
          >
            <Search className="size-4" />
            <span>Search</span>
          </button>
        </div>
      </form>
    </div>
  )
}

export default SearchBar

