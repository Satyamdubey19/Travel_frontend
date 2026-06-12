"use client"

import { useEffect } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { z } from "zod"
import { AlertTriangle, CalendarDays, CheckCircle2, FileBadge, HeartPulse, Loader2, ShieldCheck, UserRound } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { useValidateTourTraveler } from "@/hooks/useTourBooking"
import { isValidAadhaar, maskAadhaar } from "@/lib/traveler-normalization"
import { tourTravelerSchema, type TourTravelerInput } from "@/validators/tour-booking.validators"

type TravelerFormCardProps = {
  defaultValue?: Partial<TourTravelerInput>
  index: number
  onSave: (index: number, traveler: TourTravelerInput) => void
  onRemove?: (index: number) => void
  tourIdOrSlug: string
}

const inputClass = "h-11 w-full min-w-0 rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100"
const labelClass = "mb-1.5 block text-xs font-black uppercase tracking-[0.16em] text-slate-500"
type TourTravelerFormValues = z.input<typeof tourTravelerSchema>

export default function TravelerFormCard({ defaultValue, index, onRemove, onSave, tourIdOrSlug }: TravelerFormCardProps) {
  const form = useForm<TourTravelerFormValues, unknown, TourTravelerInput>({
    resolver: zodResolver(tourTravelerSchema),
    defaultValues: {
      fullName: "",
      relation: index === 0 ? "Primary" : "Friend",
      country: "India",
      aadhaar: "",
      ...defaultValue,
    },
  })
  const validateTraveler = useValidateTourTraveler(tourIdOrSlug)
  const watchedIdentity = useWatch({
    control: form.control,
    name: ["fullName", "age", "dob", "aadhaar"],
  })
  const fullName = typeof watchedIdentity[0] === "string" ? watchedIdentity[0] : ""
  const watchedAge = watchedIdentity[1]
  const age = watchedAge === "" || watchedAge === undefined || watchedAge === null ? undefined : Number(watchedAge)
  const dob = typeof watchedIdentity[2] === "string" ? watchedIdentity[2] : undefined
  const aadhaar = typeof watchedIdentity[3] === "string" ? watchedIdentity[3] : ""
  const canValidateIdentity = fullName.trim().length >= 2 && isValidAadhaar(aadhaar) && (age !== undefined || Boolean(dob))

  useEffect(() => {
    if (!canValidateIdentity) {
      validateTraveler.reset()
      return
    }

    const timer = window.setTimeout(() => {
      validateTraveler.mutate({
        fullName,
        age,
        dob,
        aadhaar,
      })
    }, 450)

    return () => window.clearTimeout(timer)
  }, [aadhaar, age, canValidateIdentity, dob, fullName])

  const duplicateMessage = validateTraveler.data?.isDuplicate ? validateTraveler.data.message : null

  const submit = form.handleSubmit(async (values) => {
    try {
      const result = await validateTraveler.mutateAsync({
        fullName: values.fullName,
        age: values.age,
        dob: values.dob,
        aadhaar: values.aadhaar,
      })
      if (result.isDuplicate) {
        form.setError("aadhaar", { type: "validate", message: "This traveler is already registered for this tour." })
        return
      }
      onSave(index, values)
    } catch (error) {
      form.setError("aadhaar", { type: "validate", message: error instanceof Error ? error.message : "Could not validate traveler" })
    }
  })

  return (
    <Card className={`overflow-hidden rounded-3xl bg-white shadow-sm transition ${duplicateMessage ? "border-rose-300 ring-4 ring-rose-100" : "border-slate-200"}`}>
      <CardHeader className="border-b border-slate-100 bg-white px-4 py-4 sm:px-5">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="flex items-center gap-3 text-base font-black text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
              <UserRound className="h-4 w-4" />
            </span>
            <span>Traveler {index + 1}</span>
          </CardTitle>
          {onRemove && index > 0 ? (
            <Button type="button" variant="outline" size="sm" onClick={() => onRemove(index)}>Remove</Button>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <label className="min-w-0">
            <span className={labelClass}>Full name</span>
            <input className={inputClass} {...form.register("fullName")} placeholder="Traveler name" />
            {form.formState.errors.fullName ? <p className="mt-1 text-xs font-semibold text-rose-600">{form.formState.errors.fullName.message}</p> : null}
          </label>
          <label className="min-w-0">
            <span className={labelClass}>Relation</span>
            <input className={inputClass} {...form.register("relation")} placeholder="Self, friend, spouse" />
          </label>
          <label className="min-w-0">
            <span className={labelClass}>Email</span>
            <input className={inputClass} {...form.register("email")} placeholder="traveler@example.com" />
          </label>
          <label className="min-w-0">
            <span className={labelClass}>Phone</span>
            <input className={inputClass} {...form.register("phone")} placeholder="+91..." />
          </label>
          <label className="min-w-0">
            <span className={labelClass}>Age</span>
            <input className={inputClass} type="number" {...form.register("age")} />
          </label>
          <label className="min-w-0">
            <span className={labelClass}>Date of birth</span>
            <div className="relative">
              <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className={`${inputClass} pl-10`} type="date" {...form.register("dob")} />
            </div>
          </label>
          <label className="min-w-0">
            <span className={`${labelClass} flex items-center gap-2`}><ShieldCheck className="h-3.5 w-3.5" />Aadhaar number</span>
            <input className={inputClass} {...form.register("aadhaar")} inputMode="numeric" maxLength={14} placeholder="12 digit Aadhaar" />
            <p className="mt-1 text-xs font-semibold text-slate-500">{aadhaar ? maskAadhaar(aadhaar) : "Stored securely as a hash"}</p>
            {form.formState.errors.aadhaar ? <p className="mt-1 text-xs font-semibold text-rose-600">{form.formState.errors.aadhaar.message}</p> : null}
          </label>
        </div>

        {canValidateIdentity ? (
          <div className={`flex items-center gap-2 rounded-2xl border p-3 text-sm font-bold ${duplicateMessage ? "border-rose-200 bg-rose-50 text-rose-700" : validateTraveler.data?.isDuplicate === false ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
            {validateTraveler.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : duplicateMessage ? <AlertTriangle className="h-4 w-4" /> : validateTraveler.data?.isDuplicate === false ? <CheckCircle2 className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            <span>
              {validateTraveler.isPending ? "Checking traveler..." : duplicateMessage || validateTraveler.data?.message || "Ready to verify traveler"}
            </span>
          </div>
        ) : null}

        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <label className="min-w-0">
            <span className={labelClass}>Emergency contact</span>
            <input className={inputClass} {...form.register("emergencyContactName")} placeholder="Contact name" />
          </label>
          <label className="min-w-0">
            <span className={labelClass}>Emergency phone</span>
            <input className={inputClass} {...form.register("emergencyContactPhone")} placeholder="+91..." />
          </label>
          <label className="min-w-0">
            <span className={labelClass}>Food preference</span>
            <input className={inputClass} {...form.register("foodPreference")} placeholder="Veg, vegan, Jain..." />
          </label>
          <label className="min-w-0">
            <span className={labelClass}>Blood group</span>
            <input className={inputClass} {...form.register("bloodGroup")} placeholder="O+" />
          </label>
        </div>

        <label>
          <span className={`${labelClass} flex items-center gap-2`}><HeartPulse className="h-3.5 w-3.5" />Medical notes</span>
          <textarea className={`${inputClass} min-h-24 resize-none py-3`} {...form.register("medicalNotes")} placeholder="Allergies, medication, mobility needs..." />
        </label>

        <div className="grid min-w-0 gap-4 lg:grid-cols-2">
          <label className="min-w-0">
            <span className={`${labelClass} flex items-center gap-2`}><FileBadge className="h-3.5 w-3.5" />ID type</span>
            <input className={inputClass} {...form.register("idType")} placeholder="Aadhaar, passport..." />
          </label>
          <label className="min-w-0">
            <span className={labelClass}>ID upload URL</span>
            <input className={inputClass} {...form.register("idUploadUrl")} placeholder="Uploaded file URL" />
          </label>
        </div>

        <div className="flex justify-end border-t border-slate-100 pt-4">
          <Button type="button" onClick={submit} disabled={validateTraveler.isPending || Boolean(duplicateMessage)} className="h-11 rounded-2xl bg-slate-950 px-5 font-black text-white hover:bg-cyan-700">
            Save traveler
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
