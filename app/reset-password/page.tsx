"use client"

import Link from "next/link"
import { FormEvent, Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, Check, Eye, EyeOff, KeyRound, LoaderCircle, Lock, ShieldCheck, X } from "lucide-react"
import { toast } from "sonner"
import AuthShell from "@/components/auth/AuthShell"
import Alert from "@/components/ui/Alert"
import api, { getApiErrorMessage } from "@/lib/axios"

function calculatePasswordStrength(pass: string) {
  let score = 0
  const checks = {
    length: pass.length >= 12,
    mixed: /[A-Z]/.test(pass) && /[a-z]/.test(pass),
    number: /[0-9]/.test(pass),
    symbol: /[^A-Za-z0-9]/.test(pass),
  }

  if (checks.length) score += 1
  if (checks.mixed) score += 1
  if (checks.number) score += 1
  if (checks.symbol) score += 1

  const configs = [
    { label: "Too weak", color: "bg-rose-500", text: "text-rose-600" },
    { label: "Fair", color: "bg-amber-500", text: "text-amber-600" },
    { label: "Good", color: "bg-blue-500", text: "text-blue-600" },
    { label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" },
  ]

  return {
    score,
    checks,
    config: configs[Math.max(0, score - 1)] || configs[0],
  }
}

function ResetPasswordForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = useMemo(() => params.get("email") ?? "", [params])
  const token = useMemo(() => params.get("token") ?? "", [params])
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const incompleteLink = !email || !token

  const strength = calculatePasswordStrength(password)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (!email || !token) {
      setError("This reset link is invalid or incomplete.")
      return
    }
    if (password.length < 12) {
      setError("Use a password with at least 12 characters.")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/reset-password", { email, token, password })
      toast.success("Password updated successfully!", {
        description: "Every previous session was signed out. Sign in with your new password.",
      })
      router.replace("/login?password=changed")
    } catch (cause) {
      const msg = getApiErrorMessage(cause, "We could not reset your password. The link may have expired.")
      setError(msg)
      toast.error("Password reset failed", { description: msg })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      eyebrow="Secure Password Reset"
      title="Create a resilient new password."
      description="Updating your password immediately invalidates all active sessions across all devices to protect your verified bookings and payment profiles."
    >
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
          <KeyRound className="h-3.5 w-3.5" />
          <span>Credential Update</span>
        </div>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
          {incompleteLink ? "Incomplete link" : "Set new password"}
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {incompleteLink
            ? "This recovery link is missing its authentication token. Please request a fresh link."
            : `Enter your new password for ${email}.`}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="reset-error"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5"
          >
            <Alert variant="error">{error}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      {incompleteLink ? (
        <div className="space-y-5">
          <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5 text-xs leading-5 text-amber-900">
            <p className="font-bold">Security notice</p>
            <p className="mt-1 text-amber-700">
              For your safety, password reset requests require both the registered email address and the cryptographic token from your recovery email.
            </p>
          </div>
          <Link
            href="/forgot-password"
            className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Request New Reset Link
          </Link>
          <Link
            href="/login"
            className="block text-center text-xs font-bold text-slate-600 transition hover:text-violet-600"
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="new-password" className="block text-xs font-black uppercase tracking-[0.16em] text-slate-700">
              New Password
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="new-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 12 characters"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-11 text-sm font-medium text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-violet-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 transition hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {/* Live Password Criteria Checklist */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 space-y-2 rounded-xl border border-slate-200/80 bg-slate-50/60 p-3.5"
              >
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Password Strength:</span>
                  <span className={strength.config.text}>{strength.config.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`h-1.5 rounded-full transition-colors duration-300 ${
                        step <= strength.score ? strength.config.color : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                  <div className={`flex items-center gap-1.5 ${strength.checks.length ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    {strength.checks.length ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>12+ Characters</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${strength.checks.mixed ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    {strength.checks.mixed ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>Upper & Lowercase</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${strength.checks.number ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    {strength.checks.number ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>Number (0-9)</span>
                  </div>
                  <div className={`flex items-center gap-1.5 ${strength.checks.symbol ? "text-emerald-600 font-bold" : "text-slate-400"}`}>
                    {strength.checks.symbol ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                    <span>Special Symbol</span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-black uppercase tracking-[0.16em] text-slate-700">
              Confirm New Password
            </label>
            <div className="relative mt-2">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                id="confirm-password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter new password"
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-violet-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10"
              />
            </div>
            {confirm.length > 0 && confirm !== password && (
              <p className="mt-1.5 text-xs font-bold text-rose-500">Passwords do not match</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs leading-5 text-slate-600">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="h-4 w-4 text-violet-600" />
              <span>Session Invalidation</span>
            </div>
            <p className="mt-1">
              Confirming your new password revokes every active browser session and device token immediately.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || password.length < 12 || password !== confirm}
            className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 px-6 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                <span>Updating password securely…</span>
              </>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition hover:text-violet-600"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to sign in</span>
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <AuthShell
          eyebrow="Account Recovery"
          title="Verifying your secure link…"
          description="Connecting to Travels Pro verification servers."
        >
          <div className="flex h-40 items-center justify-center gap-3 text-sm font-bold text-slate-600">
            <LoaderCircle className="h-6 w-6 animate-spin text-violet-600" />
            <span>Verifying recovery token…</span>
          </div>
        </AuthShell>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
