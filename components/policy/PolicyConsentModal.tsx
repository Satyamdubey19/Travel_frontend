"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Scale, AlertCircle } from "lucide-react"
import api, { getApiErrorMessage } from "@/lib/axios"
import Button from "@/components/ui/Button"

export interface PendingPolicy {
  id: string
  type: string
  version: string
  title: string
  summary: string | null
}

interface PolicyConsentModalProps {
  isOpen: boolean
  pendingPolicies: PendingPolicy[]
  onConsentAccepted: () => void
}

export default function PolicyConsentModal({
  isOpen,
  pendingPolicies,
  onConsentAccepted,
}: PolicyConsentModalProps) {
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  if (!isOpen || !pendingPolicies || pendingPolicies.length === 0) return null

  const handleSubmit = async () => {
    if (!agreed) {
      setError("Please review and mark your agreement to proceed.")
      return
    }

    setSubmitting(true)
    setError("")
    try {
      const payload = {
        context: "LOGIN_RECONSENT",
        consents: pendingPolicies.map((p) => ({
          policyId: p.id,
          policyType: p.type,
          policyVersion: p.version,
        })),
      }
      await api.post("/policies/consent", payload)
      onConsentAccepted()
    } catch (err: unknown) {
      setError(getApiErrorMessage(err, "Failed to record your agreement. Please try again."))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl p-6 sm:p-8 overflow-hidden z-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-2xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 flex items-center justify-center">
            <Scale className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-slate-950 dark:text-white tracking-tight">
              Updated Platform Policies
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              India DPDP Act 2023 & statutory safety updates
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">
          We have updated our platform safety guidelines and terms of service. To continue accessing your account, please review and accept the revised policies below:
        </p>

        <div className="space-y-3 max-h-60 overflow-y-auto pr-1 mb-5">
          {pendingPolicies.map((p) => (
            <div
              key={p.id}
              className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-extrabold text-slate-900 dark:text-white">{p.title}</span>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-300">
                  v{p.version}
                </span>
              </div>
              {p.summary && <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">{p.summary}</p>}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-4">
          <label className="flex items-start gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
            />
            <span className="text-xs text-slate-700 dark:text-slate-300 leading-normal">
              I have read, understood, and voluntarily agree to the updated terms and data processing policies in accordance with the India DPDP Act 2023.
            </span>
          </label>

          <Button
            type="button"
            variant="brand"
            size="lg"
            disabled={!agreed || submitting}
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 shadow-lg shadow-violet-600/20"
          >
            {submitting ? "Confirming…" : "Accept & Proceed"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  )
}

