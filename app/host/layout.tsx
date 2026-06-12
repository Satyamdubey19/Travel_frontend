"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { AppShellSkeleton } from "@/components/ui/loading-skeletons"

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isHost, loading, becomeHost } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [businessName, setBusinessName] = useState(user?.businessName ?? "")
  const [phone, setPhone] = useState(user?.phone ?? "")
  const [activating, setActivating] = useState(false)
  const [activationError, setActivationError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [loading, router, user])

  useEffect(() => {
    setBusinessName(user?.businessName ?? "")
    setPhone(user?.phone ?? "")
  }, [user?.businessName, user?.phone])

  if (loading || !user) {
    return <AppShellSkeleton />
  }

  const handleActivateHost = async () => {
    setActivationError("")

    if (!businessName.trim()) {
      setActivationError("Enter a business name to activate host access")
      return
    }

    setActivating(true)

    try {
      await new Promise(resolve => setTimeout(resolve, 400))
      becomeHost({ businessName, phone })
    } catch (error) {
      setActivationError(error instanceof Error ? error.message : "Failed to activate host access")
    } finally {
      setActivating(false)
    }
  }

  if (!isHost) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_26%),linear-gradient(180deg,#f8fafc_0%,#e0f2fe_100%)] px-4 py-12">
        <div className="w-full max-w-4xl overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="bg-slate-950 px-8 py-10 text-white sm:px-10">
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
              Host access
            </div>
            <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-4xl">Turn your traveler account into a hosting workspace.</h1>
            <p className="mt-4 max-w-lg text-sm leading-7 text-slate-300 sm:text-base">
              Your current account keeps its traveler access. Activating host mode adds hosting tools on top, so you can keep booking trips and manage tours from the same login.
            </p>
            <div className="mt-8 space-y-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Launch tour, activity, and rental products without creating a second account.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Keep one profile, one wishlist, and one login across traveler and host features.
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                Start with dashboard access now and complete KYC when you are ready.
              </div>
            </div>
          </div>

          <div className="px-8 py-10 sm:px-10">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">Activate host profile</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Set up your host identity</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Logged in as <span className="font-semibold text-slate-900">{user.email}</span>
            </p>

            <div className="mt-8 space-y-5">
              <div>
                <label htmlFor="host-business-name" className="mb-2 block text-sm font-semibold text-slate-800">
                  Business or brand name
                </label>
                <input
                  id="host-business-name"
                  value={businessName}
                  onChange={(event) => setBusinessName(event.target.value)}
                  placeholder="Ocean Crest Stays"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>
              <div>
                <label htmlFor="host-phone" className="mb-2 block text-sm font-semibold text-slate-800">
                  Phone number
                </label>
                <input
                  id="host-phone"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
                />
              </div>

              {activationError && (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {activationError}
                </div>
              )}

              <button
                type="button"
                onClick={handleActivateHost}
                disabled={activating}
                className="w-full rounded-2xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {activating ? "Activating host access..." : "Activate host workspace"}
              </button>

              <Link
                href="/"
                className="inline-flex text-sm font-semibold text-sky-700 transition hover:text-sky-800"
              >
                Continue as traveler
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  return (
    <div className="flex h-dvh bg-slate-100">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64 translate-x-0" : "w-20 -translate-x-full md:translate-x-0"
        } fixed md:static inset-y-0 left-0 z-50 flex h-dvh flex-col overflow-hidden bg-[linear-gradient(180deg,#020617_0%,#0f172a_45%,#111827_100%)] text-white transition-all duration-300`}
      >
        <div className="shrink-0 p-5">
          <Link href="/host" className="flex items-center gap-3 text-2xl font-bold">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/8 text-cyan-300 shadow-[0_10px_30px_rgba(34,211,238,0.16)]">
              <HostHomeIcon className="h-5 w-5" />
            </span>
            {sidebarOpen && (
              <span>
                Host
                <span className="mt-1 block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">workspace</span>
              </span>
            )}
          </Link>
        </div>

        <nav className="min-h-0 flex-1 space-y-1.5 overflow-y-auto px-4 pb-3 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.45)_transparent]">
          <NavLink href="/host" icon={<DashboardIcon className="h-5 w-5" />} label="Dashboard" open={sidebarOpen} active={pathname === "/host"} />
          <NavLink href="/host/kyc" icon={<ShieldCheckIcon className="h-5 w-5" />} label="KYC" open={sidebarOpen} active={pathname.startsWith("/host/kyc")} />
          <NavLink href="/host/tours" icon={<CompassIcon className="h-5 w-5" />} label="Tours" open={sidebarOpen} active={pathname.startsWith("/host/tours")} />
          <NavLink href="/host/bookings" icon={<CalendarIcon className="h-5 w-5" />} label="Trip Bookings" open={sidebarOpen} active={pathname.startsWith("/host/bookings")} />
          <NavLink href="/host/payments" icon={<WalletIcon className="h-5 w-5" />} label="Payments" open={sidebarOpen} active={pathname.startsWith("/host/payments")} />
          <NavLink href="/host/reviews" icon={<StarCircleIcon className="h-5 w-5" />} label="Reviews" open={sidebarOpen} active={pathname.startsWith("/host/reviews")} />
          <NavLink href="/host/analytics" icon={<ChartIcon className="h-5 w-5" />} label="Analytics" open={sidebarOpen} active={pathname.startsWith("/host/analytics")} />
          <NavLink href="/" icon={<HomeIcon className="h-5 w-5" />} label="Home" open={sidebarOpen} active={false} />
        </nav>

        {/* User Profile & Logout */}
        <div className="shrink-0 border-t border-slate-700 p-3">
          {sidebarOpen && (
            <div className="mb-2 rounded-2xl border border-white/8 bg-white/5 p-3 text-sm">
              <p className="truncate font-semibold text-slate-100">{user?.name || user?.email}</p>
              <p className="mt-1 truncate text-slate-400">{user?.email}</p>
              <p className="mt-1.5 text-xs uppercase tracking-[0.18em] text-cyan-300">Host</p>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20"
          >
            <LogoutIcon className="h-4 w-4 shrink-0" />
            {sidebarOpen && 'Logout'}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mt-1 flex w-full items-center justify-center rounded-xl px-3 py-1.5 text-slate-400 transition hover:bg-white/5 hover:text-slate-200"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <ChevronCollapseIcon open={sidebarOpen} className="h-4 w-4" />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="min-w-0 flex-1 overflow-auto">
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition"
            aria-label="Toggle sidebar"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="text-sm font-semibold text-slate-900">Host Dashboard</span>
        </div>
        {children}
      </main>
    </div>
  )
}

function NavLink({
  href,
  icon,
  label,
  open,
  active,
}: {
  href: string
  icon: ReactNode
  label: string
  open: boolean
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-white/10 text-white shadow-[0_12px_30px_rgba(14,165,233,0.12)]"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${active ? "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" : "border-white/10 bg-white/5 text-slate-300"}`}>
        {icon}
      </span>
      {open && <span>{label}</span>}
    </Link>
  )
}

function IconBase({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      {children}
    </svg>
  )
}

function HostHomeIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-8.5Z" />
    </IconBase>
  )
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="3" y="3" width="8" height="8" rx="2" />
      <rect x="13" y="3" width="8" height="5" rx="2" />
      <rect x="13" y="10" width="8" height="11" rx="2" />
      <rect x="3" y="13" width="8" height="8" rx="2" />
    </IconBase>
  )
}

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3s5 2 7 3v5c0 4.5-2.9 7.3-7 10-4.1-2.7-7-5.5-7-10V6c2-1 7-3 7-3Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m9.5 12.5 1.8 1.8 3.7-4" />
    </IconBase>
  )
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 20V7.5A1.5 1.5 0 0 1 5.5 6H10v14M10 10h4m-4 4h4m-4 4h4m2 2V4.5A1.5 1.5 0 0 1 17.5 3h1A1.5 1.5 0 0 1 20 4.5V20M7 10h.01M7 14h.01" />
    </IconBase>
  )
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.8 9.2-2.4 5.6-5.6 2.4 2.4-5.6 5.6-2.4Z" />
    </IconBase>
  )
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 3v4m8-4v4M3 10h18m-11 4h4m-4 4h7" />
    </IconBase>
  )
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 16.5v-9Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8h14a2 2 0 0 1 2 2v1h-4.5a1.5 1.5 0 0 0 0 3H20v1a2 2 0 0 1-2 2H6.5A2.5 2.5 0 0 1 4 14.5V8Z" />
    </IconBase>
  )
}

function StarCircleIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m12 7 1.5 3.1 3.4.5-2.5 2.4.6 3.4-3-1.6-3 1.6.6-3.4-2.5-2.4 3.4-.5L12 7Z" />
    </IconBase>
  )
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 19h16M7 16V9m5 7V5m5 11v-4" />
    </IconBase>
  )
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1v-8.5Z" />
    </IconBase>
  )
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <IconBase className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17v2a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m14 16 5-4-5-4m5 4H9" />
    </IconBase>
  )
}

function ChevronCollapseIcon({ open, className }: { open: boolean; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {open ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      )}
    </svg>
  )
}
