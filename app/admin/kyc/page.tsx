"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Clock3, ShieldCheck, XCircle } from 'lucide-react'
import BackLink from "@/components/ui/BackLink"
import FilterTabs from "@/components/ui/FilterTabs"
import StatusBadge from "@/components/ui/StatusBadge"
import Spinner from "@/components/ui/Spinner"
import { TablePageSkeleton } from "@/components/ui/loading-skeletons"
import Modal from "@/components/ui/Modal"
import api from "@/lib/axios"

interface KYCApplication {
  id: string
  status: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  idType: string
  idNumber: string
  idFrontImage: string
  idBackImage: string
  addressProof: string
  businessLicense: string
  taxCertificate: string
  submittedAt: string
  rejectionReason?: string
  host: {
    id: string
    businessName: string
    phone: string
    user: {
      email: string
      name: string
    }
  }
}

export default function AdminKYCPage() {
  const [applications, setApplications] = useState<KYCApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"PENDING" | "APPROVED" | "REJECTED">("PENDING")
  const [selectedApp, setSelectedApp] = useState<KYCApplication | null>(null)
  const [rejectionReason, setRejectionReason] = useState("")
  const [processing, setProcessing] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  useEffect(() => {
    fetchApplications()
  }, [filterStatus])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/admin/kyc?status=${filterStatus}`)
      setApplications(data.data || [])
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  const handleApprove = async (kycId: string) => {
    setProcessing(true)
    try {
      await api.put(`/admin/kyc/${kycId}`, { action: "approve" })
      showFeedback('success', "KYC approved successfully.")
      fetchApplications()
      setSelectedApp(null)
    } catch {
      showFeedback('error', "Network error. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (kycId: string) => {
    if (!rejectionReason.trim()) {
      showFeedback('error', "Please provide a rejection reason.")
      return
    }

    setProcessing(true)
    try {
      await api.put(`/admin/kyc/${kycId}`, { action: "reject", rejectionReason })
      showFeedback('success', "KYC rejected.")
      fetchApplications()
      setSelectedApp(null)
      setRejectionReason("")
    } catch {
      showFeedback('error', "Network error. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <TablePageSkeleton />

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BackLink href="/admin" label="Back to Admin" className="text-sky-700" />

        {/* Feedback banner */}
        {feedback && (
          <div className={`mb-4 mt-4 flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold ${
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

        <div className="mb-8 mt-4 rounded-[32px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-sky-100 text-sky-700">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Compliance review</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">KYC management</h1>
                <p className="mt-2 text-sm text-slate-600">Review host documents, approve clean records, and resolve exceptions quickly.</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
              <Clock3 className="h-4 w-4" />
              {applications.length} applications
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-6 flex items-center gap-4">
          <FilterTabs
            tabs={['PENDING', 'APPROVED', 'REJECTED'] as const}
            active={filterStatus}
            onChange={setFilterStatus}
            formatLabel={t => t.charAt(0) + t.slice(1).toLowerCase()}
          />
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-slate-500">No {filterStatus.toLowerCase()} applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => (
              <div key={app.id} className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {app.firstName} {app.lastName}
                    </h3>
                    <p className="text-slate-600">{app.host.user.email}</p>
                    <p className="text-sm text-slate-500">{app.host.businessName}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <p className="text-xs text-slate-500">ID Type</p>
                    <p className="font-semibold">{app.idType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ID Number</p>
                    <p className="font-semibold">{app.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Nationality</p>
                    <p className="font-semibold">{app.nationality}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Submitted</p>
                    <p className="font-semibold">{new Date(app.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {app.rejectionReason && (
                  <div className="mb-4 rounded border border-sky-200 bg-sky-50 p-3">
                    <p className="text-sm text-sky-900"><strong>Rejection Reason:</strong> {app.rejectionReason}</p>
                  </div>
                )}

                <button
                  onClick={() => setSelectedApp(app)}
                  className="font-semibold text-sky-700 hover:underline"
                >
                  View Details & Documents
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          open={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title="KYC Details"
          maxWidth="max-w-2xl"
        >
          {selectedApp && (
            <>

              {selectedApp.idFrontImage && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">ID Front</h3>
                  <img src={selectedApp.idFrontImage} alt="ID Front" className="w-full max-h-64 object-contain rounded-lg" />
                </div>
              )}

              {selectedApp.idBackImage && (
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">ID Back</h3>
                  <img src={selectedApp.idBackImage} alt="ID Back" className="w-full max-h-64 object-contain rounded-lg" />
                </div>
              )}

              {selectedApp.status === "PENDING" && (
                <div className="space-y-4 mt-6 border-t border-slate-100 pt-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">
                      Rejection reason <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={e => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="Required if rejecting. Explain what was missing or incorrect."
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={processing}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {processing ? "Processing..." : "Approve"}
                    </button>
                    <button
                      onClick={() => handleReject(selectedApp.id)}
                      disabled={processing || !rejectionReason.trim()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      {processing ? "Processing..." : "Reject"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Modal>
      </div>
    </div>
  )
}
