"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, ShieldCheck, CheckCircle2, RefreshCw } from "lucide-react"
import api from "@/lib/axios"

interface PolicyModalProps {
  isOpen: boolean
  onClose: () => void
  policyType: "TERMS_OF_SERVICE" | "PRIVACY_POLICY" | "HOST_SAFETY_AGREEMENT" | "TRAVELER_SAFETY_POLICY" | "CANCELLATION_POLICY"
  title?: string
}

interface PolicyData {
  id: string
  title: string
  version: string
  summary: string | null
  content: string
  effectiveDate: string
}

export default function PolicyModal({
  isOpen,
  onClose,
  policyType,
  title,
}: PolicyModalProps) {
  const [policy, setPolicy] = useState<PolicyData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (isOpen) {
      loadPolicy()
    }
  }, [isOpen, policyType])

  const loadPolicy = async () => {
    setLoading(true)
    setError("")
    try {
      const res = await api.get(`/policies/active?type=${policyType}`)
      if (res.data?.data?.policy) {
        setPolicy(res.data.data.policy)
      } else {
        setError("Policy document is currently unavailable.")
      }
    } catch {
      setError("Unable to load policy at this time.")
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-none">
                  {policy?.title || title || "Legal Agreement"}
                </h3>
                {policy && (
                  <span className="text-[11px] font-semibold text-slate-400">
                    Version {policy.version} • Effective {new Date(policy.effectiveDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
            {loading ? (
              <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                <RefreshCw className="h-6 w-6 animate-spin text-violet-600" />
                <span>Loading legal agreement...</span>
              </div>
            ) : error ? (
              <div className="py-12 text-center text-rose-500 font-medium">{error}</div>
            ) : policy ? (
              <>
                {policy.summary && (
                  <div className="p-4 rounded-2xl bg-violet-50/80 dark:bg-violet-950/40 border border-violet-100 dark:border-violet-900 text-violet-950 dark:text-violet-200">
                    <strong className="block text-xs font-bold uppercase tracking-wider mb-1 text-violet-700 dark:text-violet-400">
                      Summary Key Points:
                    </strong>
                    <p className="leading-relaxed">{policy.summary}</p>
                  </div>
                )}

                <div className="prose dark:prose-invert max-w-none text-xs leading-relaxed whitespace-pre-wrap font-sans text-slate-700 dark:text-slate-300">
                  {policy.content}
                </div>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 flex items-center justify-between">
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5" />
              DPDP Act 2023 Compliant Notice
            </span>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs shadow-xs transition"
            >
              Close & Understand
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

