'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, CheckCircle2, Clock3, IndianRupee, MapPin, Search } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import { TablePageSkeleton } from '@/components/ui/loading-skeletons';
import FilterTabs from '@/components/ui/FilterTabs';
import Input from '@/components/ui/Input';

interface Host {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  city: string;
  isVerified: boolean;
  kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NOT_SUBMITTED';
  totalProperties: number;
  totalBookings: number;
  revenue: number;
  joinedAt: string;
  lastActive: string;
}

export default function AdminHostsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'verified' | 'pending-kyc' | 'rejected-kyc'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchHosts();
  }, [isAdmin, router]);

  const fetchHosts = async () => {
    try {
      setLoading(true);
      // This would call an API endpoint for admin hosts
      // For now, using mock data
      setHosts([
        {
          id: '1',
          businessName: 'Mumbai Hotels Ltd',
          email: 'contact@mumbaihotels.com',
          phone: '+91-9876543210',
          city: 'Mumbai',
          isVerified: true,
          kycStatus: 'APPROVED',
          totalProperties: 5,
          totalBookings: 245,
          revenue: 1250000,
          joinedAt: new Date(Date.now() - 180*24*60*60*1000).toISOString(),
          lastActive: new Date(Date.now() - 2*24*60*60*1000).toISOString(),
        },
        {
          id: '2',
          businessName: 'Goa Beach Resorts',
          email: 'contact@goabeach.com',
          phone: '+91-9876543211',
          city: 'Goa',
          isVerified: false,
          kycStatus: 'PENDING',
          totalProperties: 3,
          totalBookings: 89,
          revenue: 450000,
          joinedAt: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
          lastActive: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Error fetching hosts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredHosts = hosts
    .filter((host) => {
      if (filter === 'all') return true;
      if (filter === 'verified') return host.isVerified && host.kycStatus === 'APPROVED';
      if (filter === 'pending-kyc') return host.kycStatus === 'PENDING';
      if (filter === 'rejected-kyc') return host.kycStatus === 'REJECTED';
      return true;
    })
    .filter((host) =>
      host.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      host.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  const stats = {
    totalHosts: hosts.length,
    verifiedHosts: hosts.filter(h => h.isVerified).length,
    pendingKYC: hosts.filter(h => h.kycStatus === 'PENDING').length,
    totalRevenue: hosts.reduce((sum, h) => sum + h.revenue, 0),
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-sky-100 text-sky-700">
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Partner operations</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Host management</h1>
                <p className="mt-2 text-sm text-slate-600">Track verification, revenue concentration, and partner activity from one screen.</p>
              </div>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              {stats.pendingKYC} pending reviews
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Hosts"
            value={stats.totalHosts}
            icon={<Building2 className="h-7 w-7" />}
            color="blue"
          />
          <StatCard
            title="Verified Hosts"
            value={stats.verifiedHosts}
            icon={<CheckCircle2 className="h-7 w-7" />}
            color="green"
          />
          <StatCard
            title="Pending KYC"
            value={stats.pendingKYC}
            icon={<Clock3 className="h-7 w-7" />}
            color="yellow"
            highlight={stats.pendingKYC > 0}
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue / 100000).toFixed(1)}L`}
            icon={<IndianRupee className="h-7 w-7" />}
            color="purple"
          />
        </div>

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search by business name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11"
            />
          </div>

          <FilterTabs
            tabs={['all', 'verified', 'pending-kyc', 'rejected-kyc'] as const}
            active={filter}
            onChange={(tab) => setFilter(tab as typeof filter)}
            formatLabel={(tab) => {
              if (tab === 'all') return 'All Hosts';
              if (tab === 'verified') return `Verified (${stats.verifiedHosts})`;
              if (tab === 'pending-kyc') return `Pending KYC (${stats.pendingKYC})`;
              return `Rejected KYC (${hosts.filter(h => h.kycStatus === 'REJECTED').length})`;
            }}
          />
        </div>

        {/* Hosts Table */}
        {loading ? (
          <TablePageSkeleton />
        ) : filteredHosts.length === 0 ? (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-12 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-xl text-gray-600">No hosts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Business</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Contact</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Location</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Properties</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Bookings</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Revenue</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">KYC Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredHosts.map((host) => (
                  <tr key={host.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{host.businessName}</p>
                      <p className="text-xs text-gray-500">{host.email}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {host.phone}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        {host.city}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {host.totalProperties}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {host.totalBookings}
                    </td>
                    <td className="px-6 py-4 font-bold text-sky-700">
                      ₹{(host.revenue / 100000).toFixed(1)}L
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={host.kycStatus} />
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-xs">
                      {new Date(host.lastActive).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

