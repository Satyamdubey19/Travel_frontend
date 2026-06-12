'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Clock3, Cog, CreditCard, IndianRupee, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StatCard from '@/components/ui/StatCard';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import { TablePageSkeleton } from '@/components/ui/loading-skeletons';
import FilterTabs from '@/components/ui/FilterTabs';
import Modal from '@/components/ui/Modal';
import api, { getApiErrorMessage } from '@/lib/axios';

interface Payout {
  id: string;
  hostId: string;
  hostName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  transactionId?: string;
  requestedAt: string;
  processedAt?: string;
  failureReason?: string;
  notes?: string;
}

export default function AdminPayoutsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [selectedPayout, setSelectedPayout] = useState<Payout | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'processing' | 'completed' | 'failed'>('processing');
  const [transactionId, setTransactionId] = useState<string>('');
  const [failureReason, setFailureReason] = useState<string>('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4000);
  };

  useEffect(() => {
    if (!isAdmin) {
      router.push('/');
      return;
    }
    fetchPayouts();
  }, [isAdmin, router]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/payouts');
      setPayouts(data);
    } catch (error) {
      if (getApiErrorMessage(error).includes('401')) router.push('/login');
      console.error('Error fetching payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayouts = filter === 'all'
    ? payouts
    : payouts.filter(p => p.status === filter);



  const handleProcessClick = (payout: Payout) => {
    setSelectedPayout(payout);
    setNewStatus('processing');
    setTransactionId('');
    setFailureReason('');
    setShowProcessModal(true);
  };

  const handleSubmitProcess = async () => {
    if (!selectedPayout) return;

    if (newStatus === 'completed' && !transactionId.trim()) {
      showFeedback('error', 'Please enter transaction ID for completed payouts');
      return;
    }

    if (newStatus === 'failed' && !failureReason.trim()) {
      showFeedback('error', 'Please provide reason for failed payout');
      return;
    }

    setProcessingId(selectedPayout.id);
    try {
      await api.put(`/admin/payouts/${selectedPayout.id}`, {
          status: newStatus,
          transactionId: newStatus === 'completed' ? transactionId.trim() : undefined,
          failureReason: newStatus === 'failed' ? failureReason.trim() : undefined,
      });

      showFeedback('success', `Payout moved to ${newStatus.toUpperCase()}`);
      setShowProcessModal(false);
      setSelectedPayout(null);
      fetchPayouts();
    } catch (error) {
      console.error('Error processing payout:', error);
      showFeedback('error', 'Failed to process payout');
    } finally {
      setProcessingId(null);
    }
  };

  // Calculate statistics
  const stats = {
    totalPending: payouts.filter(p => p.status === 'pending').length,
    totalProcessing: payouts.filter(p => p.status === 'processing').length,
    totalCompleted: payouts.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0),
    totalFailed: payouts.filter(p => p.status === 'failed').length,
    pendingAmount: payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0),
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {feedback && (
          <div className={`mb-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
            feedback.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}>
            {feedback.type === 'success'
              ? <CheckCircle2 className="h-4 w-4 shrink-0" />
              : <span className="h-4 w-4 shrink-0 text-red-500">✕</span>
            }
            {feedback.message}
          </div>
        )}

        <div className="mb-8 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-sky-100 text-sky-700">
                <Wallet className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Finance operations</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Payout management</h1>
                <p className="mt-2 text-sm text-slate-600">Handle transfer review, settlement status, and payout exceptions with less friction.</p>
              </div>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              {stats.totalPending} pending requests
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Pending Requests"
            value={stats.totalPending}
            color="yellow"
            icon={<Clock3 className="h-7 w-7" />}
          />
          <StatCard
            title="Pending Amount"
            value={`₹${(stats.pendingAmount / 100000).toFixed(1)}L`}
            color="orange"
            icon={<IndianRupee className="h-7 w-7" />}
          />
          <StatCard
            title="Processing"
            value={stats.totalProcessing}
            color="blue"
            icon={<Cog className="h-7 w-7" />}
          />
          <StatCard
            title="Total Completed"
            value={`₹${(stats.totalCompleted / 100000).toFixed(1)}L`}
            color="green"
            icon={<CheckCircle2 className="h-7 w-7" />}
          />
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <FilterTabs
            tabs={['all', 'pending', 'processing', 'completed', 'failed'] as const}
            active={filter}
            onChange={(tab) => setFilter(tab as typeof filter)}
            formatLabel={(tab) =>
              tab === 'all'
                ? 'All'
                : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${payouts.filter(p => p.status === tab).length})`
            }
          />
        </div>

        {/* Payouts Table */}
        {loading ? (
          <TablePageSkeleton />
        ) : filteredPayouts.length === 0 ? (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-12 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-xl text-gray-600">No payouts found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Host</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Amount</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Bank Account</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Requested</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Transaction ID</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPayouts.map((payout) => (
                  <tr key={payout.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{payout.hostName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{payout.amount.toLocaleString('en-IN')}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <p className="inline-flex items-center gap-2 text-gray-900"><CreditCard className="h-4 w-4 text-slate-400" />{payout.bankName}</p>
                      <p className="text-gray-600">****{payout.accountNumber.slice(-4)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={payout.status.toUpperCase()} colorMap={{
                        PENDING: 'warning',
                        PROCESSING: 'info',
                        COMPLETED: 'success',
                        FAILED: 'error',
                      }} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-600">
                      {payout.transactionId ? (
                        <span className="rounded bg-sky-50 px-2 py-1 text-sky-900">
                          {payout.transactionId}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {payout.status === 'pending' || payout.status === 'processing' ? (
                        <button
                          onClick={() => handleProcessClick(payout)}
                          disabled={processingId === payout.id}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition-colors disabled:opacity-50"
                        >
                          {processingId === payout.id ? 'Processing...' : 'Process'}
                        </button>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Process Modal */}
        <Modal
          open={showProcessModal && !!selectedPayout}
          onClose={() => setShowProcessModal(false)}
          title="Process Payout"
          maxWidth="max-w-md"
        >
          {selectedPayout && (
            <>

              <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4 text-sm">
                <p className="text-blue-900">
                  <strong>Host:</strong> {selectedPayout.hostName}
                </p>
                <p className="text-blue-900">
                  <strong>Amount:</strong> ₹{selectedPayout.amount.toLocaleString('en-IN')}
                </p>
                <p className="text-blue-900">
                  <strong>Current Status:</strong> {selectedPayout.status.toUpperCase()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as 'processing' | 'completed' | 'failed')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>

                {newStatus === 'completed' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Transaction ID (Required)
                    </label>
                    <input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="e.g., TXN123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                )}

                {newStatus === 'failed' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Failure Reason (Required)
                    </label>
                    <textarea
                      value={failureReason}
                      onChange={(e) => setFailureReason(e.target.value)}
                      placeholder="Explain why the payout failed..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowProcessModal(false)}
                  disabled={processingId !== null}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitProcess}
                  disabled={processingId !== null || (newStatus === 'completed' && !transactionId.trim()) || (newStatus === 'failed' && !failureReason.trim())}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  {processingId === selectedPayout.id ? 'Processing...' : 'Update Status'}
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}

