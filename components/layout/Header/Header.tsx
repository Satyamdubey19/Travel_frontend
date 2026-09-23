"use client"

import { useEffect, useRef, useState, type ComponentType } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BadgeCheck,
  BookOpen,
  CalendarCheck,
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
import NotificationMenu from "@/components/notifications/NotificationMenu"
import BrandMark from "@/components/ui/BrandMark"

const navItems = [
  { label: "Explore", href: "/" },
  { label: "Tours", href: "/tours" },
  { label: "Activities", href: "/activities" },
  { label: "Rentals", href: "/car-rental" },
  { label: "Community", href: "/posts" },
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
      className={`group flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ease-out ${
        active
          ? "bg-slate-950 text-white shadow-[0_8px_24px_rgba(15,23,42,0.22)]"
          : "text-slate-800 hover:bg-slate-50"
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

  const profileName = user?.name || "Traveler"
  const profileEmail = user?.email || ""
  const hasActiveHostWorkspace = user?.role === "HOST" && user.isHostApproved === true
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

  const hostLinks = hasActiveHostWorkspace
    ? [
        { label: "Host Dashboard", href: "/host", icon: LayoutGrid },
        { label: "Manage Tours", href: "/host/tours", icon: Ticket },
        { label: "Hosting Earnings", href: "/host/payments", icon: WalletCards },
      ]
    : user?.hasHostApplication
      ? [{ label: "Continue host verification", href: "/host/kyc", icon: BadgeCheck }]
      : [{ label: "Become a host", href: "/host/signup", icon: BookOpen }]

  const adminLinks = user?.role === "ADMIN"
    ? [{ label: "Admin workspace", href: "/admin", icon: LayoutGrid }]
    : []

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/88 shadow-[0_8px_35px_rgba(15,23,42,.045)] backdrop-blur-2xl">
      <div className="mx-auto flex h-[4.5rem] max-w-[1480px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="flex size-9 items-center justify-center rounded-lg text-slate-900 transition hover:bg-slate-100 md:hidden"
            aria-label="Open menu"
          >
            <Menu size={19} />
          </button>
          <BrandMark />
        </div>

        <nav className="hidden h-full items-center gap-7 text-sm font-semibold text-slate-500 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative flex h-full items-center px-1 transition duration-300 after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:origin-left after:bg-cyan-700 after:transition-transform ${
                isActive(item.href) ? "text-slate-950 after:scale-x-100" : "hover:text-slate-950 after:scale-x-0 hover:after:scale-x-100"
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
          <NotificationMenu key={user?.id ?? "guest"} enabled={isAuthenticated} />

          <div
            className="relative z-50"
            ref={dropdownRef}
          >
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              aria-label={isAuthenticated ? "Open account menu" : "Open sign in menu"}
              onClick={() => setProfileOpen((value) => !value)}
              className={`flex size-10 items-center justify-center overflow-hidden rounded-lg border bg-white p-1 shadow-sm transition duration-200 hover:shadow-md ${
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
              className={`absolute right-0 z-50 flex w-[min(91vw,360px)] flex-col overflow-hidden overscroll-contain rounded-2xl border border-slate-200 bg-white/95 shadow-[0_30px_90px_rgba(15,23,42,.18)] backdrop-blur-2xl transition-all duration-300 ease-out ${
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
                      {user?.role ?? "USER"} account
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
                    {adminLinks.length > 0 ? (
                      <>
                        <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.26em] text-slate-400">Admin</p>
                        <div className="space-y-1">
                          {adminLinks.map((item) => (
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
                      </>
                    ) : (
                      <>
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
                      </>
                    )}

                    <div className="my-3 border-t border-slate-100" />
                    <div className="space-y-1">
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
                    <p className="text-base font-semibold text-slate-950">Welcome to Travels Pro</p>
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
                      <ProfileMenuLink href="/login?intent=host" label="Sign in to host" icon={BookOpen} onClick={closeProfile} />
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
        <SheetContent side="left" className="inset-y-0 flex h-dvh max-h-dvh flex-col overflow-y-auto">
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
            {isAuthenticated && <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#5EEAD4] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-teal-950"><BadgeCheck size={14} />{user?.role ?? "USER"} account</div>}
          </div>

          <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
            <p className="px-3 pb-3 text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Explore</p>
            <div className="flex-1 space-y-2">
              {[
                { label: "Explore", href: "/", icon: Sparkles },
                { label: "Tours", href: "/tours", icon: Ticket },
                { label: "Community", href: "/posts", icon: ImageIcon },
                { label: "Activities", href: "/activities", icon: CalendarCheck },
                { label: "Rentals", href: "/car-rental", icon: WalletCards },
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
