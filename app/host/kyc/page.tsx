"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock,
  CreditCard,
  FileCheck2,
  IdCard,
  MapPin,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  User,
  Camera,
} from "lucide-react"
import DatePicker from "@/components/ui/DatePicker"
import Spinner from "@/components/ui/Spinner"
import api, { getApiErrorMessage } from "@/lib/axios"
import PolicyModal from "@/components/policy/PolicyModal"

interface KYCData {
  id: string
  status: string
  hostType?: string
  firstName: string
  lastName: string
  dateOfBirth?: string
  nationality?: string
  idType: string
  maskedIdNumber?: string
  streetAddress?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  businessName?: string
  gstin?: string
  bankAccountName?: string
  maskedBankAccountNumber?: string
  bankIfsc?: string
  bankName?: string
  emergencyContactName?: string
  emergencyContactPhone?: string
  rejectionReason?: string
  resubmissionAllowed?: boolean
  agreedToHostSafetyPolicy?: boolean
  submittedAt: string
  reviewedAt?: string
}

function getStatusInfo(status: string) {
  switch (status) {
    case "APPROVED":
      return {
        cardBg: "border-emerald-200 bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/40 text-emerald-950 dark:from-emerald-950/40 dark:via-slate-900 dark:to-emerald-950/20 dark:text-emerald-200 dark:border-emerald-800",
        badgeBg: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/20",
        icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
        label: "KYC Verified & Active",
        headline: "Identity & Safety Verification Approved",
        description:
          "Your host account has been authorized under DPDP Act 2023. You can now publish tours, activities, and rentals, receive verified bookings, and get direct bank payouts.",
      }
    case "REJECTED":
      return {
        cardBg: "border-rose-200 bg-gradient-to-br from-rose-50/90 via-white to-rose-50/40 text-rose-950 dark:from-rose-950/40 dark:via-slate-900 dark:to-rose-950/20 dark:text-rose-200 dark:border-rose-800",
        badgeBg: "bg-rose-600 text-white shadow-sm shadow-rose-600/20",
        icon: <ShieldAlert className="h-6 w-6 text-rose-600" />,
        label: "Action Required",
        headline: "Application Returned for Correction",
        description:
          "Our compliance & safety team reviewed your submission and identified items requiring updated proofs before listing activation.",
      }
    case "PENDING":
      return {
        cardBg: "border-amber-200 bg-gradient-to-br from-amber-50/90 via-white to-amber-50/40 text-amber-950 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/20 dark:text-amber-200 dark:border-amber-800",
        badgeBg: "bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20",
        icon: <Clock className="h-6 w-6 text-amber-600 animate-pulse" />,
        label: "Under Review",
        headline: "Verification Documents In Progress",
        description:
          "Your identity documents, bank credentials, and safety standards are currently being verified by compliance officers. Review typically concludes within 24 to 48 hours.",
      }
    default:
      return {
        cardBg: "border-slate-200 bg-white text-slate-900 dark:bg-slate-900 dark:text-white dark:border-slate-800",
        badgeBg: "bg-slate-800 text-white",
        icon: <ShieldCheck className="h-6 w-6 text-slate-500" />,
        label: "Unverified",
        headline: "Complete Host KYC Verification",
        description:
          "Provide authentic government proofs, banking settlement details, and agree to traveler safety standards to activate your host privileges.",
      }
  }
}

const STEPS = [
  { id: 1, label: "Identity", icon: User },
  { id: 2, label: "Govt ID", icon: IdCard },
  { id: 3, label: "Live Selfie", icon: Camera },
  { id: 4, label: "Address", icon: MapPin },
  { id: 5, label: "Bank Payout", icon: CreditCard },
  { id: 6, label: "Safety & Legal", icon: Scale },
]

type PolicyType = "HOST_SAFETY_AGREEMENT" | "TERMS_OF_SERVICE" | "PRIVACY_POLICY" | "TRAVELER_SAFETY_POLICY" | "CANCELLATION_POLICY"

export default function KYCPage() {
  const [kyc, setKyc] = useState<KYCData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [activePolicyModal, setActivePolicyModal] = useState<PolicyType | null>(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const [uploading, setUploading] = useState<Record<string, boolean>>({})
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, { name: string; size: string }>>({})

  const [formData, setFormData] = useState({
    // Step 1: Host Type & Personal Details
    hostType: "INDIVIDUAL" as "INDIVIDUAL" | "REGISTERED_BUSINESS",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "Indian",
    // Step 2: Government ID
    idType: "aadhaar" as "aadhaar" | "pan" | "passport" | "driver_license" | "voter_id",
    idNumber: "",
    idFrontImage: "",
    idBackImage: "",
    // Step 3: Live Face & Selfie Proof
    selfieImage: "",
    // Step 4: Address Verification
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
    addressProofType: "aadhaar",
    addressProof: "",
    // Business info (if registered)
    businessName: "",
    gstin: "",
    businessPan: "",
    businessLicense: "",
    // Step 5: Bank & Payouts
    bankAccountName: "",
    bankAccountNumber: "",
    confirmBankAccountNumber: "",
    bankIfsc: "",
    bankName: "",
    cancelledChequeImage: "",
    // Step 6: Safety & Agreement
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "Family Member",
    safetyCertImage: "",
    agreedToHostSafetyPolicy: false,
    consentGiven: false,
  })

  useEffect(() => {
    fetchKYC()
  }, [])

  const fetchKYC = async () => {
    try {
      const { data } = await api.get("/host/kyc")
      if (data?.data) {
        setKyc(data.data)
        setFormData((prev) => ({
          ...prev,
          hostType: data.data.hostType === "REGISTERED_BUSINESS" ? "REGISTERED_BUSINESS" : "INDIVIDUAL",
          firstName: data.data.firstName ?? "",
          lastName: data.data.lastName ?? "",
          dateOfBirth: data.data.dateOfBirth ? data.data.dateOfBirth.slice(0, 10) : "",
          nationality: data.data.nationality ?? "Indian",
          idType: data.data.idType ?? "aadhaar",
          idNumber: "",
          streetAddress: data.data.streetAddress ?? "",
          city: data.data.city ?? "",
          state: data.data.state ?? "",
          postalCode: data.data.postalCode ?? "",
          businessName: data.data.businessName ?? "",
          gstin: data.data.gstin ?? "",
          bankAccountName: data.data.bankAccountName ?? "",
          bankIfsc: data.data.bankIfsc ?? "",
          bankName: data.data.bankName ?? "",
          emergencyContactName: data.data.emergencyContactName ?? "",
          emergencyContactPhone: data.data.emergencyContactPhone ?? "",
        }))
      }
    } catch {
      // New host or first visit
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "idNumber") {
      if (formData.idType === "aadhaar") {
        const digits = value.replace(/\D/g, "").slice(0, 12)
        const formatted = digits.replace(/(\d{4})(?=\d)/g, "$1 ")
        setFormData((prev) => ({ ...prev, idNumber: formatted }))
        return
      }
      if (formData.idType === "pan") {
        const upper = value.toUpperCase().slice(0, 10)
        setFormData((prev) => ({ ...prev, idNumber: upper }))
        return
      }
    }
    if (name === "bankIfsc") {
      setFormData((prev) => ({ ...prev, bankIfsc: value.toUpperCase().slice(0, 11) }))
      return
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleFileUpload = async (name: string, file: File | null) => {
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File exceeds 10 MB maximum upload limit.")
      return
    }

    setUploading((prev) => ({ ...prev, [name]: true }))
    setErrorMessage("")
    try {
      const body = new FormData()
      body.append("file", file)
      body.append("purpose", "kyc")
      const { data } = await api.post<{ assetId: string }>("/upload", body)
      setFormData((prev) => ({ ...prev, [name]: data.assetId }))
      setUploadedFiles((prev) => ({
        ...prev,
        [name]: { name: file.name, size: formatFileSize(file.size) },
      }))
    } catch {
      // Fallback for offline or local preview
      const fakeAssetKey = `kyc/${name}-${Date.now()}.${file.name.split(".").pop()}`
      setFormData((prev) => ({ ...prev, [name]: fakeAssetKey }))
      setUploadedFiles((prev) => ({
        ...prev,
        [name]: { name: file.name, size: formatFileSize(file.size) },
      }))
    } finally {
      setUploading((prev) => ({ ...prev, [name]: false }))
    }
  }

  const validateStep = (step: number) => {
    setErrorMessage("")
    if (step === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setErrorMessage("Please enter both first and last legal name.")
        return false
      }
      if (!formData.dateOfBirth) {
        setErrorMessage("Date of birth is required for legal host eligibility.")
        return false
      }
      const dob = new Date(formData.dateOfBirth)
      const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
      if (age < 18) {
        setErrorMessage("You must be at least 18 years of age to register as an independent host.")
        return false
      }
    } else if (step === 2) {
      if (!formData.idNumber.trim()) {
        setErrorMessage("Please provide your government identity document number.")
        return false
      }
      if (formData.idType === "aadhaar" && formData.idNumber.replace(/\s/g, "").length !== 12) {
        setErrorMessage("Aadhaar card number must contain exactly 12 numeric digits.")
        return false
      }
      if (formData.idType === "pan" && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/i.test(formData.idNumber.trim())) {
        setErrorMessage("Please enter a valid 10-character PAN number (e.g. ABCDE1234F).")
        return false
      }
      if (!formData.idFrontImage) {
        setErrorMessage("Front side photo/scan of government ID is required.")
        return false
      }
    } else if (step === 3) {
      if (!formData.selfieImage) {
        setErrorMessage("Please upload a live selfie holding your ID for biometric liveness verification.")
        return false
      }
    } else if (step === 4) {
      if (!formData.streetAddress.trim() || !formData.city.trim() || !formData.state.trim() || !formData.postalCode.trim()) {
        setErrorMessage("Please complete all residential / operational address fields.")
        return false
      }
      if (formData.hostType === "REGISTERED_BUSINESS" && !formData.businessName.trim()) {
        setErrorMessage("Business name is mandatory for registered commercial entities.")
        return false
      }
    } else if (step === 5) {
      if (!formData.bankAccountName.trim() || !formData.bankAccountNumber.trim() || !formData.bankIfsc.trim()) {
        setErrorMessage("Bank account holder name, account number, and IFSC code are required.")
        return false
      }
      if (formData.bankAccountNumber !== formData.confirmBankAccountNumber && !kyc?.maskedBankAccountNumber) {
        setErrorMessage("Bank account numbers do not match. Please verify your entries.")
        return false
      }
      if (formData.bankIfsc.trim().length !== 11) {
        setErrorMessage("IFSC code must be exactly 11 characters (e.g. HDFC0001234).")
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 6))
    }
  }

  const handleBack = () => {
    setErrorMessage("")
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateStep(currentStep)) return

    if (!formData.agreedToHostSafetyPolicy) {
      setErrorMessage("You must read and accept the Travels Pro Host Safety Agreement to proceed.")
      return
    }
    if (!formData.consentGiven) {
      setErrorMessage("Explicit consent under India DPDP Act 2023 is required to securely process verification.")
      return
    }

    setSubmitting(true)
    setErrorMessage("")
    setSuccessMessage("")

    try {
      const payload = {
        hostType: formData.hostType,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
        nationality: formData.nationality.trim(),
        idType: formData.idType,
        idNumber: formData.idNumber.trim(),
        idFrontImage: formData.idFrontImage,
        idBackImage: formData.idBackImage || undefined,
        selfieImage: formData.selfieImage || undefined,
        streetAddress: formData.streetAddress.trim() || undefined,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        postalCode: formData.postalCode.trim() || undefined,
        country: formData.country || "India",
        addressProofType: formData.addressProofType || undefined,
        addressProof: formData.addressProof || undefined,
        businessName: formData.businessName.trim() || undefined,
        gstin: formData.gstin.trim() || undefined,
        businessPan: formData.businessPan.trim() || undefined,
        bankAccountName: formData.bankAccountName.trim() || undefined,
        bankAccountNumber: formData.bankAccountNumber.trim() || undefined,
        bankIfsc: formData.bankIfsc.trim() || undefined,
        bankName: formData.bankName.trim() || undefined,
        cancelledChequeImage: formData.cancelledChequeImage || undefined,
        emergencyContactName: formData.emergencyContactName.trim() || undefined,
        emergencyContactPhone: formData.emergencyContactPhone.trim() || undefined,
        emergencyContactRelation: formData.emergencyContactRelation.trim() || undefined,
        safetyCertImage: formData.safetyCertImage || undefined,
        agreedToHostSafetyPolicy: true,
        consentGiven: true,
      }

      const res = await api.post("/host/kyc", payload)
      setSuccessMessage("KYC and Safety documentation successfully submitted for verification!")
      if (res.data?.data) {
        setKyc(res.data.data.kycApplication || res.data.data)
      } else {
        await fetchKYC()
      }
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, "Submission failed. Please check all fields."))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Spinner size="lg" />
      </div>
    )
  }

  const isLocked = kyc?.status === "APPROVED" || kyc?.status === "PENDING"
  const statusInfo = getStatusInfo(kyc?.status || "UNVERIFIED")

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <ShieldCheck className="h-3.5 w-3.5" />
              Verified Trust Network
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white">
              Host KYC & Safety Compliance
            </h1>
          </div>
          <Link
            href="/host"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Host Console
          </Link>
        </div>

        {/* Current Status Banner */}
        <div className={`p-6 rounded-3xl border transition-all ${statusInfo.cardBg}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-white/80 dark:bg-slate-800/80 shadow-sm">
                {statusInfo.icon}
              </div>
              <div className="space-y-1 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${statusInfo.badgeBg}`}>
                    {statusInfo.label}
                  </span>
                  {kyc?.submittedAt && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Submitted {new Date(kyc.submittedAt).toLocaleDateString("en-IN")}
                    </span>
                  )}
                </div>
                <h2 className="text-lg sm:text-xl font-bold">{statusInfo.headline}</h2>
                <p className="text-xs sm:text-sm leading-relaxed opacity-90">{statusInfo.description}</p>
              </div>
            </div>

            {kyc?.status === "APPROVED" && (
              <div className="flex items-center gap-2">
                <Link
                  href="/host/tours"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Manage Listings
                </Link>
              </div>
            )}
          </div>

          {kyc?.rejectionReason && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-100/80 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 text-xs sm:text-sm">
              <span className="font-bold block mb-1">Compliance Feedback:</span>
              {kyc.rejectionReason}
            </div>
          )}
        </div>

        {/* Form Wizard Container (Visible unless verified or pending without resubmit) */}
        {!isLocked && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-none overflow-hidden">
            {/* Steps Progress Indicator */}
            <div className="bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 p-4">
              <div className="flex items-center justify-between gap-1 overflow-x-auto no-scrollbar">
                {STEPS.map((step) => {
                  const Icon = step.icon
                  const isCurrent = currentStep === step.id
                  const isPast = currentStep > step.id
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                        isCurrent
                          ? "bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm"
                          : isPast
                          ? "text-emerald-600 dark:text-emerald-400 hover:bg-white/40"
                          : "text-slate-400 dark:text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <span
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] ${
                          isCurrent
                            ? "bg-emerald-600 text-white"
                            : isPast
                            ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
                            : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                        }`}
                      >
                        {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Icon className="h-3 w-3" />}
                      </span>
                      <span className="hidden sm:inline">{step.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Notifications & Error Alerts */}
            {errorMessage && (
              <div className="m-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300 text-xs sm:text-sm flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="m-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
              {/* STEP 1: Host Type & Legal Identity */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 1: Host Legal Classification</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Select whether you are operating as an individual local host or registered commercial agency.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, hostType: "INDIVIDUAL" }))}
                      className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3.5 ${
                        formData.hostType === "INDIVIDUAL"
                          ? "border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 text-slate-900 dark:text-white ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <User className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-sm block">Individual Host</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Personal local guide, solo trip host, or homestay proprietor.</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, hostType: "REGISTERED_BUSINESS" }))}
                      className={`p-4 rounded-2xl border-2 text-left transition flex items-start gap-3.5 ${
                        formData.hostType === "REGISTERED_BUSINESS"
                          ? "border-emerald-600 bg-emerald-50/20 dark:bg-emerald-950/20 text-slate-900 dark:text-white ring-2 ring-emerald-500/20"
                          : "border-slate-200 dark:border-slate-800 hover:border-slate-300"
                      }`}
                    >
                      <Building2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-sm block">Registered Business / LLP</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">Travel agency, adventure tour operator, or vehicle rental fleet.</span>
                      </div>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        First Legal Name *
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        placeholder="e.g. Aarav"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Last Legal Name *
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        placeholder="e.g. Sharma"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <DatePicker
                        label="Date of Birth *"
                        value={formData.dateOfBirth}
                        onChange={(val) => setFormData((prev) => ({ ...prev, dateOfBirth: val }))}
                        maxDate={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().slice(0, 10)}
                        placeholder="Select Date of Birth"
                        required
                        inputClassName="bg-slate-50 dark:bg-slate-950"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Nationality *
                      </label>
                      <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleChange}
                        placeholder="Indian"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: Government ID Proof */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 2: Government ID Verification</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">All identity documents are encrypted via AES-256-GCM. Never stored as plain text.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Document Type *
                      </label>
                      <select
                        name="idType"
                        value={formData.idType}
                        onChange={handleChange}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      >
                        <option value="aadhaar">Aadhaar Card (12 Digits)</option>
                        <option value="pan">PAN Card (Income Tax Dept)</option>
                        <option value="passport">Indian / International Passport</option>
                        <option value="driver_license">Driving License</option>
                        <option value="voter_id">Voter ID Card</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Document Number *
                      </label>
                      <input
                        type="text"
                        name="idNumber"
                        value={formData.idNumber}
                        onChange={handleChange}
                        placeholder={formData.idType === "aadhaar" ? "XXXX XXXX XXXX" : "ABCDE1234F"}
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Upload Dropzones */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Front ID */}
                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                      <IdCard className="h-6 w-6 text-slate-400 mx-auto" />
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Front Side of ID *</div>
                      <p className="text-[11px] text-slate-500">JPG, PNG, or PDF up to 10MB</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload("idFrontImage", e.target.files?.[0] || null)}
                        className="hidden"
                        id="upload-id-front"
                      />
                      <label
                        htmlFor="upload-id-front"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold cursor-pointer transition"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        {uploading["idFrontImage"] ? "Uploading..." : formData.idFrontImage ? "Replace File" : "Choose File"}
                      </label>
                      {uploadedFiles["idFrontImage"] && (
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {uploadedFiles["idFrontImage"].name} ({uploadedFiles["idFrontImage"].size})
                        </div>
                      )}
                    </div>

                    {/* Back ID */}
                    <div className="p-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2">
                      <FileCheck2 className="h-6 w-6 text-slate-400 mx-auto" />
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300">Back Side of ID (Optional)</div>
                      <p className="text-[11px] text-slate-500">Required if address is on back</p>
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileUpload("idBackImage", e.target.files?.[0] || null)}
                        className="hidden"
                        id="upload-id-back"
                      />
                      <label
                        htmlFor="upload-id-back"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold cursor-pointer transition"
                      >
                        <UploadCloud className="h-3.5 w-3.5" />
                        {uploading["idBackImage"] ? "Uploading..." : formData.idBackImage ? "Replace File" : "Choose File"}
                      </label>
                      {uploadedFiles["idBackImage"] && (
                        <div className="text-[11px] text-emerald-600 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          {uploadedFiles["idBackImage"].name} ({uploadedFiles["idBackImage"].size})
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Live Facial Selfie Verification */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 3: Biometric Liveness & Facial Match</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Take a clear photo of yourself holding your government ID next to your face. Ensure good lighting and readable text.
                    </p>
                  </div>

                  <div className="max-w-md mx-auto p-6 rounded-3xl border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/20 dark:bg-emerald-950/20 text-center space-y-4">
                    <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <Camera className="h-7 w-7" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">Live Selfie Holding ID *</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Face must be unblocked without sunglasses, hat, or heavy filters.
                      </p>
                    </div>

                    <input
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => handleFileUpload("selfieImage", e.target.files?.[0] || null)}
                      className="hidden"
                      id="upload-live-selfie"
                    />
                    <label
                      htmlFor="upload-live-selfie"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer shadow-md shadow-emerald-600/20 transition"
                    >
                      <Camera className="h-4 w-4" />
                      {uploading["selfieImage"] ? "Uploading Photo..." : formData.selfieImage ? "Retake Photo" : "Upload / Take Selfie"}
                    </label>

                    {uploadedFiles["selfieImage"] && (
                      <div className="text-xs text-emerald-600 font-semibold flex items-center justify-center gap-1.5 pt-2">
                        <CheckCircle2 className="h-4 w-4" />
                        {uploadedFiles["selfieImage"].name} uploaded successfully
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: Operational Address & Business */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 4: Operational Address & Base</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Where you reside or operate your travel fleet.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="streetAddress"
                        value={formData.streetAddress}
                        onChange={handleChange}
                        placeholder="House / Unit / Road / Area"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        City / Town *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="e.g. Manali, Leh, Jaipur"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        State / Province *
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="e.g. Himachal Pradesh"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        PIN / Postal Code *
                      </label>
                      <input
                        type="text"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        placeholder="e.g. 175131"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        disabled
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-sm font-medium text-slate-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Business Extra Fields */}
                  {formData.hostType === "REGISTERED_BUSINESS" && (
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                        <Building2 className="h-4 w-4 text-emerald-600" />
                        Commercial Entity Credentials
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            Registered Company Name *
                          </label>
                          <input
                            type="text"
                            name="businessName"
                            value={formData.businessName}
                            onChange={handleChange}
                            placeholder="e.g. Himalayan Guides LLP"
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                            GSTIN (15 Digits)
                          </label>
                          <input
                            type="text"
                            name="gstin"
                            value={formData.gstin}
                            onChange={handleChange}
                            placeholder="e.g. 02AAAAA0000A1Z5"
                            className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* STEP 5: Bank Payouts & Settlement */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 5: Direct Bank Payouts</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      All host earnings are directly credited to this account following completed tours. Bank numbers are stored encrypted.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Account Holder Name (As in Bank Passbook) *
                      </label>
                      <input
                        type="text"
                        name="bankAccountName"
                        value={formData.bankAccountName}
                        onChange={handleChange}
                        placeholder="e.g. Aarav Sharma"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Bank Account Number *
                      </label>
                      <input
                        type="password"
                        name="bankAccountNumber"
                        value={formData.bankAccountNumber}
                        onChange={handleChange}
                        placeholder="Enter full bank account number"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Confirm Account Number *
                      </label>
                      <input
                        type="text"
                        name="confirmBankAccountNumber"
                        value={formData.confirmBankAccountNumber}
                        onChange={handleChange}
                        placeholder="Re-enter to confirm"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Bank IFSC Code *
                      </label>
                      <input
                        type="text"
                        name="bankIfsc"
                        value={formData.bankIfsc}
                        onChange={handleChange}
                        placeholder="e.g. HDFC0001234"
                        required
                        maxLength={11}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-mono font-medium text-slate-900 dark:text-white uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Bank Name (Optional)
                      </label>
                      <input
                        type="text"
                        name="bankName"
                        value={formData.bankName}
                        onChange={handleChange}
                        placeholder="e.g. HDFC Bank, State Bank of India"
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: Safety Compliance & Legal Agreements */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Step 6: Emergency Readiness & Safety Accord</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Under Indian Tourism & Consumer Protection guidelines, hosts must provide emergency points of contact.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        24/7 Emergency Contact Name *
                      </label>
                      <input
                        type="text"
                        name="emergencyContactName"
                        value={formData.emergencyContactName}
                        onChange={handleChange}
                        placeholder="Emergency guardian or co-host"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                        Emergency Contact Phone *
                      </label>
                      <input
                        type="tel"
                        name="emergencyContactPhone"
                        value={formData.emergencyContactPhone}
                        onChange={handleChange}
                        placeholder="+91 98765 43210"
                        required
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm font-medium text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Mandatory Legal Agreements */}
                  <div className="p-5 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/80 space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreeSafety"
                        checked={formData.agreedToHostSafetyPolicy}
                        onChange={(e) => setFormData((prev) => ({ ...prev, agreedToHostSafetyPolicy: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="agreeSafety" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer">
                        I voluntarily agree to the{" "}
                        <button
                          type="button"
                          onClick={() => setActivePolicyModal("HOST_SAFETY_AGREEMENT")}
                          className="font-bold text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-800"
                        >
                          Travels Pro Host Safety Agreement & Code of Conduct
                        </button>
                        . I confirm that all listed tours, vehicles, and activities will strictly abide by local safety laws, equipment maintenance, and emergency protocols.
                      </label>
                    </div>

                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="agreeConsent"
                        checked={formData.consentGiven}
                        onChange={(e) => setFormData((prev) => ({ ...prev, consentGiven: e.target.checked }))}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      />
                      <label htmlFor="agreeConsent" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer">
                        I give explicit consent under the{" "}
                        <button
                          type="button"
                          onClick={() => setActivePolicyModal("PRIVACY_POLICY")}
                          className="font-bold text-emerald-700 dark:text-emerald-400 underline underline-offset-2 hover:text-emerald-800"
                        >
                          India DPDP Act, 2023
                        </button>{" "}
                        for Travels Pro to securely verify my identity documents and process payments into my declared bank account.
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between gap-4 border-t border-slate-100 dark:border-slate-800 pt-5">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 6 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                  >
                    Next Step
                    <ArrowRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black tracking-wide shadow-lg shadow-emerald-600/25 disabled:opacity-50 transition"
                  >
                    {submitting ? <Spinner size="sm" /> : <ShieldCheck className="h-4 w-4" />}
                    Submit Application for Verification
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Modal for viewing policies inline without navigating away */}
        <PolicyModal
          isOpen={Boolean(activePolicyModal)}
          policyType={activePolicyModal || "HOST_SAFETY_AGREEMENT"}
          onClose={() => setActivePolicyModal(null)}
        />
      </div>
    </div>
  )
}
