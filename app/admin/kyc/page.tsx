"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react"
import BackLink from "@/components/ui/BackLink"
import FilterTabs from "@/components/ui/FilterTabs"
import StatusBadge from "@/components/ui/StatusBadge"
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
  idFrontImage?: string
  idBackImage?: string
  addressProof?: string
  businessLicense?: string
  taxCertificate?: string
  submittedAt: string
  rejectionReason?: string
  isDocumentLocked?: boolean
  requiresStepUp?: boolean
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
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Step-up authentication state
  const [hasStepUp, setHasStepUp] = useState(false)
  const [stepUpModalOpen, setStepUpModalOpen] = useState(false)
  const [stepUpPassword, setStepUpPassword] = useState("")
  const [stepUpSubmitting, setStepUpSubmitting] = useState(false)
  const [stepUpError, setStepUpError] = useState("")

  useEffect(() => {
    fetchApplications()
  }, [filterStatus])

  const fetchApplications = async () => {
    try {
      setLoading(true)
      const { data } = await api.get(`/admin/kyc?status=${filterStatus}`)
      setApplications(data.data || [])
      if (data.meta?.hasStepUp !== undefined) {
        setHasStepUp(Boolean(data.meta.hasStepUp))
      }
    } catch (error) {
      console.error("Error fetching applications:", error)
    } finally {
      setLoading(false)
    }
  }

  const showFeedback = (type: "success" | "error", message: string) => {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 5000)
  }

  const handleStepUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stepUpPassword.trim()) return
    setStepUpSubmitting(true)
    setStepUpError("")
    try {
      await api.post("/admin/auth/step-up", { password: stepUpPassword })
      setHasStepUp(true)
      setStepUpModalOpen(false)
      setStepUpPassword("")
      showFeedback("success", "Administrator step-up verified. Sensitive identity documents unlocked for 15 minutes.")
      await fetchApplications()
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { error?: string } } }
      setStepUpError(errorObj?.response?.data?.error || "Incorrect password. Please try again.")
    } finally {
      setStepUpSubmitting(false)
    }
  }

  const handleApprove = async (kycId: string) => {
    setProcessing(true)
    try {
      await api.patch(`/admin/kyc/${kycId}`, { action: "approve" })
      showFeedback("success", "KYC approved successfully.")
      fetchApplications()
      setSelectedApp(null)
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { code?: string; error?: string } } }
      if (errorObj?.response?.data?.code === "STEP_UP_REQUIRED") {
        setStepUpModalOpen(true)
        showFeedback("error", "Step-up authentication required to execute KYC approval.")
      } else {
        showFeedback("error", errorObj?.response?.data?.error || "Network error. Please try again.")
      }
    } finally {
      setProcessing(false)
    }
  }

  const handleReject = async (kycId: string, allowResubmission: boolean) => {
    if (!rejectionReason.trim()) {
      showFeedback("error", "Please provide a rejection reason.")
      return
    }

    setProcessing(true)
    try {
      await api.patch(`/admin/kyc/${kycId}`, {
        action: allowResubmission ? "request_changes" : "reject",
        rejectionReason,
      })
      showFeedback("success", allowResubmission ? "Changes requested; host notified." : "KYC application rejected.")
      fetchApplications()
      setSelectedApp(null)
      setRejectionReason("")
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { code?: string; error?: string } } }
      if (errorObj?.response?.data?.code === "STEP_UP_REQUIRED") {
        setStepUpModalOpen(true)
        showFeedback("error", "Step-up re-authentication required to process KYC rejection.")
      } else {
        showFeedback("error", errorObj?.response?.data?.error || "Network error. Please try again.")
      }
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return <TablePageSkeleton />
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] p-6 lg:p-10">
      <div className="mx-auto max-w-7xl">
        <BackLink href="/admin/dashboard" label="Back to Admin Dashboard" />

        {feedback && (
          <div
            className={`mb-6 rounded-2xl border p-4 text-sm font-semibold shadow-sm ${
              feedback.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Header */}
        <div className="mb-8 rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                <ShieldCheck className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">Compliance & Trust</p>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950">KYC Verification</h1>
                <p className="mt-1 text-sm text-slate-600">
                  Review host identity documents, verify DPDP Act consent, and audit verification decisions.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {hasStepUp ? (
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Step-Up Session Active
                </div>
              ) : (
                <button
                  onClick={() => setStepUpModalOpen(true)}
                  className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-900 transition hover:bg-amber-100"
                >
                  <KeyRound className="h-4 w-4 text-amber-600" />
                  Unlock Sensitive Documents (Step-Up)
                </button>
              )}

              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700">
                <Clock3 className="h-4 w-4" />
                {applications.length} applications
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex items-center gap-4">
          <FilterTabs
            tabs={["PENDING", "APPROVED", "REJECTED"] as const}
            active={filterStatus}
            onChange={setFilterStatus}
            formatLabel={(t) => t.charAt(0) + t.slice(1).toLowerCase()}
          />
        </div>

        {/* Applications List */}
        {applications.length === 0 ? (
          <div className="rounded-[32px] border border-white/70 bg-white/80 p-12 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <p className="text-slate-500 font-medium">No {filterStatus.toLowerCase()} KYC applications at this time.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:shadow-[0_28px_80px_rgba(15,23,42,0.12)]"
              >
                <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">
                      {app.firstName} {app.lastName}
                    </h3>
                    <p className="text-sm text-slate-600">{app.host.user.email}</p>
                    <p className="text-xs font-medium text-slate-500">{app.host.businessName}</p>
                  </div>
                  <StatusBadge status={app.status} />
                </div>

                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-4 rounded-2xl bg-slate-50/70 p-4 border border-slate-100">
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">ID Type</p>
                    <p className="font-semibold text-slate-800 capitalize">{app.idType}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">ID Number</p>
                    <p className="font-semibold font-mono text-slate-800">
                      {app.idNumber}
                      {app.requiresStepUp && (
                        <span className="ml-2 inline-flex items-center text-[10px] text-amber-600 font-sans">
                          <Lock className="h-3 w-3 inline mr-0.5" /> (Masked)
                        </span>
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Nationality</p>
                    <p className="font-semibold text-slate-800">{app.nationality}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Submitted</p>
                    <p className="font-semibold text-slate-800">{new Date(app.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {app.rejectionReason && (
                  <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50/80 p-3.5">
                    <p className="text-xs text-rose-900">
                      <strong className="font-semibold">Rejection Reason:</strong> {app.rejectionReason}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setSelectedApp(app)}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                  >
                    View Details & Verify Documents
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                  {app.requiresStepUp && (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1">
                      Step-Up required to view files
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        <Modal
          open={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          title={`KYC Application — ${selectedApp ? `${selectedApp.firstName} ${selectedApp.lastName}` : ""}`}
          maxWidth="max-w-2xl"
        >
          {selectedApp && (
            <div className="space-y-6">
              {/* Identity Details */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Host Name</p>
                    <p className="font-semibold text-slate-900">
                      {selectedApp.firstName} {selectedApp.lastName}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Document Type</p>
                    <p className="font-semibold text-slate-900 capitalize">{selectedApp.idType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Document Number</p>
                    <p className="font-semibold font-mono text-slate-900">{selectedApp.idNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Date of Birth</p>
                    <p className="font-semibold text-slate-900">
                      {selectedApp.dateOfBirth ? new Date(selectedApp.dateOfBirth).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Nationality</p>
                    <p className="font-semibold text-slate-900">{selectedApp.nationality}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">Business Name</p>
                    <p className="font-semibold text-slate-900">{selectedApp.host.businessName}</p>
                  </div>
                </div>
              </div>

              {/* Documents Area */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Identity Proof Documents</h4>

                {selectedApp.requiresStepUp && !hasStepUp ? (
                  <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-center">
                    <Lock className="mx-auto h-8 w-8 text-amber-600 mb-2" />
                    <h5 className="text-sm font-bold text-amber-900">Identity Documents Protected</h5>
                    <p className="mt-1 text-xs text-amber-700 max-w-md mx-auto">
                      Under India DPDP Act 2023 compliance, identity documents are masked until an administrator performs
                      step-up re-authentication.
                    </p>
                    <button
                      onClick={() => setStepUpModalOpen(true)}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-amber-700 transition"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Authenticate to View Documents
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {selectedApp.idFrontImage && (
                      <a
                        href={selectedApp.idFrontImage}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                      >
                        <span>Front ID Document</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {selectedApp.idBackImage && (
                      <a
                        href={selectedApp.idBackImage}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-sky-200 bg-sky-50/70 p-3 text-xs font-semibold text-sky-800 transition hover:bg-sky-100"
                      >
                        <span>Back ID Document</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {selectedApp.addressProof && (
                      <a
                        href={selectedApp.addressProof}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
                      >
                        <span>Address Proof Document</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    {selectedApp.businessLicense && (
                      <a
                        href={selectedApp.businessLicense}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs font-semibold text-slate-800 transition hover:bg-slate-100"
                      >
                        <span>Business License Document</span>
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Review Action Controls */}
              {selectedApp.status === "PENDING" && (
                <div className="space-y-4 border-t border-slate-100 pt-5">
                  <div>
                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-600">
                      Rejection / Change Request Reason (Mandatory if declining)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      rows={3}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100"
                      placeholder="Specify clear instructions for host (e.g. 'PAN card photo blurry on corner; re-upload clear scan')."
                    />
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3">
                    <button
                      onClick={() => handleApprove(selectedApp.id)}
                      disabled={processing}
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {processing ? "Processing..." : "Approve KYC"}
                    </button>
                    <button
                      onClick={() => handleReject(selectedApp.id, true)}
                      disabled={processing || !rejectionReason.trim()}
                      className="flex items-center justify-center gap-2 rounded-xl border border-amber-200 bg-amber-50 py-2.5 text-sm font-semibold text-amber-800 transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Clock3 className="h-4 w-4" />
                      {processing ? "Processing..." : "Request Changes"}
                    </button>
                    <button
                      onClick={() => handleReject(selectedApp.id, false)}
                      disabled={processing || !rejectionReason.trim()}
                      className="flex items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      {processing ? "Processing..." : "Reject Final"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* Step-Up Authentication Modal */}
        <Modal
          open={stepUpModalOpen}
          onClose={() => {
            setStepUpModalOpen(false)
            setStepUpPassword("")
            setStepUpError("")
          }}
          title="Administrator Step-Up Re-Authentication"
          maxWidth="max-w-md"
        >
          <form onSubmit={handleStepUpSubmit} className="space-y-4">
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
              <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold">DPDP Act 2023 & Security Re-Verification</p>
                <p className="mt-1">
                  Accessing unmasked government identity documents or committing KYC approvals requires re-authenticating
                  with your administrator password. This verification will remain valid for 15 minutes.
                </p>
              </div>
            </div>

            {stepUpError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                {stepUpError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Current Admin Password
              </label>
              <input
                type="password"
                value={stepUpPassword}
                onChange={(e) => setStepUpPassword(e.target.value)}
                placeholder="Enter your administrator password"
                className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-100"
                required
                autoFocus
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setStepUpModalOpen(false)
                  setStepUpPassword("")
                  setStepUpError("")
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={stepUpSubmitting || !stepUpPassword}
                className="rounded-xl bg-sky-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 transition"
              >
                {stepUpSubmitting ? "Verifying..." : "Verify & Unlock"}
              </button>
            </div>
          </form>
        </Modal>
      </div>
    </div>
  )
}
