"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { signIn } from "next-auth/react"
import Alert from "@/components/ui/Alert"
import Checkbox from "@/components/ui/Checkbox"
import SocialAuthButton from "@/components/ui/SocialAuthButton"
import { useAuth } from "@/contexts/AuthContext"

function calculatePasswordStrength(pass: string) {
  let score = 0
  if (pass.length >= 12) score += 1
  if (pass.length >= 16) score += 1
  if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1
  if (/[0-9]/.test(pass)) score += 1
  if (/[^A-Za-z0-9]/.test(pass)) score += 1

  if (score <= 1) return { score: 1, label: "Too weak", color: "bg-rose-500", text: "text-rose-600" }
  if (score <= 2) return { score: 2, label: "Fair", color: "bg-amber-500", text: "text-amber-600" }
  if (score <= 3) return { score: 3, label: "Good", color: "bg-blue-500", text: "text-blue-600" }
  return { score: 4, label: "Strong", color: "bg-emerald-500", text: "text-emerald-600" }
}

export default function HostSignupForm() {
  const router = useRouter()
  const { user, isAuthenticated, isHost, isHostApplicant, signup, becomeHost } = useAuth()
  const [callbackUrl, setCallbackUrl] = useState("/host")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const strength = calculatePasswordStrength(password)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setCallbackUrl(params.get("callbackUrl") || "/host")
  }, [])

  useEffect(() => {
    if (user) {
      setName(user.name ?? "")
      setEmail(user.email ?? "")
      setPhone(user.phone ?? "")
      setBusinessName(user.businessName ?? "")
    }
  }, [user])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!businessName.trim()) {
      setError("Please specify your business or host brand name.")
      return
    }

    if (!phone.trim()) {
      setError("Please provide a phone number for guest support.")
      return
    }

    if (!/^\+?[0-9][0-9\s-]{6,19}$/.test(phone.trim())) {
      setError("Enter a valid phone number (e.g. +91 98765 43210).")
      return
    }

    if (!isAuthenticated) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Please complete your name, email, password, and host details.")
        return
      }

      if (!/^\S+@\S+\.\S+$/.test(email)) {
        setError("Please enter a valid email address.")
        return
      }

      if (password.length < 12) {
        setError("Password must be at least 12 characters.")
        return
      }

      if (!agreeTerms) {
        setError("Please accept the host terms before continuing.")
        return
      }
    }

    setLoading(true)

    try {
      if (isAuthenticated) {
        await becomeHost({ businessName, phone })
        setSuccess("Host application submitted for review.")
      } else {
        await signup({
          name,
          email,
          phone,
          password,
          accountType: "HOST",
          businessName,
        })
        router.replace(
          `/login?registered=host&intent=host&email=${encodeURIComponent(email.trim())}&callbackUrl=${encodeURIComponent("/host/signup")}`
        )
        return
      }

      window.setTimeout(() => {
        router.refresh()
        window.location.assign("/host/signup")
      }, 550)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit your host application right now.")
    } finally {
      setLoading(false)
    }
  }

  if (isHost) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[28px] border border-emerald-500/30 bg-emerald-950/40 p-6 text-white backdrop-blur-xl shadow-2xl shadow-emerald-950/20"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-400">Verified Leader</span>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">Host access is active</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">
          Your account is fully verified to publish tours, manage live departures, chat with participants, and receive bank payouts.
        </p>
        <Link
          href="/host"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-emerald-500 shadow-lg shadow-emerald-900/30"
        >
          Open Host Studio
          <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    )
  }

  if (isAuthenticated && isHostApplicant) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-[28px] border border-amber-500/30 bg-amber-950/40 p-6 text-white backdrop-blur-xl shadow-2xl shadow-amber-950/20"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-400">Review In Progress</p>
        <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-white">Application submitted for audit</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">
          Our team is reviewing your profile and credentials. You can complete your identity document verification in Host KYC to accelerate approval.
        </p>
        <div className="mt-6 space-y-3">
          <Link
            href="/host/kyc"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-500"
          >
            Go to Identity &amp; KYC
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-xs font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
          >
            Explore marketplace as traveler
          </Link>
        </div>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[30px] border border-white/15 bg-white/95 p-6 text-slate-950 shadow-2xl shadow-slate-950/30 backdrop-blur-2xl sm:p-8"
    >
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-600/30">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-blue-600">Host Onboarding</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
            {isAuthenticated ? "Apply to host" : "Create host account"}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            {isAuthenticated
              ? `Signed in as ${user?.email}. Complete host details to request verification.`
              : "One account coordinates guest bookings, verified trips, and settlements."}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="host-error"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5"
          >
            <Alert variant="error">{error}</Alert>
          </motion.div>
        )}
        {success && (
          <motion.div
            key="host-success"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5"
          >
            <Alert variant="success">{success}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-3.5">
        <Field
          label="Full Legal Name"
          value={name}
          onChange={setName}
          placeholder="As on your Aadhaar or Passport"
          autoComplete="name"
          disabled={isAuthenticated}
        />
        <Field
          label="Email Address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="host@travelspro.in"
          autoComplete="email"
          disabled={isAuthenticated}
        />

        <div className="grid gap-3.5 sm:grid-cols-2">
          <Field
            label="Business or Brand Name"
            value={businessName}
            onChange={setBusinessName}
            placeholder="e.g. Spiti Valley Treks"
            autoComplete="organization"
          />
          <Field
            label="Support Phone (WhatsApp)"
            type="tel"
            value={phone}
            onChange={setPhone}
            placeholder="+91 98765 43210"
            autoComplete="tel"
          />
        </div>

        {!isAuthenticated && (
          <div>
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-700">Password</span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 12 characters"
                  autoComplete="new-password"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 pr-11 text-sm font-medium text-slate-900 outline-none transition focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </label>

            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Security strength:</span>
                  <span className={`font-bold ${strength.text}`}>{strength.label}</span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1.5">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`rounded-full transition-all duration-300 ${
                        step <= strength.score ? strength.color : "bg-slate-200"
                      }`}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>

      <div className="my-4 grid gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 text-xs font-semibold text-slate-600">
        {[
          "Encrypted Aadhaar/ID document verification",
          "Zero upfront fees · Server-held escrow payouts",
          "Dedicated 24/7 incident coordination desk",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2">
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <Check className="h-3 w-3" />
            </span>
            <span>{item}</span>
          </div>
        ))}
      </div>

      {!isAuthenticated && (
        <div className="pt-1">
          <Checkbox
            id="hostTerms"
            checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(checked === true)}
            label={
              <span className="text-xs text-slate-600">
                I agree to the{" "}
                <Link href="/terms" className="font-bold text-blue-600 hover:text-blue-800 underline underline-offset-2">
                  Host Terms of Service
                </Link>{" "}
                and acknowledge the safety review process.
              </span>
            }
          />
        </div>
      )}

      <motion.div whileHover={{ scale: 1.008 }} whileTap={{ scale: 0.992 }} className="mt-5">
        <button
          type="submit"
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          {loading ? "Submitting application…" : isAuthenticated ? "Submit host application" : "Create host account"}
        </button>
      </motion.div>

      {!isAuthenticated && (
        <>
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] font-black uppercase tracking-[0.16em] text-slate-400">
              <span className="bg-white px-3">or apply with</span>
            </div>
          </div>

          <SocialAuthButton
            icon={<GoogleIcon />}
            label={googleLoading ? "Connecting to Google..." : "Continue with Google"}
            disabled={loading || googleLoading}
            onClick={async () => {
              if (googleLoading || loading) return
              setGoogleLoading(true)
              try {
                const target = `/host/signup?googleHost=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
                await signIn("google", { callbackUrl: `/api/auth/google-login?callbackUrl=${encodeURIComponent(target)}` })
              } catch {
                setGoogleLoading(false)
              }
            }}
            className="w-full h-11"
          />

          <p className="mt-5 text-center text-xs text-slate-500">
            Already have an account?{" "}
            <Link
              href={`/login?intent=host&callbackUrl=${encodeURIComponent(callbackUrl)}`}
              className="font-bold text-blue-600 hover:text-blue-800"
            >
              Sign in here
            </Link>
          </p>
        </>
      )}
    </form>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  disabled = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
  type?: string
  autoComplete?: string
  disabled?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/80 px-3.5 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:bg-white focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
      />
    </label>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.7h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.74 2.97-4.3 2.97-7.26Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.24-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.41 13.9A5.98 5.98 0 0 1 6.1 12c0-.66.11-1.3.31-1.9V7.52H3.06A10 10 0 0 0 2 12c0 1.62.39 3.16 1.06 4.48l3.35-2.58Z" fill="#FBBC05" />
      <path d="M12 5.98c1.47 0 2.78.5 3.81 1.49l2.86-2.86C16.96 3 14.7 2 12 2 8.09 2 4.73 4.24 3.06 7.52l3.35 2.58C7.2 7.74 9.4 5.98 12 5.98Z" fill="#EA4335" />
    </svg>
  )
}
