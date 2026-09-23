"use client"

import { useState, useMemo, FormEvent } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, ArrowRight, LoaderCircle, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react"

interface SsoLoginSectionProps {
  callbackUrl?: string
  isOpen: boolean
  onToggle: () => void
}

export default function SsoLoginSection({ callbackUrl = "", isOpen, onToggle }: SsoLoginSectionProps) {
  const [corporateInput, setCorporateInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const detectedDomain = useMemo(() => {
    const trimmed = corporateInput.trim()
    if (!trimmed) return null
    if (trimmed.includes("@")) {
      const parts = trimmed.split("@")
      return parts[parts.length - 1].toLowerCase().trim() || null
    }
    if (trimmed.includes(".") && !trimmed.startsWith("http")) {
      return trimmed.toLowerCase()
    }
    return null
  }, [corporateInput])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    const trimmed = corporateInput.trim()
    if (!trimmed) {
      setErrorMessage("Please enter your corporate email or organization domain.")
      return
    }

    if (!detectedDomain || !detectedDomain.includes(".")) {
      setErrorMessage("Please enter a valid company domain (e.g., yourcompany.com or name@yourcompany.com).")
      return
    }

    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || ""
      const query = new URLSearchParams()
      if (trimmed.includes("@")) {
        query.set("email", trimmed)
      } else {
        query.set("domain", detectedDomain)
      }
      query.set("callbackUrl", callbackUrl || "/dashboard")

      const res = await fetch(`${apiUrl}/api/auth/sso/authorize?${query.toString()}`, {
        headers: { Accept: "application/json" },
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        if (data.error === "SSO_NOT_CONFIGURED") {
          setErrorMessage(
            `Single Sign-On is not yet configured for ${detectedDomain}. Please use email/password or contact your IT admin.`
          )
        } else {
          setErrorMessage(data.message || "Failed to initialize SSO authentication.")
        }
        setLoading(false)
        return
      }

      if (data.authorizationUrl) {
        window.location.href = data.authorizationUrl
      } else {
        throw new Error("Missing authorization redirect URL.")
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Network error contacting corporate identity provider."
      setErrorMessage(msg)
      setLoading(false)
    }
  }

  return (
    <div className="mt-3">
      {!isOpen ? (
        <button
          type="button"
          onClick={onToggle}
          className="group relative flex h-10.5 w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 px-4 text-xs font-medium text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900/10 active:scale-[0.99]"
        >
          <Building2 className="h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-800" />
          <span>Sign in with Corporate SSO</span>
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden rounded-xl border border-slate-200/90 bg-gradient-to-b from-slate-50/90 to-white p-3.5 shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
                <KeyRound className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-semibold text-slate-900">Corporate Single Sign-On</span>
            </div>
            <button
              type="button"
              onClick={onToggle}
              className="text-[11px] font-medium text-slate-400 hover:text-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-normal leading-relaxed mb-3">
            Authenticate using your company&apos;s Identity Provider (Microsoft Entra ID, Okta, Google Workspace, or SAML 2.0).
          </p>

          <form onSubmit={handleSubmit} className="space-y-2.5" noValidate>
            <div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Building2 className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  required
                  autoFocus
                  disabled={loading}
                  value={corporateInput}
                  onChange={(e) => setCorporateInput(e.target.value)}
                  placeholder="employee@company.com or company.com"
                  className="h-10 w-full rounded-xl border border-slate-200/90 bg-white pl-9.5 pr-4 text-xs font-normal text-slate-900 placeholder:text-slate-400 placeholder:text-xs shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-150 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 disabled:opacity-50"
                />
              </div>

              {detectedDomain && (
                <div className="mt-1.5 flex items-center gap-1.5 px-0.5 text-[10.5px] font-medium text-emerald-700">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  <span>Domain detected: <strong className="font-semibold text-emerald-800">{detectedDomain}</strong></span>
                </div>
              )}
            </div>

            <AnimatePresence>
              {errorMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50/70 p-2.5 text-[11px] text-rose-700"
                >
                  <ShieldAlert className="h-3.5 w-3.5 shrink-0 mt-0.5 text-rose-600" />
                  <span className="leading-snug">{errorMessage}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading || !corporateInput.trim()}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 text-xs font-medium text-white shadow-xs transition-all duration-150 hover:bg-slate-800 active:scale-[0.99] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                  <span>Contacting Identity Provider…</span>
                </>
              ) : (
                <>
                  <span>Continue with SSO</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </motion.div>
      )}
    </div>
  )
}

