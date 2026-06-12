import React, { ReactNode } from "react"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs))
}

type Tone = "cyan" | "emerald" | "amber" | "violet" | "rose" | "slate"

interface HostPageProps {
  children: ReactNode
  title?: string
  eyebrow?: string
  description?: string
  actions?: ReactNode
  className?: string
}

interface HostSectionProps {
  children: ReactNode
  title?: string
  eyebrow?: string
  description?: string
  actions?: ReactNode
  className?: string
  contentClassName?: string
}

interface HostStatCardProps {
  label: string
  value: ReactNode
  hint?: string
  icon?: ReactNode
  tone?: Tone
  className?: string
}

interface HostEmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

interface HostPillProps {
  children: ReactNode
  tone?: Exclude<Tone, "violet">
  className?: string
}

const STAT_CARD_TONES: Record<Tone, string> = {
  cyan: "border-cyan-100 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-100 bg-emerald-50 text-emerald-700",
  amber: "border-amber-100 bg-amber-50 text-amber-700",
  violet: "border-violet-100 bg-violet-50 text-violet-700",
  rose: "border-rose-100 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-100 text-slate-700",
}

const PILL_TONES: Record<Exclude<Tone, "violet">, string> = {
  cyan: "border-cyan-200 bg-cyan-50 text-cyan-700",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
  amber: "border-amber-200 bg-amber-50 text-amber-700",
  rose: "border-rose-200 bg-rose-50 text-rose-700",
  slate: "border-slate-200 bg-slate-50 text-slate-700",
}

export function HostPage({
  children,
  title,
  eyebrow,
  description,
  actions,
  className,
}: HostPageProps) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full max-w-7xl flex-col gap-5",
        className
      )}
    >
      {(title || eyebrow || description || actions) && (
        <header className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
                {eyebrow}
              </p>
            )}

            {title && (
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
                {title}
              </h1>
            )}

            {description && (
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {actions}
            </div>
          )}
        </header>
      )}

      {children}
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
        "overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      {(title || eyebrow || description || actions) && (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 dark:border-slate-800 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {eyebrow && (
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-700 dark:text-cyan-400">
                {eyebrow}
              </p>
            )}

            {title && (
              <h2 className="mt-1 text-lg font-bold text-slate-950 dark:text-white">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex shrink-0 flex-wrap gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={cn("p-5", contentClassName)}>
        {children}
      </div>
    </section>
  )
}

export function HostStatCard({
  label,
  value,
  hint,
  icon,
  tone = "cyan",
  className,
}: HostStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div
            aria-hidden="true"
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
              STAT_CARD_TONES[tone]
            )}
          >
            {icon}
          </div>
        )}

        {hint && (
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {hint}
          </span>
        )}
      </div>

      <div className="mt-5">
        <div className="text-3xl font-bold tracking-tight text-slate-950 dark:text-white">
          {value}
        </div>

        <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {label}
        </p>
      </div>
    </div>
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
        "flex flex-col items-center justify-center gap-4 px-5 py-16 text-center",
        className
      )}
    >
      {icon && (
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">
          {icon}
        </div>
      )}

      <div>
        <h3 className="text-lg font-bold text-slate-950 dark:text-white">
          {title}
        </h3>

        {description && (
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>

      {action && <div>{action}</div>}
    </div>
  )
}

export function HostPill({
  children,
  tone = "slate",
  className,
}: HostPillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold",
        PILL_TONES[tone],
        className
      )}
    >
      {children}
    </span>
  )
}