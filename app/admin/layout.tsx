'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Building2,
  CalendarCheck2,
  Car,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Map,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AppShellSkeleton } from '@/components/ui/loading-skeletons';

type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const navItems: NavItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    description: 'Overview, risks, and activity',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/kyc',
    label: 'KYC Reviews',
    description: 'Approve host verification',
    icon: ShieldCheck,
    badge: '23',
  },
  {
    href: '/admin/bookings',
    label: 'Trip Bookings',
    description: 'Tour, activity, and rental reservations',
    icon: CalendarCheck2,
  },
  {
    href: '/admin/tours',
    label: 'Tours',
    description: 'Tour packages and slots',
    icon: Map,
  },
  {
    href: '/admin/rentals',
    label: 'Rentals',
    description: 'Vehicles and rental supply',
    icon: Car,
  },
  {
    href: '/admin/posts',
    label: 'Posts',
    description: 'User content and engagement',
    icon: FileText,
  },
  {
    href: '/admin/payouts',
    label: 'Payouts',
    description: 'Transfers and settlements',
    icon: CreditCard,
    badge: '12',
  },
  {
    href: '/admin/hosts',
    label: 'Hosts',
    description: 'Businesses and performance',
    icon: Building2,
  },
  {
    href: '/admin/users',
    label: 'Users',
    description: 'Accounts and moderation',
    icon: Users,
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    description: 'Revenue and operations trends',
    icon: BarChart3,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isAdmin, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, router, user]);

  if (loading || !user) {
    return <AppShellSkeleton />;
  }

  if (!isAdmin) {
    router.push('/');
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const searchResults = navItems.filter((item) => {
    const value = `${item.label} ${item.description}`.toLowerCase();
    return searchQuery.trim() !== '' && value.includes(searchQuery.trim().toLowerCase());
  });

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (searchResults.length > 0) {
      router.push(searchResults[0].href);
      setSearchQuery('');
    }
  };

  const displayName = user.name || user.email.split('@')[0];

  return (
    <div className="flex min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.14),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.12),_transparent_26%),linear-gradient(180deg,#ecfeff_0%,#f8fafc_36%,#eef2ff_100%)] text-slate-900">
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={`${
          sidebarOpen ? 'w-80 translate-x-0' : 'w-24 -translate-x-full md:translate-x-0'
        } fixed inset-y-0 left-0 z-50 flex flex-col border-r border-white/10 bg-[linear-gradient(180deg,#020617_0%,#0f172a_38%,#111827_100%)] text-white shadow-[0_30px_80px_rgba(2,6,23,0.45)] transition-all duration-300 md:static`}
      >
        <div className="border-b border-white/10 px-4 py-5">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/25 bg-cyan-400/10 text-cyan-200 shadow-[0_10px_30px_rgba(34,211,238,0.18)]">
                <AdminBrandMark className="h-6 w-6" />
              </div>
              {sidebarOpen ? (
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200/80">GetHotels</p>
                  <p className="text-lg font-semibold tracking-tight text-white">Admin Ops</p>
                </div>
              ) : null}
            </Link>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-200 transition hover:bg-white/10"
              aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            >
              {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </div>
          {sidebarOpen ? (
            <div className="mt-5 rounded-[24px] border border-cyan-400/10 bg-white/5 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Priority Queue</p>
              <div className="mt-3 space-y-3 text-sm text-slate-200">
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-2">
                  <span>KYC approvals</span>
                  <span className="rounded-full bg-cyan-400/15 px-2.5 py-1 text-xs font-semibold text-cyan-100">23 open</span>
                </div>
                <div className="flex items-center justify-between gap-3 rounded-2xl bg-white/5 px-3 py-2">
                  <span>Payout reviews</span>
                  <span className="rounded-full bg-cyan-400/15 px-2.5 py-1 text-xs font-semibold text-cyan-200">12 queued</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto px-3 py-5">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              description={item.description}
              badge={item.badge}
              open={sidebarOpen}
              active={item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)}
            />
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className={`flex items-center gap-3 rounded-[24px] border border-white/10 bg-white/5 p-3 ${sidebarOpen ? '' : 'justify-center'}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-300 to-cyan-400 text-sm font-semibold text-slate-950">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            {sidebarOpen ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">{displayName}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            ) : null}
          </div>
          <button
            onClick={handleLogout}
            className={`mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-3 py-2.5 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/20 ${sidebarOpen ? '' : 'px-0'}`}
          >
            <LogOut className="h-4 w-4" />
            {sidebarOpen ? 'Log out' : null}
          </button>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="rounded-2xl border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-slate-300 hover:text-slate-900 md:hidden"
                  aria-label="Toggle sidebar"
                >
                  {sidebarOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Control Center</p>
                  <h1 className="text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">GetHotels Admin Panel</h1>
                </div>
              </div>
              <div className="hidden items-center gap-3 md:flex">
                <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                  Platform stable
                </div>
                <button className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition hover:border-slate-300 hover:text-slate-900">
                  <Bell className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <form onSubmit={handleSearchSubmit} className="relative w-full max-w-2xl">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search users, hosts, tours, rentals, activities, posts"
                  className="w-full rounded-[24px] border border-slate-200 bg-white px-11 py-3.5 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400"
                />
                {searchResults.length > 0 ? (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] rounded-[24px] border border-slate-200 bg-white p-2 shadow-[0_22px_50px_rgba(15,23,42,0.12)]">
                    {searchResults.slice(0, 5).map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.href}
                          type="button"
                          onClick={() => {
                            router.push(item.href);
                            setSearchQuery('');
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-slate-50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                              <p className="text-xs text-slate-500">{item.description}</p>
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-slate-400" />
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </form>

              <div className="flex flex-wrap items-center gap-2">
                <TopShortcut href="/admin/kyc" label="Review KYC" />
                <TopShortcut href="/admin/tours" label="Review tours" />
                <TopShortcut href="/admin/posts" label="View posts" />
                <TopShortcut href="/admin/payouts" label="Process payouts" />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-0 py-0">{children}</div>
      </div>
    </div>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  description,
  badge,
  open,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
  badge?: string;
  open: boolean;
  active: boolean;
}) {
  return (
    <Link href={href} className="block">
      <div
        className={`group flex items-center gap-3 rounded-[24px] border px-3 py-3 transition-all ${
          active
            ? 'border-cyan-400/20 bg-cyan-400/12 shadow-[0_12px_30px_rgba(34,211,238,0.14)]'
            : 'border-transparent bg-transparent hover:border-white/10 hover:bg-white/5'
        }`}
      >
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
            active ? 'bg-cyan-300 text-slate-950' : 'bg-white/5 text-slate-300'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className={`${open ? 'min-w-0 flex-1' : 'hidden'} transition-opacity`}>
          <div className="flex items-center justify-between gap-3">
            <p className={`text-sm font-semibold ${active ? 'text-white' : 'text-slate-100'}`}>{label}</p>
            {badge ? <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">{badge}</span> : null}
          </div>
          <p className="mt-1 text-xs text-slate-400">{description}</p>
        </div>
        {open ? <ArrowUpRight className={`h-4 w-4 shrink-0 ${active ? 'text-cyan-200' : 'text-slate-500'}`} /> : null}
      </div>
    </Link>
  );
}

function TopShortcut({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
    >
      {label}
    </Link>
  );
}

function AdminBrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 8.5 12 4l8 4.5v7L12 20l-8-4.5v-7Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 11.5h7M8.5 14.5h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
