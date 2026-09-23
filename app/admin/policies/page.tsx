"use client"

import { useState, useEffect, useRef } from "react"
import {
  ShieldCheck,
  Plus,
  Eye,
  CheckCircle2,
  Search,
  Upload,
  RefreshCw,
  Scale,
  Users,
  Lock,
  X,
} from "lucide-react"
import api, { getApiErrorMessage } from "@/lib/axios"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"

interface PolicyItem {
  id: string
  type: string
  title: string
  version: string
  summary: string | null
  content: string
  isActive: boolean
  effectiveDate: string
  publishedById?: string | null
  publishedBy?: { id: string; name: string; email: string } | null
  consentCount: number
  createdAt: string
  updatedAt: string
}

interface AuditLogItem {
  id: string
  userId: string
  user: { id: string; name: string; email: string; role: string }
  policyId: string
  policy: { id: string; title: string; version: string; type: string }
  policyType: string
  policyVersion: string
  ipAddress: string | null
  userAgent: string | null
  context: string
  consentedAt: string
}

const POLICY_TYPES = [
  { value: "TERMS_OF_SERVICE", label: "Terms of Service", audience: "All Users" },
  { value: "PRIVACY_POLICY", label: "Privacy Policy (DPDP 2023)", audience: "All Users" },
  { value: "HOST_SAFETY_AGREEMENT", label: "Host Safety Agreement", audience: "Hosts & Suppliers" },
  { value: "TRAVELER_SAFETY_POLICY", label: "Traveler Safety Policy", audience: "Travelers & Guests" },
  { value: "CANCELLATION_POLICY", label: "Cancellation & Refunds", audience: "All Users" },
]

export default function AdminPoliciesPage() {
  const [activeTab, setActiveTab] = useState<"policies" | "create" | "audit">("policies")
  const [policies, setPolicies] = useState<PolicyItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([])
  const [auditTotal, setAuditTotal] = useState(0)
  const [auditPage, setAuditPage] = useState(1)
  const [auditSearch, setAuditSearch] = useState("")
  const [auditTypeFilter, setAuditTypeFilter] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingAudit, setLoadingAudit] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [selectedPolicyForView, setSelectedPolicyForView] = useState<PolicyItem | null>(null)
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null)

  // Create form state
  const [formData, setFormData] = useState({
    type: "TERMS_OF_SERVICE",
    title: "",
    version: "",
    summary: "",
    content: "",
    activateImmediately: true,
  })
  const [editorMode, setEditorMode] = useState<"write" | "preview">("write")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchPolicies()
  }, [])

  useEffect(() => {
    if (activeTab === "audit") {
      fetchAuditLogs(auditPage, auditSearch, auditTypeFilter)
    }
  }, [activeTab, auditPage, auditTypeFilter])

  const fetchPolicies = async () => {
    setLoading(true)
    try {
      const res = await api.get("/admin/policies")
      if (res.data?.data?.policies) {
        setPolicies(res.data.data.policies)
      }
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getApiErrorMessage(err, "Failed to load policies") })
    } finally {
      setLoading(false)
    }
  }

  const fetchAuditLogs = async (page: number, search: string, type: string) => {
    setLoadingAudit(true)
    try {
      const params = new URLSearchParams()
      params.set("page", String(page))
      params.set("limit", "15")
      if (search) params.set("search", search)
      if (type) params.set("policyType", type)

      const res = await api.get(`/admin/policies/audit?${params.toString()}`)
      if (res.data?.data?.items) {
        setAuditLogs(res.data.data.items)
        setAuditTotal(res.data.data.meta?.total || 0)
      }
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getApiErrorMessage(err, "Failed to load audit logs") })
    } finally {
      setLoadingAudit(false)
    }
  }

  const handleToggleActive = async (policy: PolicyItem) => {
    setActionLoading(true)
    try {
      await api.patch(`/admin/policies/${policy.id}`, { isActive: !policy.isActive })
      setFeedback({
        type: "success",
        message: `Policy ${policy.title} v${policy.version} is now ${!policy.isActive ? "ACTIVE" : "INACTIVE"}.`,
      })
      await fetchPolicies()
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getApiErrorMessage(err, "Failed to update policy status") })
    } finally {
      setActionLoading(false)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      setFormData((prev) => ({
        ...prev,
        content: text,
        title: prev.title || file.name.replace(/\.md$/i, "").replace(/[-_]/g, " "),
      }))
    }
    reader.readAsText(file)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.version.trim() || !formData.content.trim()) {
      setFeedback({ type: "error", message: "Title, version, and Markdown content are required." })
      return
    }

    setActionLoading(true)
    try {
      await api.post("/admin/policies", formData)
      setFeedback({
        type: "success",
        message: `Published ${formData.title} version ${formData.version} successfully!`,
      })
      setFormData({
        type: "TERMS_OF_SERVICE",
        title: "",
        version: "",
        summary: "",
        content: "",
        activateImmediately: true,
      })
      setActiveTab("policies")
      await fetchPolicies()
    } catch (err: unknown) {
      setFeedback({ type: "error", message: getApiErrorMessage(err, "Failed to publish policy") })
    } finally {
      setActionLoading(false)
    }
  }

  const totalConsents = policies.reduce((acc, p) => acc + (p.consentCount || 0), 0)
  const activeCount = policies.filter((p) => p.isActive).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-1">
            <span>Admin Control</span>
            <span>/</span>
            <span>Safety & Statutory Policies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Safety & Legal Policies
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Manage statutory terms, India DPDP Act 2023 notices, Host Code of Conduct, and traveler safety protocols with immutable clickwrap consent tracking.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchPolicies}
            disabled={loading}
            className="flex items-center gap-1.5"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button
            variant="brand"
            size="sm"
            onClick={() => setActiveTab("create")}
            className="flex items-center gap-1.5 shadow-md shadow-violet-600/20"
          >
            <Plus className="h-4 w-4" />
            Publish Version
          </Button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-sm font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
              : "bg-rose-50 text-rose-900 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
          }`}
        >
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Standard Policies</span>
            <div className="h-9 w-9 rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400 flex items-center justify-center">
              <Scale className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{activeCount}</span>
            <span className="text-xs font-semibold text-slate-400">/ 5 required</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Enforced across web & app touchpoints</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Clickwrap Consents</span>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{totalConsents.toLocaleString()}</span>
            <span className="text-xs font-bold text-emerald-600">Verifiable</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">IP, version & timestamp sealed</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">India DPDP Act 2023</span>
            <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-blue-700 dark:text-blue-400">Compliant</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">AES-256-GCM identity vaults active</p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Consent Enforcement</span>
            <div className="h-9 w-9 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">Strict Modal</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">Re-consent blocks outdated logins</p>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab("policies")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "policies"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Scale className="h-4 w-4" />
          Active & Historical Policies ({policies.length})
        </button>

        <button
          onClick={() => setActiveTab("create")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "create"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Plus className="h-4 w-4" />
          Publish New Version
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
            activeTab === "audit"
              ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
              : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          <Users className="h-4 w-4" />
          Consent Audit Trail
        </button>
      </div>

      {/* Tab 1: Policies List */}
      {activeTab === "policies" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {policies.map((policy) => {
            const meta = POLICY_TYPES.find((t) => t.value === policy.type)
            return (
              <div
                key={policy.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-sm transition hover:shadow-md ${
                  policy.isActive
                    ? "border-slate-200/80 dark:border-slate-800"
                    : "border-slate-200/50 dark:border-slate-800/50 opacity-75"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/50">
                        v{policy.version}
                      </span>
                      {policy.isActive ? (
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Archived
                        </span>
                      )}
                    </div>
                    <h3 className="font-extrabold text-slate-900 dark:text-white text-lg mt-2">
                      {policy.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">Audience: {meta?.audience || policy.type}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Accepted</span>
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {policy.consentCount?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>

                {policy.summary && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 line-clamp-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                    {policy.summary}
                  </p>
                )}

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Updated {new Date(policy.effectiveDate).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPolicyForView(policy)}
                      className="px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Read
                    </button>
                    <button
                      onClick={() => handleToggleActive(policy)}
                      disabled={actionLoading}
                      className={`px-2.5 py-1 rounded-lg font-bold transition ${
                        policy.isActive
                          ? "text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          : "text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                      }`}
                    >
                      {policy.isActive ? "Deactivate" : "Make Active"}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab 2: Create / Upload Policy */}
      {activeTab === "create" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="max-w-3xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Publish or Upload New Policy Version
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Publishing an active version immediately supersedes previous versions and flags all existing users for clickwrap re-consent upon next login.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="mt-6 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Policy Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => {
                    const t = e.target.value
                    const found = POLICY_TYPES.find((p) => p.value === t)
                    setFormData((prev) => ({
                      ...prev,
                      type: t,
                      title: found ? found.label : prev.title,
                    }))
                  }}
                  className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                >
                  {POLICY_TYPES.map((pt) => (
                    <option key={pt.value} value={pt.value}>
                      {pt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Policy Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Platform Terms of Service"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Version String
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1.1 or 2.0"
                  value={formData.version}
                  onChange={(e) => setFormData((prev) => ({ ...prev, version: e.target.value }))}
                  required
                  className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Plain-English Summary (User TL;DR Card)
              </label>
              <textarea
                rows={2}
                placeholder="Brief, accessible summary highlighting changes and core rules for user transparency..."
                value={formData.summary}
                onChange={(e) => setFormData((prev) => ({ ...prev, summary: e.target.value }))}
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
              />
            </div>

            {/* Markdown Editor / File Upload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Full Legal Document (Markdown)
                  </span>
                  <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
                    <button
                      type="button"
                      onClick={() => setEditorMode("write")}
                      className={`px-2.5 py-1 rounded-md transition ${
                        editorMode === "write" ? "bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white" : "text-slate-500"
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorMode("preview")}
                      className={`px-2.5 py-1 rounded-md transition ${
                        editorMode === "preview" ? "bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white" : "text-slate-500"
                      }`}
                    >
                      Preview
                    </button>
                  </div>
                </div>

                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept=".md,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-violet-600 hover:text-violet-700 flex items-center gap-1.5"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload .md File
                  </button>
                </div>
              </div>

              {editorMode === "write" ? (
                <textarea
                  rows={14}
                  placeholder="# Enter markdown content here..."
                  value={formData.content}
                  onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                  required
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono text-xs leading-relaxed text-slate-900 dark:text-white"
                />
              ) : (
                <div className="w-full min-h-[350px] p-6 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 overflow-y-auto prose dark:prose-invert max-w-none text-xs">
                  {formData.content ? (
                    <pre className="whitespace-pre-wrap font-sans text-xs">{formData.content}</pre>
                  ) : (
                    <span className="text-slate-400 italic">Nothing to preview yet.</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.activateImmediately}
                  onChange={(e) => setFormData((prev) => ({ ...prev, activateImmediately: e.target.checked }))}
                  className="h-4 w-4 rounded text-violet-600 focus:ring-violet-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Activate immediately (Replaces currently active version & prompts user re-consent)
                </span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setActiveTab("policies")}>
                Cancel
              </Button>
              <Button type="submit" variant="brand" disabled={actionLoading}>
                {actionLoading ? "Publishing…" : "Publish Policy Version"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 3: Consent Audit Trail */}
      {activeTab === "audit" && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Verifiable Clickwrap Consent Audit Trail
              </h2>
              <p className="text-xs text-slate-500">
                Statutory audit log capturing every user agreement, IP address, device telemetry, and policy version.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search user email or name..."
                  value={auditSearch}
                  onChange={(e) => {
                    setAuditSearch(e.target.value)
                    setAuditPage(1)
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") fetchAuditLogs(1, auditSearch, auditTypeFilter)
                  }}
                  className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white"
                />
              </div>

              <select
                value={auditTypeFilter}
                onChange={(e) => {
                  setAuditTypeFilter(e.target.value)
                  setAuditPage(1)
                }}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium text-slate-900 dark:text-white"
              >
                <option value="">All Policy Types</option>
                {POLICY_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingAudit ? (
            <div className="py-12 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading audit logs...
            </div>
          ) : auditLogs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No consent records found matching current query.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="py-3 px-3">User</th>
                    <th className="py-3 px-3">Policy & Version</th>
                    <th className="py-3 px-3">Context</th>
                    <th className="py-3 px-3">IP Address</th>
                    <th className="py-3 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">{log.user?.name || "Unknown"}</div>
                        <div className="text-[11px] text-slate-400">{log.user?.email}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {log.policy?.title || log.policyType}
                        </span>
                        <span className="ml-2 font-mono text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          v{log.policyVersion}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md font-bold text-[10px] uppercase bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                          {log.context}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {log.ipAddress || "127.0.0.1"}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(log.consentedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                <span className="text-slate-400">Total {auditTotal} verifiable records</span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={auditPage <= 1}
                    onClick={() => setAuditPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="font-semibold px-2">Page {auditPage}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={auditPage * 15 >= auditTotal}
                    onClick={() => setAuditPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reader Modal */}
      {selectedPolicyForView && (
        <Modal
          open={true}
          onClose={() => setSelectedPolicyForView(null)}
          title={`${selectedPolicyForView.title} (v${selectedPolicyForView.version})`}
        >
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2 text-xs">
            {selectedPolicyForView.summary && (
              <div className="p-3.5 rounded-xl bg-violet-50 dark:bg-violet-950/40 border border-violet-200/60 dark:border-violet-800 text-violet-900 dark:text-violet-200">
                <strong className="block mb-1 font-bold">Key Highlights:</strong>
                {selectedPolicyForView.summary}
              </div>
            )}
            <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-800 dark:text-slate-200">
              {selectedPolicyForView.content}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

