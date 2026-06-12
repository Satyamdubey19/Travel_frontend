"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowRight, CalendarCheck2, CheckCircle2, ClipboardCheck, HeartPulse, Loader2, Plus, ShieldCheck, Users, UserRoundCheck } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/Input"
import api, { getApiErrorMessage } from "@/lib/axios"
import { useCreateTourBookingIntent, useTourBatches } from "@/hooks/useTourBooking"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { removeTraveler, setActiveStep, setBookingResult, setDepartureBatch, upsertTraveler } from "@/store/tourBookingWizardSlice"
import type { TourBookingWizardStep } from "@/types/tour-booking"
import type { TourTravelerInput } from "@/validators/tour-booking.validators"
import TravelerFormCard from "./TravelerFormCard"

type TourBookingWizardProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tourIdOrSlug: string
  contact: {
    name: string
    email: string
    phone: string
  }
}

const flowSteps: TourBookingWizardStep[] = ["departure", "primary", "travelers", "documents", "medical", "review", "payment", "confirmation"]
const visibleSteps: TourBookingWizardStep[] = ["departure", "primary", "travelers", "medical", "review", "confirmation"]

const stepMeta: Record<TourBookingWizardStep, { label: string; helper: string; icon: typeof CalendarCheck2 }> = {
  departure: { label: "Departure", helper: "Pick your slot", icon: CalendarCheck2 },
  primary: { label: "Primary", helper: "Lead traveler", icon: UserRoundCheck },
  travelers: { label: "Travelers", helper: "Group details", icon: Users },
  documents: { label: "Documents", helper: "ID checks", icon: ClipboardCheck },
  medical: { label: "Medical", helper: "Health notes", icon: HeartPulse },
  review: { label: "Review", helper: "Verify all info", icon: ClipboardCheck },
  payment: { label: "Payment", helper: "Secure checkout", icon: ShieldCheck },
  confirmation: { label: "Confirmation", helper: "Ready to pay", icon: CheckCircle2 },
}

const panelMotion = {
  initial: { opacity: 0, y: 14, filter: "blur(2px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    filter: "blur(1px)",
    transition: { duration: 0.18, ease: "easeIn" as const },
  },
}

type RazorpayCheckoutResponse = {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

type RazorpayCheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: {
    name?: string
    email?: string
    contact?: string
  }
  notes?: Record<string, string>
  theme?: { color?: string }
  modal?: { ondismiss?: () => void }
  handler: (response: RazorpayCheckoutResponse) => void | Promise<void>
}

type RazorpayInstance = { open: () => void }
type RazorpayConstructor = new (options: RazorpayCheckoutOptions) => RazorpayInstance

let razorpayScriptPromise: Promise<boolean> | null = null

function loadRazorpayScript() {
  if (typeof window === "undefined") return Promise.resolve(false)

  const existingWindow = window as Window & { Razorpay?: RazorpayConstructor }
  if (existingWindow.Razorpay) return Promise.resolve(true)

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://checkout.razorpay.com/v1/checkout.js"]')
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(true), { once: true })
        existingScript.addEventListener("error", () => resolve(false), { once: true })
        return
      }

      const script = document.createElement("script")
      script.src = "https://checkout.razorpay.com/v1/checkout.js"
      script.async = true
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.head.appendChild(script)
    })
  }

  return razorpayScriptPromise
}

export default function TourBookingWizard({ contact, onOpenChange, open, tourIdOrSlug }: TourBookingWizardProps) {
  const dispatch = useAppDispatch()
  const wizard = useAppSelector((state) => state.tourBookingWizard)
  const batches = useTourBatches(tourIdOrSlug)
  const createIntent = useCreateTourBookingIntent(tourIdOrSlug)
  const [contactDraft, setContactDraft] = useState(contact)
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const activeStepIndex = flowSteps.indexOf(wizard.activeStep)
  const progressPercent = Math.max(8, ((activeStepIndex + 1) / flowSteps.length) * 100)
  const selectedBatch = (batches.data ?? []).find((batch) => batch.id === wizard.departureBatchId)

  useEffect(() => {
    if (!open) return
    setContactDraft(contact)
  }, [contact, open])

  useEffect(() => {
    if (!open || wizard.departureBatchId || !batches.data?.length) return
    dispatch(setDepartureBatch(batches.data[0].id))
  }, [batches.data, dispatch, open, wizard.departureBatchId])

  const submit = async () => {
    if (isProcessingPayment) return
    if (!wizard.travelers.length) {
      toast.error("Add at least one traveler")
      return
    }
    try {
      setIsProcessingPayment(true)
      dispatch(setActiveStep("payment"))
      const result = await createIntent.mutateAsync({
        departureBatchId: wizard.departureBatchId,
        travelers: wizard.travelers,
        contactName: contactDraft.name,
        contactEmail: contactDraft.email,
        contactPhone: contactDraft.phone,
        idempotencyKey: `${tourIdOrSlug}-${Date.now()}`,
      })

      if (result.status === "WAITLISTED") {
        dispatch(setBookingResult({ bookingId: result.bookingId, bookingCode: result.bookingCode }))
        toast.success("Group added to waitlist")
        return
      }

      const orderResponse = await api.post(`/tour/${tourIdOrSlug}/payment/order`, {
        bookingId: result.bookingId,
      })

      const order = orderResponse.data.data as {
        bookingId: string
        bookingCode: string
        orderId: string
        amount: number
        currency: string
        keyId: string
      }

      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) throw new Error("Unable to load the payment gateway")

      const RazorpayCheckout = (window as Window & { Razorpay?: RazorpayConstructor }).Razorpay
      if (!RazorpayCheckout) throw new Error("Payment gateway is unavailable")

      const checkout = new RazorpayCheckout({
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "GetHotels",
        description: `Tour booking - ${tourIdOrSlug}`,
        order_id: order.orderId,
        prefill: {
          name: contactDraft.name,
          email: contactDraft.email,
          contact: contactDraft.phone,
        },
        notes: {
          bookingId: order.bookingId,
          bookingCode: order.bookingCode,
          tourRef: tourIdOrSlug,
        },
        theme: { color: "#0f172a" },
        modal: {
          ondismiss: () => {
            toast.message("Payment window closed", { description: "You can retry payment from this booking flow." })
            setIsProcessingPayment(false)
          },
        },
        handler: async (payment) => {
          try {
            await api.post(`/tour/${tourIdOrSlug}/payment/verify`, payment)
            dispatch(setBookingResult({ bookingId: order.bookingId, bookingCode: order.bookingCode }))
            toast.success("Payment verified. Booking confirmed")
          } catch (error) {
            toast.error(getApiErrorMessage(error, "Payment verification failed"))
            dispatch(setActiveStep("review"))
          } finally {
            setIsProcessingPayment(false)
          }
        },
      })

      checkout.open()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create booking")
      dispatch(setActiveStep("review"))
      setIsProcessingPayment(false)
    }
  }

  const addBlankTraveler = () => {
    const traveler: TourTravelerInput = { fullName: "", aadhaar: "", relation: wizard.travelers.length === 0 ? "Primary" : "Friend", country: "India" }
    dispatch(upsertTraveler({ index: wizard.travelers.length, traveler }))
    dispatch(setActiveStep(wizard.travelers.length === 0 ? "primary" : "travelers"))
  }

  const continueToTravelers = () => {
    if (!wizard.travelers.length) {
      addBlankTraveler()
      return
    }
    dispatch(setActiveStep(wizard.travelers.length === 1 ? "primary" : "travelers"))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        overlayClassName="bg-slate-950/40 duration-200 supports-backdrop-filter:backdrop-blur-md"
        style={{
          width: "min(1080px, calc(100vw - 2rem))",
          maxWidth: "min(1080px, calc(100vw - 2rem))",
          maxHeight: "calc(100dvh - 2rem)",
        }}
        className="flex min-h-0 flex-col gap-0 overflow-hidden rounded-[30px] border border-white/80 bg-white p-0 text-slate-950 shadow-[0_34px_110px_rgba(15,23,42,0.38)] ring-1 ring-slate-950/10 sm:rounded-[34px]"
      >
        <DialogHeader className="sticky top-0 z-20 border-b border-slate-200/70 bg-[radial-gradient(circle_at_top_left,rgba(13,148,136,0.14),transparent_30%),linear-gradient(180deg,#ffffff,#f8fafc)] px-4 py-3.5 pr-14 sm:px-6 sm:py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.13em] text-teal-800 ring-1 ring-teal-100">
                <ShieldCheck className="h-3.5 w-3.5" />
                Protected group booking
              </p>
              <DialogTitle className="mt-2 text-[clamp(1.7rem,2.4vw,2.5rem)] font-black tracking-tight text-slate-950">Complete your tour booking</DialogTitle>
              <p className="mt-1.5 max-w-2xl text-sm font-semibold leading-5 text-slate-600">Choose a departure, add traveler details, then we validate seats before payment.</p>
            </div>
            <div className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-right shadow-sm sm:block">
              <CalendarCheck2 className="ml-auto h-4 w-4 text-teal-700" />
              <p className="mt-1.5 text-xs font-bold text-slate-600">{wizard.travelers.length || 1} traveler{(wizard.travelers.length || 1) > 1 ? "s" : ""}</p>
              <p className="text-[11px] font-semibold text-slate-500">Step {activeStepIndex + 1} of {flowSteps.length}</p>
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <div className="hidden h-1 rounded-full bg-slate-200/80 md:block">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-slate-950 via-slate-800 to-teal-700"
                initial={false}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.28, ease: "easeOut" as const }}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {visibleSteps.map((step, index) => {
              const isActive = wizard.activeStep === step
              const isCompleted = flowSteps.indexOf(step) < activeStepIndex
              const StepIcon = stepMeta[step].icon

              return (
              <button
                key={step}
                onClick={() => dispatch(setActiveStep(step))}
                className={`min-w-[148px] shrink-0 rounded-xl border px-2.5 py-2 text-left transition ${
                  isActive
                    ? "border-slate-900 bg-slate-950 text-white shadow-lg shadow-slate-200"
                    : isCompleted
                      ? "border-teal-200 bg-teal-50/70 text-teal-900"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-black ${
                    isActive ? "border-white/30 bg-white/10 text-white" : isCompleted ? "border-teal-200 bg-white text-teal-700" : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : index + 1}
                  </span>
                  <StepIcon className={`h-3 w-3 ${isActive ? "text-white/90" : isCompleted ? "text-teal-700" : "text-slate-400"}`} />
                  <span className="truncate text-[11px] font-black uppercase tracking-[0.07em]">{stepMeta[step].label}</span>
                </div>
                <p className={`mt-0.5 truncate text-[10px] font-semibold ${isActive ? "text-white/75" : isCompleted ? "text-teal-800/75" : "text-slate-500"}`}>
                  {stepMeta[step].helper}
                </p>
              </button>
            )})}
            </div>
          </div>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50/80 p-4 pb-6 sm:p-6 sm:pb-7">
          <AnimatePresence mode="wait">
            {wizard.activeStep === "departure" ? (
              <motion.div key="departure" variants={panelMotion} initial="initial" animate="animate" exit="exit" className="space-y-4">
                <div className="flex gap-3 rounded-[24px] border border-teal-100 bg-teal-50/80 p-4 text-sm text-teal-950">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-teal-700 shadow-sm">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black">Secure seat validation</p>
                    <p className="mt-1 font-semibold leading-6 text-teal-900/75">Seats are validated again before payment, so stale availability cannot overbook the group.</p>
                  </div>
                </div>
                {batches.isLoading ? <p className="rounded-2xl bg-slate-50 p-5 text-sm font-bold text-slate-500">Loading departures...</p> : null}
                <div className="grid gap-3 md:grid-cols-2">
                  {(batches.data ?? []).map((batch) => (
                    <motion.button
                      key={batch.id}
                      onClick={() => dispatch(setDepartureBatch(batch.id))}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.995 }}
                      className={`rounded-[24px] border p-5 text-left transition ${
                        wizard.departureBatchId === batch.id
                          ? "border-teal-300 bg-white shadow-[0_18px_50px_rgba(13,148,136,0.12)] ring-4 ring-teal-100"
                          : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-teal-100 hover:shadow-lg"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-black text-slate-950">{batch.label || "Departure"}</p>
                          <p className="mt-1 text-sm font-semibold text-slate-500">{new Date(batch.startDate).toLocaleDateString("en-IN")} - {batch.seatsLeft} seats</p>
                        </div>
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-600">{batch.status}</span>
                      </div>
                      <p className="mt-4 text-2xl font-black text-slate-950">INR {batch.currentPrice.toLocaleString("en-IN")}</p>
                    </motion.button>
                  ))}
                </div>
                <div className="sticky bottom-0 -mx-4 flex flex-col gap-3 border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:-mx-6 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-sm font-semibold text-slate-600">
                    {selectedBatch
                      ? `Selected: ${selectedBatch.label || "Departure"} on ${new Date(selectedBatch.startDate).toLocaleDateString("en-IN")}`
                      : "Select a departure to continue"}
                  </p>
                  <Button type="button" onClick={continueToTravelers} className="h-12 rounded-2xl bg-slate-950 px-6 font-black text-white shadow-lg shadow-slate-200 hover:bg-teal-700">
                    Continue to travelers
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            ) : wizard.activeStep === "confirmation" ? (
              <motion.div key="confirmation" variants={panelMotion} initial="initial" animate="animate" exit="exit" className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-950">
                <ShieldCheck className="h-8 w-8" />
                <h3 className="mt-4 text-2xl font-black">Booking request saved</h3>
                <p className="mt-2 text-sm font-semibold">Reference: {wizard.bookingCode}</p>
              </motion.div>
            ) : (
              <motion.div key="travelers" variants={panelMotion} initial="initial" animate="animate" exit="exit" className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Current step</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                        {(() => {
                          const ActiveIcon = stepMeta[wizard.activeStep].icon
                          return <ActiveIcon className="h-4 w-4" />
                        })()}
                      </span>
                      <div>
                        <p className="text-sm font-black text-slate-900">{stepMeta[wizard.activeStep].label}</p>
                        <p className="text-xs font-semibold text-slate-500">{stepMeta[wizard.activeStep].helper}</p>
                      </div>
                    </div>
                        <p className="text-xs font-black text-slate-500">Step {activeStepIndex + 1} / {flowSteps.length}</p>
                  </div>
                </div>
                <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-teal-700">Booking contact</p>
                  <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <Input
                      value={contactDraft.name}
                      onChange={(event) => setContactDraft((current) => ({ ...current, name: event.target.value }))}
                      placeholder="Full name"
                      className="h-11 rounded-xl bg-white"
                    />
                    <Input
                      value={contactDraft.email}
                      onChange={(event) => setContactDraft((current) => ({ ...current, email: event.target.value }))}
                      placeholder="Email"
                      type="email"
                      className="h-11 rounded-xl bg-white"
                    />
                    <Input
                      value={contactDraft.phone}
                      onChange={(event) => setContactDraft((current) => ({ ...current, phone: event.target.value }))}
                      placeholder="Phone"
                      className="h-11 rounded-xl bg-white"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="flex items-center gap-2 text-lg font-black text-slate-950"><Users className="h-5 w-5 text-teal-700" />Travelers</h3>
                    <p className="mt-1 text-sm text-slate-500">Entire groups confirm together; if not enough seats exist, the group is waitlisted together.</p>
                  </div>
                  <Button type="button" variant="outline" onClick={addBlankTraveler} className="rounded-2xl">
                    <Plus className="h-4 w-4" />
                    Add
                  </Button>
                </div>
                {wizard.travelers.map((traveler, index) => (
                  <TravelerFormCard
                    key={index}
                    index={index}
                    tourIdOrSlug={tourIdOrSlug}
                    defaultValue={traveler}
                    onSave={(itemIndex, value) => dispatch(upsertTraveler({ index: itemIndex, traveler: value }))}
                    onRemove={(itemIndex) => dispatch(removeTraveler(itemIndex))}
                  />
                ))}
                <div className="sticky bottom-0 -mx-4 flex justify-end border-t border-slate-200 bg-white/95 px-4 py-4 shadow-[0_-18px_40px_rgba(15,23,42,0.08)] backdrop-blur sm:-mx-6 sm:px-6">
                  <Button type="button" disabled={createIntent.isPending || isProcessingPayment} onClick={submit} className="h-11 rounded-2xl bg-slate-950 px-6 font-black text-white shadow-lg shadow-slate-200 hover:bg-teal-700">
                    {createIntent.isPending || isProcessingPayment ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {isProcessingPayment ? "Opening payment..." : "Validate seats"}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
