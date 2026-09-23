"use client"

import React, { ReactNode } from "react"
import { motion } from "framer-motion"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { ClassValue } from "clsx"

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type Tone = "cyan" | "emerald" | "amber" | "violet" | "rose" | "slate"

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface HostPageProps {
  children: ReactNode
  title?: string
  eyebrow?: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  badge?: ReactNode
  actions?: ReactNode
  className?: string
}

export interface HostSectionProps {
  children: ReactNode
  title?: string
  eyebrow?: string
  description?: string
  actions?: ReactNode
  className?: string
  contentClassName?: string
}

export interface HostStatCardProps {
  label: string
  value: ReactNode
  hint?: string
  trend?: {
    value: string
    positive?: boolean
  }
  icon?: ReactNode
  tone?: Tone
  className?: string
}

export interface HostEmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export interface HostPillProps {
  children: ReactNode
  tone?: Tone
  showDot?: boolean
  className?: string
}

export interface HostTabItem<T extends string = string> {
  id: T
  label: string
  count?: number
  icon?: ReactNode
}

export interface HostFilterTabsProps<T extends string = string> {
  tabs: HostTabItem<T>[]
  active: T
  onChange: (id: T) => void
  layoutId?: string
  className?: string
}

const STAT_THEMES: Record<
  Tone,
  {
    card: string
    icon: string
    dot: string
  }
> = {
  cyan: {
    card: "border-sky-200/80 bg-gradient-to-br from-white via-white to-sky-50/50 hover:border-sky-300 dark:border-sky-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-sky-950/30",
    icon: "bg-sky-500/10 text-sky-600 border border-sky-500/20 shadow-sm shadow-sky-500/10 dark:bg-sky-400/15 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  emerald: {
    card: "border-emerald-200/80 bg-gradient-to-br from-white via-white to-emerald-50/50 hover:border-emerald-300 dark:border-emerald-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30",
    icon: "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm shadow-emerald-500/10 dark:bg-emerald-400/15 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  amber: {
    card: "border-amber-200/80 bg-gradient-to-br from-white via-white to-amber-50/50 hover:border-amber-300 dark:border-amber-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/30",
    icon: "bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-sm shadow-amber-500/10 dark:bg-amber-400/15 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  violet: {
    card: "border-violet-200/80 bg-gradient-to-br from-white via-white to-violet-50/50 hover:border-violet-300 dark:border-violet-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-violet-950/30",
    icon: "bg-violet-500/10 text-violet-600 border border-violet-500/20 shadow-sm shadow-violet-500/10 dark:bg-violet-400/15 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  rose: {
    card: "border-rose-200/80 bg-gradient-to-br from-white via-white to-rose-50/50 hover:border-rose-300 dark:border-rose-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-rose-950/30",
    icon: "bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-sm shadow-rose-500/10 dark:bg-rose-400/15 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  slate: {
    card: "border-slate-200/80 bg-gradient-to-br from-white via-white to-slate-50/60 hover:border-slate-300 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800/40",
    icon: "bg-slate-500/10 text-slate-700 border border-slate-500/20 shadow-sm dark:bg-slate-700 dark:text-slate-300",
    dot: "bg-slate-500",
  },
}

const PILL_THEMES: Record<Tone, { badge: string; dot: string }> = {
  cyan: {
    badge: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800/80 dark:bg-sky-950/50 dark:text-sky-300",
    dot: "bg-sky-500",
  },
  emerald: {
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800/80 dark:bg-emerald-950/50 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  amber: {
    badge: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800/80 dark:bg-amber-950/50 dark:text-amber-300",
    dot: "bg-amber-500",
  },
  violet: {
    badge: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800/80 dark:bg-violet-950/50 dark:text-violet-300",
    dot: "bg-violet-500",
  },
  rose: {
    badge: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800/80 dark:bg-rose-950/50 dark:text-rose-300",
    dot: "bg-rose-500",
  },
  slate: {
    badge: "border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300",
    dot: "bg-slate-400",
  },
}

export function HostPage({
  children,
  title,
  eyebrow,
  description,
  breadcrumbs,
  badge,
  actions,
  className,
}: HostPageProps) {
  return (
    <div className={cn("mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8", className)}>
      {(title || eyebrow || description || actions || breadcrumbs || badge) && (
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:p-8"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-sky-400/10 via-indigo-400/5 to-transparent blur-3xl"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0 flex-1">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                <nav aria-label="Breadcrumb" className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                  {breadcrumbs.map((crumb, idx) => (
                    <React.Fragment key={crumb.label}>
                      {idx > 0 && <span className="text-slate-300 dark:text-slate-600">/</span>}
                      {crumb.href ? (
                        <a href={crumb.href} className="transition hover:text-sky-600 dark:hover:text-sky-400">
                          {crumb.label}
                        </a>
                      ) : (
                        <span className="text-slate-600 dark:text-slate-300">{crumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </nav>
              ) : eyebrow ? (
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-400">
                    {eyebrow}
                  </p>
                </div>
              ) : null}

              <div className="mt-1 flex flex-wrap items-center gap-3">
                {title && (
                  <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white sm:text-3xl lg:text-4xl">
                    {title}
                  </h1>
                )}
                {badge}
              </div>

              {description && (
                <p className="mt-2.5 max-w-3xl text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
                  {description}
                </p>
              )}
            </div>

            {actions && (
              <div className="flex shrink-0 flex-wrap items-center gap-2.5">
                {actions}
              </div>
            )}
          </div>
        </motion.header>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
        className="flex flex-col gap-6 sm:gap-8"
      >
        {children}
      </motion.div>
    </div>
  )
}

export function HostSection({
  children,
  title,
  eyebrow,
  description,
  actions,
  className,
  contentClassName,
}: HostSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_2px_16px_-4px_rgba(15,23,42,0.05)] transition-all dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {(title || eyebrow || description || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-100/90 px-6 py-4.5 dark:border-slate-800/80 sm:flex-row sm:items-center sm:justify-between sm:px-7">
          <div>
            {eyebrow && (
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-600 dark:text-sky-400">
                  {eyebrow}
                </p>
              </div>
            )}

            {title && (
              <h2 className="mt-0.5 text-lg font-bold text-slate-950 dark:text-white sm:text-xl">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400 sm:text-sm">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={cn("p-6 sm:p-7", contentClassName)}>{children}</div>
    </section>
  )
}

export function HostStatCard({
  label,
  value,
  hint,
  trend,
  icon,
  tone = "cyan",
  className,
}: HostStatCardProps) {
  const theme = STAT_THEMES[tone] || STAT_THEMES.cyan

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.18 } }}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 sm:p-6 shadow-[0_2px_12px_-3px_rgba(15,23,42,0.05)] transition-shadow duration-200 hover:shadow-[0_12px_28px_-6px_rgba(15,23,42,0.1)]",
        theme.card,
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div
            aria-hidden="true"
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-transform duration-200 group-hover:scale-105",
              theme.icon
            )}
          >
            {icon}
          </div>
        )}

        <div className="flex flex-col items-end gap-1">
          {trend && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold",
                trend.positive !== false
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                  : "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300"
              )}
            >
              {trend.positive !== false ? "↑" : "↓"} {trend.value}
            </span>
          )}

          {hint && (
            <span className="rounded-full bg-slate-100/90 px-2.5 py-1 text-[11px] font-semibold text-slate-600 backdrop-blur-xs dark:bg-slate-800 dark:text-slate-300">
              {hint}
            </span>
          )}
        </div>
      </div>

      <div className="mt-5">
        <div className="font-sans text-2xl font-black tracking-tight text-slate-950 tabular-nums dark:text-white sm:text-3xl xl:text-4xl">
          {value}
        </div>

        <p className="mt-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </motion.div>
  )
}

export function HostEmptyState({
  icon,
  title,
  description,
  action,
  className,
}: HostEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-16 text-center sm:py-20",
        className
      )}
    >
      {icon && (
        <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl border border-slate-200/90 bg-slate-50 text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400">
          <div className="absolute inset-0 rounded-3xl bg-sky-500/5 animate-ping opacity-75" />
          {icon}
        </div>
      )}

      <div className="max-w-md">
        <h3 className="text-lg font-bold text-slate-950 dark:text-white sm:text-xl">
          {title}
        </h3>

        {description && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}

export function HostPill({
  children,
  tone = "slate",
  showDot = true,
  className,
}: HostPillProps) {
  const theme = PILL_THEMES[tone] || PILL_THEMES.slate

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold shadow-xs",
        theme.badge,
        className
      )}
    >
      {showDot && (
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full animate-pulse", theme.dot)}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export function HostFilterTabs<T extends string = string>({
  tabs,
  active,
  onChange,
  layoutId = "host-tab-indicator",
  className,
}: HostFilterTabsProps<T>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1 rounded-2xl border border-slate-200/90 bg-slate-100/80 p-1.5 dark:border-slate-800 dark:bg-slate-800/70",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = active === tab.id
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={cn(
              "relative flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs font-bold transition-colors duration-150 sm:text-sm",
              isActive
                ? "text-slate-950 dark:text-white font-extrabold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
            )}
          >
            {isActive && (
              <motion.span
                layoutId={layoutId}
                className="absolute inset-0 rounded-xl bg-white shadow-sm dark:bg-slate-900 ring-1 ring-slate-950/5 dark:ring-white/10"
                transition={{ type: "spring", stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {tab.icon}
              {tab.label}
              {typeof tab.count === "number" && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.2 text-[11px] font-black",
                    isActive
                      ? "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200"
                      : "bg-slate-200/70 text-slate-600 dark:bg-slate-700/60 dark:text-slate-400"
                  )}
                >
                  {tab.count}
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}