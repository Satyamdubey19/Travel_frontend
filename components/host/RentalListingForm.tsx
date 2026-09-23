"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Car, CheckCircle2, ImageIcon, Loader2, ShieldCheck } from "lucide-react"
import api, { getApiErrorMessage } from "@/lib/axios"
import PolicyModal from "@/components/policy/PolicyModal"

type FormState = {
  slug: string; title: string; vehicleType: string; brand: string; model: string; year: string; city: string; state: string; country: string; pickupArea: string
  totalUnits: string; availableUnits: string; image: string; pricePerDay: string; originalPrice: string; cancellationPolicy: string
  transmission: string; fuelType: string; seats: string; engine: string; rangeKm: string; deposit: string; features: string; documentsRequired: string
}

const initial: FormState = { slug: "", title: "", vehicleType: "CAR", brand: "", model: "", year: "", city: "", state: "", country: "India", pickupArea: "", totalUnits: "1", availableUnits: "1", image: "", pricePerDay: "", originalPrice: "", cancellationPolicy: "", transmission: "MANUAL", fuelType: "PETROL", seats: "5", engine: "", rangeKm: "0", deposit: "0", features: "", documentsRequired: "Driving licence, Government ID" }

function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }

export default function RentalListingForm({ rentalId }: { rentalId?: string }) {
  const router = useRouter()
  const [form, setForm] = useState(initial)
  const [loading, setLoading] = useState(Boolean(rentalId))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")
  const [safetyAgreementAgreed, setSafetyAgreementAgreed] = useState(true)
  const [activePolicyModal, setActivePolicyModal] = useState<null | "HOST_SAFETY_AGREEMENT">(null)

  useEffect(() => {
    if (!rentalId) return
    void api.get(`/rental/${rentalId}?scope=mine`).then(({ data }) => {
      const item = data.data
      setForm({
        slug: item.slug ?? "", title: item.title ?? "", vehicleType: item.vehicleType ?? "CAR", brand: item.brand ?? "", model: item.model ?? "", year: item.year ?? "", city: item.city ?? "", state: item.state ?? "", country: item.country ?? "India", pickupArea: item.pickupArea ?? "", totalUnits: item.totalUnits ?? "1", availableUnits: item.availableUnits ?? "1", image: item.images?.[0] ?? item.imageUrl ?? "", pricePerDay: item.pricePerDay ?? "", originalPrice: item.originalPrice ?? "", cancellationPolicy: item.cancellationPolicy ?? "", transmission: item.transmission ?? "MANUAL", fuelType: item.fuelType ?? "PETROL", seats: item.seats ?? "5", engine: item.engine ?? "", rangeKm: item.rangeKm ?? "0", deposit: item.deposit ?? "0", features: (item.features ?? []).join(", "), documentsRequired: (item.documentsRequired ?? []).join(", "),
      })
    }).catch((error) => setMessage(getApiErrorMessage(error, "Rental could not be loaded"))).finally(() => setLoading(false))
  }, [rentalId])

  const update = (key: keyof FormState, value: string) => setForm((current) => ({ ...current, [key]: value, ...(key === "title" && !rentalId ? { slug: slugify(value) } : {}) }))
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!safetyAgreementAgreed) {
      setMessage("You must accept the Host Safety Agreement and Vehicle Standards to publish a rental.")
      return
    }
    setSaving(true); setMessage("")
    const payload = { ...form, images: [form.image.trim()].filter(Boolean), features: form.features.split(",").map((value) => value.trim()).filter(Boolean), documentsRequired: form.documentsRequired.split(",").map((value) => value.trim()).filter(Boolean), year: form.year || undefined, originalPrice: form.originalPrice || undefined, engine: form.engine || undefined }
    try {
      if (rentalId) await api.put(`/rental/${rentalId}`, payload)
      else await api.post("/rental", payload)
      router.push("/host/rentals")
      router.refresh()
    } catch (error) { setMessage(getApiErrorMessage(error, "Rental could not be submitted")) }
    finally { setSaving(false) }
  }

  if (loading) return <div className="grid min-h-[60vh] place-items-center"><Loader2 className="size-8 animate-spin text-cyan-600" /></div>
  const field = (key: keyof FormState, label: string, type = "text", placeholder = "") => <label className="block text-sm font-bold text-slate-700">{label}<input type={type} value={form[key]} onChange={(event) => update(key, event.target.value)} placeholder={placeholder} required={!['model','year','state','originalPrice','engine'].includes(key)} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 font-medium outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100" /></label>

  return <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,.12),transparent_30%),#f8fafc] p-4 sm:p-7"><form onSubmit={submit} className="mx-auto max-w-5xl space-y-6">
    <header className="rounded-[2rem] bg-slate-950 p-7 text-white shadow-2xl"><p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.2em] text-cyan-300"><Car className="size-4" />Rental studio</p><h1 className="mt-3 text-3xl font-black">{rentalId ? "Edit and resubmit rental" : "Create a verified rental listing"}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300">Every save enters moderation. Travelers see the listing only after admin approval, host verification and safety terms are complete.</p></header>
    <section className="rounded-[2rem] border border-white bg-white/85 p-6 shadow-xl shadow-slate-200/50 backdrop-blur-xl sm:p-8"><h2 className="text-xl font-black">Vehicle identity</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">{field("title","Listing title","text","Mahindra Thar for Goa trails")}{field("slug","Public URL slug","text","goa-thar-rental")}{field("brand","Brand")}{field("model","Model (optional)")}{field("year","Year (optional)","number")}<label className="text-sm font-bold text-slate-700">Vehicle type<select value={form.vehicleType} onChange={(e) => update("vehicleType", e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4"><option>CAR</option><option>SUV</option><option>BIKE</option><option>SCOOTER</option></select></label></div></section>
    <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-[2rem] bg-white/85 p-6 shadow-sm"><h2 className="text-xl font-black">Pickup & inventory</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">{field("city","City")}{field("state","State (optional)")}{field("country","Country")}{field("pickupArea","Pickup area")}{field("totalUnits","Fleet units","number")}{field("availableUnits","Units available","number")}</div></div><div className="rounded-[2rem] bg-white/85 p-6 shadow-sm"><h2 className="text-xl font-black">Price & security</h2><div className="mt-5 grid gap-5 sm:grid-cols-2">{field("pricePerDay","Price per day (₹)","number")}{field("originalPrice","Original price (optional)","number")}{field("deposit","Security deposit (₹)","number")}{field("rangeKm","Included/range km","number")}</div></div></section>
    <section className="rounded-[2rem] bg-white/85 p-6 shadow-sm"><h2 className="text-xl font-black">Specifications</h2><div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"><label className="text-sm font-bold text-slate-700">Transmission<select value={form.transmission} onChange={(e) => update("transmission", e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4"><option>MANUAL</option><option>AUTOMATIC</option></select></label><label className="text-sm font-bold text-slate-700">Fuel<select value={form.fuelType} onChange={(e) => update("fuelType", e.target.value)} className="mt-2 h-12 w-full rounded-2xl border border-slate-200 px-4">{["PETROL","DIESEL","ELECTRIC","CNG","HYBRID"].map((value)=><option key={value}>{value}</option>)}</select></label>{field("seats","Seats","number")}{field("engine","Engine (optional)")}</div></section>
    <section className="rounded-[2rem] bg-white/85 p-6 shadow-sm"><h2 className="flex items-center gap-2 text-xl font-black"><ImageIcon className="text-cyan-600" />Traveler-facing proof</h2><div className="mt-5 space-y-5">{field("image","Vehicle image URL","url","https://...")}<label className="block text-sm font-bold text-slate-700">Features (comma separated)<textarea value={form.features} onChange={(e)=>update("features",e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 p-4" placeholder="Roadside support, Two helmets, Sanitized cabin" /></label><label className="block text-sm font-bold text-slate-700">Documents required (comma separated)<textarea value={form.documentsRequired} onChange={(e)=>update("documentsRequired",e.target.value)} rows={3} className="mt-2 w-full rounded-2xl border border-slate-200 p-4" /></label><label className="block text-sm font-bold text-slate-700">Cancellation policy<textarea required minLength={20} maxLength={2000} value={form.cancellationPolicy} onChange={(e)=>update("cancellationPolicy",e.target.value)} rows={5} className="mt-2 w-full rounded-2xl border border-slate-200 p-4" placeholder="State deadlines, deductions, no-show rules and host cancellation handling clearly." /></label></div></section>
    {message && <p role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700">{message}</p>}
    <div className="rounded-[1.75rem] border border-cyan-200 bg-cyan-50/70 p-5 text-cyan-950 shadow-xs">
      <div className="flex items-center gap-2 font-bold text-sm">
        <ShieldCheck className="size-5 text-cyan-700" />
        Vehicle Fitness, Insurance & Safety Standard
      </div>
      <p className="mt-2 text-xs leading-relaxed text-cyan-900">
        By offering vehicles on Travels Pro, you certify that all vehicles hold valid registration certificates (RC), valid commercial or comprehensive insurance, and comply with state motor vehicles guidelines and pre-delivery inspection protocols under the DPDP Act 2023.
      </p>
      <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-xs font-semibold">
        <input
          type="checkbox"
          checked={safetyAgreementAgreed}
          onChange={(e) => setSafetyAgreementAgreed(e.target.checked)}
          className="mt-0.5 size-4 accent-cyan-700 rounded cursor-pointer"
        />
        <span>
          I agree to the{" "}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setActivePolicyModal("HOST_SAFETY_AGREEMENT")
            }}
            className="font-bold underline text-cyan-800 hover:text-cyan-950"
          >
            Host Safety Agreement
          </button>{" "}
          and verify vehicle fitness and statutory road compliance.
        </span>
      </label>
    </div>

    <div className="flex flex-col gap-3 rounded-[2rem] border border-cyan-100 bg-cyan-50 p-5 sm:flex-row sm:items-center sm:justify-between"><p className="flex items-center gap-2 text-sm font-semibold text-cyan-950"><ShieldCheck className="size-5" />Saving sends this version to moderation and removes any previous approval.</p><button disabled={saving || !safetyAgreementAgreed} className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 font-black text-white disabled:opacity-50 disabled:cursor-not-allowed">{saving ? <Loader2 className="size-5 animate-spin" /> : <CheckCircle2 className="size-5" />}{saving ? "Submitting…" : "Submit for review"}</button></div>
  </form>
    <PolicyModal
      isOpen={Boolean(activePolicyModal)}
      policyType={activePolicyModal || "HOST_SAFETY_AGREEMENT"}
      onClose={() => setActivePolicyModal(null)}
    />
  </div>
}
