"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  SlidersHorizontal,
  RotateCcw,
  Tag,
  DollarSign,
  Gauge,
  ArrowUpDown,
  X,
} from "lucide-react"

export interface FilterOption {
  label: string
  value: string
  icon?: React.ReactNode
}

export interface FilterSidebarProps {
  // Category
  categories?: FilterOption[]
  selectedCategory?: string
  onCategoryChange?: (category: string) => void

  // Difficulty
  difficulties?: FilterOption[]
  selectedDifficulty?: string
  onDifficultyChange?: (difficulty: string) => void

  // Price
  minPrice?: number
  maxPrice?: number
  priceRange?: number
  onPriceChange?: (price: number) => void
  currencyPrefix?: string

  // Sort
  sortOptions?: FilterOption[]
  selectedSort?: string
  onSortChange?: (sort: string) => void

  // Reset
  onReset?: () => void

  // Layout & Styling
  className?: string
  title?: string
}

export default function FilterSidebar({
  categories = [
    { label: "All", value: "all" },
    { label: "Adventure", value: "adventure" },
    { label: "Nature", value: "nature" },
    { label: "Culture", value: "culture" },
    { label: "Water", value: "water" },
    { label: "Wellness", value: "wellness" },
  ],
  selectedCategory = "all",
  onCategoryChange,

  difficulties = [
    { label: "Any difficulty", value: "all" },
    { label: "Easy", value: "Easy" },
    { label: "Moderate", value: "Moderate" },
    { label: "High", value: "High" },
  ],
  selectedDifficulty = "all",
  onDifficultyChange,

  minPrice = 500,
  maxPrice = 10000,
  priceRange = 4000,
  onPriceChange,
  currencyPrefix = "Rs.",

  sortOptions = [
    { label: "Recommended", value: "recommended" },
    { label: "Price: Low to High", value: "price-asc" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Top Rated", value: "rating-desc" },
  ],
  selectedSort = "recommended",
  onSortChange,

  onReset,
  className = "",
  title = "Filters",
}: FilterSidebarProps) {
  // Calculate active filter count
  const activeCount = React.useMemo(() => {
    let count = 0
    if (selectedCategory && selectedCategory !== "all") count++
    if (selectedDifficulty && selectedDifficulty !== "all") count++
    if (priceRange && priceRange < maxPrice) count++
    if (selectedSort && selectedSort !== "recommended") count++
    return count
  }, [selectedCategory, selectedDifficulty, priceRange, maxPrice, selectedSort])

  const pricePercent = Math.min(
    100,
    Math.max(0, ((priceRange - minPrice) / (maxPrice - minPrice)) * 100)
  )

  return (
    <aside
      className={`h-fit w-full rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-[0_10px_35px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_16px_45px_rgba(15,23,42,0.07)] dark:border-slate-800 dark:bg-slate-900/90 ${className}`}
    >
      {/* Filter Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-slate-950 text-cyan-400 dark:bg-slate-800">
            <SlidersHorizontal className="size-4" />
          </span>
          <div>
            <h2 className="text-base font-bold text-slate-950 dark:text-white">
              {title}
            </h2>
            {activeCount > 0 && (
              <span className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400">
                {activeCount} active filter{activeCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onReset}
            className="group flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            <RotateCcw className="size-3.5 transition group-hover:-rotate-90" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {activeCount > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-1.5 border-b border-slate-100 py-3 dark:border-slate-800"
          >
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-xs font-semibold text-cyan-800 dark:text-cyan-300">
                <Tag className="size-3" />
                <span className="capitalize">{selectedCategory}</span>
                <button
                  onClick={() => onCategoryChange?.("all")}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-cyan-500/20"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {selectedDifficulty !== "all" && (
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/20 bg-violet-500/10 px-2.5 py-1 text-xs font-semibold text-violet-800 dark:text-violet-300">
                <Gauge className="size-3" />
                <span>{selectedDifficulty}</span>
                <button
                  onClick={() => onDifficultyChange?.("all")}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-violet-500/20"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {priceRange < maxPrice && (
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                <DollarSign className="size-3" />
                <span>Under {currencyPrefix} {priceRange.toLocaleString()}</span>
                <button
                  onClick={() => onPriceChange?.(maxPrice)}
                  className="ml-0.5 rounded-full p-0.5 hover:bg-emerald-500/20"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5 space-y-6">
        {/* Category Pills */}
        {categories && categories.length > 0 && (
          <div>
            <div className="mb-2.5 flex items-center gap-1.5">
              <Tag className="size-3.5 text-slate-400" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Category
              </p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((option) => {
                const isSelected = selectedCategory === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onCategoryChange?.(option.value)}
                    className={`relative rounded-xl px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                      isSelected
                        ? "bg-slate-950 text-white shadow-md shadow-slate-950/20 dark:bg-white dark:text-slate-950"
                        : "border border-slate-200/80 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300"
                    }`}
                  >
                    {isSelected && (
                      <motion.span
                        layoutId="activeCategoryPill"
                        className="absolute inset-0 rounded-xl bg-slate-950 -z-10 dark:bg-white"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                    <span className="capitalize">{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Difficulty Selector */}
        {difficulties && difficulties.length > 0 && (
          <div>
            <div className="mb-2.5 flex items-center gap-1.5">
              <Gauge className="size-3.5 text-slate-400" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Difficulty
              </p>
            </div>
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-2">
              {difficulties.map((diff) => {
                const isSelected = selectedDifficulty === diff.value
                return (
                  <button
                    key={diff.value}
                    type="button"
                    onClick={() => onDifficultyChange?.(diff.value)}
                    className={`flex items-center justify-center rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-600 bg-indigo-50/80 text-indigo-700 shadow-sm ring-1 ring-indigo-500/20 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-500"
                        : "border-slate-200/80 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-300"
                    }`}
                  >
                    <span>{diff.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Max Price Slider */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-slate-400" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Max Price
              </p>
            </div>
            <span className="inline-flex items-center rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-900 shadow-sm ring-1 ring-slate-200/70 dark:bg-slate-800 dark:text-white dark:ring-slate-700">
              {currencyPrefix} {priceRange.toLocaleString()}
            </span>
          </div>

          <div className="relative py-2">
            <input
              type="range"
              min={minPrice}
              max={maxPrice}
              step={100}
              value={priceRange}
              onChange={(e) => onPriceChange?.(Number(e.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-cyan-600 focus:outline-none dark:bg-slate-700"
              style={{
                background: `linear-gradient(to right, #0891b2 0%, #0891b2 ${pricePercent}%, #e2e8f0 ${pricePercent}%, #e2e8f0 100%)`,
              }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-400">
            <span>{currencyPrefix} {minPrice.toLocaleString()}</span>
            <span>{currencyPrefix} {maxPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Sort Dropdown */}
        {sortOptions && sortOptions.length > 0 && (
          <div>
            <div className="mb-2.5 flex items-center gap-1.5">
              <ArrowUpDown className="size-3.5 text-slate-400" />
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
                Sort By
              </p>
            </div>
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => onSortChange?.(e.target.value)}
                className="h-11 w-full appearance-none rounded-2xl border border-slate-200/90 bg-slate-50/70 px-3.5 pr-8 text-xs font-bold text-slate-700 outline-none transition hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 dark:border-slate-800 dark:bg-slate-850 dark:text-slate-200"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <ArrowUpDown className="size-3.5" />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
