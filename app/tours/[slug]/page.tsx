"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Heart,
  Lock,
  MapPin,
  Minus,
  Plus,
  Share2,
  ShieldCheck,
  Star,
  Users,
  X,
} from "lucide-react"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import TourBookingWizard from "@/components/tour/TourBookingWizard"
import { useAuth } from "@/contexts/AuthContext"
import api from "@/lib/axios"
import { tours, type Tour } from "@/lib/tours"
import { useAppDispatch } from "@/store/hooks"
import { startWizard, upsertTraveler } from "@/store/tourBookingWizardSlice"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { Skeleton } from "@/components/ui/skeleton"

type TourBatch = {
  id: string
  label: string | null
  startDate: string
  endDate: string
  seatsLeft: number
  currentPrice: number
  status: string
}

type TourReview = {
  id: string
  rating: number
  comment: string
  User?: { name: string }
}

const navItems = [
  ["overview", "Overview"],
  ["gallery", "Gallery"],
  ["itinerary", "Itinerary"],
  ["inclusions", "Inclusions"],
  ["host", "Meet Host"],
  ["reviews", "Reviews"],
] as const

function formatMoney(value: number) {
  return `INR ${value.toLocaleString("en-IN")}`
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date)
}

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date)
}

function parseGroupSize(value: string) {
  const numbers = value.match(/\d+/g)?.map(Number) || [8]
  const total = numbers[numbers.length - 1] || 12
  return { total, left: Math.max(2, Math.round(total * 0.35)) }
}

function difficultyFor(tour: Tour) {
  if (tour.tags.some((tag) => ["trekking", "mountain", "safari"].includes(tag))) return "Moderate"
  if (tour.category === "adventure") return "Hard"
  return "Easy"
}

function TourDetailSkeleton() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#eff1f3] pb-24">
        <section className="relative min-h-[58vh] overflow-hidden bg-slate-200 sm:min-h-[66vh]">
          <Skeleton className="absolute inset-0 h-full w-full rounded-none" />
          <div className="relative mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-28 sm:min-h-[66vh] sm:px-6 lg:px-8">
            <div className="mb-3 flex gap-2">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-32 rounded-full" />
            </div>
            <Skeleton className="h-12 w-full max-w-2xl" />
            <Skeleton className="mt-3 h-5 w-72" />
          </div>
        </section>

        <section className="relative z-20 -mt-8 px-4 sm:px-6 lg:-mt-10 lg:px-8">
          <Card className="mx-auto max-w-7xl border border-slate-200 bg-white py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <CardContent className="grid gap-3 px-3 sm:grid-cols-4">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="rounded-xl bg-slate-50 p-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="mt-2 h-4 w-24" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <div className="sticky top-0 z-30 mt-4 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} className="h-8 w-24 rounded-full" />
            ))}
          </div>
        </div>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="space-y-8">
            {Array.from({ length: 5 }).map((_, idx) => (
              <Card key={idx} className="border border-slate-200 bg-white py-4">
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-7 w-64" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="hidden lg:block">
            <Card className="border border-slate-200 bg-white py-4">
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-40" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-11 w-full" />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export default function TourDetailPage() {
  const params = useParams()
  const { isAuthenticated, user } = useAuth()
  const dispatch = useAppDispatch()
  const slug = typeof params.slug === "string" ? params.slug : ""

  const [tour, setTour] = useState<Tour | null>(() => tours.find((item) => item.slug === slug) ?? null)
  const [isLoadingTour, setIsLoadingTour] = useState(true)
  const [chatUnlocked, setChatUnlocked] = useState(false)
  const [liked, setLiked] = useState(false)
  const [copied, setCopied] = useState(false)
  const [bookingModal, setBookingModal] = useState(false)
  const [lightbox, setLightbox] = useState<string | null>(null)
  const [expandedDays, setExpandedDays] = useState<number[]>([1])
  const [guestCount, setGuestCount] = useState(1)
  const [batches, setBatches] = useState<TourBatch[]>([])
  const [selectedBatchId, setSelectedBatchId] = useState("")
  const [waitlistMessage, setWaitlistMessage] = useState("")
  const [joiningWaitlist, setJoiningWaitlist] = useState(false)
  const [backendReviews, setBackendReviews] = useState<TourReview[]>([])

  useEffect(() => {
    if (!slug) {
      setIsLoadingTour(false)
      return
    }

    let ignore = false
    const loadTour = async () => {
      try {
        const { data: payload } = await api.get(`/tour/${slug}`, { headers: { "Cache-Control": "no-store" } })
        if (!ignore && payload?.data) {
          setTour(payload.data)
          return
        }
      } catch {
        // fallback below
      } finally {
        if (!ignore) {
          setTour((current) => current ?? tours.find((item) => item.slug === slug) ?? null)
          setIsLoadingTour(false)
        }
      }
    }

    void loadTour()
    return () => {
      ignore = true
    }
  }, [slug])

  useEffect(() => {
    if (!slug || !isAuthenticated) {
      setChatUnlocked(false)
      return
    }

    let ignore = false
    const loadChatAccess = async () => {
      try {
        await api.get(`/tour/${slug}/chat?scope=participant`, { headers: { "Cache-Control": "no-store" } })
        if (!ignore) setChatUnlocked(true)
      } catch {
        if (!ignore) setChatUnlocked(false)
      }
    }

    void loadChatAccess()
    return () => {
      ignore = true
    }
  }, [slug, isAuthenticated, bookingModal])

  useEffect(() => {
    if (!slug) return

    let ignore = false
    const loadBatches = async () => {
      try {
        const { data: payload } = await api.get(`/tour/${slug}/batches`, { headers: { "Cache-Control": "no-store" } })
        if (!ignore) {
          const next = Array.isArray(payload?.data) ? payload.data : []
          setBatches(next)
          setSelectedBatchId((current) => current || next[0]?.id || "")
        }
      } catch {
        if (!ignore) {
          setBatches([])
          setSelectedBatchId("")
        }
      }
    }

    void loadBatches()
    return () => {
      ignore = true
    }
  }, [slug])

  useEffect(() => {
    if (!slug) return

    let ignore = false
    const loadReviews = async () => {
      try {
        const { data: payload } = await api.get(`/tour/${slug}/reviews`, { headers: { "Cache-Control": "no-store" } })
        if (!ignore) setBackendReviews(Array.isArray(payload?.data) ? payload.data : [])
      } catch {
        if (!ignore) setBackendReviews([])
      }
    }

    void loadReviews()
    return () => {
      ignore = true
    }
  }, [slug])

  const computed = useMemo(() => {
    if (!tour) return null
    const group = parseGroupSize(tour.groupSize)
    const startDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 24)
    const difficulty = difficultyFor(tour)
    const approvalRequired = Boolean(tour.joinApprovalRequired)
    return { group, startDate, difficulty, approvalRequired }
  }, [tour])

  if (isLoadingTour) {
    return <TourDetailSkeleton />
  }

  if (!tour || !computed) {
    return (
      <>
        <Header />
        <main className="flex min-h-screen items-center justify-center bg-[#eff1f3] px-4">
          <Card className="w-full max-w-md border border-slate-200 bg-white py-6 text-center shadow-sm">
            <CardContent>
              <h1 className="text-2xl font-black text-slate-950">Tour not found</h1>
              <Button asChild className="mt-4 bg-slate-950 text-white hover:bg-slate-800">
                <Link href="/tours">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to tours
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </>
    )
  }

  const gallery = tour.gallery.length > 0 ? tour.gallery : [tour.image]
  const selectedBatch = batches.find((batch) => batch.id === selectedBatchId) ?? batches[0] ?? null
  const seatsLeft = selectedBatch ? Math.max(0, selectedBatch.seatsLeft) : computed.group.left
  const unitPrice = selectedBatch ? selectedBatch.currentPrice : tour.price
  const isSoldOut = seatsLeft <= 0 || selectedBatch?.status === "SOLD_OUT"

  const visibleReviews = backendReviews.length > 0
    ? backendReviews.map((review) => ({
        name: review.User?.name ?? "Verified traveler",
        rating: review.rating,
        text: review.comment,
      }))
    : [{ name: "Verified traveler", rating: tour.rating, text: "Great route and smooth host coordination." }]

  const share = async () => {
    if (navigator.share) {
      await navigator.share({ title: tour.title, url: window.location.href })
      return
    }
    await navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  const joinWaitlist = async () => {
    if (!isAuthenticated) {
      setWaitlistMessage("Please sign in to join the waitlist.")
      return
    }

    setJoiningWaitlist(true)
    setWaitlistMessage("")
    try {
      await api.post(`/tour/${slug}/waitlist`, { batchId: selectedBatch?.id, seatsRequested: guestCount })
      setWaitlistMessage("You are on the waitlist. We will notify you when seats open.")
    } catch {
      setWaitlistMessage("Could not join waitlist right now. Please try again.")
    } finally {
      setJoiningWaitlist(false)
    }
  }

  const openBookingWizard = () => {
    dispatch(startWizard({
      tourId: tour.id,
      tourSlug: tour.slug,
      departureBatchId: selectedBatch?.id,
    }))
    Array.from({ length: guestCount }).forEach((_, index) => {
      dispatch(upsertTraveler({
        index,
        traveler: {
          fullName: index === 0 ? user?.name ?? "" : "",
          aadhaar: "",
          email: index === 0 ? user?.email ?? undefined : undefined,
          phone: index === 0 ? user?.phone ?? undefined : undefined,
          relation: index === 0 ? "Primary" : "Friend",
          country: "India",
        },
      }))
    })
    setBookingModal(true)
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#eff1f3] pb-24">
        <section className="relative min-h-[58vh] overflow-hidden bg-black text-white sm:min-h-[66vh]">
          <img src={gallery[0]} alt={tour.title} className="absolute inset-0 h-full w-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/10" />

          <div className="relative mx-auto flex min-h-[58vh] max-w-7xl flex-col justify-end px-4 pb-10 pt-28 sm:min-h-[66vh] sm:px-6 lg:px-8">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Button asChild variant="secondary" className="rounded-full bg-black/45 text-white ring-1 ring-white/20 hover:bg-black/55">
                <Link href="/tours">
                  <ArrowLeft className="mr-2 h-3.5 w-3.5" />
                  Back to all tours
                </Link>
              </Button>
              <Badge className="bg-emerald-100 text-emerald-900">Verified Experience</Badge>
            </div>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">{tour.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm font-bold text-white/95">
              <span className="inline-flex items-center gap-1.5"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{tour.rating} ({tour.reviews} reviews)</span>
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{tour.location.city}, {tour.location.country}</span>
            </div>
          </div>
        </section>

        <section className="relative z-20 -mt-8 px-4 sm:px-6 lg:-mt-10 lg:px-8">
          <Card className="mx-auto max-w-7xl border border-slate-200 bg-white py-3 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
            <CardContent className="grid gap-3 px-3 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Duration</p>
                <p className="mt-1 text-sm font-black text-slate-950">{tour.duration} Days</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Group Size</p>
                <p className="mt-1 text-sm font-black text-slate-950">{tour.groupSize}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Effort</p>
                <p className="mt-1 text-sm font-black text-slate-950">{computed.difficulty}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Languages</p>
                <p className="mt-1 text-sm font-black text-slate-950">Eng, Hindi</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="sticky top-0 z-30 mt-4 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 py-3 sm:px-6 lg:px-8">
            {navItems.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="shrink-0 rounded-full px-4 py-2 text-sm font-black text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
                {label}
              </a>
            ))}
          </div>
        </div>

        <section className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_360px] lg:px-8">
          <div className="space-y-6">
            <Card id="overview" className="scroll-mt-24 border border-slate-200 bg-white py-4 shadow-sm">
              <CardContent>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">The Experience</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-slate-950">A trip designed for stories and community</h2>
                <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">{tour.description}</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700"><Check className="mr-2 inline h-4 w-4 text-emerald-600" />Solo-traveler Friendly</div>
                  <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm font-bold text-slate-700"><Check className="mr-2 inline h-4 w-4 text-emerald-600" />Verified Accommodations</div>
                </div>
              </CardContent>
            </Card>

            <Card id="gallery" className="scroll-mt-24 border border-slate-200 bg-white py-4 shadow-sm">
              <CardContent>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Gallery</p>
                <p className="mt-1 text-sm text-slate-500">See the journey before you join</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {gallery.slice(0, 5).map((image, index) => (
                    <button key={image} onClick={() => setLightbox(image)} className={`group relative overflow-hidden rounded-2xl bg-slate-200 ${index === 0 ? "sm:col-span-2 sm:row-span-2" : ""}`}>
                      <img src={image} alt={`${tour.title} photo ${index + 1}`} className="aspect-[4/3] h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card id="itinerary" className="scroll-mt-24 border border-slate-200 bg-white py-4 shadow-sm">
              <CardContent>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Itinerary</p>
                <p className="mt-1 text-sm text-slate-500">Day-wise travel timeline</p>
                <div className="mt-4 space-y-3">
                  {tour.itinerary.map((day) => {
                    const open = expandedDays.includes(day.day)
                    return (
                      <article key={day.day} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                        <button onClick={() => setExpandedDays((current) => open ? current.filter((item) => item !== day.day) : [...current, day.day])} className="flex w-full items-center justify-between gap-4 p-4 text-left">
                          <div className="flex items-center gap-3">
                            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-950 text-xs font-black text-white">D{day.day}</span>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Today&apos;s experience</p>
                              <p className="text-sm font-black text-slate-900">{day.title}</p>
                            </div>
                          </div>
                          {open ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </button>
                        {open ? (
                          <div className="border-t border-slate-100 p-4">
                            <p className="text-sm italic text-slate-600">{day.description}</p>
                            <div className="mt-4 grid gap-3 sm:grid-cols-2">
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Activities</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {day.activities.map((activity) => <span key={activity} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{activity}</span>)}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-black uppercase tracking-[0.16em] text-slate-500">Meals</p>
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {day.meals.map((meal) => <span key={meal} className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">{meal}</span>)}
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : null}
                      </article>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            <Card id="inclusions" className="scroll-mt-24 border border-slate-200 bg-white py-4 shadow-sm">
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                    <h3 className="text-lg font-black text-emerald-900">Included</h3>
                    <ul className="mt-3 space-y-2 text-sm text-emerald-900">
                      {tour.budget.inclusions.map((item) => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4" />{item}</li>)}
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                    <h3 className="text-lg font-black text-rose-900">Excluded</h3>
                    <ul className="mt-3 space-y-2 text-sm text-rose-900">
                      {tour.budget.exclusions.map((item) => <li key={item} className="flex items-center gap-2"><X className="h-4 w-4" />{item}</li>)}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="host" className="scroll-mt-24 border border-slate-200 bg-white py-4 shadow-sm">
              <CardContent>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-700">Meet Host</p>
                <div className="mt-3 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-black text-slate-950">GetHotels Verified Host</h3>
                    <p className="mt-1 text-sm text-slate-600">Local expert with curated route and group safety protocols.</p>
                  </div>
                  <Button className="bg-black text-white hover:bg-slate-800">Message Host</Button>
                </div>
              </CardContent>
            </Card>

            <Card id="reviews" className="scroll-mt-24 border border-slate-200 bg-white py-4 shadow-sm">
              <CardContent>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-cyan-700">Reviews</p>
                <div className="mt-3 space-y-3">
                  {visibleReviews.map((review, index) => (
                    <div key={`${review.name}-${index}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                      <div className="flex items-center justify-between">
                        <p className="font-black text-slate-950">{review.name}</p>
                        <p className="inline-flex items-center gap-1 text-sm font-black text-slate-800"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{review.rating}</p>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{review.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="hidden lg:block">
            <Card className="sticky top-24 overflow-hidden border border-slate-200 bg-white py-0 shadow-[0_22px_55px_rgba(15,23,42,0.12)]">
              <CardContent className="space-y-3">
                <div className="-mx-6 -mt-6 border-b border-slate-100 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 px-6 pb-5 pt-6 text-white">
                  <div className="flex items-center justify-between gap-3">
                    <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                      {isSoldOut ? "Waitlist open" : seatsLeft <= 3 ? "Almost full" : "Open group"}
                    </Badge>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-100">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Protected checkout
                    </span>
                  </div>
                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-cyan-100">Starting from</p>
                  <div className="mt-1 flex items-end justify-between">
                    <p className="text-4xl font-black tracking-tight">{formatMoney(unitPrice)}</p>
                    <p className="pb-1 text-xs font-semibold text-cyan-100">per person</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Selected group</p>
                    <p className="mt-1 text-sm font-black text-slate-950">{tour.duration} days - {computed.difficulty}</p>
                  </div>
                  <Users className="h-5 w-5 text-cyan-700" />
                </div>

                {batches.length > 0 ? (
                  <div className="space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Departure batches</p>
                    <div className="space-y-2">
                      {batches.slice(0, 3).map((batch) => {
                        const selected = batch.id === selectedBatchId
                        const batchSoldOut = batch.seatsLeft <= 0 || batch.status === "SOLD_OUT"
                        return (
                          <button
                            key={batch.id}
                            onClick={() => {
                              setSelectedBatchId(batch.id)
                              setGuestCount((current) => Math.min(Math.max(1, batch.seatsLeft || 1), current))
                            }}
                            className={`w-full rounded-2xl border p-3 text-left transition ${selected ? "border-cyan-300 bg-cyan-50 shadow-sm ring-4 ring-cyan-100" : "border-slate-200 bg-white hover:border-cyan-200 hover:bg-slate-50"}`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="flex items-center gap-1.5 text-sm font-black text-slate-950">
                                  <CalendarDays className="h-4 w-4 text-cyan-700" />
                                  {formatShortDate(new Date(batch.startDate))} - {formatShortDate(new Date(batch.endDate))}
                                </p>
                                <p className="mt-1 text-xs font-semibold text-slate-500">{batch.label || "Curated group departure"}</p>
                              </div>
                              <Badge className={batchSoldOut ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : "bg-emerald-100 text-emerald-800 hover:bg-emerald-100"}>
                                {batchSoldOut ? "Full" : `${batch.seatsLeft} left`}
                              </Badge>
                            </div>
                            <p className="mt-2 text-sm font-black text-slate-950">{formatMoney(batch.currentPrice)}</p>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-500">Departure Date</p>
                    <div className="mt-1 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700">
                      <CalendarDays className="h-4 w-4 text-cyan-700" />
                      {formatDate(computed.startDate)}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-700">Travelers</span>
                    <div className="flex items-center gap-3">
                      <Button size="icon-xs" variant="outline" className="rounded-full" onClick={() => setGuestCount(Math.max(1, guestCount - 1))}><Minus className="h-4 w-4" /></Button>
                      <span className="text-sm font-black">{guestCount} Guests</span>
                      <Button size="icon-xs" variant="outline" className="rounded-full" onClick={() => setGuestCount(Math.min(Math.max(1, seatsLeft), guestCount + 1))} disabled={isSoldOut}><Plus className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Add full traveler, ID, medical and emergency details in the next step.</p>
                </div>

                <Button onClick={isSoldOut ? joinWaitlist : openBookingWizard} disabled={joiningWaitlist} className={`h-12 w-full rounded-2xl text-base font-black shadow-lg ${isSoldOut ? "bg-amber-600 text-white shadow-amber-200 hover:bg-amber-700" : "bg-slate-950 text-white shadow-slate-200 hover:bg-cyan-700"}`}>
                  {isSoldOut ? "Join waitlist" : computed.approvalRequired ? "Request to join" : "Book this trip"}
                </Button>

                <p className="text-center text-xs font-semibold text-slate-500">Seats are revalidated before payment</p>
                {waitlistMessage ? <p className="rounded-xl bg-amber-50 p-3 text-xs font-bold text-amber-800">{waitlistMessage}</p> : null}

                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" onClick={() => setLiked(!liked)}><Heart className={`mr-1 h-4 w-4 ${liked ? "fill-rose-500 text-rose-500" : ""}`} />Save</Button>
                  <Button variant="outline" onClick={share}><Share2 className="mr-1 h-4 w-4" />Share</Button>
                </div>

                {copied ? <p className="text-center text-xs font-black text-emerald-700">Link copied</p> : null}
                <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-3 text-xs font-bold text-cyan-900">Only {seatsLeft} slots left for this departure. Group bookings stay together if seats are available.</div>
                {computed.approvalRequired ? <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-bold text-amber-800"><Lock className="mr-1 inline h-3.5 w-3.5" />Host approval required for this tour.</div> : null}
                {chatUnlocked ? <Button asChild variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"><Link href={`/tours/${tour.slug}/chat`}>Open Group Chat</Link></Button> : null}
              </CardContent>
            </Card>
          </aside>
        </section>

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-[0_-18px_45px_rgba(15,23,42,0.1)] lg:hidden">
          <div className="mx-auto flex max-w-7xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-500">Starting from</p>
              <p className="truncate text-lg font-black text-slate-950">{formatMoney(unitPrice)} <span className="text-xs font-semibold text-slate-500">/person</span></p>
            </div>
            <Button size="icon" variant="outline" onClick={() => setLiked(!liked)}><Heart className={`h-5 w-5 ${liked ? "fill-rose-500 text-rose-500" : "text-slate-600"}`} /></Button>
            <Button onClick={isSoldOut ? joinWaitlist : openBookingWizard} className={`${isSoldOut ? "bg-amber-600 text-white hover:bg-amber-700" : "bg-teal-700 text-white hover:bg-teal-800"}`}>
              {isSoldOut ? "Waitlist" : computed.approvalRequired ? "Request" : "Join Tour"}
            </Button>
          </div>
        </div>

        {lightbox ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightbox(null)}>
            <Button size="icon" variant="secondary" className="absolute right-5 top-5 bg-white text-slate-950 hover:bg-slate-200"><X className="h-5 w-5" /></Button>
            <img src={lightbox} alt="Tour preview" className="max-h-[86vh] max-w-full rounded-2xl object-contain shadow-2xl" />
          </div>
        ) : null}

        <TourBookingWizard
          open={bookingModal}
          onOpenChange={setBookingModal}
          tourIdOrSlug={tour.slug}
          contact={{
            name: user?.name ?? "",
            email: user?.email ?? "",
            phone: user?.phone ?? "",
          }}
        />
      </main>
      <Footer />
    </>
  )
}
