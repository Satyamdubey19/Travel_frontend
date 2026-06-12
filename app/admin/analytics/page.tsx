'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BarChart3, CalendarClock, CreditCard, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
    }
  }, [isAdmin, router]);

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-sky-100 text-sky-700">
                <BarChart3 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Insights workspace</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Platform analytics</h1>
                <p className="mt-2 text-sm text-slate-600">A unified analytics surface is planned here for revenue, bookings, hosts, and platform health.</p>
              </div>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              Preview mode
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-white/70 bg-white/80 p-12 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-sky-100 text-sky-700">
            <BarChart3 className="h-10 w-10" />
          </div>
          <h2 className="mt-6 text-2xl font-semibold tracking-tight text-slate-950">Analytics dashboard coming soon</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            This page will aggregate revenue movement, booking completion, host verification, growth segments, and geographic performance in the same admin theme.
          </p>
          <ul className="mx-auto mt-8 inline-block text-left text-sm text-slate-600 space-y-2">
            <li>Daily, weekly, and monthly revenue trends</li>
            <li>Booking completion and cancellation patterns</li>
            <li>Host verification and compliance throughput</li>
            <li>User acquisition and retention metrics</li>
            <li>Top-performing properties and destinations</li>
            <li>Payment and settlement visibility</li>
          </ul>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <LinkCard
            title="KYC Reviews"
            description="Review host verification with the same admin theme."
            icon={<ShieldCheck className="h-6 w-6" />}
            href="/admin/kyc"
          />
          <LinkCard
            title="Bookings"
            description="Inspect platform reservations and override workflows."
            icon={<CalendarClock className="h-6 w-6" />}
            href="/admin/bookings"
          />
          <LinkCard
            title="Payouts"
            description="Process settlements and payout status changes."
            icon={<CreditCard className="h-6 w-6" />}
            href="/admin/payouts"
          />
        </div>
      </div>
    </div>
  );
}

function LinkCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)]"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
        {icon}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      <div className="mt-4 text-sm font-semibold text-sky-700">
        Go to {title} →
      </div>
    </Link>
  );
}