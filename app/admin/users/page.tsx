'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ShieldCheck, UserRound, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import { TablePageSkeleton } from '@/components/ui/loading-skeletons';
import FilterTabs from '@/components/ui/FilterTabs';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'HOST' | 'ADMIN';
  createdAt: string;
  isActive: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'USER' | 'HOST' | 'ADMIN'>('all');

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchUsers();
  }, [isAdmin, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // This would call an API endpoint for admin users
      // For now, using mock data
      setUsers([
        {
          id: '1',
          email: 'john@example.com',
          name: 'John Doe',
          phone: '+91-9876543210',
          role: 'USER',
          createdAt: new Date(Date.now() - 30*24*60*60*1000).toISOString(),
          isActive: true,
        },
        {
          id: '2',
          email: 'hotel@example.com',
          name: 'Mumbai Hotels',
          phone: '+91-9876543211',
          role: 'HOST',
          createdAt: new Date(Date.now() - 60*24*60*60*1000).toISOString(),
          isActive: true,
        },
        {
          id: '3',
          email: 'admin@gethotels.com',
          name: 'Admin User',
          phone: '+91-9876543212',
          role: 'ADMIN',
          createdAt: new Date(Date.now() - 120*24*60*60*1000).toISOString(),
          isActive: true,
        },
      ]);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = filter === 'all' 
    ? users 
    : users.filter(u => u.role === filter);
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'USER':
        return <UserRound className="h-5 w-5" />;
      case 'HOST':
        return <Building2 className="h-5 w-5" />;
      case 'ADMIN':
        return <ShieldCheck className="h-5 w-5" />;
      default:
        return <Users className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-sky-100 text-sky-700">
                <Users className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Administration</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">User management</h1>
                <p className="mt-2 text-sm text-slate-600">Review account types, growth mix, and active user health from one table.</p>
              </div>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              {users.length} total accounts
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={users.filter(u => u.role === 'USER').length}
            icon={<UserRound className="h-7 w-7" />}
            color="blue"
          />
          <StatCard
            title="Total Hosts"
            value={users.filter(u => u.role === 'HOST').length}
            icon={<Building2 className="h-7 w-7" />}
            color="green"
          />
          <StatCard
            title="Admins"
            value={users.filter(u => u.role === 'ADMIN').length}
            icon={<ShieldCheck className="h-7 w-7" />}
            color="red"
          />
          <StatCard
            title="Active Users"
            value={users.filter(u => u.isActive).length}
            icon={<Users className="h-7 w-7" />}
            color="purple"
          />
        </div>

        <div className="mb-6">
          <FilterTabs
            tabs={['all', 'USER', 'HOST', 'ADMIN'] as const}
            active={filter}
            onChange={(tab) => setFilter(tab as typeof filter)}
            formatLabel={(tab) =>
              tab === 'all' ? 'All Users' : `${tab} (${users.filter(u => u.role === tab).length})`
            }
          />
        </div>

        {/* Users Table */}
        {loading ? (
          <TablePageSkeleton />
        ) : filteredUsers.length === 0 ? (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-12 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-xl text-gray-600">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">User</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Email</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Phone</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Role</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Joined</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                          {getRoleIcon(user.role)}
                        </div>
                        <p className="font-semibold text-gray-900">{user.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">{user.phone || '-'}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.role} />
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={user.isActive ? 'Active' : 'Inactive'} colorMap={{ Active: 'success', Inactive: 'default' }} />
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


