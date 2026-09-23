'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, BarChart3, CalendarCheck2, CreditCard, IndianRupee, ShieldCheck, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AdminDashboardSkeleton } from '@/components/ui/loading-skeletons';
import api, { getApiErrorMessage } from '@/lib/axios';

type AnalyticsStats = {
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
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }

    void api.get<{ data: { stats: AnalyticsStats } }>('/admin/dashboard')
      .then(({ data }) => setStats(data.data.stats))
      .catch((requestError) => setError(getApiErrorMessage(requestError, 'Unable to load analytics')))
      .finally(() => setLoading(false));
  }, [isAdmin, router]);

  if (loading) return <AdminDashboardSkeleton />;

  const safeStats = stats ?? {
    totalUsers: 0, totalHosts: 0, totalBookings: 0, pendingKYC: 0, approvedKYC: 0,
    rejectedKYC: 0, totalRevenue: 0, totalPayouts: 0, pendingPayouts: 0,
    confirmedBookings: 0, cancelledBookings: 0,
  };
  const kycTotal = safeStats.approvedKYC + safeStats.pendingKYC + safeStats.rejectedKYC;
  const kycApprovalRate = percent(safeStats.approvedKYC, kycTotal);
  const bookingStability = 100 - percent(safeStats.cancelledBookings, safeStats.totalBookings);
  const settlementCoverage = percent(safeStats.totalPayouts, safeStats.totalRevenue);
  const hostShare = percent(safeStats.totalHosts, safeStats.totalUsers);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {error && <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</div>}

        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-slate-950 p-7 text-white shadow-[0_30px_90px_rgba(15,23,42,0.25)] sm:p-9">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_15%,rgba(34,211,238,0.22),transparent_30%),radial-gradient(circle_at_88%_70%,rgba(99,102,241,0.22),transparent_32%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-200">
                <BarChart3 className="h-4 w-4" /> Live platform snapshot
              </div>
              <h1 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">Decisions from recorded activity, not demo metrics.</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                This view reports current database totals. Historical trends, cohorts, acquisition attribution and retention require a dedicated event pipeline before they can be shown honestly.
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/[0.07] px-6 py-5 backdrop-blur-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Gross recorded revenue</p>
              <p className="mt-2 text-3xl font-semibold text-cyan-200">{currency(safeStats.totalRevenue)}</p>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric title="Booking stability" value={`${bookingStability}%`} detail={`${safeStats.cancelledBookings} cancelled of ${safeStats.totalBookings} tracked`} icon={<CalendarCheck2 className="h-5 w-5" />} />
          <Metric title="KYC approval" value={`${kycApprovalRate}%`} detail={`${safeStats.pendingKYC} still pending review`} icon={<ShieldCheck className="h-5 w-5" />} />
          <Metric title="Settlement coverage" value={`${settlementCoverage}%`} detail={`${currency(safeStats.pendingPayouts)} pending payout`} icon={<CreditCard className="h-5 w-5" />} />
          <Metric title="Host share" value={`${hostShare}%`} detail={`${safeStats.totalHosts} hosts across ${safeStats.totalUsers} accounts`} icon={<Users className="h-5 w-5" />} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <Breakdown
            eyebrow="Booking health"
            title="Current booking outcomes"
            rows={[
              { label: 'Confirmed tour bookings', value: safeStats.confirmedBookings, total: safeStats.totalBookings, tone: 'bg-emerald-500' },
              { label: 'Cancelled tour bookings', value: safeStats.cancelledBookings, total: safeStats.totalBookings, tone: 'bg-rose-500' },
            ]}
            href="/admin/bookings"
          />
          <Breakdown
            eyebrow="Verification funnel"
            title="Host identity decisions"
            rows={[
              { label: 'Approved', value: safeStats.approvedKYC, total: kycTotal, tone: 'bg-cyan-500' },
              { label: 'Pending', value: safeStats.pendingKYC, total: kycTotal, tone: 'bg-amber-400' },
              { label: 'Rejected', value: safeStats.rejectedKYC, total: kycTotal, tone: 'bg-rose-500' },
            ]}
            href="/admin/kyc"
          />
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <Action href="/admin/users" title="Account operations" detail="Search, suspend and reactivate real accounts with audit reasons." icon={<Users className="h-6 w-6" />} />
          <Action href="/admin/payouts" title="Settlement operations" detail={`${currency(safeStats.totalPayouts)} is marked settled in current records.`} icon={<IndianRupee className="h-6 w-6" />} />
          <Action href="/admin/hosts" title="Host portfolio" detail="Inspect verification, inventory, bookings and recorded revenue by host." icon={<ShieldCheck className="h-6 w-6" />} />
        </section>
      </div>
    </div>
  );
}

function Metric({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) {
  return <article className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-[0_20px_55px_rgba(15,23,42,0.07)] backdrop-blur-xl">
    <div className="flex items-center justify-between"><p className="text-sm font-semibold text-slate-600">{title}</p><span className="rounded-2xl bg-sky-50 p-2.5 text-sky-700">{icon}</span></div>
    <p className="mt-5 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
    <p className="mt-2 text-xs leading-5 text-slate-500">{detail}</p>
  </article>;
}

function Breakdown({ eyebrow, title, rows, href }: { eyebrow: string; title: string; rows: Array<{ label: string; value: number; total: number; tone: string }>; href: string }) {
  return <article className="rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">{eyebrow}</p>
    <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
    <div className="mt-6 space-y-5">{rows.map((row) => <div key={row.label}>
      <div className="mb-2 flex justify-between gap-4 text-sm"><span className="font-semibold text-slate-700">{row.label}</span><span className="font-bold text-slate-950">{row.value.toLocaleString()}</span></div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100"><div className={`h-full rounded-full ${row.tone} transition-[width] duration-700`} style={{ width: `${percent(row.value, row.total)}%` }} /></div>
    </div>)}</div>
    <Link href={href} className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-sky-700 hover:text-sky-900">Open records <ArrowUpRight className="h-4 w-4" /></Link>
  </article>;
}

function Action({ href, title, detail, icon }: { href: string; title: string; detail: string; icon: React.ReactNode }) {
  return <Link href={href} className="group rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_20px_55px_rgba(15,23,42,0.07)] backdrop-blur-xl transition hover:-translate-y-0.5 hover:shadow-xl">
    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-cyan-200">{icon}</span>
    <h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-sky-700">Open workspace <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5" /></span>
  </Link>;
}

function percent(value: number, total: number) {
  return Math.min(Math.max(Math.round((value / Math.max(total, 1)) * 100), 0), 100);
}

function currency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);
}
