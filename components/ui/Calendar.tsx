"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, RotateCcw, ChevronDown } from "lucide-react"

export interface CalendarProps {
  value?: string | Date | null
  onChange?: (dateString: string, dateObj: Date) => void
  mode?: "single" | "range"
  startDate?: string | Date | null
  endDate?: string | Date | null
  onRangeChange?: (startDate: string, endDate: string) => void
  minDate?: string | Date | null
  maxDate?: string | Date | null
  disabledDates?: (date: Date) => boolean
  className?: string
  showQuickPresets?: boolean
  showYearPicker?: boolean
}

// Helpers
function parseDate(input?: string | Date | null): Date | null {
  if (!input) return null
  if (input instanceof Date) {
    if (isNaN(input.getTime())) return null
    return new Date(input.getFullYear(), input.getMonth(), input.getDate())
  }
  const parts = String(input).slice(0, 10).split("-")
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10) - 1
    const d = parseInt(parts[2], 10)
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      return new Date(y, m, d)
    }
  }
  const parsed = new Date(input)
  return isNaN(parsed.getTime()) ? null : new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

function formatDateString(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  const d = String(date.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

function isSameDay(d1: Date | null, d2: Date | null): boolean {
  if (!d1 || !d2) return false
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  )
}

function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false
  const t = date.getTime()
  return t > start.getTime() && t < end.getTime()
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const MONTH_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
]

const WEEK_DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export default function Calendar({
  value,
  onChange,
  mode = "single",
  startDate,
  endDate,
  onRangeChange,
  minDate,
  maxDate,
  disabledDates,
  className = "",
  showQuickPresets = true,
}: CalendarProps) {
  const parsedValue = React.useMemo(() => parseDate(value), [value])
  const parsedStart = React.useMemo(() => parseDate(startDate), [startDate])
  const parsedEnd = React.useMemo(() => parseDate(endDate), [endDate])
  const parsedMin = React.useMemo(() => parseDate(minDate), [minDate])
  const parsedMax = React.useMemo(() => parseDate(maxDate), [maxDate])

  const initialViewDate = parsedValue || parsedStart || new Date()
  const [currentMonth, setCurrentMonth] = React.useState<number>(initialViewDate.getMonth())
  const [currentYear, setCurrentYear] = React.useState<number>(initialViewDate.getFullYear())
  const [viewMode, setViewMode] = React.useState<"days" | "months" | "years">("days")

  // Sync view when parsedValue changes externally
  React.useEffect(() => {
    if (parsedValue) {
      setCurrentMonth(parsedValue.getMonth())
      setCurrentYear(parsedValue.getFullYear())
    }
  }, [parsedValue])

  const handlePrevMonth = () => {
    if (viewMode === "years") {
      setCurrentYear((prev) => prev - 12)
    } else if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((prev) => prev - 1)
    } else {
      setCurrentMonth((prev) => prev - 1)
    }
  }

  const handleNextMonth = () => {
    if (viewMode === "years") {
      setCurrentYear((prev) => prev + 12)
    } else if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((prev) => prev + 1)
    } else {
      setCurrentMonth((prev) => prev + 1)
    }
  }

  // Days in month calculation
  const calendarGrid = React.useMemo(() => {
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay()
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate()

    const days: Array<{
      date: Date
      isCurrentMonth: boolean
      isPrevMonth: boolean
      isNextMonth: boolean
    }> = []

    // Previous month filler days
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
      days.push({
        date: new Date(currentYear, currentMonth - 1, daysInPrevMonth - i),
        isCurrentMonth: false,
        isPrevMonth: true,
        isNextMonth: false,
      })
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      days.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
        isPrevMonth: false,
        isNextMonth: false,
      })
    }

    // Next month filler days (to make 35 or 42 grid)
    const remaining = (7 - (days.length % 7)) % 7
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
        isPrevMonth: false,
        isNextMonth: true,
      })
    }

    return days
  }, [currentMonth, currentYear])

  const isDayDisabled = (d: Date): boolean => {
    if (parsedMin && d.getTime() < parsedMin.getTime()) return true
    if (parsedMax && d.getTime() > parsedMax.getTime()) return true
    if (disabledDates && disabledDates(d)) return true
    return false
  }

  const handleDayClick = (d: Date) => {
    if (isDayDisabled(d)) return
    const dateStr = formatDateString(d)

    if (mode === "single") {
      onChange?.(dateStr, d)
    } else if (mode === "range") {
      if (!parsedStart || (parsedStart && parsedEnd)) {
        onRangeChange?.(dateStr, "")
      } else {
        if (d.getTime() < parsedStart.getTime()) {
          onRangeChange?.(dateStr, formatDateString(parsedStart))
        } else {
          onRangeChange?.(formatDateString(parsedStart), dateStr)
        }
      }
    }
  }

  const today = React.useMemo(() => new Date(), [])

  // Quick preset shortcuts
  const selectToday = () => {
    const d = new Date()
    setCurrentMonth(d.getMonth())
    setCurrentYear(d.getFullYear())
    if (!isDayDisabled(d)) {
      onChange?.(formatDateString(d), d)
    }
  }

  const selectTomorrow = () => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    setCurrentMonth(d.getMonth())
    setCurrentYear(d.getFullYear())
    if (!isDayDisabled(d)) {
      onChange?.(formatDateString(d), d)
    }
  }

  const selectNextWeekend = () => {
    const d = new Date()
    const day = d.getDay()
    const diff = day <= 5 ? 6 - day : 6
    d.setDate(d.getDate() + diff)
    setCurrentMonth(d.getMonth())
    setCurrentYear(d.getFullYear())
    if (!isDayDisabled(d)) {
      onChange?.(formatDateString(d), d)
    }
  }

  const clearSelection = () => {
    onChange?.("", new Date())
    onRangeChange?.("", "")
  }

  // 12-year window for year selector
  const yearRangeStart = Math.floor(currentYear / 12) * 12

  return (
    <div
      className={`select-none rounded-3xl border border-slate-200 bg-white p-4 shadow-[0_25px_70px_rgba(15,23,42,0.25)] dark:border-slate-800 dark:bg-slate-900 w-[315px] sm:w-[325px] max-w-[calc(100vw-32px)] ${className}`}
    >
      {/* HEADER: Month & Year navigation */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="flex size-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-90 transition dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Previous"
        >
          <ChevronLeft className="size-4" />
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setViewMode((prev) => (prev === "months" ? "days" : "months"))}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-sm font-extrabold transition ${
              viewMode === "months"
                ? "bg-slate-950 text-white dark:bg-cyan-500 dark:text-slate-950"
                : "text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
            }`}
          >
            <span>{MONTH_NAMES[currentMonth]}</span>
            <ChevronDown className={`size-3 text-slate-400 transition-transform ${viewMode === "months" ? "rotate-180" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => setViewMode((prev) => (prev === "years" ? "days" : "years"))}
            className={`flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-extrabold transition ${
              viewMode === "years"
                ? "bg-slate-950 text-white dark:bg-cyan-500 dark:text-slate-950"
                : "text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
            }`}
          >
            <span>{currentYear}</span>
            <ChevronDown className={`size-3 text-slate-400 transition-transform ${viewMode === "years" ? "rotate-180" : ""}`} />
          </button>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="flex size-8 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900 active:scale-90 transition dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Next"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      {/* VIEW: MONTHS PICKER GRID */}
      {viewMode === "months" && (
        <div className="grid grid-cols-3 gap-2 py-4">
          {MONTH_SHORT.map((m, idx) => {
            const isSelected = idx === currentMonth
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setCurrentMonth(idx)
                  setViewMode("days")
                }}
                className={`h-11 rounded-xl text-xs font-bold transition active:scale-95 ${
                  isSelected
                    ? "bg-slate-950 text-white shadow-sm dark:bg-cyan-500 dark:text-slate-950"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {m}
              </button>
            )
          })}
        </div>
      )}

      {/* VIEW: YEARS PICKER GRID */}
      {viewMode === "years" && (
        <div className="grid grid-cols-3 gap-2 py-4">
          {Array.from({ length: 12 }, (_, i) => yearRangeStart + i).map((y) => {
            const isSelected = y === currentYear
            return (
              <button
                key={y}
                type="button"
                onClick={() => {
                  setCurrentYear(y)
                  setViewMode("days")
                }}
                className={`h-11 rounded-xl text-xs font-bold transition active:scale-95 ${
                  isSelected
                    ? "bg-slate-950 text-white shadow-sm dark:bg-cyan-500 dark:text-slate-950"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
              >
                {y}
              </button>
            )
          })}
        </div>
      )}

      {/* VIEW: DAYS GRID */}
      {viewMode === "days" && (
        <>
          {/* WEEKDAY LABELS */}
          <div className="grid grid-cols-7 gap-1 pt-3 text-center">
            {WEEK_DAYS.map((wd) => (
              <span
                key={wd}
                className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300"
              >
                {wd}
              </span>
            ))}
          </div>

          {/* DAY CELLS GRID */}
          <div className="mt-2 grid grid-cols-7 gap-1">
            {calendarGrid.map(({ date, isCurrentMonth }, idx) => {
              const disabled = isDayDisabled(date)
              const isToday = isSameDay(date, today)
              const isSelected =
                mode === "single"
                  ? isSameDay(date, parsedValue)
                  : isSameDay(date, parsedStart) || isSameDay(date, parsedEnd)
              const isInRange = mode === "range" && isDateInRange(date, parsedStart, parsedEnd)

              let cellClass = "relative flex size-9 items-center justify-center rounded-xl text-xs transition"

              if (disabled) {
                cellClass += " text-slate-300 dark:text-slate-600 cursor-not-allowed pointer-events-none font-medium"
              } else if (isSelected) {
                cellClass += " bg-slate-950 text-white font-black shadow-md shadow-slate-950/25 active:scale-95 dark:bg-emerald-500 dark:text-slate-950"
              } else if (isInRange) {
                cellClass += " bg-emerald-100 text-emerald-950 font-bold dark:bg-emerald-950/60 dark:text-emerald-200 rounded-none first:rounded-l-xl last:rounded-r-xl"
              } else if (isCurrentMonth) {
                cellClass += " text-slate-900 font-bold hover:bg-slate-100 hover:text-slate-950 active:scale-95 dark:text-slate-100 dark:hover:bg-slate-800"
              } else {
                cellClass += " text-slate-300 dark:text-slate-700 pointer-events-none font-medium"
              }

              if (isToday && !isSelected) {
                cellClass += " ring-2 ring-emerald-500/80 font-black text-emerald-700 bg-emerald-50/60 dark:ring-emerald-400 dark:text-emerald-400 dark:bg-emerald-950/30"
              }

              return (
                <button
                  key={`${date.toISOString()}-${idx}`}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(date)}
                  className={cellClass}
                >
                  {date.getDate()}
                  {isToday && !isSelected && (
                    <span className="absolute bottom-1 size-1 rounded-full bg-emerald-500" />
                  )}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* QUICK PRESETS & ACTIONS */}
      {showQuickPresets && viewMode === "days" && (
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] font-bold text-slate-600 dark:border-slate-800 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={selectToday}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 transition hover:bg-slate-200 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Today
            </button>
            <button
              type="button"
              onClick={selectTomorrow}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 transition hover:bg-slate-200 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Tomorrow
            </button>
            <button
              type="button"
              onClick={selectNextWeekend}
              className="hidden sm:inline-block rounded-lg bg-slate-100 px-2.5 py-1 text-slate-700 transition hover:bg-slate-200 hover:text-slate-950 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              Weekend
            </button>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="flex items-center gap-1 text-slate-400 hover:text-rose-500 transition"
          >
            <RotateCcw className="size-3" />
            Clear
          </button>
        </div>
      )}
    </div>
  )
}
