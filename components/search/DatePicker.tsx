"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import type { DatePickerProps } from "@/types/search"

const monthFormatter = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" })
const dayFormatter = new Intl.DateTimeFormat("en-US", { day: "numeric" })
const displayFormatter = new Intl.DateTimeFormat("en-US", { day: "2-digit", month: "short", year: "numeric" })

const weekDays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

function toDate(value?: string) {
  if (!value) return null
  const [year, month, day] = value.split("-").map(Number)
  if (!year || !month || !day) return null
  return new Date(year, month - 1, day)
}

function toDateString(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export default function DatePicker({
  label,
  value,
  onChange,
  className,
  min,
  max,
  placeholder = "dd-mm-yyyy",
  hideTrailingIcon = false,
}: DatePickerProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const selectedDate = useMemo(() => toDate(value), [value])
  const minDate = useMemo(() => toDate(min), [min])
  const maxDate = useMemo(() => toDate(max), [max])
  const firstAllowedDate = useMemo(() => (minDate ? startOfDay(minDate) : null), [minDate])
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => selectedDate ?? firstAllowedDate ?? new Date())

  useEffect(() => {
    if (selectedDate) {
      setViewDate(selectedDate)
      return
    }
    if (firstAllowedDate && viewDate < firstAllowedDate) setViewDate(firstAllowedDate)
  }, [firstAllowedDate, selectedDate, viewDate])

  useEffect(() => {
    if (!open) return

    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) setOpen(false)
    }

    document.addEventListener("pointerdown", handlePointerDown)
    return () => document.removeEventListener("pointerdown", handlePointerDown)
  }, [open])

  const calendarDays = useMemo(() => {
    const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
    const gridStart = new Date(monthStart)
    gridStart.setDate(monthStart.getDate() - monthStart.getDay())

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart)
      date.setDate(gridStart.getDate() + index)
      return date
    })
  }, [viewDate])

  const openPicker = () => {
    setOpen((current) => !current)
  }

  const canGoToPreviousMonth = !firstAllowedDate || addMonths(viewDate, -1) >= new Date(firstAllowedDate.getFullYear(), firstAllowedDate.getMonth(), 1)

  const isDisabled = (date: Date) => {
    const day = startOfDay(date)
    if (firstAllowedDate && day < firstAllowedDate) return true
    if (maxDate && day > startOfDay(maxDate)) return true
    return false
  }

  const handleSelect = (date: Date) => {
    if (isDisabled(date)) return
    onChange(toDateString(date))
    setOpen(false)
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {label ? <span className="mb-2 block text-xs uppercase tracking-[0.3em] text-slate-500">{label}</span> : null}
      <button
        type="button"
        onClick={openPicker}
        className={`flex w-full items-center justify-between rounded-xl border border-transparent bg-transparent py-1.5 text-left text-sm font-semibold outline-none transition duration-300 focus:ring-0 ${hideTrailingIcon ? "px-0" : "pl-0 pr-8"} ${className ?? ""}`}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={value ? "text-current" : "text-current opacity-55"}>
          {selectedDate ? displayFormatter.format(selectedDate) : placeholder}
        </span>
      </button>
      {!hideTrailingIcon ? (
        <button
          type="button"
          onClick={openPicker}
          className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Open calendar"
        >
          <CalendarDays className="size-4" />
        </button>
      ) : null}
      {open ? (
        <div className="absolute left-0 top-[calc(100%+0.75rem)] z-[999] w-[19rem] rounded-2xl border border-slate-200 bg-white p-3 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setViewDate((date) => addMonths(date, -1))}
              disabled={!canGoToPreviousMonth}
              className="flex size-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-4" />
            </button>
            <p className="text-sm font-black text-slate-900">{monthFormatter.format(viewDate)}</p>
            <button
              type="button"
              onClick={() => setViewDate((date) => addMonths(date, 1))}
              className="flex size-8 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Next month"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>

          <div className="grid gap-1 text-center" style={{ gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
            {weekDays.map((day) => (
              <span key={day} className="py-1 text-[11px] font-bold uppercase text-slate-400">
                {day}
              </span>
            ))}
            {calendarDays.map((date) => {
              const dayValue = toDateString(date)
              const outsideMonth = date.getMonth() !== viewDate.getMonth()
              const disabled = isDisabled(date)
              const selected = value === dayValue

              return (
                <button
                  key={dayValue}
                  type="button"
                  onClick={() => handleSelect(date)}
                  disabled={disabled}
                  className={[
                    "flex aspect-square items-center justify-center rounded-xl text-sm font-bold transition",
                    selected ? "bg-rose-600 text-white shadow-[0_8px_18px_rgba(225,29,72,0.28)]" : "",
                    !selected && !disabled ? "text-slate-700 hover:bg-rose-50 hover:text-rose-700" : "",
                    outsideMonth && !selected ? "text-slate-300" : "",
                    disabled ? "cursor-not-allowed text-slate-300 line-through opacity-50" : "",
                  ].join(" ")}
                  aria-label={displayFormatter.format(date)}
                >
                  {dayFormatter.format(date)}
                </button>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}
