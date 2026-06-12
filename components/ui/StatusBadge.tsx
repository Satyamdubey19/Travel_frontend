type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default'

interface StatusBadgeProps {
  status: string
  colorMap?: Record<string, StatusVariant>
  className?: string
}

const variantStyles: Record<StatusVariant, { badge: string; dot: string }> = {
  success: { badge: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200', dot: 'bg-emerald-500' },
  warning: { badge: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200', dot: 'bg-amber-400' },
  error:   { badge: 'bg-red-50 text-red-700 ring-1 ring-red-200', dot: 'bg-red-500' },
  info:    { badge: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200', dot: 'bg-sky-500' },
  default: { badge: 'bg-slate-100 text-slate-600 ring-1 ring-slate-200', dot: 'bg-slate-400' },
}

/** @deprecated Use variantStyles instead */
const variantColors: Record<StatusVariant, string> = {
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  info: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
}

const defaultColorMap: Record<string, StatusVariant> = {
  // booking statuses
  pending: 'warning',
  confirmed: 'info',
  cancelled: 'error',
  completed: 'success',
  // KYC statuses
  APPROVED: 'success',
  PENDING: 'warning',
  REJECTED: 'error',
  NOT_SUBMITTED: 'default',
  // payout statuses
  processing: 'info',
  failed: 'error',
  // user roles
  USER: 'info',
  HOST: 'success',
  ADMIN: 'error',
  // generic
  Active: 'success',
  Inactive: 'default',
  active: 'success',
  inactive: 'default',
  DRAFT: 'default',
  PUBLISHED: 'success',
  SUSPENDED: 'error',
}

export default function StatusBadge({ status, colorMap, className }: StatusBadgeProps) {
  const map = colorMap || defaultColorMap
  const variant = map[status] || 'default'
  const { badge, dot } = variantStyles[variant]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badge} ${className || ''}`}>
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      {status}
    </span>
  )
}

export { variantColors, defaultColorMap }
export type { StatusVariant }
