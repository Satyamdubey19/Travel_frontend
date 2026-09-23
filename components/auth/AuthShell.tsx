"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, Map, ShieldCheck, Sparkles, Users } from "lucide-react"
import BrandMark from "@/components/ui/BrandMark"

const principles = [
  {
    icon: ShieldCheck,
    title: "Verified hosts only",
    text: "Every host completes identity, background, and trip safety checks.",
  },
  {
    icon: Users,
    title: "Trip Circles",
    text: "Coordinate safely with verified co-travelers and hosts before departure.",
  },
  {
    icon: Map,
    title: "Curated India wedges",
    text: "Small-group treks, local trails, and authentic regional culture.",
  },
]

export default function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <main className="cinematic-noise relative min-h-screen overflow-hidden bg-[#060814] text-white">
      {/* Atmospheric lighting */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(124,58,237,0.32),transparent_35%),radial-gradient(circle_at_85%_15%,rgba(6,182,212,0.22),transparent_30%),linear-gradient(145deg,#050713_0%,#0e1229_48%,#060815_100%)]" />
      <div className="travel-grid pointer-events-none absolute inset-0 opacity-20" />

      {/* Floating glow orbs */}
      <motion.div
        animate={{ x: [0, 24, 0], y: [0, -28, 0], opacity: [0.12, 0.22, 0.12] }}
        transition={{ repeat: Infinity, duration: 14, ease: "easeInOut" }}
        className="pointer-events-none absolute -left-20 top-1/3 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 25, 0], opacity: [0.15, 0.28, 0.15] }}
        transition={{ repeat: Infinity, duration: 16, ease: "easeInOut" }}
        className="pointer-events-none absolute -right-20 top-2/3 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl"
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1540px] flex-col justify-between px-4 py-5 sm:px-8 sm:py-8 lg:px-12 lg:py-10 xl:px-16">
        {/* Top Global Header Bar */}
        <motion.header
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center justify-between pb-6 sm:pb-8"
        >
          <BrandMark inverted />
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-white/85 backdrop-blur-xl transition duration-300 hover:border-cyan-400/40 hover:bg-white/12 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            <span className="hidden sm:inline">Explore Marketplace</span>
            <span className="sm:hidden">Explore</span>
          </Link>
        </motion.header>

        {/* Center Grid: Left Showcase & Right Floating Luxury Card */}
        <div className="grid flex-1 items-center gap-8 py-4 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12 xl:grid-cols-[1.2fr_0.8fr] xl:gap-16">
          {/* Left Hero Brand Experience */}
          <section className="flex flex-col justify-center text-left">
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex w-fit items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-1.5 text-[11px] font-black uppercase tracking-[0.24em] text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.2)] backdrop-blur-2xl"
            >
              <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
              {eyebrow}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 text-3xl font-extrabold leading-[1.08] tracking-[-0.035em] text-white sm:text-4xl lg:text-5xl xl:text-[3.5rem]"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base sm:leading-7"
            >
              {description}
            </motion.p>

            {/* Core Value Principles (Desktop) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 hidden gap-3.5 lg:grid lg:max-w-2xl lg:grid-cols-3"
            >
              {principles.map(({ icon: Icon, title: itemTitle, text }, index) => (
                <motion.div
                  key={itemTitle}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.35 + index * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl transition duration-300 hover:border-cyan-300/40 hover:bg-white/[0.08] hover:shadow-[0_12px_24px_rgba(0,0,0,0.4)]"
                >
                  <div className="absolute -right-6 -top-6 h-16 w-16 rounded-full bg-cyan-500/10 blur-xl transition duration-500 group-hover:bg-cyan-400/20" />
                  <span className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-cyan-300 transition duration-300 group-hover:scale-105 group-hover:border-cyan-300/40 group-hover:bg-cyan-500/20">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <p className="text-xs font-bold tracking-tight text-white">{itemTitle}</p>
                  <p className="mt-1 text-[11px] leading-4 text-white/55">{text}</p>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Right Floating Elevated Luxury Card Container */}
          <section className="flex items-center justify-center py-4 sm:py-6">
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.55, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-[480px]"
            >
              {/* Dynamic glowing halo behind the card */}
              <div className="pointer-events-none absolute -inset-3 rounded-[40px] bg-gradient-to-br from-cyan-500/25 via-violet-600/25 to-pink-500/20 blur-2xl opacity-70" />

              {/* Elevated Frosted Card */}
              <div className="relative rounded-[28px] sm:rounded-[36px] border border-white/40 bg-white/[0.97] p-6 sm:p-9 text-slate-950 shadow-[0_25px_65px_-15px_rgba(0,0,0,0.65),0_0_1px_1px_rgba(255,255,255,0.8)] backdrop-blur-2xl">
                {children}
              </div>
            </motion.div>
          </section>
        </div>

        {/* Bottom Trust & Compliance Bar */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs font-semibold text-white/50"
        >
          <div className="flex flex-wrap items-center gap-6">
            <span className="flex items-center gap-1.5 text-white/70">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              100% Verified Local Hosts
            </span>
            <span className="flex items-center gap-1.5 text-white/70">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
              RBI &amp; Razorpay Compliant Payments
            </span>
          </div>
          <span className="text-white/40">Travels Pro India Edition · DPDP Compliant</span>
        </motion.footer>
      </div>
    </main>
  )
}
