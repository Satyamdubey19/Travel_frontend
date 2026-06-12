import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

type StatCardColor = 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange' | 'indigo'

interface StatCardProps {
  title: string
  value: number | string
  icon: ReactNode
  color?: StatCardColor
  href?: string
  highlight?: boolean
  change?: string
  variant?: 'admin' | 'host'
}

const adminColors: Record<StatCardColor, string> = {
  blue: 'border-sky-200/70 bg-[linear-gradient(180deg,rgba(240,249,255,0.96)_0%,rgba(224,242,254,0.92)_100%)]',
  green: 'border-sky-200/75 bg-[linear-gradient(180deg,rgba(239,246,255,0.98)_0%,rgba(224,242,254,0.95)_100%)]',
  yellow: 'border-cyan-200/75 bg-[linear-gradient(180deg,rgba(236,254,255,0.98)_0%,rgba(207,250,254,0.94)_100%)]',
  red: 'border-slate-200/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.98)_0%,rgba(226,232,240,0.94)_100%)]',
  purple: 'border-sky-300/70 bg-[linear-gradient(180deg,rgba(224,242,254,0.98)_0%,rgba(186,230,253,0.94)_100%)]',
  orange: 'border-cyan-300/70 bg-[linear-gradient(180deg,rgba(236,254,255,0.98)_0%,rgba(165,243,252,0.93)_100%)]',
  indigo: 'border-blue-200/75 bg-[linear-gradient(180deg,rgba(239,246,255,0.98)_0%,rgba(191,219,254,0.94)_100%)]',
}

export default function StatCard({ title, value, icon, color = 'blue', href, highlight, change, variant = 'admin' }: StatCardProps) {
  if (variant === 'host') {
    const content = (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-500 text-sm">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{typeof value === 'number' ? value.toLocaleString() : value}</p>
            {change && <p className="text-green-600 text-sm font-semibold mt-2">{change} from last month</p>}
          </div>
          <span className="text-4xl">{icon}</span>
        </div>
      </div>
    )
    return href ? <Link href={href}>{content}</Link> : content
  }

  const content = (
    <div
      className={`${adminColors[color]} ${
        highlight ? 'ring-2 ring-sky-300 ring-offset-4 ring-offset-white/60' : ''
      } group relative overflow-hidden rounded-[28px] border p-6 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_60px_rgba(15,23,42,0.12)]`}
    >
      <div className="absolute inset-x-6 top-0 h-px bg-white/70" />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {change ? <p className="mt-3 text-sm font-medium text-slate-600">{change}</p> : null}
        </div>
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/75 text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.08)]">
          {icon}
        </div>
      </div>
      {href ? (
        <div className="mt-5 flex items-center justify-between text-sm font-semibold text-slate-700">
          <span>Open details</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-x-6 bottom-0 h-10 rounded-full bg-white/25 blur-2xl" />
    </div>
  )

  return href ? (
    <Link href={href} className="block">
      {content}
    </Link>
  ) : (
    content
  )
}
