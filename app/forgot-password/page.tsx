"use client"

import Link from "next/link"
import { FormEvent, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, LoaderCircle, Mail, ShieldCheck, Sparkles } from "lucide-react"
import { toast } from "sonner"
import AuthShell from "@/components/auth/AuthShell"
import Alert from "@/components/ui/Alert"
import api, { getApiErrorMessage } from "@/lib/axios"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [state, setState] = useState<"form" | "sent">("form")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (state === "sent" && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(timer)
  }, [state, countdown])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setError("")
    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Please enter a valid email address.")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/forgot-password", { email: email.trim() })
      setState("sent")
      setCountdown(60)
      setCanResend(false)
      toast.success("Password reset instructions dispatched.", {
        description: "Check your inbox for the secure link.",
      })
    } catch (cause) {
      setError(getApiErrorMessage(cause, "We could not send a reset link right now. Please try again."))
      toast.error("Unable to request password reset", {
        description: "Please check your network and try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResend = () => {
    setState("form")
    setCanResend(false)
  }

  return (
    <AuthShell
      eyebrow="Account Recovery"
      title="Restore access to your travel circle."
      description="Every recovery link is protected with single-use cryptographic tokens and time-bounded expiry. We never reveal account existence to protect your privacy under DPDP guidelines."
    >
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-violet-600">
          <KeyRound className="h-3.5 w-3.5" />
          <span>Security & Recovery</span>
        </div>
        <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-slate-950 sm:text-4xl">
          {state === "sent" ? "Check your inbox" : "Forgot your password?"}
        </h2>
        <p className="mt-2.5 text-sm leading-6 text-slate-500">
          {state === "sent"
            ? `If an account matches ${email}, a single-use recovery link has been sent.`
            : "Enter your registered email address. We'll send you a secure link to create a new password."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="forgot-error"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5"
          >
            <Alert variant="error">{error}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {state === "form" ? (
          <motion.form
            key="forgot-form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            onSubmit={submit}
            className="space-y-5"
            noValidate
          >
            <div>
              <label htmlFor="recovery-email" className="block text-xs font-black uppercase tracking-[0.16em] text-slate-700">
                Registered Email Address
              </label>
              <div className="relative mt-2">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="recovery-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm font-medium text-slate-900 transition-all duration-200 placeholder:text-slate-400 focus:border-violet-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/10"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/60 p-4 text-xs leading-5 text-slate-600">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span>Privacy & Protection Guarantee</span>
              </div>
              <p className="mt-1.5">
                For security, we will never confirm whether this address is registered. If valid, the link will expire in 60 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex h-12 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-700 px-6 text-sm font-black text-white shadow-lg shadow-violet-500/25 transition-all duration-300 hover:shadow-violet-500/40 focus:outline-none focus:ring-4 focus:ring-violet-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>Sending secure link…</span>
                </>
              ) : (
                <>
                  <span>Send Recovery Link</span>
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
                <span>Remembered your password? Back to sign in</span>
              </Link>
            </div>
          </motion.form>
        ) : (
          <motion.div
            key="forgot-sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            <div className="flex flex-col items-center rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="h-7 w-7" />
              </div>
              <h3 className="mt-4 text-lg font-black text-slate-900">Email Dispatched</h3>
              <p className="mt-2 text-xs leading-5 text-slate-600">
                We sent a password reset link to <span className="font-bold text-slate-900">{email}</span>. Click the link in that email to reset your credentials.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-[11px] font-bold text-emerald-800 shadow-sm">
                <Sparkles className="h-3 w-3 text-emerald-600" />
                <span>Link valid for 60 minutes</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href="/login"
                className="flex h-12 w-full items-center justify-center rounded-xl bg-slate-950 text-sm font-black text-white shadow-md transition hover:bg-slate-800"
              >
                Return to Sign In
              </Link>

              <button
                type="button"
                onClick={handleResend}
                disabled={!canResend}
                className="flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-400"
              >
                {canResend ? "Didn't receive email? Try another address" : `Resend available in ${countdown}s`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthShell>
  )
}
