'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Search, ShieldCheck, UserCheck, UserRound, Users, UserX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import { TablePageSkeleton } from '@/components/ui/loading-skeletons';
import FilterTabs from '@/components/ui/FilterTabs';
import Input from '@/components/ui/Input';
import api, { getApiErrorMessage } from '@/lib/axios';

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'USER' | 'HOST' | 'ADMIN';
  createdAt: string;
  isActive: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  isHost: boolean;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'USER' | 'HOST' | 'ADMIN'>('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    void fetchUsers();
  }, [isAdmin, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await api.get<{ data: User[] }>('/admin/users?limit=100');
      setUsers(data.data ?? []);
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to load user accounts'));
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (user: User, status: 'ACTIVE' | 'SUSPENDED') => {
    const reason = status === 'SUSPENDED'
      ? window.prompt(`Why are you suspending ${user.name}? This reason is written to the audit log.`)?.trim()
      : undefined;
    if (status === 'SUSPENDED' && !reason) return;

    try {
      setUpdatingId(user.id);
      setError('');
      await api.patch(`/admin/users/${user.id}`, { status, reason });
      setUsers((current) => current.map((item) => item.id === user.id
        ? { ...item, status, isActive: status === 'ACTIVE' }
        : item));
      setFeedback(`${user.name} is now ${status.toLowerCase()}.`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to update this account'));
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users
    .filter((user) => filter === 'all' || user.role === filter)
    .filter((user) => [user.name, user.email, user.phone ?? ''].some((value) => value.toLowerCase().includes(search.toLowerCase().trim())));
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

        {(error || feedback) && (
          <div role="status" className={`mb-6 rounded-2xl border px-4 py-3 text-sm font-semibold ${error ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
            {error || feedback}
          </div>
        )}

        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, or phone" className="pl-11" />
          </div>
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
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Action</th>
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
                      <StatusBadge status={user.status} colorMap={{ ACTIVE: 'success', SUSPENDED: 'warning', DELETED: 'error' }} />
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'DELETED' ? (
                        <span className="text-xs font-semibold text-slate-400">Permanent state</span>
                      ) : (
                        <button
                          type="button"
                          disabled={updatingId === user.id}
                          onClick={() => void updateStatus(user, user.isActive ? 'SUSPENDED' : 'ACTIVE')}
                          className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition disabled:cursor-wait disabled:opacity-50 ${user.isActive ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100' : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'}`}
                        >
                          {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          {updatingId === user.id ? 'Updating…' : user.isActive ? 'Suspend' : 'Reactivate'}
                        </button>
                      )}
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


