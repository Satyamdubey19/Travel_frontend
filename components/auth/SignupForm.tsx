"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Phone, ShieldCheck, User } from "lucide-react"
import { signIn } from "next-auth/react"
import Alert from "@/components/ui/Alert"
import Button from "@/components/ui/Button"
import Checkbox from "@/components/ui/Checkbox"
import FormLabel from "@/components/ui/FormLabel"
import SocialAuthButton from "@/components/ui/SocialAuthButton"
import { useAuth } from "@/contexts/AuthContext"
import { safePostAuthPath } from "@/lib/auth-navigation"
import PolicyModal from "@/components/policy/PolicyModal"

function googleHandoffPath(callbackUrl: string) {
  const target = safePostAuthPath(callbackUrl) || "/"
  return `/api/auth/google-login?callbackUrl=${encodeURIComponent(target)}`
}

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

export default function SignupForm({
  callbackUrl = "",
  authError = "",
}: {
  callbackUrl?: string
  authError?: string
}) {
  const router = useRouter()
  const { signup } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [activePolicyModal, setActivePolicyModal] = useState<null | "TERMS_OF_SERVICE" | "PRIVACY_POLICY">(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")

  const strength = calculatePasswordStrength(password)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      return setError("Complete every required field.")
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return setError("Enter a valid email address.")
    }
    if (!/^\+?[0-9][0-9\s-]{6,19}$/.test(phone.trim())) {
      return setError("Enter a valid phone number (e.g. +91 98765 43210).")
    }
    if (password.length < 12) {
      return setError("Use at least 12 characters for your password.")
    }
    if (password !== confirmPassword) {
      return setError("The passwords do not match.")
    }
    if (!agreeTerms) {
      return setError("Please accept the terms and privacy policy.")
    }
    setLoading(true)
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        accountType: "USER",
        agreedToTerms: true,
        consentGiven: true,
      })
      const loginTarget = `/login?registered=1&email=${encodeURIComponent(email.trim())}${callbackUrl ? `&callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`
      router.replace(loginTarget)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create your account.")
    } finally {
      setLoading(false)
    }
  }

  const inputClasses =
    "h-11 w-full rounded-xl border border-slate-200 bg-slate-50/70 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-200 hover:bg-slate-50 focus:border-violet-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/15"

  return (
    <div className="w-full">
      {/* Form Header */}
      <div className="mb-5 text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
          Create an account
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          Join verified travellers exploring curated trails and trips across India.
        </p>
      </div>

      <div className="space-y-2 mb-3">
        {authError === "GOOGLE_SIGNIN_FAILED" ? (
          <Alert variant="error">Google sign-in could not be completed. Please try again or create an account with email.</Alert>
        ) : null}
        {authError === "DEVICE_LIMIT_REACHED" ? (
          <Alert variant="warning">This account has reached its secure-device limit. Sign in to manage your devices.</Alert>
        ) : null}
        {authError === "AccessDenied" ? (
          <Alert variant="error">Access was denied by Google authentication. Please try again.</Alert>
        ) : null}
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="signup-error"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-4"
          >
            <Alert variant="error">{error}</Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={submit} className="space-y-3.5" noValidate>
        <div>
          <FormLabel htmlFor="name" required>
            Full legal name
          </FormLabel>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="As on your Aadhaar or Passport"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${inputClasses} pl-10 pr-4`}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <FormLabel htmlFor="signup-email" required>
              Email address
            </FormLabel>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="signup-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`${inputClasses} pl-10 pr-4`}
              />
            </div>
          </div>
          <div>
            <FormLabel htmlFor="phone" required>
              Mobile number
            </FormLabel>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Phone className="h-4 w-4" />
              </div>
              <input
                id="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={`${inputClasses} pl-10 pr-4`}
              />
            </div>
          </div>
        </div>

        <div>
          <FormLabel htmlFor="new-password" required>
            Password
          </FormLabel>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <LockKeyhole className="h-4 w-4" />
            </div>
            <input
              id="new-password"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 12 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClasses} pl-10 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {/* Dynamic Animated Password Strength Indicator */}
          {password.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-2 space-y-1"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Security strength:</span>
                <span className={`font-bold ${strength.text}`}>{strength.label}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`rounded-full transition-all duration-300 ${
                      step <= strength.score ? strength.color : "bg-slate-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-[11px] text-slate-400">Must be 12–128 characters with uppercase, numbers, or symbols.</p>
            </motion.div>
          )}
        </div>

        <div>
          <FormLabel htmlFor="confirm-password" required>
            Confirm password
          </FormLabel>
          <div className="relative mt-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <LockKeyhole className="h-4 w-4" />
            </div>
            <input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`${inputClasses} pl-10 pr-11`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute right-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-200/60 hover:text-slate-700"
            >
              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <div className="pt-1">
          <Checkbox
            id="agreeTerms"
            checked={agreeTerms}
            onCheckedChange={(checked) => setAgreeTerms(checked === true)}
            label={
              <span className="text-xs text-slate-600 dark:text-slate-400 leading-normal">
                I voluntarily agree to the{" "}
                <button
                  type="button"
                  onClick={() => setActivePolicyModal("TERMS_OF_SERVICE")}
                  className="font-bold text-violet-600 hover:text-violet-800 underline underline-offset-2"
                >
                  Terms of Service
                </button>{" "}
                and{" "}
                <button
                  type="button"
                  onClick={() => setActivePolicyModal("PRIVACY_POLICY")}
                  className="font-bold text-violet-600 hover:text-violet-800 underline underline-offset-2"
                >
                  Privacy Policy
                </button>
                .
              </span>
            }
          />
        </div>

        <div className="flex items-center justify-between py-0.5 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            DPDP Compliant Data Vault
          </span>
          <span className="text-slate-400">India Edition</span>
        </div>

        <motion.div whileHover={{ scale: 1.008 }} whileTap={{ scale: 0.992 }} className="pt-1">
          <Button
            type="submit"
            variant="brand"
            size="xl"
            disabled={loading}
            className="w-full h-11.5 shadow-lg shadow-violet-950/20 text-sm font-bold tracking-wide"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? "Creating traveller account…" : "Create traveller account"}
          </Button>
        </motion.div>
      </form>

      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
            or continue with
          </span>
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
            await signIn("google", { callbackUrl: "/api/auth/google-login?callbackUrl=%2F" })
            await signIn("google", { callbackUrl: googleHandoffPath(callbackUrl) })
          } catch {
            setGoogleLoading(false)
          }
        }}
        className="w-full h-11.5 rounded-xl border border-slate-200/90 bg-white font-semibold text-slate-700 transition duration-200 hover:bg-slate-50/90 hover:border-slate-300"
      />

      <div className="mt-5 space-y-1.5 text-center text-xs sm:text-sm">
        <p className="text-slate-600">
          Already have an account?{" "}
          <Link
            href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/login"}
            className="font-bold text-violet-600 hover:text-violet-800"
          >
            Sign in
          </Link>
        </p>
        <p className="text-xs text-slate-500">
          Want to lead local tours or activities?{" "}
          <Link
            href={callbackUrl ? `/host/signup?callbackUrl=${encodeURIComponent(callbackUrl)}` : "/host/signup"}
            className="font-bold text-slate-900 hover:text-violet-700 underline underline-offset-2"
          >
            Host onboarding
          </Link>
        </p>
      </div>

      <PolicyModal
        isOpen={Boolean(activePolicyModal)}
        policyType={activePolicyModal || "TERMS_OF_SERVICE"}
        onClose={() => setActivePolicyModal(null)}
      />
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 shrink-0" aria-hidden="true">
      <path d="M21.6 12.23c0-.68-.06-1.33-.17-1.96H12v3.7h5.39a4.6 4.6 0 0 1-2 3.02v2.5h3.24c1.9-1.74 2.97-4.3 2.97-7.26Z" fill="#4285F4" />
      <path d="M12 22c2.7 0 4.97-.9 6.63-2.44l-3.24-2.5c-.9.6-2.04.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.06v2.58A10 10 0 0 0 12 22Z" fill="#34A853" />
      <path d="M6.41 13.9A5.98 5.98 0 0 1 6.1 12c0-.66.11-1.3.31-1.9V7.52H3.06A10 10 0 0 0 2 12c0 1.62.39 3.16 1.06 4.48l3.35-2.58Z" fill="#FBBC05" />
      <path d="M12 5.98c1.47 0 2.78.5 3.81 1.49l2.86-2.86C16.96 3 14.7 2 12 2 8.09 2 4.73 4.24 3.06 7.52l3.35 2.58C7.2 7.74 9.4 5.98 12 5.98Z" fill="#EA4335" />
    </svg>
  )
}
