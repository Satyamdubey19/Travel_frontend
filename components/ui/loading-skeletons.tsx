import { Skeleton } from "@/components/ui/skeleton"

export function AppShellSkeleton() {
  return (
    <div className="flex min-h-screen bg-slate-100/70">
      <aside className="hidden w-80 border-r border-white/40 bg-slate-950 p-5 md:flex md:flex-col">
        <div className="flex items-center gap-3 border-b border-white/10 pb-5">
          <Skeleton className="h-11 w-11 rounded-2xl bg-white/10" />
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-white/10" />
            <Skeleton className="h-5 w-28 bg-white/10" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <Skeleton className="h-4 w-28 bg-white/10" />
              <Skeleton className="mt-3 h-3 w-40 bg-white/10" />
            </div>
          ))}
        </div>
      </aside>
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-7xl space-y-6">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-72" />
                <Skeleton className="h-4 w-96 max-w-full" />
              </div>
              <Skeleton className="h-12 w-44 rounded-2xl" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl"
              >
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-4 h-9 w-28" />
                <Skeleton className="mt-3 h-3 w-36" />
              </div>
            ))}
          </div>
          <div className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <Skeleton className="h-5 w-44" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="grid gap-4 rounded-2xl border border-slate-100 p-4 md:grid-cols-[1.2fr_0.8fr_0.6fr]">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <Skeleton className="h-5 w-32" />
              <div className="mt-6 space-y-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="space-y-2 rounded-2xl border border-slate-100 p-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function AdminDashboardSkeleton() {
  return <AppShellSkeleton />
}

export function HostDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.22),_transparent_26%),radial-gradient(circle_at_top_right,_rgba(79,70,229,0.18),_transparent_28%),linear-gradient(180deg,#eff6ff_0%,#f8fafc_42%,#eef2ff_100%)] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-[32px] border border-white/60 bg-slate-950 px-6 py-8 shadow-[0_30px_80px_rgba(15,23,42,0.28)] sm:px-8 lg:px-10">
          <div className="space-y-6">
            <Skeleton className="h-9 w-48 rounded-full bg-white/10" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-3/4 bg-white/10" />
              <Skeleton className="h-4 w-2/3 bg-white/10" />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="rounded-3xl border border-white/10 bg-white/5 p-4">
                  <Skeleton className="h-3 w-24 bg-white/10" />
                  <Skeleton className="mt-3 h-8 w-20 bg-white/10" />
                  <Skeleton className="mt-3 h-3 w-32 bg-white/10" />
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-11 w-44 rounded-2xl bg-white/10" />
              ))}
            </div>
          </div>
        </section>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-10 w-24" />
              <Skeleton className="mt-3 h-3 w-36" />
            </div>
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-[1.4fr_0.95fr]">
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <Skeleton className="h-5 w-40" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid gap-4 rounded-2xl border border-slate-100 p-4 md:grid-cols-[1.3fr_0.8fr_0.7fr]">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-8 w-20 rounded-xl" />
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <Skeleton className="h-5 w-32" />
            <div className="mt-6 space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="space-y-3 rounded-2xl border border-slate-100 p-4">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-28 w-full rounded-2xl" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function TablePageSkeleton() {
  return (
    <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-11 w-full max-w-sm rounded-2xl" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-24 rounded-full" />
          ))}
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-100">
        <div className="grid grid-cols-4 gap-4 border-b border-slate-100 bg-slate-50/80 px-6 py-4 md:grid-cols-7">
          {Array.from({ length: 7 }).map((_, index) => (
            <Skeleton key={index} className="h-4 w-full max-w-[120px]" />
          ))}
        </div>
        <div className="space-y-0">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 border-b border-slate-100 px-6 py-5 md:grid-cols-7">
              {Array.from({ length: 7 }).map((_, cellIndex) => (
                <Skeleton key={cellIndex} className="h-4 w-full max-w-[140px]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}