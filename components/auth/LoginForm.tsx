"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Compass, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, ShieldCheck } from "lucide-react"
import { signIn } from "next-auth/react"
import Alert from "@/components/ui/Alert"
import Button from "@/components/ui/Button"
import FormLabel from "@/components/ui/FormLabel"
import SocialAuthButton from "@/components/ui/SocialAuthButton"
import { DeviceLimitError, type AuthDevice, type AuthUser, useAuth } from "@/contexts/AuthContext"
import { resolvePostLoginDestination, safePostAuthPath } from "@/lib/auth-navigation"
import PolicyConsentModal, { type PendingPolicy } from "@/components/policy/PolicyConsentModal"

function googleHandoffPath(callbackUrl: string, hostIntent: boolean) {
  const target = safePostAuthPath(callbackUrl) || (hostIntent ? "/host/signup" : "/")
  return `/api/auth/google-login?callbackUrl=${encodeURIComponent(target)}`
}

export default function LoginForm({
  initialEmail = "",
  callbackUrl = "",
  registered = "",
  hostIntent = false,
}: {
  initialEmail?: string
  callbackUrl?: string
  registered?: string
  hostIntent?: boolean
}) {
  const router = useRouter()
  const { login, replaceDeviceLogin } = useAuth()
  const [activeRole, setActiveRole] = useState<"traveler" | "host">(hostIntent ? "host" : "traveler")
  const [email, setEmail] = useState(initialEmail)
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState("")
  const [deviceLimit, setDeviceLimit] = useState<{ message: string; devices: AuthDevice[] } | null>(null)
  const [replacingDeviceId, setReplacingDeviceId] = useState("")
  const [pendingReconsent, setPendingReconsent] = useState<{
    user: AuthUser
    policies: PendingPolicy[]
    destination: string
  } | null>(null)

  const isHostMode = activeRole === "host" || hostIntent

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setDeviceLimit(null)
    if (!email.trim() || !password) return setError("Enter your email and password.")
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Enter a valid email address.")
    setLoading(true)
    try {
      const user = await login(email.trim(), password)
      if (user.reconsentRequired && user.pendingPolicies && user.pendingPolicies.length > 0) {
        setPendingReconsent({
          user,
          policies: user.pendingPolicies,
          destination: resolvePostLoginDestination(user, callbackUrl, isHostMode),
        })
        return
      }
      const destination = resolvePostLoginDestination(user, callbackUrl, isHostMode)
      router.replace(destination)
      router.refresh()
    } catch (err) {
      if (err instanceof DeviceLimitError) {
        setDeviceLimit({ message: err.message, devices: err.devices })
        return
      }
      setError(err instanceof Error ? err.message : "Unable to sign in. Please check your credentials.")
    } finally {
      setLoading(false)
    }
  }

  const replaceDevice = async (deviceId: string) => {
    if (!email.trim() || !password) return setError("Enter your email and password before replacing a device.")
    setError("")
    setReplacingDeviceId(deviceId)
    try {
      const user = await replaceDeviceLogin(email.trim(), password, deviceId)
      const destination = resolvePostLoginDestination(user, callbackUrl, isHostMode)
      router.replace(destination)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to replace that device. Please try again.")
    } finally {
      setReplacingDeviceId("")
    }
  }

  return (
    <div className="w-full">
      {/* Role Switcher Pills */}
      <div className="mb-6 flex rounded-2xl bg-slate-100/90 p-1 border border-slate-200/80">
        <button
          type="button"
          onClick={() => setActiveRole("traveler")}
          className={`relative flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all duration-200 ${
            activeRole === "traveler"
              ? "bg-white text-slate-950 shadow-sm shadow-slate-950/5 border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <Compass className={`h-4 w-4 ${activeRole === "traveler" ? "text-violet-600" : "text-slate-400"}`} />
          <span>Traveler</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveRole("host")}
          className={`relative flex-1 flex items-center justify-center gap-2 rounded-xl py-2 text-xs font-bold transition-all duration-200 ${
            activeRole === "host"
              ? "bg-white text-slate-950 shadow-sm shadow-slate-950/5 border border-slate-200/60"
              : "text-slate-500 hover:text-slate-900"
          }`}
        >
          <ShieldCheck className={`h-4 w-4 ${activeRole === "host" ? "text-cyan-600" : "text-slate-400"}`} />
          <span>Host Partner</span>
          {activeRole === "host" && (
            <span className="hidden sm:inline-block rounded-full bg-cyan-100 px-1.5 py-0.5 text-[9px] font-extrabold text-cyan-800">
              PRO
            </span>
          )}
        </button>
      </div>

      {/* Form Header */}
      <div className="mb-6 text-left">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">
          {activeRole === "host" ? "Host Studio Sign In" : "Welcome back"}
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-slate-500">
          {activeRole === "host"
            ? "Manage verified departures, guest lists, and instant settlements."
            : "Enter your credentials to access your trips, wishlist, and circles."}
        </p>
      </div>

      <AnimatePresence mode="wait">
        {registered && (
          <motion.div
            key="registered-alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5"
          >
            <Alert variant="success">Account registered! Please sign in to activate your session.</Alert>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error-alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5"
          >
            <Alert variant="error">{error}</Alert>
          </motion.div>
        )}

        {deviceLimit && (
          <motion.div
            key="device-alert"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mb-5"
          >
            <Alert variant="warning">
              <p className="font-semibold text-amber-950">{deviceLimit.message}</p>
              <ul className="mt-3 space-y-2">
                {deviceLimit.devices.map((device) => (
                  <li
                    key={device.deviceId}
                    className="flex flex-col gap-2 rounded-xl border border-amber-200/80 bg-white/90 p-3 text-xs sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{device.deviceName || device.browser || "Active session"}</p>
                      <p className="text-slate-500">
                        {device.os ? `${device.os} · ` : ""}
                        {device.lastSeenAt ? `Last active ${new Date(device.lastSeenAt).toLocaleString()}` : "Recently active"}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={Boolean(replacingDeviceId) || device.isCurrent}
                      onClick={() => void replaceDevice(device.deviceId)}
                      className="shrink-0"
                    >
                      {replacingDeviceId === device.deviceId ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
                      {device.isCurrent ? "Current device" : "Replace device"}
                    </Button>
                  </li>
                ))}
              </ul>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <FormLabel htmlFor="email" required>
            Email address
          </FormLabel>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={Boolean(error) || undefined}
              className="h-11.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-200 hover:bg-slate-50 focus:border-violet-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/15"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <FormLabel htmlFor="password" required>
              Password
            </FormLabel>
            <Link
              href="/forgot-password"
              className="text-xs font-semibold text-violet-600 transition-colors duration-200 hover:text-violet-800"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <LockKeyhole className="h-4 w-4" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11.5 w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-11 text-sm font-medium text-slate-900 placeholder:text-slate-400 transition-all duration-200 hover:bg-slate-50 focus:border-violet-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-violet-500/15"
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
        </div>

        <div className="flex items-center justify-between py-1 text-xs">
          <span className="flex items-center gap-1.5 font-medium text-emerald-700">
            <LockKeyhole className="h-3.5 w-3.5 text-emerald-600" />
            256-bit TLS Encrypted
          </span>
          <span className="flex items-center gap-1 text-slate-500 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-cyan-600" />
            Device Bounded
          </span>
        </div>

        <motion.div whileHover={{ scale: 1.008 }} whileTap={{ scale: 0.992 }}>
          <Button
            type="submit"
            variant="brand"
            size="xl"
            disabled={loading}
            className="w-full h-11.5 shadow-lg shadow-violet-950/20 text-sm font-bold tracking-wide"
          >
            {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
            {loading ? "Verifying credentials…" : activeRole === "host" ? "Sign in to Host Studio" : "Sign in securely"}
          </Button>
        </motion.div>
      </form>

      <div className="relative my-5">
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
            await signIn("google", { callbackUrl: googleHandoffPath(callbackUrl, isHostMode) })
          } catch {
            setGoogleLoading(false)
          }
        }}
        className="w-full h-11.5 rounded-xl border border-slate-200/90 bg-white font-semibold text-slate-700 transition duration-200 hover:bg-slate-50/90 hover:border-slate-300"
      />

      <div className="mt-6 space-y-2 text-center text-xs sm:text-sm">
        <p className="text-slate-600">
          New to Travels Pro?{" "}
          <Link href="/signup" className="font-bold text-violet-600 hover:text-violet-800">
            Create an account
          </Link>
        </p>
        <p className="text-xs text-slate-500">
          Are you a local tour leader or activity host?{" "}
          <Link href="/host/signup" className="font-bold text-slate-900 hover:text-violet-700 underline underline-offset-2">
            Apply to become a verified host
          </Link>
        </p>
      </div>

      <PolicyConsentModal
        isOpen={Boolean(pendingReconsent)}
        pendingPolicies={pendingReconsent?.policies || []}
        onConsentAccepted={() => {
          const target = pendingReconsent?.destination || "/"
          setPendingReconsent(null)
          router.replace(target)
          router.refresh()
        }}
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
