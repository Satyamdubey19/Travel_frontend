"use client"

import { useEffect, useRef, useState, type ComponentType } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarCheck,
  Gift,
  Heart,
  HelpCircle,
  ImageIcon,
  LayoutGrid,
  LogOut,
  Menu,
  Settings,
  Sparkles,
  Ticket,
  User,
  WalletCards,
} from "lucide-react"
import LocationDetector from "@/components/search/LocationDetector"
import { useWishlist } from "@/contexts/WishlistContext"
import { useAuth } from "@/contexts/AuthContext"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"

const navItems = [
  { label: "Explore", href: "/" },
  { label: "Tours", href: "/tours" },
  { label: "Contests", href: "/posts" },
  { label: "Activities", href: "/activities" },
]

type MenuLinkProps = {
  href: string
  label: string
  icon: ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  active?: boolean
  badge?: string | number
  onClick: () => void
}

function ProfileMenuLink({ href, label, icon: Icon, active, badge, onClick }: MenuLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex min-h-10 items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 ease-out ${
        active
          ? "bg-slate-950 text-white shadow-[0_8px_24px_rgba(15,23,42,0.22)]"
          : "text-slate-800 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
      }`}
    >
      <Icon
        size={18}
        strokeWidth={1.9}
        className={`transition-all duration-200 ease-out ${
          active ? "text-white" : "text-slate-700 group-hover:-translate-y-0.5 group-hover:text-slate-950"
        }`}
      />
      <span className="flex-1 font-medium transition-transform duration-200 ease-out group-hover:translate-x-0.5">{label}</span>
      {badge ? (
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold transition-all duration-200 ease-out ${
            active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-700"
          }`}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  )
}

const Header = () => {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { wishlist } = useWishlist()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [profileMenuPlacement, setProfileMenuPlacement] = useState<{ openUp: boolean; maxHeight: number }>({
    openUp: false,
    maxHeight: 520,
  })

  const profileName = user?.name || "Alexander Mitchell"
  const profileEmail = user?.email || "alex.mitchell@premium.com"
  const isHost = user?.role === "HOST" || user?.role === "ADMIN"
  const avatarInitials = (user?.name || user?.email || "GH")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  const closeProfile = () => setProfileOpen(false)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false)
      }
    }
    if (profileOpen) document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [profileOpen])

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false)
    }
    if (profileOpen) document.addEventListener("keydown", handleEsc)
    return () => document.removeEventListener("keydown", handleEsc)
  }, [profileOpen])

  useEffect(() => {
    if (!profileOpen) return

    const updateMenuPlacement = () => {
      const trigger = triggerRef.current
      if (!trigger) return

      const rect = trigger.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const spaceBelow = viewportHeight - rect.bottom - 12
      const spaceAbove = rect.top - 12
      const openUp = spaceBelow < 360 && spaceAbove > spaceBelow
      const availableSpace = openUp ? spaceAbove : spaceBelow
      const maxHeight = Math.max(280, Math.min(640, Math.floor(availableSpace)))

      setProfileMenuPlacement({ openUp, maxHeight })
    }

    updateMenuPlacement()
    window.addEventListener("resize", updateMenuPlacement)
    window.addEventListener("scroll", updateMenuPlacement, true)

    return () => {
      window.removeEventListener("resize", updateMenuPlacement)
      window.removeEventListener("scroll", updateMenuPlacement, true)
    }
  }, [profileOpen])

  const travelerLinks = [
    { label: "My Profile", href: "/profile", icon: User },
    { label: "My Bookings", href: "/my-bookings", icon: Ticket },
    { label: "Wishlist", href: "/wishlist", icon: Heart, badge: wishlist.length ? `(${wishlist.length})` : undefined },
    { label: "Travel Posts", href: "/posts", icon: ImageIcon },
  ]

  const hostLinks = [
    { label: isHost ? "Host Dashboard" : "Become a Host", href: "/host", icon: LayoutGrid },
    { label: "Manage Tours", href: "/host/tours", icon: Ticket },
    { label: "Hosting Earnings", href: "/host/payments", icon: WalletCards },
  ]

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/95 shadow-[0_1px_20px_rgba(15,23,42,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-9 items-center justify-center rounded-full text-slate-900 transition hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>
          <Link href="/" className="group inline-flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_60%,#06b6d4_100%)] text-[11px] font-black tracking-tight text-white shadow-[0_6px_18px_rgba(29,78,216,0.35)] transition-transform duration-200 group-hover:scale-105">
              GH
            </span>
            <span className="text-[17px] font-black tracking-tight text-slate-950 sm:text-[18px]">GetHotels</span>
          </Link>
        </div>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`rounded-full px-1.5 py-2 transition ${
                isActive(item.href) ? "text-slate-950" : "hover:text-slate-950"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden min-w-0 max-w-[220px] items-center lg:flex">
            <LocationDetector />
          </div>
          <button
            type="button"
            className="flex size-8 items-center justify-center rounded-full text-slate-800 transition hover:bg-slate-100"
            aria-label="Notifications"
          >
            <Bell size={17} strokeWidth={2} />
          </button>

          <div
            className="relative z-50"
            ref={dropdownRef}
            onMouseEnter={() => setProfileOpen(true)}
            onMouseLeave={() => setProfileOpen(false)}
          >
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label={isAuthenticated ? "Open account menu" : "Open sign in menu"}
              onClick={() => setProfileOpen((value) => !value)}
              className={`flex size-10 items-center justify-center overflow-hidden rounded-full border bg-white p-1 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                profileOpen ? "border-slate-400 ring-4 ring-slate-200/70" : "border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className="flex size-full overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                {isAuthenticated ? (
                  <span className="flex size-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#06b6d4_100%)] text-[10px] font-black tracking-[0.04em] text-white">
                    {avatarInitials}
                  </span>
                ) : (
                  <span className="flex size-full items-center justify-center text-slate-700">
                    <User size={17} />
                  </span>
                )}
              </span>
            </button>

            <div
              className={`absolute right-0 z-50 flex w-[min(88vw,340px)] flex-col overflow-hidden overscroll-contain rounded-[22px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)] transition-all duration-300 ease-out ${
                profileMenuPlacement.openUp ? "bottom-[calc(100%+10px)] origin-bottom-right" : "top-[calc(100%+10px)] origin-top-right"
              } ${
                profileOpen
                  ? "pointer-events-auto translate-y-0 scale-100 opacity-100 blur-0"
                  : "pointer-events-none -translate-y-2 scale-[0.97] opacity-0 blur-[1px]"
              }`}
              style={{ maxHeight: `${profileMenuPlacement.maxHeight}px` }}
            >
              {isAuthenticated ? (
                <>
                  <div className="border-b border-slate-100 px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="size-12 overflow-hidden rounded-full border-2 border-teal-500 bg-slate-100 p-0.5">
                        {isAuthenticated ? (
                          <span className="flex size-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#06b6d4_100%)] text-sm font-black tracking-[0.04em] text-white">
                            {avatarInitials}
                          </span>
                        ) : (
                          <span className="flex size-full items-center justify-center rounded-full bg-slate-200 text-slate-700">
                            <User size={18} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-slate-950">{profileName}</p>
                        <p className="truncate text-xs text-slate-500">{profileEmail}</p>
                      </div>
                    </div>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#8cefe2] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-teal-900">
                      <BadgeCheck size={13} />
                      Gold Tier Member
                    </div>
                  </div>

                  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Traveler</p>
                    <div className="space-y-1">
                      {travelerLinks.map((item) => (
                        <ProfileMenuLink
                          key={item.label}
                          href={item.href}
                          label={item.label}
                          icon={item.icon}
                          badge={item.badge}
                          active={isActive(item.href)}
                          onClick={closeProfile}
                        />
                      ))}
                    </div>

                    <div className="my-3 border-t border-slate-100" />
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Host</p>
                    <div className="space-y-1">
                      {hostLinks.map((item) => (
                        <ProfileMenuLink
                          key={item.label}
                          href={item.href}
                          label={item.label}
                          icon={item.icon}
                          active={isActive(item.href)}
                          onClick={closeProfile}
                        />
                      ))}
                    </div>

                    <div className="my-3 border-t border-slate-100" />
                    <div className="space-y-1">
                      <ProfileMenuLink href="/profile" label="Rewards & Referrals" icon={Gift} onClick={closeProfile} />
                      <ProfileMenuLink href="/profile" label="Settings" icon={Settings} onClick={closeProfile} />
                      <ProfileMenuLink href="/terms" label="Help & Support" icon={HelpCircle} onClick={closeProfile} />
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        logout()
                        closeProfile()
                        router.push("/login")
                      }}
                      className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-100 bg-white text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <LogOut size={17} />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="border-b border-slate-100 px-4 py-4">
                    <p className="text-base font-semibold text-slate-950">Welcome to GetHotels</p>
                    <p className="mt-1 text-sm text-slate-500">Sign in to manage trips, wishlist items, and host tools.</p>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb:hover]:bg-slate-400">
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Traveler</p>
                    <div className="space-y-1">
                      <ProfileMenuLink href="/login" label="Sign In" icon={User} onClick={closeProfile} />
                      <ProfileMenuLink href="/signup" label="Create Account" icon={Sparkles} onClick={closeProfile} />
                      {wishlist.length > 0 ? (
                        <ProfileMenuLink
                          href="/wishlist"
                          label="Your Wishlist"
                          icon={Heart}
                          badge={`(${wishlist.length})`}
                          onClick={closeProfile}
                        />
                      ) : null}
                    </div>
                    <div className="my-3 border-t border-slate-100" />
                    <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Host</p>
                    <div className="space-y-1">
                      <ProfileMenuLink href="/login?role=HOST" label="Host Sign In" icon={BookOpen} onClick={closeProfile} />
                      <ProfileMenuLink href="/host/signup" label="List Tours" icon={BookOpen} onClick={closeProfile} />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="inset-y-0 flex h-dvh max-h-dvh flex-col overflow-y-auto rounded-r-[32px]">
          <SheetTitle className="sr-only">Mobile navigation</SheetTitle>
          <div className="relative overflow-hidden bg-[linear-gradient(135deg,#020617_0%,#0f172a_45%,#1e293b_100%)] px-5 pb-6 pt-14 text-white">
            <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-8 -left-10 h-20 w-20 rounded-full bg-blue-400/20 blur-2xl" />
            <div className="flex items-center gap-4">
              <div className="size-14 overflow-hidden rounded-full border-2 border-[#5EEAD4] bg-white/10 p-0.5">
                {isAuthenticated ? (
                  <span className="flex size-full items-center justify-center rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_55%,#06b6d4_100%)] text-base font-black tracking-[0.04em] text-white">
                    {avatarInitials}
                  </span>
                ) : (
                  <span className="flex size-full items-center justify-center rounded-full bg-white/10">
                    <User size={22} />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-lg font-semibold">{isAuthenticated ? profileName : "Welcome Traveler"}</p>
                <p className="truncate text-xs text-white/55">{isAuthenticated ? profileEmail : "Sign in to unlock trips"}</p>
              </div>
            </div>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5EEAD4] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-teal-950">
              <BadgeCheck size={14} />
              Gold Tier Member
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Explore</p>
            <div className="flex-1 space-y-2">
              {[
                { label: "Explore", href: "/", icon: Sparkles },
                { label: "Tours", href: "/tours", icon: Ticket },
                { label: "Contests", href: "/posts", icon: Gift },
                { label: "Activities", href: "/activities", icon: CalendarCheck },
              ].map((item, index) => {
                const active = isActive(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`group flex min-h-11 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-all duration-300 ${
                      active
                        ? "bg-slate-950 text-white shadow-[0_10px_22px_rgba(15,23,42,0.25)]"
                        : "text-slate-700 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-[0_10px_22px_rgba(15,23,42,0.08)]"
                    }`}
                    style={{ transitionDelay: `${index * 40}ms` }}
                  >
                    <span className={`flex size-8 items-center justify-center rounded-xl transition-all duration-300 ${active ? "bg-white/15" : "bg-slate-100 group-hover:bg-white"}`}>
                      <Icon size={16} className={`${active ? "text-white" : "text-slate-700"}`} />
                    </span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}

export default Header
