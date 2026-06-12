'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarClock, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import StatusBadge from '@/components/ui/StatusBadge';
import Spinner from '@/components/ui/Spinner';
import { TablePageSkeleton } from '@/components/ui/loading-skeletons';
import FilterTabs from '@/components/ui/FilterTabs';
import Modal from '@/components/ui/Modal';
import type { AdminBooking as Booking } from '@/types/admin';
import api, { getApiErrorMessage } from '@/lib/axios';

export default function AdminBookingsPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [newStatus, setNewStatus] = useState<string>('');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [overriding, setOverriding] = useState(false);
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
    fetchBookings();
  }, [isAdmin, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/admin/bookings');
      setBookings(data.data || []);
    } catch (error) {
      if (getApiErrorMessage(error).includes('401')) router.push('/login');
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);



  const handleOverrideClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setNewStatus(booking.status);
    setOverrideReason('');
    setShowOverrideModal(true);
  };

  const handleSubmitOverride = async () => {
    if (!selectedBooking || !newStatus || !overrideReason.trim()) {
      showFeedback('error', 'Please fill all fields');
      return;
    }

    setOverriding(true);
    try {
      await api.patch(`/admin/bookings/${selectedBooking.id}`, {
          status: newStatus.toUpperCase(),
          overrideReason: overrideReason.trim(),
      });

      showFeedback('success', 'Booking overridden successfully.');
      setShowOverrideModal(false);
      setSelectedBooking(null);
      fetchBookings();
    } catch (error) {
      console.error('Error overriding booking:', error);
      showFeedback('error', 'Failed to override booking.');
    } finally {
      setOverriding(false);
    }
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
              : <XCircle className="h-4 w-4 shrink-0" />
            }
            {feedback.message}
          </div>
        )}

        <div className="mb-8 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-sky-100 text-sky-700">
                <CalendarClock className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Operations oversight</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">All bookings</h1>
                <p className="mt-2 text-sm text-slate-600">Manage booking status changes and admin overrides from a single queue.</p>
              </div>
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              {filteredBookings.length} visible bookings
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6">
          <FilterTabs
            tabs={['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const}
            active={filter}
            onChange={(tab) => setFilter(tab as typeof filter)}
            formatLabel={(tab) =>
              tab === 'all'
                ? 'All'
                : `${tab.charAt(0).toUpperCase() + tab.slice(1)} (${bookings.filter(b => b.status === tab).length})`
            }
          />
        </div>

        {/* Bookings Table */}
        {loading ? (
          <TablePageSkeleton />
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-12 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-xl text-gray-600">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[32px] border border-white/70 bg-white/80 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Guest</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Property</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Rooms</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Host</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Dates</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-left font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredBookings.map((booking) => (
                  <tr key={booking.id} className="transition hover:bg-slate-50/80">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{booking.guestName}</p>
                        <p className="text-xs text-gray-500">{booking.guestEmail}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {booking.hotelName || booking.tourName || '-'}
                        </p>
                        {booking.isOverridden && (
                          <p className="text-xs font-medium text-sky-700">Overridden by admin</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {booking.rooms?.length ? (
                        <div className="space-y-1">
                          {booking.rooms.map((room) => (
                            <div key={room.id} className="text-xs">
                              <p className="font-semibold text-slate-800">{room.name} x{room.quantity}</p>
                              <p className="text-slate-500">
                                {room.availableRooms} available / {room.bookedRooms} booked
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{booking.hostName}</p>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {booking.checkInDate && booking.checkOutDate ? (
                        <div>
                          <p>{new Date(booking.checkInDate).toLocaleDateString()}</p>
                          <p className="text-gray-500">to {new Date(booking.checkOutDate).toLocaleDateString()}</p>
                        </div>
                      ) : booking.startDate && booking.endDate ? (
                        <div>
                          <p>{new Date(booking.startDate).toLocaleDateString()}</p>
                          <p className="text-gray-500">to {new Date(booking.endDate).toLocaleDateString()}</p>
                        </div>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      ₹{(booking.totalPrice ?? 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={booking.status.toUpperCase()} colorMap={{
                        PENDING: 'warning',
                        CONFIRMED: 'info',
                        CANCELLED: 'error',
                        COMPLETED: 'success',
                      }} />
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleOverrideClick(booking)}
                        className="rounded px-3 py-1 text-xs font-medium text-white transition-colors bg-sky-600 hover:bg-sky-700"
                      >
                        Override
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Override Modal */}
        <Modal
          open={showOverrideModal && !!selectedBooking}
          onClose={() => setShowOverrideModal(false)}
          title="Override Booking"
          maxWidth="max-w-md"
        >
          {selectedBooking && (
            <>

              <div className="mb-4 rounded border border-sky-200 bg-sky-50 p-3 text-sm">
                <p className="text-sky-900">
                  <strong>Guest:</strong> {selectedBooking.guestName}
                </p>
                <p className="text-sky-900">
                  <strong>Property:</strong> {selectedBooking.hotelName || selectedBooking.tourName}
                </p>
                <p className="text-sky-900">
                  <strong>Current Status:</strong> {selectedBooking.status.toUpperCase()}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Approved</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Override Reason (Required)
                  </label>
                  <textarea
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    placeholder="Explain why you're overriding this booking..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowOverrideModal(false)}
                  disabled={overriding}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitOverride}
                  disabled={overriding || !newStatus || !overrideReason.trim()}
                  className="flex-1 rounded-lg bg-sky-600 px-4 py-2 font-medium text-white transition-colors hover:bg-sky-700 disabled:opacity-50"
                >
                  {overriding ? 'Overriding...' : 'Override Booking'}
                </button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </div>
  );
}
