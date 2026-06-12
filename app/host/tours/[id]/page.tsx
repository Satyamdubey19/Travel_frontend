"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertCircle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock,
  Copy,
  Eye,
  Globe2,
  GripVertical,
  ImageIcon,
  IndianRupee,
  Languages,
  MapPin,
  Mountain,
  Plus,
  Save,
  ShieldCheck,
  Sparkles,
  Tag,
  Trash2,
  Users,
  X,
} from "lucide-react"
import PhotoUploader from "@/components/ui/PhotoUploader"
import type { ItineraryDay, TourForm } from "@/types/host-forms"
import api, { getApiErrorMessage } from "@/lib/axios"

type FieldErrors = Record<string, string>
type Toast = { type: "success" | "error"; message: string } | null

const inputCls = "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
const labelCls = "mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500"
const helpCls = "mt-1.5 text-xs leading-5 text-slate-500"

const sectionLinks = [
  { id: "basics", title: "Basics", icon: Tag },
  { id: "location", title: "Location", icon: MapPin },
  { id: "schedule", title: "Schedule", icon: CalendarDays },
  { id: "group", title: "Group", icon: Users },
  { id: "safety", title: "Safety", icon: ShieldCheck },
  { id: "pricing", title: "Pricing", icon: IndianRupee },
  { id: "content", title: "Content", icon: Sparkles },
  { id: "itinerary", title: "Itinerary", icon: Mountain },
  { id: "media", title: "Media", icon: ImageIcon },
  { id: "policies", title: "Policies", icon: CheckCircle2 },
]

const categoryOptions = ["Adventure", "Wellness", "Heritage", "Water", "Food", "Culture", "Nature", "Sports", "Spiritual", "Community"]
const languageOptions = ["English", "Hindi", "Tamil", "Bengali", "Marathi", "Telugu", "Kannada", "Malayalam", "French", "Spanish"]
const statusOptions = ["DRAFT", "PENDING_REVIEW", "PAUSED"]
const errorSectionByField: Record<string, string> = {
  title: "basics",
  slug: "basics",
  description: "basics",
  destination: "location",
  startDate: "schedule",
  endDate: "schedule",
  registrationDeadline: "schedule",
  totalSlots: "group",
  availableSlots: "group",
  pricePerPerson: "pricing",
  originalPrice: "pricing",
  images: "media",
  itinerary: "itinerary",
}

function makeItinerary(days: number): ItineraryDay[] {
  return Array.from({ length: days }, (_, index) => ({
    day: index + 1,
    title: "",
    description: "",
    activities: [""],
    meals: ["Breakfast"],
    stayNotes: "",
    travelNotes: "",
  }))
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

function daysBetween(start?: string, end?: string) {
  if (!start || !end) return 1
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)
  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return 1
  return Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / 86400000) + 1)
}

function splitCsv(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value
  return String(value || "").split(",").map((item) => item.trim()).filter(Boolean)
}

function toDateInput(value?: string | Date | null) {
  if (!value) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString().slice(0, 10)
}

function formatStatus(status: string) {
  return status.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase())
}

function SectionCard({
  id,
  title,
  eyebrow,
  icon,
  complete,
  children,
}: {
  id: string
  title: string
  eyebrow: string
  icon: React.ReactNode
  complete: boolean
  children: React.ReactNode
}) {
  return (
    <section id={id} className="scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
            {icon}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">{eyebrow}</p>
            <h2 className="mt-1 text-xl font-black tracking-tight text-slate-950">{title}</h2>
          </div>
        </div>
        <span className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${complete ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"}`}>
          {complete ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
          {complete ? "Complete" : "Needs info"}
        </span>
      </div>
      {children}
    </section>
  )
}

function FieldError({ error }: { error?: string }) {
  if (!error) return null
  return <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600"><AlertCircle className="h-3.5 w-3.5" />{error}</p>
}

function DynamicList({
  items,
  placeholder,
  onChange,
  onAdd,
  onRemove,
}: {
  items: string[]
  placeholder: string
  onChange: (index: number, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
}) {
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <GripVertical className="hidden h-4 w-4 shrink-0 text-slate-300 sm:block" />
          <input className={inputCls} value={item} placeholder={placeholder} onChange={(event) => onChange(index, event.target.value)} />
          {items.length > 1 ? (
            <button type="button" onClick={() => onRemove(index)} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-50 text-red-600 transition hover:bg-red-100" aria-label="Remove item">
              <Trash2 className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      ))}
      <button type="button" onClick={onAdd} className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-cyan-400 hover:bg-cyan-50 hover:text-cyan-800">
        <Plus className="h-4 w-4" />
        Add item
      </button>
    </div>
  )
}

function ToggleCard({
  checked,
  onChange,
  icon,
  title,
  description,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`group rounded-2xl border p-4 text-left shadow-sm transition hover:-translate-y-0.5 ${checked ? "border-cyan-300 bg-cyan-50 ring-4 ring-cyan-100" : "border-slate-200 bg-white hover:border-slate-300"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${checked ? "bg-cyan-700 text-white" : "bg-slate-100 text-slate-600"}`}>
          {icon}
        </div>
        <span className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-cyan-700" : "bg-slate-300"}`}>
          <span className={`absolute top-1 h-4 w-4 rounded-full bg-white transition ${checked ? "left-6" : "left-1"}`} />
        </span>
      </div>
      <h3 className="mt-4 text-sm font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
    </button>
  )
}

export default function HostTourForm() {
  const router = useRouter()
  const params = useParams()
  const tourId = params?.id as string
  const isEdit = !!tourId && tourId !== "new"
  const draftKey = `host-tour-draft-${tourId || "new"}`

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [dirty, setDirty] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast>(null)
  const [expandedDays, setExpandedDays] = useState<number[]>([1])
  const [errors, setErrors] = useState<FieldErrors>({})

  const [form, setForm] = useState<TourForm>({
    title: "",
    slug: "",
    description: "",
    category: "Adventure",
    tags: [],
    destination: "",
    city: "",
    state: "",
    country: "India",
    latitude: "",
    longitude: "",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    duration: "3",
    totalSlots: "15",
    availableSlots: "15",
    maxGroupSize: "15",
    joinApprovalRequired: false,
    womenOnly: false,
    safeForSoloWomen: false,
    verifiedTravelersOnly: false,
    pricePerPerson: "",
    originalPrice: "",
    difficulty: "MODERATE",
    languages: "English, Hindi",
    cancellationPolicy: "",
    status: "DRAFT",
    highlights: [""],
    included: ["Accommodation", "Meals", "Guide", "Local transport"],
    excluded: ["Flights", "Travel insurance"],
    images: [],
    itinerary: makeItinerary(3),
  })

  useEffect(() => {
    const cached = window.localStorage.getItem(draftKey)
    if (cached && !isEdit) {
      try {
        setForm((prev: TourForm) => ({ ...prev, ...JSON.parse(cached) }))
        setToast({ type: "success", message: "Draft restored from this browser." })
      } catch {
        window.localStorage.removeItem(draftKey)
      }
    }
  }, [draftKey, isEdit])

  useEffect(() => {
    if (isEdit) void fetchTour()
  }, [isEdit])

  useEffect(() => {
    if (!dirty) return
    const timer = window.setTimeout(() => {
      window.localStorage.setItem(draftKey, JSON.stringify(form))
      setLastSavedAt(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }))
    }, 700)
    return () => window.clearTimeout(timer)
  }, [dirty, draftKey, form])

  useEffect(() => {
    const handler = (event: BeforeUnloadEvent) => {
      if (!dirty) return
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [dirty])

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 3500)
    return () => window.clearTimeout(timer)
  }, [toast])

  const fetchTour = async () => {
    try {
      setLoading(true)
      const { data: payload } = await api.get(`/tour/${tourId}?scope=mine`)
      const { data } = payload
      setForm((prev: TourForm) => ({
        ...prev,
        ...data,
        startDate: toDateInput(data.startDate),
        endDate: toDateInput(data.endDate),
        registrationDeadline: toDateInput(data.registrationDeadline),
        tags: data.tags ?? [],
        joinApprovalRequired: Boolean(data.joinApprovalRequired),
        womenOnly: Boolean(data.womenOnly),
        safeForSoloWomen: Boolean(data.safeForSoloWomen),
        verifiedTravelersOnly: Boolean(data.verifiedTravelersOnly),
      }))
      setExpandedDays([1])
    } catch {
      setToast({ type: "error", message: "Could not load this tour." })
    } finally {
      setLoading(false)
    }
  }

  const set = (field: keyof TourForm, value: unknown) => {
    setDirty(true)
    setForm((prev: TourForm) => ({ ...prev, [field]: value }))
  }

  const updateArray = (field: "highlights" | "included" | "excluded" | "images" | "tags", index: number, value: string) => {
    const next = [...((form[field] as string[]) || [])]
    next[index] = value
    set(field, next)
  }

  const addArray = (field: "highlights" | "included" | "excluded" | "images" | "tags") => set(field, [...((form[field] as string[]) || []), ""])
  const removeArray = (field: "highlights" | "included" | "excluded" | "images" | "tags", index: number) => set(field, ((form[field] as string[]) || []).filter((_, itemIndex) => itemIndex !== index))

  const setDuration = (value: string) => {
    const days = Math.max(1, Math.min(45, parseInt(value) || 1))
    set("duration", String(days))
    const current = form.itinerary || []
    if (days > current.length) {
      set("itinerary", [...current, ...makeItinerary(days - current.length).map((day, index) => ({ ...day, day: current.length + index + 1 }))])
    } else {
      set("itinerary", current.slice(0, days).map((day: ItineraryDay, index: number) => ({ ...day, day: index + 1 })))
    }
  }

  const setScheduleDate = (field: "startDate" | "endDate" | "registrationDeadline", value: string) => {
    const next = { ...form, [field]: value }
    const duration = daysBetween(next.startDate, next.endDate)
    setDirty(true)
    setForm((prev: TourForm) => ({ ...prev, [field]: value, duration: String(duration) }))
    if (field === "startDate" || field === "endDate") {
      const current = form.itinerary || []
      if (duration > current.length) {
        setForm((prev: TourForm) => ({ ...prev, [field]: value, duration: String(duration), itinerary: [...current, ...makeItinerary(duration - current.length).map((day, index) => ({ ...day, day: current.length + index + 1 }))] }))
      } else {
        setForm((prev: TourForm) => ({ ...prev, [field]: value, duration: String(duration), itinerary: current.slice(0, duration).map((day: ItineraryDay, index: number) => ({ ...day, day: index + 1 })) }))
      }
    }
  }

  const updateItineraryDay = (dayIndex: number, patch: Partial<ItineraryDay>) => {
    const next = [...form.itinerary]
    next[dayIndex] = { ...next[dayIndex], ...patch }
    set("itinerary", next)
  }

  const updateItineraryList = (dayIndex: number, field: "activities" | "meals", itemIndex: number, value: string) => {
    const day = form.itinerary[dayIndex]
    const list = [...(day[field] || [])]
    list[itemIndex] = value
    updateItineraryDay(dayIndex, { [field]: list } as Partial<ItineraryDay>)
  }

  const moveDay = (index: number, direction: -1 | 1) => {
    const next = [...form.itinerary]
    const target = index + direction
    if (target < 0 || target >= next.length) return
    const current = next[index]
    next[index] = next[target]
    next[target] = current
    set("itinerary", next.map((day: ItineraryDay, dayIndex: number) => ({ ...day, day: dayIndex + 1 })))
  }

  const validate = () => {
    const next: FieldErrors = {}
    const totalSlots = Number(form.totalSlots) || 0
    const availableSlots = Number(form.availableSlots) || 0
    const price = Number(form.pricePerPerson) || 0
    const originalPrice = Number(form.originalPrice) || 0

    if (!form.title?.trim()) next.title = "Tour title is required."
    if (!form.slug?.trim()) next.slug = "Slug is required."
    if (!form.description?.trim() || form.description.trim().length < 40) next.description = "Write at least 40 characters."
    if (!form.destination?.trim()) next.destination = "Destination is required."
    if (!form.startDate) next.startDate = "Start date is required."
    if (!form.endDate) next.endDate = "End date is required."
    if (form.startDate && form.endDate && new Date(form.startDate) > new Date(form.endDate)) next.endDate = "End date must be after start date."
    if (form.registrationDeadline && form.startDate && new Date(form.registrationDeadline) >= new Date(form.startDate)) next.registrationDeadline = "Deadline must be before start date."
    if (totalSlots < 1) next.totalSlots = "Total slots must be at least 1."
    if (availableSlots > totalSlots) next.availableSlots = "Available slots cannot exceed total slots."
    if (price <= 0) next.pricePerPerson = "Price is required."
    if (originalPrice > 0 && originalPrice < price) next.originalPrice = "Original price must be greater than offer price."
    if (!form.images?.filter((url: string) => url.trim()).length) next.images = "Add at least one cover image."
    if (!form.itinerary?.length) next.itinerary = "Add at least one itinerary day."

    setErrors(next)
    return next
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    const validationErrors = validate()
    const firstErrorKey = Object.keys(validationErrors)[0]
    if (firstErrorKey) {
      const sectionId = errorSectionByField[firstErrorKey]
      if (sectionId) {
        window.history.replaceState(null, "", `#${sectionId}`)
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      setToast({ type: "error", message: validationErrors[firstErrorKey] || "Please fix highlighted fields before saving." })
      return
    }
    setSubmitting(true)
    try {
      const payload = {
        ...form,
        tags: (form.tags || []).filter(Boolean),
        availableSlots: String(Math.min(Number(form.availableSlots) || 0, Number(form.totalSlots) || 0)),
      }
      if (isEdit) {
        await api.put(`/tour/${tourId}`, payload)
      } else {
        await api.post("/tour", payload)
      }
      window.localStorage.removeItem(draftKey)
      setDirty(false)
      setToast({ type: "success", message: isEdit ? "Tour changes saved." : "Tour created and sent to review." })
      router.push("/host")
    } catch (error) {
      setToast({ type: "error", message: getApiErrorMessage(error, "Could not save tour.") })
    } finally {
      setSubmitting(false)
    }
  }

  const selectedLanguages = splitCsv(form.languages)
  const discount = useMemo(() => {
    const original = Number(form.originalPrice) || 0
    const price = Number(form.pricePerPerson) || 0
    if (!original || !price || original <= price) return 0
    return Math.round(((original - price) / original) * 100)
  }, [form.originalPrice, form.pricePerPerson])

  const completion = useMemo(() => {
    const values: Record<string, boolean> = {
      basics: Boolean(form.title && form.slug && form.description && form.category),
      location: Boolean(form.destination && form.city && form.country),
      schedule: Boolean(form.startDate && form.endDate && (!form.registrationDeadline || new Date(form.registrationDeadline) < new Date(form.startDate))),
      group: Number(form.totalSlots) > 0 && Number(form.availableSlots) <= Number(form.totalSlots),
      safety: true,
      pricing: Number(form.pricePerPerson) > 0 && (!form.originalPrice || Number(form.originalPrice) >= Number(form.pricePerPerson)),
      content: form.highlights?.filter(Boolean).length > 0 && form.included?.filter(Boolean).length > 0,
      itinerary: form.itinerary?.length > 0 && form.itinerary.every((day: ItineraryDay) => day.title || day.description),
      media: form.images?.filter((url: string) => url.trim()).length > 0,
      policies: Boolean(form.cancellationPolicy && form.status),
    }
    return values
  }, [form])

  const completedCount = Object.values(completion).filter(Boolean).length
  const progress = Math.round((completedCount / sectionLinks.length) * 100)

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <div className="h-96 animate-pulse rounded-2xl bg-slate-100" />
          <div className="space-y-5">
            {Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-48 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/70 pb-40">
      {toast ? (
        <div className={`fixed right-4 top-4 z-50 flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold shadow-xl ${toast.type === "success" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-800"}`}>
          {toast.type === "success" ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {toast.message}
        </div>
      ) : null}

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <Link href="/host" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-700">Host tour studio</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">{isEdit ? "Edit tour experience" : "Create tour experience"}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">Build a polished group tour listing with itinerary, safety controls, pricing, media, and review-ready details.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Completion</p>
                  <p className="mt-1 text-2xl font-black text-slate-950">{progress}%</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-50 text-sm font-black text-cyan-800 ring-8 ring-cyan-100">
                  {completedCount}/{sectionLinks.length}
                </div>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div className="h-full rounded-full bg-cyan-700 transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[280px_1fr] lg:px-8">
        <aside className="lg:sticky lg:top-6 lg:h-fit">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <div className="px-3 py-3">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Sections</p>
              <p className="mt-1 text-sm font-semibold text-slate-700">{completedCount} of {sectionLinks.length} complete</p>
            </div>
            <nav className="space-y-1">
              {sectionLinks.map((item) => {
                const Icon = item.icon
                return (
                  <a key={item.id} href={`#${item.id}`} className="flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                    <span className="flex items-center gap-3">
                      <Icon className="h-4 w-4 text-slate-400" />
                      {item.title}
                    </span>
                    {completion[item.id] ? <Check className="h-4 w-4 text-emerald-600" /> : <Circle className="h-3.5 w-3.5 text-slate-300" />}
                  </a>
                )
              })}
            </nav>
            <div className="mt-4 rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                <Clock className="h-4 w-4" />
                Draft
              </div>
              <p className="mt-2 text-sm text-slate-600">{dirty ? "Unsaved changes" : "All changes saved"}</p>
              {lastSavedAt ? <p className="mt-1 text-xs text-slate-500">Autosaved at {lastSavedAt}</p> : null}
            </div>
          </div>
        </aside>

        <main className="space-y-6 pb-36">
          {Object.keys(errors).length > 0 ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p>Please complete the required tour details.</p>
                  <p className="mt-1 text-xs font-medium text-red-700">{Object.values(errors)[0]}</p>
                </div>
              </div>
            </div>
          ) : null}

          <SectionCard id="basics" eyebrow="Identity" title="Tour Basics" icon={<Tag className="h-5 w-5" />} complete={completion.basics}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className={labelCls}>Tour title *</label>
                <input className={inputCls} value={form.title} placeholder="Manali to Leh community road trip" onChange={(event) => { set("title", event.target.value); if (!isEdit) set("slug", slugify(event.target.value)) }} />
                <FieldError error={errors.title} />
              </div>
              <div>
                <label className={labelCls}>Slug *</label>
                <input className={inputCls} value={form.slug} placeholder="manali-leh-community-road-trip" onChange={(event) => set("slug", slugify(event.target.value))} />
                <FieldError error={errors.slug} />
              </div>
              <div>
                <label className={labelCls}>Category</label>
                <div className="relative">
                  <select className={`${inputCls} appearance-none pr-10`} value={form.category} onChange={(event) => set("category", event.target.value)}>
                    {categoryOptions.map((category) => <option key={category}>{category}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Description *</label>
                <textarea className={inputCls} rows={5} value={form.description} placeholder="Describe the travel community, route, pace, safety arrangements, host style, and who this experience is best for." onChange={(event) => set("description", event.target.value)} />
                <FieldError error={errors.description} />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>Tags</label>
                <DynamicList items={form.tags || [""]} placeholder="solo friendly, backpacking, women only" onChange={(index, value) => updateArray("tags", index, value)} onAdd={() => addArray("tags")} onRemove={(index) => removeArray("tags", index)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="location" eyebrow="Destination" title="Map & Location" icon={<MapPin className="h-5 w-5" />} complete={completion.location}>
            <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Destination *</label>
                  <input className={inputCls} value={form.destination} placeholder="Manali to Leh via Jispa and Pangong" onChange={(event) => set("destination", event.target.value)} />
                  <FieldError error={errors.destination} />
                </div>
                <div>
                  <label className={labelCls}>City</label>
                  <input className={inputCls} value={form.city} placeholder="Manali" onChange={(event) => set("city", event.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>State</label>
                  <input className={inputCls} value={form.state} placeholder="Himachal Pradesh" onChange={(event) => set("state", event.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Country</label>
                  <input className={inputCls} value={form.country} placeholder="India" onChange={(event) => set("country", event.target.value)} />
                </div>
                <div>
                  <label className={labelCls}>Coordinates</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input className={inputCls} value={form.latitude} placeholder="Lat" onChange={(event) => set("latitude", event.target.value)} />
                    <input className={inputCls} value={form.longitude} placeholder="Lng" onChange={(event) => set("longitude", event.target.value)} />
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => { set("latitude", form.latitude || "32.2432"); set("longitude", form.longitude || "77.1892") }}
                className="relative min-h-72 overflow-hidden rounded-2xl border border-slate-200 bg-[linear-gradient(135deg,#ecfeff_0%,#f8fafc_45%,#e0f2fe_100%)] p-4 text-left shadow-inner"
              >
                <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(#94a3b8_1px,transparent_1px),linear-gradient(90deg,#94a3b8_1px,transparent_1px)] [background-size:34px_34px]" />
                <div className="relative flex h-full min-h-64 flex-col justify-between">
                  <div className="rounded-2xl bg-white/85 p-3 shadow-sm backdrop-blur">
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Map picker</p>
                    <p className="mt-1 text-sm font-semibold text-slate-800">Click to drop a starter pin, then refine coordinates.</p>
                  </div>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-cyan-700 text-white shadow-xl">
                    <MapPin className="h-7 w-7" />
                  </div>
                  <p className="relative rounded-2xl bg-slate-950/80 px-3 py-2 text-xs font-semibold text-white">{form.latitude || "32.2432"}, {form.longitude || "77.1892"}</p>
                </div>
              </button>
            </div>
          </SectionCard>

          <SectionCard id="schedule" eyebrow="Timing" title="Schedule & Registration" icon={<CalendarDays className="h-5 w-5" />} complete={completion.schedule}>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={labelCls}>Start date *</label>
                <input type="date" className={inputCls} value={form.startDate} onChange={(event) => setScheduleDate("startDate", event.target.value)} />
                <FieldError error={errors.startDate} />
              </div>
              <div>
                <label className={labelCls}>End date *</label>
                <input type="date" className={inputCls} value={form.endDate} onChange={(event) => setScheduleDate("endDate", event.target.value)} />
                <FieldError error={errors.endDate} />
              </div>
              <div>
                <label className={labelCls}>Registration deadline</label>
                <input type="date" className={inputCls} value={form.registrationDeadline} onChange={(event) => setScheduleDate("registrationDeadline", event.target.value)} />
                <FieldError error={errors.registrationDeadline} />
              </div>
              <div>
                <label className={labelCls}>Duration</label>
                <input type="number" min="1" max="45" className={inputCls} value={form.duration} onChange={(event) => setDuration(event.target.value)} />
                <p className={helpCls}>Auto-syncs itinerary days.</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="group" eyebrow="Community" title="Group Settings" icon={<Users className="h-5 w-5" />} complete={completion.group}>
            <div className="grid gap-5 sm:grid-cols-3">
              <div>
                <label className={labelCls}>Total slots</label>
                <input type="number" min="1" className={inputCls} value={form.totalSlots} onChange={(event) => { set("totalSlots", event.target.value); if (Number(form.availableSlots) > Number(event.target.value)) set("availableSlots", event.target.value) }} />
                <FieldError error={errors.totalSlots} />
              </div>
              <div>
                <label className={labelCls}>Available slots</label>
                <input type="number" min="0" max={Number(form.totalSlots) || undefined} className={inputCls} value={form.availableSlots} onChange={(event) => set("availableSlots", event.target.value)} />
                <FieldError error={errors.availableSlots} />
              </div>
              <div>
                <label className={labelCls}>Max group size</label>
                <input type="number" min="1" className={inputCls} value={form.maxGroupSize} onChange={(event) => set("maxGroupSize", event.target.value)} />
              </div>
            </div>
          </SectionCard>

          <SectionCard id="safety" eyebrow="Access" title="Traveler Safety & Access" icon={<ShieldCheck className="h-5 w-5" />} complete={completion.safety}>
            <div className="grid gap-4 sm:grid-cols-2">
              <ToggleCard checked={Boolean(form.womenOnly)} onChange={(value) => set("womenOnly", value)} icon={<ShieldCheck className="h-5 w-5" />} title="Women-only tour" description="Restrict participation to women travelers for safer community trips." />
              <ToggleCard checked={Boolean(form.safeForSoloWomen)} onChange={(value) => set("safeForSoloWomen", value)} icon={<CheckCircle2 className="h-5 w-5" />} title="Solo women safe" description="Mark the tour as suitable for solo women with verified safety planning." />
              <ToggleCard checked={Boolean(form.verifiedTravelersOnly)} onChange={(value) => set("verifiedTravelersOnly", value)} icon={<Eye className="h-5 w-5" />} title="Verified travelers only" description="Allow only travelers with completed verification or strong trust signals." />
              <ToggleCard checked={Boolean(form.joinApprovalRequired)} onChange={(value) => set("joinApprovalRequired", value)} icon={<Users className="h-5 w-5" />} title="Host approval required" description="Review each join request before a traveler can enter the group." />
            </div>
          </SectionCard>

          <SectionCard id="pricing" eyebrow="Commercials" title="Pricing" icon={<IndianRupee className="h-5 w-5" />} complete={completion.pricing}>
            <div className="grid gap-5 lg:grid-cols-[1fr_260px]">
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <label className={labelCls}>Price per person *</label>
                  <input type="number" min="0" className={inputCls} value={form.pricePerPerson} placeholder="12000" onChange={(event) => set("pricePerPerson", event.target.value)} />
                  <FieldError error={errors.pricePerPerson} />
                </div>
                <div>
                  <label className={labelCls}>Original price</label>
                  <input type="number" min="0" className={inputCls} value={form.originalPrice} placeholder="15000" onChange={(event) => set("originalPrice", event.target.value)} />
                  <FieldError error={errors.originalPrice} />
                </div>
                <div>
                  <label className={labelCls}>Difficulty</label>
                  <select className={`${inputCls} appearance-none`} value={form.difficulty} onChange={(event) => set("difficulty", event.target.value)}>
                    {["EASY", "MODERATE", "HARD", "EXPERT"].map((difficulty) => <option key={difficulty} value={difficulty}>{formatStatus(difficulty)}</option>)}
                  </select>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Price preview</p>
                <p className="mt-3 text-3xl font-black text-slate-950">INR {(Number(form.pricePerPerson) || 0).toLocaleString("en-IN")}</p>
                <p className="mt-1 text-sm font-semibold text-emerald-700">{discount > 0 ? `${discount}% discount shown to travelers` : "No discount preview"}</p>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="content" eyebrow="Story" title="Content, Inclusions & Languages" icon={<Languages className="h-5 w-5" />} complete={completion.content}>
            <div className="space-y-6">
              <div>
                <label className={labelCls}>Languages</label>
                <div className="flex flex-wrap gap-2">
                  {languageOptions.map((language) => {
                    const active = selectedLanguages.includes(language)
                    return (
                      <button key={language} type="button" onClick={() => {
                        const next = active ? selectedLanguages.filter((item) => item !== language) : [...selectedLanguages, language]
                        set("languages", next.join(", "))
                      }} className={`rounded-full px-3 py-2 text-xs font-bold transition ${active ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                        {language}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <div>
                  <label className={labelCls}>Highlights</label>
                  <DynamicList items={form.highlights} placeholder="Sunrise at Pangong Lake" onChange={(index, value) => updateArray("highlights", index, value)} onAdd={() => addArray("highlights")} onRemove={(index) => removeArray("highlights", index)} />
                </div>
                <div>
                  <label className={labelCls}>Included</label>
                  <DynamicList items={form.included} placeholder="Stay, guide, transfers" onChange={(index, value) => updateArray("included", index, value)} onAdd={() => addArray("included")} onRemove={(index) => removeArray("included", index)} />
                </div>
                <div>
                  <label className={labelCls}>Excluded</label>
                  <DynamicList items={form.excluded} placeholder="Flights, personal expenses" onChange={(index, value) => updateArray("excluded", index, value)} onAdd={() => addArray("excluded")} onRemove={(index) => removeArray("excluded", index)} />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard id="itinerary" eyebrow="Plan" title="Day-wise Itinerary" icon={<Mountain className="h-5 w-5" />} complete={completion.itinerary}>
            <div className="mb-4 flex flex-wrap gap-3">
              <button type="button" onClick={() => setExpandedDays(form.itinerary.map((day: ItineraryDay) => day.day))} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Expand all</button>
              <button type="button" onClick={() => setExpandedDays([])} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50">Collapse all</button>
              <button type="button" onClick={() => setDuration(String(Number(form.duration || 1) + 1))} className="rounded-2xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-cyan-700"><Plus className="mr-2 inline h-4 w-4" />Add day</button>
            </div>
            <FieldError error={errors.itinerary} />
            <div className="space-y-4">
              {form.itinerary.map((day: ItineraryDay, dayIndex: number) => {
                const expanded = expandedDays.includes(day.day)
                return (
                  <div key={day.day} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 px-4 py-3">
                      <button type="button" onClick={() => setExpandedDays((current) => expanded ? current.filter((item) => item !== day.day) : [...current, day.day])} className="flex items-center gap-3 text-left">
                        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-700 text-sm font-black text-white">D{day.day}</span>
                        <span>
                          <span className="block text-sm font-black text-slate-950">{day.title || `Day ${day.day}`}</span>
                          <span className="text-xs font-medium text-slate-500">{(day.activities || []).filter(Boolean).length} activities, {(day.meals || []).filter(Boolean).length} meals</span>
                        </span>
                        {expanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                      </button>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => moveDay(dayIndex, -1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100" aria-label="Move day up"><ArrowUp className="h-4 w-4" /></button>
                        <button type="button" onClick={() => moveDay(dayIndex, 1)} className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100" aria-label="Move day down"><ArrowDown className="h-4 w-4" /></button>
                      </div>
                    </div>
                    {expanded ? (
                      <div className="space-y-4 p-4">
                        <input className={inputCls} value={day.title} placeholder="Arrival, orientation, and welcome dinner" onChange={(event) => updateItineraryDay(dayIndex, { title: event.target.value })} />
                        <textarea className={inputCls} rows={3} value={day.description} placeholder="Describe route, pace, check-ins, local experiences, and safety notes for this day." onChange={(event) => updateItineraryDay(dayIndex, { description: event.target.value })} />
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div>
                            <label className={labelCls}>Activities</label>
                            <DynamicList items={day.activities || [""]} placeholder="Guided heritage walk" onChange={(index, value) => updateItineraryList(dayIndex, "activities", index, value)} onAdd={() => updateItineraryDay(dayIndex, { activities: [...(day.activities || []), ""] })} onRemove={(index) => updateItineraryDay(dayIndex, { activities: (day.activities || []).filter((_: string, itemIndex: number) => itemIndex !== index) })} />
                          </div>
                          <div>
                            <label className={labelCls}>Meals</label>
                            <DynamicList items={day.meals || [""]} placeholder="Breakfast, lunch, dinner" onChange={(index, value) => updateItineraryList(dayIndex, "meals", index, value)} onAdd={() => updateItineraryDay(dayIndex, { meals: [...(day.meals || []), ""] })} onRemove={(index) => updateItineraryDay(dayIndex, { meals: (day.meals || []).filter((_: string, itemIndex: number) => itemIndex !== index) })} />
                          </div>
                        </div>
                        <div className="grid gap-4 lg:grid-cols-2">
                          <textarea className={inputCls} rows={2} value={day.stayNotes || ""} placeholder="Stay or accommodation notes" onChange={(event) => updateItineraryDay(dayIndex, { stayNotes: event.target.value })} />
                          <textarea className={inputCls} rows={2} value={day.travelNotes || ""} placeholder="Travel, transfer, or safety notes" onChange={(event) => updateItineraryDay(dayIndex, { travelNotes: event.target.value })} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </SectionCard>

          <SectionCard id="media" eyebrow="Gallery" title="Media" icon={<ImageIcon className="h-5 w-5" />} complete={completion.media}>
            <PhotoUploader images={form.images || []} onChange={(urls) => set("images", urls)} />
            <FieldError error={errors.images} />
            <p className={helpCls}>First image becomes the cover image. Drag sorting can be added later when the upload component supports reorder events.</p>
          </SectionCard>

          <SectionCard id="policies" eyebrow="Review" title="Policies & Publishing" icon={<CheckCircle2 className="h-5 w-5" />} complete={completion.policies}>
            <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
              <div>
                <label className={labelCls}>Cancellation policy</label>
                <textarea className={inputCls} rows={4} value={form.cancellationPolicy} placeholder="Example: Full refund until 7 days before departure, 50% refund until 72 hours before departure." onChange={(event) => set("cancellationPolicy", event.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Listing status</label>
                <select className={`${inputCls} appearance-none`} value={form.status} onChange={(event) => set("status", event.target.value)}>
                  {statusOptions.map((status) => <option key={status} value={status}>{formatStatus(status)}</option>)}
                </select>
                <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                  <p className="text-sm font-black text-slate-950">Review summary</p>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{formatStatus(form.status)} listings are saved for host review or sent to admin depending on your backend workflow.</p>
                </div>
              </div>
            </div>
          </SectionCard>
        </main>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-18px_45px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <span className={`flex h-9 w-9 items-center justify-center rounded-2xl ${dirty ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                {dirty ? <Save className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </span>
              <span>{dirty ? "You have unsaved changes" : "Ready"}{lastSavedAt ? ` · autosaved ${lastSavedAt}` : ""}</span>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" onClick={() => navigator.clipboard?.writeText(`/tours/${form.slug}`)} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                <Copy className="h-4 w-4" />
                Copy link
              </button>
              <Link href="/host" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                <X className="h-4 w-4" />
                Cancel
              </Link>
              <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-6 py-3 text-sm font-black text-white shadow-lg shadow-slate-950/10 transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-60">
                {submitting ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <Save className="h-4 w-4" />}
                {submitting ? "Saving..." : isEdit ? "Save changes" : "Create tour"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
