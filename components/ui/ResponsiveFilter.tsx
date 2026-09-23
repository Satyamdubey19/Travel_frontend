"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { SlidersHorizontal, RotateCcw, X, Filter } from "lucide-react"
import FilterSidebar, { type FilterSidebarProps } from "@/components/filters/FilterSidebar"

export interface ResponsiveFilterProps extends FilterSidebarProps {
  totalResults?: number
  resultLabel?: string
  mobileTriggerClassName?: string
}

export default function ResponsiveFilter({
  categories,
  selectedCategory = "all",
  onCategoryChange,
  difficulties,
  selectedDifficulty = "all",
  onDifficultyChange,
  minPrice = 500,
  maxPrice = 10000,
  priceRange = 10000,
  onPriceChange,
  currencyPrefix = "₹",
  sortOptions,
  selectedSort = "recommended",
  onSortChange,
  onReset,
  className = "",
  title = "Filters",
  totalResults,
  resultLabel = "Results",
  mobileTriggerClassName = "",
}: ResponsiveFilterProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  // Calculate active filter count
  const activeCount = React.useMemo(() => {
    let count = 0
    if (selectedCategory && selectedCategory !== "all") count++
    if (selectedDifficulty && selectedDifficulty !== "all") count++
    if (priceRange && priceRange < maxPrice) count++
    if (selectedSort && selectedSort !== "recommended") count++
    return count
  }, [selectedCategory, selectedDifficulty, priceRange, maxPrice, selectedSort])

  // Prevent background scroll when mobile filter is open
  React.useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileOpen])

  return (
    <>
      {/* DESKTOP SIDEBAR (Visible on lg+ screens) */}
      <div className={`hidden lg:block ${className}`}>
        <FilterSidebar
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={onCategoryChange}
          difficulties={difficulties}
          selectedDifficulty={selectedDifficulty}
          onDifficultyChange={onDifficultyChange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          priceRange={priceRange}
          onPriceChange={onPriceChange}
          currencyPrefix={currencyPrefix}
          sortOptions={sortOptions}
          selectedSort={selectedSort}
          onSortChange={onSortChange}
          onReset={onReset}
          title={title}
        />
      </div>

      {/* MOBILE TRIGGER BUTTON (Visible on < lg screens) */}
      <div className="lg:hidden flex items-center gap-2">
        <button
          type="button"
          onClick={() => setIsMobileOpen(true)}
          className={`flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white/90 px-4 py-2.5 text-xs font-bold text-slate-800 shadow-sm backdrop-blur-md transition hover:bg-slate-50 active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-white ${mobileTriggerClassName}`}
        >
          <SlidersHorizontal className="size-4 text-cyan-600 dark:text-cyan-400" />
          <span>{title}</span>
          {activeCount > 0 && (
            <span className="flex size-5 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-black text-white dark:bg-cyan-500 dark:text-slate-950">
              {activeCount}
            </span>
          )}
        </button>

        {activeCount > 0 && onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 rounded-2xl border border-slate-200 bg-white/80 px-3 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            title="Reset filters"
          >
            <RotateCcw className="size-3.5" />
            <span className="sr-only sm:not-sr-only">Reset</span>
          </button>
        )}
      </div>

      {/* MOBILE SLIDE-OVER DRAWER (Visible when open on < lg screens) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-white shadow-2xl dark:bg-slate-900"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-slate-950 text-cyan-400 dark:bg-slate-800">
                    <Filter className="size-3.5" />
                  </span>
                  <h3 className="font-black text-slate-900 dark:text-white">{title}</h3>
                  {activeCount > 0 && (
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-bold text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300">
                      {activeCount} active
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Close filters"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Scrollable Filter Body */}
              <div className="flex-1 overflow-y-auto px-5 py-4">
                <FilterSidebar
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategoryChange={onCategoryChange}
                  difficulties={difficulties}
                  selectedDifficulty={selectedDifficulty}
                  onDifficultyChange={onDifficultyChange}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  priceRange={priceRange}
                  onPriceChange={onPriceChange}
                  currencyPrefix={currencyPrefix}
                  sortOptions={sortOptions}
                  selectedSort={selectedSort}
                  onSortChange={onSortChange}
                  onReset={onReset}
                  className="border-none shadow-none p-0 bg-transparent"
                />
              </div>

              {/* Footer */}
              <div className="border-t border-slate-100 p-4 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full rounded-2xl bg-slate-950 py-3 text-center text-sm font-bold text-white shadow-md transition hover:bg-cyan-700 active:scale-98 dark:bg-cyan-500 dark:text-slate-950"
                >
                  Show {totalResults !== undefined ? `${totalResults} ${resultLabel}` : "Results"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

