"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, ArrowRight, X } from "lucide-react"
import Calendar from "./Calendar"

export interface DateRangePickerProps {
  startDate?: string
  endDate?: string
  onChange: (startDate: string, endDate: string) => void
  minDate?: string | Date
  maxDate?: string | Date
  startLabel?: string
  endLabel?: string
  className?: string
  disabled?: boolean
}

function formatReadableDate(dateStr?: string): string {
  if (!dateStr) return ""
  const parts = dateStr.slice(0, 10).split("-")
  if (parts.length === 3) {
    const y = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10) - 1
    const d = parseInt(parts[2], 10)
    const date = new Date(y, m, d)
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    }
  }
  return dateStr
}

export default function DateRangePicker({
  startDate,
  endDate,
  onChange,
  minDate,
  maxDate,
  startLabel = "Pickup",
  endLabel = "Return",
  className = "",
  disabled = false,
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)

  const startFormatted = React.useMemo(() => formatReadableDate(startDate), [startDate])
  const endFormatted = React.useMemo(() => formatReadableDate(endDate), [endDate])

  // Calculate day difference if both dates present
  const durationDays = React.useMemo(() => {
    if (!startDate || !endDate) return null
    const d1 = new Date(startDate)
    const d2 = new Date(endDate)
    const diff = Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : null
  }, [startDate, endDate])

  React.useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false)
    }

    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("touchstart", handlePointerDown)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("touchstart", handlePointerDown)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const handleRangeChange = (start: string, end: string) => {
    onChange(start, end)
    if (start && end) {
      setIsOpen(false)
    }
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("", "")
  }

  return (
    <div ref={containerRef} className={`relative inline-block w-full ${className}`}>
      {/* TRIGGER DUAL PILL */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`group relative flex h-14 w-full items-center justify-between rounded-2xl border bg-white/95 px-4 text-left shadow-sm backdrop-blur-md transition-all outline-none focus:ring-4 focus:ring-cyan-500/15 dark:bg-slate-900 dark:border-slate-800 ${
          isOpen
            ? "border-cyan-600 ring-4 ring-cyan-500/15 dark:border-cyan-500"
            : "border-slate-200 hover:border-slate-300 dark:hover:border-slate-700"
        } ${disabled ? "cursor-not-allowed opacity-50 bg-slate-100" : "cursor-pointer"}`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <CalendarDays
            className={`size-5 shrink-0 transition-colors ${
              isOpen ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"
            }`}
          />
          <div className="flex items-center gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {startLabel}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {startFormatted || "Select date"}
              </p>
            </div>

            <ArrowRight className="size-3.5 text-slate-300 dark:text-slate-600 mx-1 shrink-0" />

            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {endLabel}
              </p>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                {endFormatted || "Select date"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {durationDays !== null && (
            <span className="hidden sm:inline-flex rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-bold text-cyan-700 dark:bg-cyan-950 dark:text-cyan-300">
              {durationDays} {durationDays === 1 ? "day" : "days"}
            </span>
          )}
          {(startDate || endDate) && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 transition"
              title="Clear range"
            >
              <X className="size-3.5" />
            </span>
          )}
        </div>
      </button>

      {/* RANGE CALENDAR POPOVER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-sm sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.95, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className="fixed sm:absolute z-[9999] max-sm:inset-0 max-sm:flex max-sm:items-center max-sm:justify-center max-sm:p-4 sm:top-full sm:mt-2.5 sm:left-0"
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Calendar
                  mode="range"
                  startDate={startDate}
                  endDate={endDate}
                  onRangeChange={handleRangeChange}
                  minDate={minDate}
                  maxDate={maxDate}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

