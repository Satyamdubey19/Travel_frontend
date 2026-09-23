"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ShieldCheck,
  Scale,
  FileText,
  Users,
  Building2,
  Calendar,
  Sparkles,
  ArrowLeft,
  Printer,
  CheckCircle2,
} from "lucide-react"
import api from "@/lib/axios"

interface PolicyData {
  id: string
  type: string
  title: string
  version: string
  summary: string | null
  content: string
  effectiveDate: string
}

const TABS = [
  { id: "TERMS_OF_SERVICE", label: "Terms of Service", icon: Scale, description: "Marketplace terms, booking contracts, and liability limits" },
  { id: "PRIVACY_POLICY", label: "Privacy Policy", icon: ShieldCheck, description: "DPDP Act 2023 compliance, data rights, and encryption" },
  { id: "HOST_SAFETY_AGREEMENT", label: "Host Safety Agreement", icon: Building2, description: "Host obligations, safety standards, and KYC requirements" },
  { id: "TRAVELER_SAFETY_POLICY", label: "Traveler Safety Guidelines", icon: Users, description: "Traveler conduct, substance rules, and emergency guidelines" },
  { id: "CANCELLATION_POLICY", label: "Cancellation & Refunds", icon: FileText, description: "Transparent refund schedules, tiers, and force majeure" },
]

const FALLBACK_POLICIES: Record<string, PolicyData> = {
  TERMS_OF_SERVICE: {
    id: "tos-fallback",
    type: "TERMS_OF_SERVICE",
    title: "Terms of Service & Platform User Agreement",
    version: "1.0",
    summary: "Binding agreement governing marketplace use, booking transactions, and liability limitations.",
    effectiveDate: "2026-04-01T00:00:00.000Z",
    content: `# 1. Acceptance of Terms
By accessing or using the Travels Pro marketplace (the "Platform"), you agree to be bound by these Terms of Service and all incorporated policies.

# 2. Marketplace Role
Travels Pro operates as an online marketplace technology provider facilitating direct contracts between Travelers and verified independent Hosts. Travels Pro is not an operator or common carrier unless explicitly designated in writing.

# 3. Booking & Payment Execution
All booking payments are processed securely through certified PCI-DSS Level 1 payment partners. Payouts to Hosts are executed strictly following safety custody holding periods after trip commencement.

# 4. Dispute Resolution
Any dispute arising out of or in connection with this agreement shall be governed by the laws of India, subject to arbitration in accordance with the Arbitration and Conciliation Act, 1996.`,
  },
  PRIVACY_POLICY: {
    id: "privacy-fallback",
    type: "PRIVACY_POLICY",
    title: "Privacy Policy & DPDP Act 2023 Compliance",
    version: "1.0",
    summary: "Our commitment to data protection under the Digital Personal Data Protection Act, 2023.",
    effectiveDate: "2026-04-01T00:00:00.000Z",
    content: `# 1. Legislative Compliance
Travels Pro complies with the Digital Personal Data Protection Act, 2023 (DPDP Act) of India and applicable global standards.

# 2. Data We Collect
We collect personal information necessary to fulfill verified bookings, perform host KYC compliance, and ensure passenger physical safety.

# 3. End-to-End Encryption
Sensitive financial credentials and national identity documents are encrypted at rest using industry standard AES-256-GCM algorithms.

# 4. Your Rights
You possess the statutory right to access your stored data, request rectification of inaccurate records, or demand erasure subject to mandatory tax retention.`,
  },
  HOST_SAFETY_AGREEMENT: {
    id: "host-safety-fallback",
    type: "HOST_SAFETY_AGREEMENT",
    title: "Host Safety Agreement & Operational Standards",
    version: "1.0",
    summary: "Mandatory safety verification, licensing, and traveler protection standards for hosts.",
    effectiveDate: "2026-04-01T00:00:00.000Z",
    content: `# 1. Verification & Identity Authenticity
All Hosts must successfully complete identity authentication, local address verification, and payout authorization prior to listing tours or vehicles.

# 2. Safety Equipment & Emergency Preparedness
Hosts conducting high-altitude expeditions, water activities, or motor rentals must maintain certified safety equipment, first-aid resources, and emergency protocol documentation.

# 3. Zero Tolerance for Harassment
Travels Pro maintains a zero-tolerance policy against physical, verbal, or discriminatory harassment. Violations result in immediate suspension.`,
  },
  TRAVELER_SAFETY_POLICY: {
    id: "traveler-safety-fallback",
    type: "TRAVELER_SAFETY_POLICY",
    title: "Traveler Safety Guidelines & Code of Conduct",
    version: "1.0",
    summary: "Guidelines ensuring safe, respectful, and responsible participation for travelers.",
    effectiveDate: "2026-04-01T00:00:00.000Z",
    content: `# 1. Physical Fitness & Medical Disclosure
Travelers must review itinerary difficulty ratings and disclose pertinent medical conditions to Hosts prior to high-risk excursions.

# 2. Adherence to Guide Directives
For the safety of the entire group, travelers must follow instructions issued by certified guides regarding trails, weather shelters, and equipment.

# 3. Environmental Stewardship
Travelers must practice "Leave No Trace" ethics, respect wildlife, and honor local cultural customs.`,
  },
  CANCELLATION_POLICY: {
    id: "cancellation-fallback",
    type: "CANCELLATION_POLICY",
    title: "Standard Cancellation & Refund Policy",
    version: "1.0",
    summary: "Transparent cancellation tiers, refund timelines, and force majeure weather exemptions.",
    effectiveDate: "2026-04-01T00:00:00.000Z",
    content: `# 1. Standard Cancellation Tiers
- **More than 48 hours prior to start**: 100% refund of booking amount minus standard transaction gateway charges.
- **Between 24 and 48 hours prior to start**: 50% refund.
- **Less than 24 hours or No-Show**: Non-refundable.

# 2. Host-Initiated Cancellations
If a host cancels an authorized booking, the traveler receives an immediate 100% refund with full booking assistance.

# 3. Weather Emergencies & Force Majeure
Severe weather advisories or road blockages verified by local authorities qualify for full refund or free rescheduling.`,
  },
}

export default function TermsAndPoliciesPage() {
  const [policies, setPolicies] = useState<Record<string, PolicyData>>(FALLBACK_POLICIES)
  const [selectedType, setSelectedType] = useState("TERMS_OF_SERVICE")

  useEffect(() => {
    let ignore = false
    void api
      .get<{ data?: { policies?: PolicyData[] } }>("/policies/active")
      .then((res) => {
        if (!ignore && res.data?.data?.policies && Array.isArray(res.data.data.policies)) {
          const map: Record<string, PolicyData> = { ...FALLBACK_POLICIES }
          for (const p of res.data.data.policies) {
            map[p.type] = p
          }
          setPolicies(map)
        }
      })
      .catch(() => {
        // Use fallback policies seamlessly
      })
    return () => {
      ignore = true
    }
  }, [])

  const currentPolicy = policies[selectedType] || FALLBACK_POLICIES[selectedType]

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Travels Pro
          </Link>
          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-medium border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="h-3.5 w-3.5" />
              DPDP Act 2023 Verified
            </span>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1 hover:text-slate-800 dark:hover:text-white transition"
              title="Print Policy"
            >
              <Printer className="h-3.5 w-3.5" />
              Print
            </button>
          </div>
        </div>

        {/* Hero Title */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold tracking-wide uppercase">
            <Sparkles className="h-3.5 w-3.5" />
            Legal & Trust Framework
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-950 dark:text-white">
            Policies, Terms & Safety Standards
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
            Transparent legal safeguards for travelers, certified hosts, and marketplace partners across India and abroad.
          </p>
        </div>

        {/* Policy Tab Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 bg-slate-200/60 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
          {TABS.map((tab) => {
            const Icon = tab.icon
            const isSelected = selectedType === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedType(tab.id)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl text-xs font-bold transition-all text-center gap-1.5 ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm shadow-slate-200/50 dark:shadow-none"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/40"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-emerald-600 dark:text-emerald-400" : "text-slate-400"}`} />
                <span className="line-clamp-1">{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Selected Policy Content Card */}
        {currentPolicy && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none p-6 sm:p-10 space-y-8">
            {/* Document Meta Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400 text-xs font-bold font-mono">
                    Version {currentPolicy.version}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    Effective: {new Date(currentPolicy.effectiveDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white pt-1">
                  {currentPolicy.title}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Active Policy
                </span>
              </div>
            </div>

            {/* Executive Summary Callout */}
            {currentPolicy.summary && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex items-start gap-3.5 text-emerald-950 dark:text-emerald-200">
                <Sparkles className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-sm font-medium leading-relaxed">
                  <span className="font-bold block text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-0.5">
                    Executive Summary
                  </span>
                  {currentPolicy.summary}
                </div>
              </div>
            )}

            {/* Document Body */}
            <div className="prose prose-slate dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed space-y-6">
              {currentPolicy.content.split("\n\n").map((section, idx) => {
                if (section.startsWith("# ")) {
                  return (
                    <h3 key={idx} className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white pt-3 border-t border-slate-100 dark:border-slate-800">
                      {section.replace("# ", "")}
                    </h3>
                  )
                }
                if (section.startsWith("## ")) {
                  return (
                    <h4 key={idx} className="text-base sm:text-lg font-bold text-slate-900 dark:text-white pt-2">
                      {section.replace("## ", "")}
                    </h4>
                  )
                }
                return (
                  <p key={idx} className="text-slate-700 dark:text-slate-300 whitespace-pre-line">
                    {section}
                  </p>
                )
              })}
            </div>

            {/* Consent & Audit Trail Footer Notice */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <p>
                Platform user consent is cryptographically recorded with timestamp and IP address under Indian Information Technology Act, 2000 & DPDP Act 2023.
              </p>
              <div className="flex items-center gap-4">
                <Link href="/privacy" className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2">
                  Privacy Policy
                </Link>
                <Link href="/host/kyc" className="hover:text-emerald-600 dark:hover:text-emerald-400 underline underline-offset-2">
                  Host Verification
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
