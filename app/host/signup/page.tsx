import Link from "next/link"
import { BarChart3, CalendarCheck, CircleDollarSign, ShieldCheck, Sparkles, Star } from "lucide-react"
import HostSignupForm from "@/components/auth/HostSignupForm"

const hostBenefits = [
  {
    title: "Role based access",
    description: "The shared login checks HOST permission before opening the workspace.",
    icon: ShieldCheck,
  },
  {
    title: "Live booking desk",
    description: "Track arrivals, requests, guest details, and confirmation status from one panel.",
    icon: CalendarCheck,
  },
  {
    title: "Payout readiness",
    description: "KYC, wallet, settlement notes, and earnings are kept close to your daily work.",
    icon: CircleDollarSign,
  },
]

const metrics = [
  ["4.8", "avg guest rating"],
  ["24/7", "booking support"],
  ["8 min", "response target"],
]

export default function HostSignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f8fc] text-slate-950">
      <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_20%_10%,rgba(59,130,246,0.18),transparent_32%),radial-gradient(circle_at_80%_0%,rgba(20,184,166,0.16),transparent_30%),linear-gradient(135deg,#ffffff_0%,#eff6ff_48%,#eef2ff_100%)]" />
      <div className="absolute left-1/2 top-20 h-80 w-[70vw] -translate-x-1/2 rounded-full bg-white/50 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <nav className="flex items-center justify-between">
          <Link href="/" className="group flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-base font-black text-white shadow-xl shadow-blue-600/25 transition group-hover:-translate-y-0.5">
              GH
            </span>
            <span>
              <span className="block text-lg font-black tracking-tight">GetHotels</span>
              <span className="block text-xs font-bold uppercase tracking-[0.24em] text-slate-500">Host studio</span>
            </span>
          </Link>
          <Link
            href="/login?role=HOST&callbackUrl=/host"
            className="rounded-full border border-slate-200 bg-white/80 px-5 py-3 text-sm font-black text-slate-900 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:border-blue-200 hover:text-blue-700"
          >
            Host login
          </Link>
        </nav>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <div className="animate-slide-in-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-blue-700 shadow-sm backdrop-blur">
              <Sparkles className="h-4 w-4" />
              Start hosting
            </div>
            <h1 className="max-w-3xl text-5xl font-black leading-[0.94] tracking-tight text-slate-950 sm:text-6xl lg:text-7xl">
              Turn your stays, tours, and experiences into a polished booking business.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Create a host profile, verify your business, and open a workspace built for fast booking decisions, cleaner operations, and guest trust.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {metrics.map(([value, label]) => (
                <div key={label} className="rounded-3xl border border-white/80 bg-white/75 p-5 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
                  <p className="text-3xl font-black tracking-tight text-slate-950">{value}</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 grid gap-4">
              {hostBenefits.map(({ title, description, icon: Icon }) => (
                <div key={title} className="group flex gap-4 rounded-[26px] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur transition hover:-translate-y-1 hover:shadow-xl">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white transition group-hover:bg-blue-600">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-base font-black text-slate-950">{title}</span>
                    <span className="mt-1 block text-sm leading-6 text-slate-600">{description}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-slide-in-right">
            <div className="relative">
              <div className="absolute -inset-5 rounded-[38px] bg-gradient-to-br from-blue-500/12 via-white to-teal-500/12 blur-2xl" />
              <div className="relative">
                <HostSignupForm />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="rounded-[24px] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
                <BarChart3 className="mb-3 h-5 w-5 text-blue-600" />
                <p className="text-sm font-black text-slate-950">Performance ready</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Revenue, occupancy, response time, and rating surfaces.</p>
              </div>
              <div className="rounded-[24px] border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur">
                <Star className="mb-3 h-5 w-5 text-amber-500" />
                <p className="text-sm font-black text-slate-950">Trust focused</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Verification and guest reviews are part of the setup path.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
