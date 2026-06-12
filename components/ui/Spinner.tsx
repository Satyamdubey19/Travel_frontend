import { Skeleton } from "@/components/ui/skeleton"

interface SpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  fullPage?: boolean
  minimal?: boolean
}

const sizes = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12',
  lg: 'h-16 w-16',
}

export default function Spinner({ message, size = 'md', fullPage, minimal }: SpinnerProps) {
  if (minimal) {
    return (
      <div className="space-y-3 py-6">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-20 w-full rounded-2xl" />
        <Skeleton className="h-20 w-full rounded-2xl" />
      </div>
    )
  }

  const skeleton = (
    <div className="space-y-4">
      {message ? <p className="text-sm text-slate-500">{message}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: size === 'lg' ? 6 : size === 'sm' ? 2 : 3 }).map((_, index) => (
          <div key={index} className="rounded-3xl border border-slate-100 bg-white/70 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-8 w-20" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}
      </div>
    </div>
  )

  if (fullPage) {
    return (
      <div className="h-96 py-8">
        {skeleton}
      </div>
    )
  }

  return skeleton
}
