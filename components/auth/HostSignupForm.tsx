"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Building2, Check, Eye, EyeOff, LoaderCircle, ShieldCheck, Sparkles } from "lucide-react"
import { signIn } from "next-auth/react"
import Alert from "@/components/ui/Alert"
import Checkbox from "@/components/ui/Checkbox"
import SocialAuthButton from "@/components/ui/SocialAuthButton"
import { useAuth } from "@/contexts/AuthContext"

const propertyTypes = ["All travel products", "Hotel or homestay", "Tour operator", "Car and bike rental", "Activity host"]
const hostProducts = ["Hotels", "Tours", "Cars & bikes", "Activities"]

export default function HostSignupForm() {
  const router = useRouter()
  const { user, isAuthenticated, isHost, signup, becomeHost } = useAuth()
  const [callbackUrl, setCallbackUrl] = useState("/host")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [businessName, setBusinessName] = useState("")
  const [city, setCity] = useState("")
  const [propertyType, setPropertyType] = useState(propertyTypes[0])
  const [products, setProducts] = useState(hostProducts)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

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
      setError("Add your business or host brand name.")
      return
    }

    if (!phone.trim()) {
      setError("Add a phone number for booking support.")
      return
    }

    if (!city.trim()) {
      setError("Add your primary hosting city.")
      return
    }

    if (products.length === 0) {
      setError("Choose at least one product you want to host.")
      return
    }

    if (!isAuthenticated) {
      if (!name.trim() || !email.trim() || !password.trim()) {
        setError("Please complete your name, email, password, and host details.")
        return
      }

      if (!email.includes("@")) {
        setError("Please enter a valid email address.")
        return
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters.")
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
        setSuccess("Host access activated. Opening Host Studio...")
      } else {
        await signup({
          name,
          email,
          phone,
          password,
          accountType: "HOST",
          businessName,
        })
        setSuccess("Host account created. Opening Host Studio...")
      }

      window.setTimeout(() => {
        router.refresh()
        window.location.assign(callbackUrl || "/host")
      }, 550)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to activate host access right now.")
    } finally {
      setLoading(false)
    }
  }

  if (isHost) {
    return (
      <div className="rounded-[28px] border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-black tracking-tight text-slate-950">Host access is active</h2>
        <p className="mt-2 text-sm leading-6 text-emerald-900">
          Your account can manage listings, bookings, payouts, KYC, and guest reviews.
        </p>
        <Link
          href="/host"
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
        >
          Open host workspace
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-[30px] border border-white/70 bg-white/95 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur sm:p-7">
      <div className="mb-6 flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-950/20">
          <Building2 className="h-6 w-6" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-blue-600">Host onboarding</p>
          <h2 className="mt-1 text-2xl font-black tracking-tight text-slate-950">
            {isAuthenticated ? "Activate your host role" : "Create your host account"}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            {isAuthenticated
              ? `Signed in as ${user?.email}. We will add host permissions to this account.`
              : "Use one account for travel bookings and your host workspace."}
          </p>
        </div>
      </div>

      {error && <Alert variant="error" className="mb-5">{error}</Alert>}
      {success && <Alert variant="success" className="mb-5">{success}</Alert>}

      <div className="grid gap-4">
        <Field
          label="Full name"
          value={name}
          onChange={setName}
          placeholder="Satyam Dubey"
          autoComplete="name"
          disabled={isAuthenticated}
        />
        <Field
          label="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          placeholder="host@gethotels.com"
          autoComplete="email"
          disabled={isAuthenticated}
        />

        <Field label="Business or brand name" value={businessName} onChange={setBusinessName} placeholder="Golden Tulip Goa" autoComplete="organization" />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Support phone" type="tel" value={phone} onChange={setPhone} placeholder="+91 98765 43210" autoComplete="tel" />
          <Field label="Primary city" value={city} onChange={setCity} placeholder="Goa" autoComplete="address-level2" />
        </div>

        <label className="block">
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">Host type</span>
          <select
            value={propertyType}
            onChange={event => setPropertyType(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          >
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </label>

        <div>
          <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">Products you can host</span>
          <div className="grid grid-cols-2 gap-2">
            {hostProducts.map(product => {
              const active = products.includes(product)
              return (
                <button
                  key={product}
                  type="button"
                  onClick={() => {
                    setProducts(current =>
                      active ? current.filter(item => item !== product) : [...current, product],
                    )
                  }}
                  className={`rounded-2xl border px-3 py-3 text-left text-xs font-black transition ${
                    active
                      ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                      : "border-slate-200 bg-slate-50 text-slate-500 hover:bg-white"
                  }`}
                >
                  {product}
                </button>
              )
            })}
          </div>
        </div>

        {!isAuthenticated && (
          <label className="block">
            <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">Password</span>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="Create a secure password"
                autoComplete="new-password"
                className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 pr-12 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              <button
                type="button"
                onClick={() => setShowPassword(current => !current)}
                className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>
        )}
      </div>

      <div className="my-5 grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-4">
        {["Role checked at login", "Host dashboard permission", `${propertyType} setup path`].map(item => (
          <div key={item} className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-emerald-600 shadow-sm">
              <Check className="h-4 w-4" />
            </span>
            {item}
          </div>
        ))}
      </div>

      {!isAuthenticated && (
        <Checkbox
          id="hostTerms"
          checked={agreeTerms}
          onCheckedChange={checked => setAgreeTerms(checked === true)}
          label={(
            <span>
              I agree to the <Link href="/terms" className="font-bold text-blue-600 hover:text-blue-700">host terms</Link> and verification process.
            </span>
          )}
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-4 text-sm font-black text-white shadow-xl shadow-slate-950/20 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {loading ? "Setting up workspace..." : isAuthenticated ? "Activate host access" : "Create host account"}
      </button>

      {!isAuthenticated && (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs font-black uppercase tracking-[0.18em] text-slate-400">
              <span className="bg-white px-3">Or</span>
            </div>
          </div>

          <SocialAuthButton
            icon={<GoogleIcon />}
            label="Sign up with Google as Host"
            onClick={() => {
      const nextUrl = `/host/signup?googleHost=1&callbackUrl=${encodeURIComponent(callbackUrl)}`
              signIn("google", { callbackUrl: nextUrl })
            }}
            className="w-full"
          />

          <p className="mt-5 text-center text-sm text-slate-600">
            Already a host?{" "}
            <Link href={`/login?role=HOST&callbackUrl=${encodeURIComponent(callbackUrl)}`} className="font-black text-blue-600 hover:text-blue-700">
              Sign in with email and password
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
      <span className="mb-2 block text-xs font-black uppercase tracking-[0.18em] text-slate-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        disabled={disabled}
        className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
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
