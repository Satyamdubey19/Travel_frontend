"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  CircleDollarSign,
  Compass,
  MapPin,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react"
import HostSignupForm from "@/components/auth/HostSignupForm"
import BrandMark from "@/components/ui/BrandMark"

const hostBenefits = [
  {
    title: "Server-approved access",
    description: "Host Studio unlocks only after strict identity, document, and safety verification.",
    icon: ShieldCheck,
    tag: "Security First",
  },
  {
    title: "Real-time booking desk",
    description: "Manage guest rosters, group capacities, meeting points, and trip chats in one place.",
    icon: CalendarCheck,
    tag: "Operations",
  },
  {
    title: "Instant RBI-compliant payouts",
    description: "Settlements route securely to your verified Indian bank account after trip completion.",
    icon: CircleDollarSign,
    tag: "Fast Settlement",
  },
]

const steps = [
  { step: "01", title: "Create account", detail: "Single profile for hosting and exploring" },
  { step: "02", title: "Verify identity", detail: "AES-256 encrypted Aadhaar / Passport KYC" },
  { step: "03", title: "Host Studio live", detail: "Publish trips and welcome travelers" },
]

export default function HostSignupPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#070a18] text-white">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_85%_20%,rgba(16,185,129,0.18),transparent_32%),linear-gradient(160deg,#060917_0%,#0c1229_45%,#070a1a_100%)]" />
      <div className="travel-grid pointer-events-none absolute inset-0 opacity-15" />

      <motion.div
        animate={{ x: [0, 30, 0], y: [0, -30, 0], opacity: [0.15, 0.28, 0.15] }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-28 top-1/4 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -25, 0], y: [0, 35, 0], opacity: [0.12, 0.24, 0.12] }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-24 top-2/3 h-96 w-96 rounded-full bg-emerald-600/20 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-6 sm:px-6 lg:px-12">
        {/* Navigation Bar */}
        <motion.nav
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between py-2"
        >
          <BrandMark inverted />
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-white/70 transition hover:text-white"
            >
              Explore Tours
            </Link>
            <Link
              href="/login?intent=host&callbackUrl=/host"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl transition duration-300 hover:border-blue-400 hover:bg-white/15"
            >
              Sign In To Host
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.nav>

        {/* Main Content Layout */}
        <section className="grid flex-1 items-center gap-12 py-10 lg:grid-cols-[1.12fr_0.88fr] lg:py-14">
          {/* Left Column - Host Pitch & Values */}
          <div>
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-blue-300 backdrop-blur-xl shadow-[0_0_20px_rgba(59,130,246,0.2)]"
            >
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              Verified Host Network · India Edition
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              Turn regional insight into journeys travellers{" "}
              <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                never forget.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-2xl text-base leading-7 text-white/70 sm:text-lg"
            >
              From Spiti Valley high passes to Chettinad heritage culinary walks, lead authentic experiences on India&apos;s verified host marketplace. Retain operational control with server-verified traveler lists, automated deposits, and zero upfront platform charges.
            </motion.p>

            {/* Step Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.25 }}
              className="mt-9 grid gap-3.5 sm:grid-cols-3"
            >
              {steps.map(({ step, title, detail }) => (
                <div
                  key={title}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4.5 backdrop-blur-xl transition duration-300 hover:border-blue-400/40 hover:bg-white/[0.08]"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-blue-400">{step}</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400/60 transition group-hover:text-emerald-400" />
                  </div>
                  <p className="mt-2 text-sm font-bold text-white">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/55">{detail}</p>
                </div>
              ))}
            </motion.div>

            {/* Benefits List */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.32 }}
              className="mt-8 space-y-3.5"
            >
              {hostBenefits.map(({ title, description, icon: Icon, tag }) => (
                <div
                  key={title}
                  className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-xl transition duration-300 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-blue-300 transition duration-300 group-hover:scale-105 group-hover:border-blue-400/50 group-hover:bg-blue-500/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{title}</span>
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-bold text-white/60">
                        {tag}
                      </span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/60">{description}</p>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Trust Assurance Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-8 flex flex-wrap items-center gap-6 border-t border-white/10 pt-5 text-xs font-semibold text-white/50"
            >
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-emerald-400" />
                24/7 Incident Escalation Desk
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-cyan-400" />
                Pan-India Local Guide Network
              </span>
              <span className="flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-amber-400" />
                Curated Travel Wedges
              </span>
            </motion.div>
          </div>

          {/* Right Column - Form Container */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.55, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <div className="relative">
              <div className="absolute -inset-2 rounded-[34px] bg-gradient-to-br from-blue-500/20 via-teal-500/10 to-purple-600/20 blur-xl" />
              <div className="relative">
                <HostSignupForm />
              </div>
            </div>

            {/* Micro Highlights */}
            <div className="mt-5 grid grid-cols-2 gap-3.5">
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <BarChart3 className="mb-2 h-4 w-4 text-blue-400" />
                <p className="text-xs font-bold text-white">Live Analytics</p>
                <p className="mt-1 text-[11px] leading-4 text-white/50">Occupancy rates, waitlists, and revenue trends in real time.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                <Star className="mb-2 h-4 w-4 text-amber-400" />
                <p className="text-xs font-bold text-white">Verified Reviews</p>
                <p className="mt-1 text-[11px] leading-4 text-white/50">Only travelers who completed departures can leave guest ratings.</p>
              </div>
            </div>
          </motion.div>
        </section>
      </div>
    </main>
  )
}
