"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowUpRight,
  BarChart3,
  CalendarCheck,
  Car,
  ChevronLeft,
  ChevronRight,
  Compass,
  CreditCard,
  ExternalLink,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Star,
  Ticket,
  X,
} from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { AppShellSkeleton } from "@/components/ui/loading-skeletons"

interface NavItem {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  exact?: boolean
  badge?: string | number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Operations",
    items: [
      { href: "/host", icon: LayoutDashboard, label: "Dashboard", exact: true },
      { href: "/host/bookings", icon: CalendarCheck, label: "Trip Bookings" },
    ],
  },
  {
    title: "Listings & Supply",
    items: [
      { href: "/host/tours", icon: Compass, label: "Tours" },
      { href: "/host/activities", icon: Ticket, label: "Activities" },
      { href: "/host/rentals", icon: Car, label: "Rentals" },
    ],
  },
  {
    title: "Finances & Trust",
    items: [
      { href: "/host/kyc", icon: ShieldCheck, label: "KYC Verification" },
      { href: "/host/payments", icon: CreditCard, label: "Payments & Payouts" },
      { href: "/host/reviews", icon: Star, label: "Guest Reviews" },
      { href: "/host/analytics", icon: BarChart3, label: "Analytics" },
    ],
  },
]

export default function HostLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, logout, isHost, isHostApplicant, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isHostApplicationRoute = pathname === "/host/signup"

  useEffect(() => {
    if (!isHostApplicationRoute && !loading && !user) {
      router.push("/login")
    }
  }, [isHostApplicationRoute, loading, router, user])

  if (isHostApplicationRoute) {
    return <>{children}</>
  }

  if (loading || !user) {
    return <AppShellSkeleton />
  }

  if (!isHostApplicant) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-100 via-slate-50 to-slate-100 px-4 py-12">
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white p-8 shadow-xl sm:p-10"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-600">
            <Compass className="h-6 w-6" />
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.22em] text-sky-600">
            Host Application Required
          </p>
          <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-slate-950">
            Apply before opening Host Studio.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">
            Your traveler account remains active. Submit your host application, complete verification, and publish your guided tours, experiences, or rentals to start receiving bookings.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/host/signup"
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-sky-600 shadow-sm"
            >
              Start Host Application
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-center text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              Continue as Traveler
            </Link>
          </div>
        </motion.section>
      </div>
    )
  }

  if (!isHost && pathname.startsWith("/host/kyc")) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3.5 sm:px-6">
            <Link href="/host" className="flex items-center gap-2.5 font-black text-slate-950">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-500/25">
                <ShieldCheck className="h-5 w-5" />
              </span>
              <span className="text-base tracking-tight">
                Travels Pro <span className="font-extrabold text-sky-600">Host Studio</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:text-slate-950 shadow-xs"
              >
                Traveler Home
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
      </div>
    )
  }

  if (!isHost) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.18),_transparent_36%),linear-gradient(145deg,#020617,#0f172a)] px-4 py-12">
        <motion.section
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.06] p-8 text-white shadow-2xl backdrop-blur-2xl sm:p-10"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3.5 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
            Verification Required
          </div>
          <h1 className="mt-5 text-2xl sm:text-3xl font-black tracking-tight">
            Your host workspace is almost ready.
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
            Complete identity and business verification to unlock trip publishing, guest booking manifests, payouts, and operations analytics.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Link
              href="/host/kyc"
              className="inline-flex items-center justify-center rounded-2xl bg-sky-400 px-5 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-sky-300 shadow-md shadow-sky-400/20"
            >
              Continue Verification
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/5 px-5 py-3 text-center text-sm font-semibold text-slate-200 transition hover:bg-white/10"
            >
              Continue as Traveler
            </Link>
          </div>
        </motion.section>
      </div>
    )
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const hostDisplayName = user?.businessName || user?.name || "Host"
  const hostInitials = (user?.businessName?.[0] || user?.name?.[0] || "H").toUpperCase()

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-slate-100/90 dark:bg-slate-950 font-sans">
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs md:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 flex h-dvh flex-col border-r border-slate-800/80 bg-[#0B0F19] text-slate-200 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-72" : "w-20"
        } ${mobileMenuOpen ? "translate-x-0 !w-72" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="flex h-18 shrink-0 items-center justify-between border-b border-slate-800/80 px-5">
          <Link href="/host" className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-md shadow-sky-500/25">
              <Compass className="h-5 w-5" />
            </span>
            {(sidebarOpen || mobileMenuOpen) && (
              <div className="min-w-0">
                <span className="block text-base font-black tracking-tight text-white">
                  Travels Pro
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-[0.22em] text-sky-400">
                  Host Studio
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white md:hidden"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3.5 py-5 [scrollbar-width:thin] [scrollbar-color:rgba(148,163,184,0.3)_transparent]">
          {NAV_GROUPS.map((group) => (
            <div key={group.title}>
              {(sidebarOpen || mobileMenuOpen) && (
                <p className="px-3 mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {group.title}
                </p>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = item.exact
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                  const Icon = item.icon

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      title={!sidebarOpen && !mobileMenuOpen ? item.label : undefined}
                      className={`group relative flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-150 ${
                        isActive
                          ? "bg-gradient-to-r from-sky-500/20 via-sky-500/10 to-transparent text-white border-l-2 border-sky-400 shadow-xs"
                          : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"
                      }`}
                    >
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                          isActive
                            ? "bg-sky-400/20 text-sky-300 shadow-xs shadow-sky-400/10"
                            : "text-slate-400 group-hover:text-slate-200"
                        }`}
                      >
                        <Icon className="h-4.5 w-4.5" />
                      </span>

                      {(sidebarOpen || mobileMenuOpen) && (
                        <span className="flex-1 truncate">{item.label}</span>
                      )}

                      {(sidebarOpen || mobileMenuOpen) && item.badge && (
                        <span className="rounded-full bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-800/80 p-3.5">
          {(sidebarOpen || mobileMenuOpen) ? (
            <div className="mb-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-3 shadow-xs">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-xs font-black text-white shadow-xs">
                  {hostInitials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-white">{hostDisplayName}</p>
                  <p className="truncate text-[11px] text-slate-400">{user?.email}</p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/80 pt-2 text-[11px]">
                <span className="inline-flex items-center gap-1 font-bold text-sky-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400 animate-pulse" />
                  Verified Host
                </span>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1 font-semibold text-slate-400 hover:text-white transition"
                >
                  Traveler mode <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
            </div>
          ) : (
            <div className="mb-2 flex justify-center">
              <span
                title={hostDisplayName}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-xs font-black text-white"
              >
                {hostInitials}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleLogout}
              className={`flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 ${
                sidebarOpen || mobileMenuOpen ? "flex-1" : "w-full"
              }`}
              title="Logout"
            >
              <LogOut className="h-3.5 w-3.5 shrink-0" />
              {(sidebarOpen || mobileMenuOpen) && <span>Logout</span>}
            </button>

            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white transition"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 shadow-xs backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 md:hidden dark:border-slate-700 dark:text-slate-300"
              aria-label="Open navigation drawer"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-xs font-bold text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300">
                <span className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse" />
                Live Host Desk
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {pathname === "/host"
                  ? "Host Overview"
                  : pathname.startsWith("/host/bookings")
                  ? "Bookings Operations"
                  : pathname.startsWith("/host/tours")
                  ? "Tours Inventory"
                  : pathname.startsWith("/host/activities")
                  ? "Activities Supply"
                  : pathname.startsWith("/host/rentals")
                  ? "Vehicles & Rentals"
                  : pathname.startsWith("/host/kyc")
                  ? "Host Verification"
                  : pathname.startsWith("/host/payments")
                  ? "Finance & Payouts"
                  : pathname.startsWith("/host/reviews")
                  ? "Guest Feedback"
                  : pathname.startsWith("/host/analytics")
                  ? "Host Analytics"
                  : "Host Studio"}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Home className="h-3.5 w-3.5 text-slate-500" />
              <span className="hidden sm:inline">Traveler Mode</span>
              <ExternalLink className="h-3 w-3 text-slate-400" />
            </Link>

            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-xs font-black text-white shadow-xs">
              {hostInitials}
            </div>
          </div>
        </header>

        <main className="min-w-0 flex-1 overflow-y-auto bg-slate-50/70 p-4 sm:p-6 lg:p-8 dark:bg-slate-950/60">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  )
}