'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  CreditCard,
  IndianRupee,
  ShieldCheck,
  TrendingUp,
  UserCog,
  Users,
  Wallet,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { AdminDashboardSkeleton } from '@/components/ui/loading-skeletons';

interface DashboardStats {
  totalUsers: number;
  totalHosts: number;
  totalBookings: number;
  pendingKYC: number;
  approvedKYC: number;
  rejectedKYC: number;
  totalRevenue: number;
  totalPayouts: number;
  pendingPayouts: number;
  confirmedBookings: number;
  cancelledBookings: number;
}

interface RecentActivity {
  id: string;
  type: 'booking' | 'kyc' | 'payout' | 'user';
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'rejected';
  href: string;
}

type WorkspaceView = 'operations' | 'compliance' | 'growth';

const revenueTrend = [8.4, 9.1, 10.2, 10.9, 11.6, 12.4, 12.9];

const workspaceViews: Array<{
  id: WorkspaceView;
  label: string;
  description: string;
}> = [
  { id: 'operations', label: 'Operations', description: 'Keep bookings and support flow healthy' },
  { id: 'compliance', label: 'Compliance', description: 'Review KYC and high-risk actions quickly' },
  { id: 'growth', label: 'Growth', description: 'Monitor revenue momentum and host quality' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const { isAdmin, user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [workspaceView, setWorkspaceView] = useState<WorkspaceView>('operations');

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }

    void fetchStats();
  }, [isAdmin, router]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setStats({
        totalUsers: 1250,
        totalHosts: 145,
        totalBookings: 2847,
        pendingKYC: 23,
        approvedKYC: 142,
        rejectedKYC: 5,
        totalRevenue: 1254780,
        totalPayouts: 980420,
        pendingPayouts: 47500,
        confirmedBookings: 2156,
        cancelledBookings: 311,
      });

      setRecentActivity([
        {
          id: '1',
          type: 'kyc',
          description: 'New business identity package submitted by John Hotel Group',
          timestamp: new Date().toISOString(),
          status: 'pending',
          href: '/admin/kyc',
        },
        {
          id: '2',
          type: 'booking',
          description: 'Booking #1234 dispute resolved and released to host wallet',
          timestamp: new Date(Date.now() - 1000 * 60 * 52).toISOString(),
          status: 'completed',
          href: '/admin/bookings',
        },
        {
          id: '3',
          type: 'payout',
          description: 'Mumbai Hotels Ltd payout batch requires secondary review',
          timestamp: new Date(Date.now() - 1000 * 60 * 115).toISOString(),
          status: 'pending',
          href: '/admin/payouts',
        },
        {
          id: '4',
          type: 'user',
          description: 'Account moderation flag opened for duplicate traveler profile',
          timestamp: new Date(Date.now() - 1000 * 60 * 220).toISOString(),
          status: 'rejected',
          href: '/admin/users',
        },
      ]);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !stats) {
    return <AdminDashboardSkeleton />;
  }

  const approvalRate = Math.round((stats.approvedKYC / Math.max(stats.approvedKYC + stats.pendingKYC + stats.rejectedKYC, 1)) * 100);
  const payoutCoverage = Math.round((stats.totalPayouts / Math.max(stats.totalRevenue, 1)) * 100);
  const cancellationRate = Math.round((stats.cancelledBookings / Math.max(stats.totalBookings, 1)) * 100);
  const greetingName = user?.name || 'Admin';

  const priorityCards = [
    {
      title: 'Review compliance queue',
      value: `${stats.pendingKYC} pending`,
      detail: 'Business identities and tax documents waiting for approval.',
      href: '/admin/kyc',
      tone: 'from-sky-100 via-white to-cyan-50',
      icon: ShieldCheck,
    },
    {
      title: 'Process payout batch',
      value: formatCurrency(stats.pendingPayouts),
      detail: 'Transfers pending before the next settlement cutoff.',
      href: '/admin/payouts',
      tone: 'from-sky-100 via-white to-cyan-50',
      icon: Wallet,
    },
    {
      title: 'Watch booking exceptions',
      value: `${cancellationRate}% churn`,
      detail: 'Cancellation levels are above the preferred operating band.',
      href: '/admin/bookings',
      tone: 'from-slate-100 via-white to-sky-50',
      icon: CalendarClock,
    },
    {
      title: 'Coach host portfolio',
      value: `${stats.totalHosts} hosts`,
      detail: 'Spot underperforming partners before demand drops.',
      href: '/admin/hosts',
      tone: 'from-sky-100 via-white to-blue-50',
      icon: Building2,
    },
  ];

  const healthMetrics = [
    {
      label: 'KYC approval rate',
      value: `${approvalRate}%`,
      detail: 'Faster approvals keep host onboarding moving.',
      icon: CheckCircle2,
    },
    {
      label: 'Payout coverage',
      value: `${payoutCoverage}%`,
      detail: 'Share of revenue already released to hosts.',
      icon: CreditCard,
    },
    {
      label: 'Booking stability',
      value: `${100 - cancellationRate}%`,
      detail: 'Confirmed bookings holding without cancellations.',
      icon: Activity,
    },
  ];

  const workspacePanels: Record<WorkspaceView, Array<{ title: string; detail: string; href: string; icon: typeof Activity }>> = {
    operations: [
      {
        title: 'Bookings that need manual follow-up',
        detail: '8 reservations have schedule edits or payment mismatches.',
        href: '/admin/bookings',
        icon: BookOpenCheck,
      },
      {
        title: 'Traveler support escalations',
        detail: '3 cases have been open for more than 12 hours.',
        href: '/admin/users',
        icon: UserCog,
      },
    ],
    compliance: [
      {
        title: 'Business identities waiting for legal review',
        detail: '12 host records include newly uploaded tax paperwork.',
        href: '/admin/kyc',
        icon: ShieldCheck,
      },
      {
        title: 'Rejected accounts with appeal requests',
        detail: '4 hosts have submitted revised documents after rejection.',
        href: '/admin/hosts',
        icon: CircleAlert,
      },
    ],
    growth: [
      {
        title: 'High-performing hosts to feature',
        detail: 'Top 10 partners crossed the 95% response-health threshold.',
        href: '/admin/hosts',
        icon: TrendingUp,
      },
      {
        title: 'Revenue segments gaining momentum',
        detail: 'Weekend tours and premium stays are driving this month’s lift.',
        href: '/admin/analytics',
        icon: BarChart3,
      },
    ],
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <section className="relative overflow-hidden rounded-[36px] border border-white/60 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_90px_rgba(15,23,42,0.24)] sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,211,238,0.22),transparent_26%),radial-gradient(circle_at_80%_15%,rgba(59,130,246,0.24),transparent_22%),radial-gradient(circle_at_72%_78%,rgba(14,165,233,0.16),transparent_24%)]" />
          <div className="absolute -right-12 top-10 h-40 w-40 rounded-full border border-white/10 bg-white/5 blur-2xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1.35fr_0.95fr] lg:items-end">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
                <ShieldCheck className="h-4 w-4" />
                Admin command center
              </div>
              <div className="max-w-3xl space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
                  {greetingName}, the platform is healthy, but there are a few queues that need your attention.
                </h2>
                <p className="max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Move through compliance reviews, payout approvals, and booking exceptions from one workspace designed for fast operational decisions.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <HeroMetric label="Gross revenue" value={formatCurrency(stats.totalRevenue)} detail="7.8% ahead of the last cycle" />
                <HeroMetric label="Active hosts" value={stats.totalHosts.toLocaleString()} detail={`${stats.pendingKYC} still waiting for approval`} />
                <HeroMetric label="Confirmed bookings" value={stats.confirmedBookings.toLocaleString()} detail={`${cancellationRate}% cancellation rate`} />
              </div>
              <div className="flex flex-wrap gap-3">
                <ActionLink href="/admin/kyc" label="Open KYC queue" icon={<ShieldCheck className="h-4 w-4" />} tone="bg-cyan-400 text-slate-950 hover:bg-cyan-300" />
                <ActionLink href="/admin/payouts" label="Process payouts" icon={<Wallet className="h-4 w-4" />} tone="bg-white/10 text-white hover:bg-white/15" />
                <ActionLink href="/admin/users" label="Review accounts" icon={<Users className="h-4 w-4" />} tone="bg-white/10 text-white hover:bg-white/15" />
              </div>
            </div>

            <div className="grid gap-4 rounded-[28px] border border-white/10 bg-white/5 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100/80">Live posture</p>
                  <p className="mt-2 text-lg font-semibold text-white">Operational health</p>
                </div>
                <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                  Stable
                </div>
              </div>
              <div className="space-y-3">
                {healthMetrics.map((metric) => {
                  const Icon = metric.icon;
                  return (
                    <div key={metric.label} className="rounded-[24px] border border-white/10 bg-slate-950/25 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{metric.label}</p>
                          <p className="mt-1 text-xs text-slate-300">{metric.detail}</p>
                        </div>
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-200">
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="mt-4 text-2xl font-semibold tracking-tight text-cyan-100">{metric.value}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Platform users" value={stats.totalUsers} icon={<Users className="h-7 w-7" />} color="blue" href="/admin/users" change="Includes travelers, hosts, and admin accounts" />
          <StatCard title="Host partners" value={stats.totalHosts} icon={<Building2 className="h-7 w-7" />} color="purple" href="/admin/hosts" change="14 high-value accounts added this quarter" />
          <StatCard title="Pending KYC" value={stats.pendingKYC} icon={<ShieldCheck className="h-7 w-7" />} color="yellow" href="/admin/kyc" highlight={stats.pendingKYC > 0} change="Compliance queue needs same-day review" />
          <StatCard title="Bookings tracked" value={stats.totalBookings} icon={<CalendarClock className="h-7 w-7" />} color="green" href="/admin/bookings" change={`${stats.confirmedBookings.toLocaleString()} already confirmed`} />
        </section>

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Priority workflows</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Handle the most important queues first</h3>
              </div>
              <div className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">
                4 focus areas today
              </div>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {priorityCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    href={card.href}
                    className={`group overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br ${card.tone} p-5 shadow-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_rgba(15,23,42,0.1)]`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-500">{card.title}</p>
                        <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{card.value}</p>
                        <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/85 text-slate-700 shadow-sm">
                        <Icon className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-800">
                      Open workspace
                      <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Revenue pulse</p>
            <div className="mt-2 flex items-end justify-between gap-3">
              <div>
                <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{formatCurrency(stats.totalRevenue)}</h3>
                <p className="mt-1 text-sm text-slate-600">Gross platform revenue with steady month-on-month lift.</p>
              </div>
              <div className="rounded-2xl bg-sky-50 px-3 py-2 text-sm font-semibold text-sky-700">+7.8%</div>
            </div>
            <div className="mt-6 flex h-44 items-end gap-3">
              {revenueTrend.map((value, index) => (
                <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-3">
                  <div
                    className="w-full rounded-t-[18px] bg-[linear-gradient(180deg,#0ea5e9_0%,#2563eb_100%)] shadow-[0_14px_30px_rgba(37,99,235,0.18)]"
                    style={{ height: `${Math.max(value * 9, 28)}px` }}
                  />
                  <span className="text-xs font-medium text-slate-500">W{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <MiniRevenueCard label="Settled payouts" value={formatCurrency(stats.totalPayouts)} icon={<IndianRupee className="h-4 w-4" />} />
              <MiniRevenueCard label="Pending payout load" value={formatCurrency(stats.pendingPayouts)} icon={<CreditCard className="h-4 w-4" />} />
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex flex-wrap gap-2">
              {workspaceViews.map((view) => (
                <button
                  key={view.id}
                  onClick={() => setWorkspaceView(view.id)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    workspaceView === view.id
                      ? 'bg-slate-950 text-white shadow-[0_12px_25px_rgba(15,23,42,0.16)]'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {view.label}
                </button>
              ))}
            </div>
            <div className="mt-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Workspace mode</p>
              <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{workspaceViews.find((view) => view.id === workspaceView)?.label}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{workspaceViews.find((view) => view.id === workspaceView)?.description}</p>
            </div>
            <div className="mt-6 space-y-3">
              {workspacePanels[workspaceView].map((panel) => {
                const Icon = panel.icon;
                return (
                  <Link key={panel.title} href={panel.href} className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-semibold text-slate-950">{panel.title}</p>
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{panel.detail}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Live activity</p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">Recent operational events</h3>
              </div>
              <div className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                {recentActivity.length} events
              </div>
            </div>
            <div className="mt-6 space-y-3">
              {recentActivity.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <Link
                    key={activity.id}
                    href={activity.href}
                    className="flex items-start gap-4 rounded-[24px] border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <p className="text-sm font-semibold leading-6 text-slate-950">{activity.description}</p>
                        <StatusBadge status={activity.status} />
                      </div>
                      <p className="mt-2 text-xs font-medium uppercase tracking-[0.16em] text-slate-500">
                        {formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function HeroMetric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-300">{detail}</p>
    </div>
  );
}

function ActionLink({
  href,
  label,
  icon,
  tone,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
  tone: string;
}) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition ${tone}`}>
      {icon}
      {label}
    </Link>
  );
}

function MiniRevenueCard({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-600">
        {icon}
        {label}
      </div>
      <p className="mt-3 text-xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function getActivityIcon(type: RecentActivity['type']) {
  switch (type) {
    case 'kyc':
      return ShieldCheck;
    case 'booking':
      return CalendarClock;
    case 'payout':
      return Wallet;
    case 'user':
      return UserCog;
    default:
      return Activity;
  }
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatRelativeTime(timestamp: string) {
  const diffInMinutes = Math.max(Math.round((Date.now() - new Date(timestamp).getTime()) / (1000 * 60)), 0);

  if (diffInMinutes < 60) {
    return `${diffInMinutes || 1}m ago`;
  }

  if (diffInMinutes < 60 * 24) {
    return `${Math.round(diffInMinutes / 60)}h ago`;
  }

  return `${Math.round(diffInMinutes / (60 * 24))}d ago`;
}