"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { CalendarDays, X, ChevronDown } from "lucide-react"
import Calendar from "./Calendar"

export interface DatePickerProps {
  label?: string
  value?: string
  onChange: (value: string) => void
  minDate?: string | Date
  maxDate?: string | Date
  min?: string | Date
  max?: string | Date
  placeholder?: string
  helperText?: string
  error?: string
  disabled?: boolean
  required?: boolean
  className?: string
  inputClassName?: string
  id?: string
  name?: string
  showQuickPresets?: boolean
  showYearPicker?: boolean
  hideCalendarIcon?: boolean
  hideTrailingIcon?: boolean
  variant?: "default" | "inline" | "ghost"
  align?: "left" | "right" | "center"
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

export default function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  min,
  max,
  placeholder = "Select date",
  helperText,
  error,
  disabled = false,
  required = false,
  className = "",
  inputClassName = "",
  id,
  name,
  showQuickPresets = true,
  showYearPicker = true,
  hideCalendarIcon = false,
  hideTrailingIcon = false,
  variant = "default",
  align = "left",
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState<boolean>(false)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const [dropdownPosition, setDropdownPosition] = React.useState<"bottom" | "top">("bottom")

  const effectiveMin = minDate ?? min
  const effectiveMax = maxDate ?? max

  const displayValue = React.useMemo(() => formatReadableDate(value), [value])

  // Handle click outside to close popover
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
      if (e.key === "Escape") {
        setIsOpen(false)
      }
    }

    // Determine if popover should flip to top if near bottom of screen
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const spaceBelow = window.innerHeight - rect.bottom
      if (spaceBelow < 370 && rect.top > spaceBelow) {
        setDropdownPosition("top")
      } else {
        setDropdownPosition("bottom")
      }
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

  const handleDateSelect = (dateStr: string) => {
    onChange(dateStr)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange("")
  }

  const isInline = variant === "inline" || variant === "ghost"

  // Alignment classes for desktop popover
  const alignmentClass =
    align === "right"
      ? "sm:right-0 sm:left-auto"
      : align === "center"
      ? "sm:left-1/2 sm:-translate-x-1/2"
      : "sm:left-0 sm:right-auto"

  return (
    <div ref={containerRef} className={`relative ${isInline ? "w-full" : "inline-block w-full"} ${className}`}>
      {label && (
        <label
          htmlFor={id}
          className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-rose-500 ml-1">*</span>}
        </label>
      )}

      {/* INPUT TRIGGER BUTTON */}
      <button
        type="button"
        id={id}
        name={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={
          isInline
            ? `group flex w-full items-center justify-between bg-transparent p-0 text-left outline-none transition-all ${
                disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
              } ${inputClassName}`
            : `group relative flex h-11 w-full items-center justify-between rounded-xl border bg-white/90 px-3.5 text-left text-sm font-medium shadow-sm backdrop-blur-sm transition-all outline-none focus:ring-4 focus:ring-cyan-500/15 dark:bg-slate-900 dark:text-white ${
                error
                  ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                  : isOpen
                  ? "border-cyan-600 ring-4 ring-cyan-500/15 dark:border-cyan-500"
                  : "border-slate-200 hover:border-slate-300 dark:border-slate-800 dark:hover:border-slate-700"
              } ${disabled ? "cursor-not-allowed opacity-50 bg-slate-100" : "cursor-pointer"} ${inputClassName}`
        }
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 overflow-hidden min-w-0">
          {!hideCalendarIcon && !isInline && (
            <CalendarDays
              className={`size-4 shrink-0 transition-colors ${
                isOpen ? "text-cyan-600 dark:text-cyan-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500"
              }`}
            />
          )}
          <span
            className={`truncate ${
              value
                ? "font-bold text-slate-950 dark:text-white"
                : "font-normal text-slate-400 dark:text-slate-500"
            } ${isInline ? "text-xs sm:text-sm" : "text-sm"}`}
          >
            {displayValue || placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {value && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
              title="Clear date"
            >
              <X className="size-3.5" />
            </span>
          )}
          {!hideTrailingIcon && (
            <ChevronDown
              className={`size-3.5 text-slate-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-cyan-600" : ""
              }`}
            />
          )}
        </div>
      </button>

      {/* HELPER OR ERROR TEXT */}
      {error ? (
        <p className="mt-1 text-xs font-semibold text-rose-500">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{helperText}</p>
      ) : null}

      {/* RESPONSIVE CALENDAR POPOVER */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* MOBILE MODAL BACKDROP (< sm screens) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9998] bg-slate-950/60 backdrop-blur-sm sm:hidden"
              onClick={() => setIsOpen(false)}
            />

            {/* POPOVER / MODAL CONTAINER */}
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.95, y: dropdownPosition === "bottom" ? -6 : 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: dropdownPosition === "bottom" ? -6 : 6 }}
              transition={{ duration: 0.16, ease: "easeOut" }}
              className={`fixed sm:absolute z-[9999] max-sm:inset-0 max-sm:flex max-sm:items-center max-sm:justify-center max-sm:p-4 ${
                dropdownPosition === "bottom" ? "sm:top-full sm:mt-2.5" : "sm:bottom-full sm:mb-2.5"
              } ${alignmentClass}`}
            >
              <div onClick={(e) => e.stopPropagation()}>
                <Calendar
                  value={value}
                  onChange={handleDateSelect}
                  minDate={effectiveMin}
                  maxDate={effectiveMax}
                  showQuickPresets={showQuickPresets}
                  showYearPicker={showYearPicker}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
