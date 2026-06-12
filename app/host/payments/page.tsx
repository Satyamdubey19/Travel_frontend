"use client"

import { useState, useEffect } from "react"
import { ArrowDownToLine, CreditCard, IndianRupee, Receipt, TrendingUp, X } from "lucide-react"
import { HostEmptyState, HostPage, HostSection, HostStatCard } from "@/components/host/HostUI"
import StatusBadge from "@/components/ui/StatusBadge"
import Spinner from "@/components/ui/Spinner"
import api from "@/lib/axios"

interface Payment {
  id: string
  amount: number
  hostEarnings: number
  platformFee: number
  status: string
  transactionId: string
  paidAt: string
  booking: {
    id: string
    numberOfGuests: number
    hotel?: { name: string }
    tour?: { name: string }
  }
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ totalPayments: 0, completedPayments: 0, totalAmount: 0 })
  const [payoutAmount, setPayoutAmount] = useState(0)
  const [pendingBalance, setPendingBalance] = useState(0)
  const [showPayoutForm, setShowPayoutForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [payoutNotes, setPayoutNotes] = useState("")

  useEffect(() => {
    fetchPayments()
  }, [])

  const fetchPayments = async () => {
    try {
      const { data } = await api.get("/payments")
      setPayments(data.data || [])
      setStats(data.stats)
      setPendingBalance(data.stats.totalAmount)
    } catch (error) {
      console.error("Error fetching payments:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPayout = async () => {
    if (payoutAmount <= 0 || payoutAmount > pendingBalance) {
      alert("Invalid payout amount")
      return
    }

    setSubmitting(true)
    try {
      await api.post("/host/payouts", {
          amount: payoutAmount,
          notes: payoutNotes,
      })

      alert("Payout request submitted successfully!")
      setPayoutAmount(0)
      setPayoutNotes("")
      setShowPayoutForm(false)
      fetchPayments()
    } catch (error) {
      console.error("Error requesting payout:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner minimal />

  return (
    <HostPage
      eyebrow="Finance"
      title="Payments & Payouts"
      description="Track earnings, review payment history, and request transfers to your bank account."
    >
      <section className="grid gap-4 sm:grid-cols-3">
        <HostStatCard label="Total payments" value={stats.totalPayments} tone="cyan" icon={<CreditCard className="h-5 w-5" />} />
        <HostStatCard label="Completed" value={stats.completedPayments} tone="emerald" icon={<TrendingUp className="h-5 w-5" />} />
        <HostStatCard label="Total earnings" value={`Rs. ${stats.totalAmount.toFixed(2)}`} tone="amber" icon={<IndianRupee className="h-5 w-5" />} />
      </section>

      {/* Payout Request */}
      <HostSection title="Available balance" eyebrow="Withdrawals">
        <div className="p-5">
          <div className="mb-5 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Available for payout</p>
              <p className="mt-1 text-2xl font-bold text-slate-950">Rs. {pendingBalance.toFixed(2)}</p>
            </div>
            {!showPayoutForm && (
              <button
                onClick={() => setShowPayoutForm(true)}
                disabled={pendingBalance <= 0}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowDownToLine className="h-4 w-4" />
                Request Payout
              </button>
            )}
          </div>

          {showPayoutForm && (
            <div className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-900">New payout request</p>
                <button
                  onClick={() => { setShowPayoutForm(false); setPayoutAmount(0); setPayoutNotes("") }}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Amount (Max: Rs. {pendingBalance.toFixed(2)})
                </label>
                <input
                  type="number"
                  value={payoutAmount}
                  onChange={e => setPayoutAmount(parseFloat(e.target.value) || 0)}
                  max={pendingBalance}
                  min={0}
                  step={0.01}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  placeholder="Enter amount"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">Notes (Optional)</label>
                <textarea
                  value={payoutNotes}
                  onChange={e => setPayoutNotes(e.target.value)}
                  rows={3}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-cyan-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-100"
                  placeholder="Add any notes about this payout request..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRequestPayout}
                  disabled={submitting || payoutAmount <= 0}
                  className="flex-1 rounded-xl bg-slate-950 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Requesting..." : "Submit Request"}
                </button>
                <button
                  onClick={() => { setShowPayoutForm(false); setPayoutAmount(0); setPayoutNotes("") }}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </HostSection>

      {/* Payment History */}
      <HostSection title="Payment history" eyebrow="Transactions" description="All payments received for your confirmed bookings.">
        {payments.length === 0 ? (
          <HostEmptyState
            icon={<Receipt className="h-6 w-6" />}
            title="No payments yet"
            description="Payments will appear here once guests complete their bookings."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-slate-100 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Booking</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Amount</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Your Earnings</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Platform Fee</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Date</th>
                  <th className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(payment => (
                  <tr key={payment.id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-slate-900">{payment.booking.hotel?.name || payment.booking.tour?.name}</p>
                      <p className="text-xs text-slate-400">{payment.transactionId}</p>
                    </td>
                    <td className="px-5 py-4 font-semibold text-slate-700">Rs. {payment.amount.toFixed(2)}</td>
                    <td className="px-5 py-4 font-bold text-emerald-700">Rs. {payment.hostEarnings.toFixed(2)}</td>
                    <td className="px-5 py-4 text-slate-500">Rs. {payment.platformFee.toFixed(2)}</td>
                    <td className="px-5 py-4 text-slate-500">{new Date(payment.paidAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <StatusBadge status={payment.status} colorMap={{ COMPLETED: 'success', PENDING: 'warning' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </HostSection>
    </HostPage>
  )
}

