"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle2, ChevronDown, Clock, FileText, ShieldCheck, Upload, User } from "lucide-react"
import Spinner from "@/components/ui/Spinner"
import api from "@/lib/axios"

interface KYCData {
  id: string
  status: string
  firstName: string
  lastName: string
  idType: string
  idNumber?: string
  rejectionReason?: string
  submittedAt: string
  reviewedAt?: string
}

function getStatusColor(status: string) {
  switch (status) {
    case "APPROVED": return { bg: "bg-emerald-50 border-emerald-200", text: "text-emerald-800", icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" /> }
    case "REJECTED": return { bg: "bg-red-50 border-red-200", text: "text-red-800", icon: <AlertTriangle className="h-5 w-5 text-red-600" /> }
    case "PENDING": return { bg: "bg-amber-50 border-amber-200", text: "text-amber-800", icon: <Clock className="h-5 w-5 text-amber-600" /> }
    default: return { bg: "bg-slate-50 border-slate-200", text: "text-slate-800", icon: <ShieldCheck className="h-5 w-5 text-slate-500" /> }
  }
}

export default function KYCPage() {
  const [kyc, setKyc] = useState<KYCData | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    nationality: "",
    idType: "passport",
    idNumber: "",
    idFrontImage: "",
    idBackImage: "",
    addressProof: "",
    businessLicense: "",
    taxCertificate: "",
  })

  useEffect(() => {
    fetchKYC()
  }, [])

  const fetchKYC = async () => {
    try {
      const { data } = await api.get("/host/kyc")
      setKyc(data.kyc)
      if (data.kyc) {
        setFormData(prev => ({
          ...prev,
          firstName: data.kyc.firstName,
          lastName: data.kyc.lastName,
          idType: data.kyc.idType,
          idNumber: data.kyc.idNumber,
        }))
      }
    } catch (error) {
      console.error("Error fetching KYC:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target
    if (files?.[0]) {
      const reader = new FileReader()
      reader.onload = () => {
        setFormData(prev => ({ ...prev, [name]: reader.result as string }))
      }
      reader.readAsDataURL(files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      await api.post("/host/kyc", formData)
      void fetchKYC()
    } catch (error) {
      console.error("Error submitting KYC:", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <Spinner minimal />

  const statusStyle = kyc ? getStatusColor(kyc.status) : null
  const isApproved = kyc?.status === "APPROVED"

  const inputClass = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-950 focus:border-sky-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-100 transition"
  const fileClass = "block w-full text-sm text-slate-500 file:mr-3 file:rounded-xl file:border-0 file:bg-slate-950 file:px-4 file:py-2 file:text-xs file:font-black file:text-white hover:file:bg-blue-700 file:transition"
  const labelClass = "mb-2 block text-sm font-bold text-slate-700"
  const sectionHeadingClass = "flex items-center gap-3 mb-6"

  return (
    <div className="mx-auto max-w-3xl space-y-6">

      {/* Status banner */}
      {kyc && statusStyle && (
        <div className={`flex items-start gap-4 rounded-[24px] border p-5 ${statusStyle.bg}`}>
          <span className="mt-0.5 shrink-0">{statusStyle.icon}</span>
          <div className="min-w-0 flex-1">
            <p className={`text-sm font-black ${statusStyle.text}`}>
              {kyc.status === "APPROVED" && "Verification approved — you can receive bookings and payouts."}
              {kyc.status === "PENDING" && "Application under review — we will notify you once a decision is made."}
              {kyc.status === "REJECTED" && `Application rejected${kyc.rejectionReason ? `: ${kyc.rejectionReason}` : ". Please resubmit with correct documents."}`}
            </p>
            <p className={`mt-1 text-xs ${statusStyle.text} opacity-70`}>Submitted {new Date(kyc.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Personal info */}
        <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div className={sectionHeadingClass}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <User className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-blue-600">Step 1</p>
              <h2 className="text-lg font-black text-slate-950">Personal information</h2>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>First name <span className="text-red-400">*</span></label>
              <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required className={inputClass} placeholder="John" />
            </div>
            <div>
              <label className={labelClass}>Last name <span className="text-red-400">*</span></label>
              <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required className={inputClass} placeholder="Doe" />
            </div>
            <div>
              <label className={labelClass}>Date of birth <span className="text-red-400">*</span></label>
              <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nationality <span className="text-red-400">*</span></label>
              <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} required className={inputClass} placeholder="Indian" />
            </div>
          </div>
        </div>

        {/* Identity verification */}
        <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div className={sectionHeadingClass}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-emerald-600">Step 2</p>
              <h2 className="text-lg font-black text-slate-950">Identity verification</h2>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>ID type <span className="text-red-400">*</span></label>
              <div className="relative">
                <select name="idType" value={formData.idType} onChange={handleChange} className={inputClass + " appearance-none pr-9"}>
                  <option value="passport">Passport</option>
                  <option value="driver_license">Driver License</option>
                  <option value="national_id">National ID</option>
                  <option value="visa">Visa</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div>
              <label className={labelClass}>ID number <span className="text-red-400">*</span></label>
              <input type="text" name="idNumber" value={formData.idNumber} onChange={handleChange} required className={inputClass} placeholder="A1234567" />
            </div>
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>ID front image <span className="text-red-400">*</span></label>
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50/50">
                <input type="file" name="idFrontImage" accept="image/*" onChange={handleFileChange} className={fileClass} />
                {!formData.idFrontImage && <p className="mt-2 text-xs text-slate-400">JPG, PNG up to 5MB</p>}
                {formData.idFrontImage && <p className="mt-2 text-xs font-bold text-emerald-600">✓ Image selected</p>}
              </div>
            </div>
            <div>
              <label className={labelClass}>ID back image <span className="text-red-400">*</span></label>
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50/50">
                <input type="file" name="idBackImage" accept="image/*" onChange={handleFileChange} className={fileClass} />
                {!formData.idBackImage && <p className="mt-2 text-xs text-slate-400">JPG, PNG up to 5MB</p>}
                {formData.idBackImage && <p className="mt-2 text-xs font-bold text-emerald-600">✓ Image selected</p>}
              </div>
            </div>
          </div>
          <div className="mt-5">
            <label className={labelClass}>Address proof</label>
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50/50">
              <input type="file" name="addressProof" accept="image/*,application/pdf" onChange={handleFileChange} className={fileClass} />
              {!formData.addressProof && <p className="mt-2 text-xs text-slate-400">Utility bill, bank statement, etc.</p>}
              {formData.addressProof && <p className="mt-2 text-xs font-bold text-emerald-600">✓ Document selected</p>}
            </div>
          </div>
        </div>

        {/* Business documents */}
        <div className="rounded-[28px] border border-slate-200/70 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div className={sectionHeadingClass}>
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-violet-600">Step 3</p>
              <h2 className="text-lg font-black text-slate-950">Business documents</h2>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Business license</label>
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50/50">
                <input type="file" name="businessLicense" accept="image/*,application/pdf" onChange={handleFileChange} className={fileClass} />
                {!formData.businessLicense && <p className="mt-2 text-xs text-slate-400">PDF or image</p>}
                {formData.businessLicense && <p className="mt-2 text-xs font-bold text-emerald-600">✓ Document selected</p>}
              </div>
            </div>
            <div>
              <label className={labelClass}>Tax certificate</label>
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4 transition hover:border-sky-300 hover:bg-sky-50/50">
                <input type="file" name="taxCertificate" accept="image/*,application/pdf" onChange={handleFileChange} className={fileClass} />
                {!formData.taxCertificate && <p className="mt-2 text-xs text-slate-400">PDF or image</p>}
                {formData.taxCertificate && <p className="mt-2 text-xs font-bold text-emerald-600">✓ Document selected</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || isApproved}
          className="flex w-full items-center justify-center gap-3 rounded-2xl bg-slate-950 px-6 py-4 text-sm font-black text-white shadow-lg shadow-slate-950/15 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:pointer-events-none disabled:opacity-50"
        >
          {isApproved ? (
            <><CheckCircle2 className="h-5 w-5" /> KYC Verified</>
          ) : submitting ? (
            <><Upload className="h-5 w-5 animate-spin" /> Submitting…</>
          ) : (
            <><Upload className="h-5 w-5" /> Submit KYC application</>
          )}
        </button>
      </form>
    </div>
  )
}
