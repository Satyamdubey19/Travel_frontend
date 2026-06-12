"use client"

import { useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import { getActivityBySlug } from "@/lib/activities"
import {
  AlertCircle,
  ArrowLeft,
  Award,
  Backpack,
  BadgeCheck,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Compass,
  CreditCard,
  Languages,
  MapPin,
  MessageCircle,
  Route,
  ShieldCheck,
  Sparkles,
  Star,
  Sun,
  ThumbsUp,
  Ticket,
  Timer,
  Users,
  XCircle,
  Zap,
} from "lucide-react"

const getDateInputValue = (offsetDays = 1) => {
  const date = new Date()
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().split("T")[0]
}

const tomorrowInputValue = getDateInputValue(1)

const MOCK_REVIEWS = [
  { name: "Meera K.", initials: "MK", rating: 5, date: "Apr 2025", text: "Absolutely breathtaking! The guide was knowledgeable and funny. We got photos we will cherish forever. Safety gear was top-notch.", helpful: 41 },
  { name: "Arjun T.", initials: "AT", rating: 5, date: "Apr 2025", text: "Best activity I have done in India. The host energy was contagious and everything ran perfectly on schedule.", helpful: 28 },
  { name: "Nisha P.", initials: "NP", rating: 4, date: "Mar 2025", text: "Really enjoyed it. The small group made it very personal. Slight wait at the start but the experience was worth every minute.", helpful: 16 },
  { name: "Dev M.", initials: "DM", rating: 5, date: "Feb 2025", text: "Booked this for our anniversary and it exceeded all expectations. The host made it feel very special for us.", helpful: 35 },
]

const RATING_BREAKDOWN = [
  { stars: 5, count: 91 },
  { stars: 4, count: 53 },
  { stars: 3, count: 22 },
  { stars: 2, count: 8 },
  { stars: 1, count: 4 },
]

const FAQ_ITEMS = [
  { q: "Is prior experience required?", a: "No prior experience is necessary. Our certified guides will brief you on everything you need to know before the activity begins." },
  { q: "What should I wear?", a: "Comfortable, weather-appropriate clothing is recommended. Closed-toe shoes are required for most activities. Check the Bring section for specific requirements." },
  { q: "How many people are in the group?", a: "Group sizes are capped per activity for quality. Private group upgrades are available for exclusive access and personalised experience." },
  { q: "Is it safe for kids?", a: "Age and health requirements vary by activity. Check the difficulty level and contact the host if concerned. Most Easy-level activities welcome guests aged 8 and above." },
  { q: "What is the cancellation policy?", a: "Free cancellation up to 24 hours before the activity. After that, a 50% charge applies. No-shows are non-refundable. Weather-related cancellations receive a full refund." },
  { q: "What if the weather is bad?", a: "Our hosts monitor weather closely. If unsafe conditions arise, you will be offered a reschedule or full refund. Bookings are never cancelled without advance notice." },
]

const ACTIVITY_GALLERY: Record<string, string[]> = {
  adventure: [
    "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=900&q=80",
  ],
  water: [
    "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1559494007-9f5847c49d94?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1506953823976-52e1fdc0149a?auto=format&fit=crop&w=900&q=80",
  ],
  heritage: [
    "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?auto=format&fit=crop&w=900&q=80",
  ],
  food: [
    "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1476224203421-9ac39bcb3df4?auto=format&fit=crop&w=900&q=80",
  ],
  wellness: [
    "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=900&q=80",
  ],
}

const NOT_INCLUDED = ["Personal expenses", "Transport to meeting point", "Meals (unless listed)", "Gratuities"]

const SLOT_SPOTS = [7, 4, 11, 6, 9]

const DIFF_COLOR: Record<string, string> = {
  Easy: "bg-emerald-500",
  Moderate: "bg-amber-500",
  High: "bg-red-500",
}

const DIFF_WIDTH: Record<string, string> = {
  Easy: "w-1/3",
  Moderate: "w-2/3",
  High: "w-full",
}

export default function ActivityDetailPage() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : ""
  const activity = getActivityBySlug(slug)
  const [date, setDate] = useState(tomorrowInputValue)
  const [time, setTime] = useState("")
  const [guests, setGuests] = useState(2)
  const [privateGroup, setPrivateGroup] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const [activeImage, setActiveImage] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, boolean>>({})

  if (!activity) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
          <Compass className="size-12 text-slate-300" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">Activity not found</h1>
          <p className="mt-2 text-slate-500">This activity is no longer available.</p>
          <Link href="/activities" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white">
            <ArrowLeft size={16} />
            Back to activities
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const galleryImages = [activity.image, ...(ACTIVITY_GALLERY[activity.category] || []).filter((img) => img !== activity.image)].slice(0, 4)
  const privateFee = privateGroup ? 1200 : 0
  const subtotal = activity.price * guests
  const serviceFee = Math.round((subtotal + privateFee) * 0.08)
  const total = subtotal + privateFee + serviceFee
  const savings = activity.originalPrice - activity.price
  const totalRatings = RATING_BREAKDOWN.reduce((s, r) => s + r.count, 0)
  const prepItems = ["Comfortable shoes", "Valid ID", "Water bottle (500ml+)", "Arrive 15 min early"]

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-950">
      <Header />
      <main>

        <section className="border-b border-stone-200 bg-gradient-to-b from-white to-[#f7f4ee]">
          <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Link href="/activities" className="inline-flex items-center gap-1.5 text-slate-700 transition hover:text-slate-950">
                <ArrowLeft size={15} />Activities
              </Link>
              <span className="text-slate-300">/</span>
              <span>{activity.city}</span>
              <span className="text-slate-300">/</span>
              <span className="truncate text-slate-950">{activity.title}</span>
            </div>

            <div className="mt-8 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
              <div className="space-y-3">
                <div className="group relative overflow-hidden rounded-[2rem] bg-slate-900 shadow-2xl shadow-stone-200">
                  <img
                    src={galleryImages[activeImage]}
                    alt={activity.title}
                    className="h-[28rem] w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/5 to-transparent" />
                  {savings > 0 && (
                    <div className="absolute right-4 top-4 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-black text-white shadow-lg">
                      Save Rs. {savings.toLocaleString()} per person
                    </div>
                  )}
                  <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-black text-slate-800 shadow backdrop-blur">
                    <Sparkles size={14} />
                    {activity.category} experience
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
                    <span className="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-xs font-black text-slate-800 shadow backdrop-blur">
                      <Timer size={13} />{activity.duration}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-xs font-black text-slate-800 shadow backdrop-blur">
                      <Users size={13} />{activity.groupSize}
                    </span>
                    <span className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-white shadow backdrop-blur ${
                      activity.difficulty === "Easy" ? "bg-emerald-600/90" : activity.difficulty === "Moderate" ? "bg-amber-500/90" : "bg-red-600/90"
                    }`}>
                      <Zap size={13} />{activity.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative h-20 flex-1 overflow-hidden rounded-xl border-2 transition duration-200 ${
                        activeImage === i ? "scale-[1.02] border-[#7c2d12] shadow-lg" : "border-transparent opacity-60 hover:opacity-90"
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7c2d12] px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-white">
                    <Sparkles size={13} />{activity.category}
                  </span>
                  {activity.host.verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      <ShieldCheck size={13} />Certified host
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    <BadgeCheck size={13} />Instant booking
                  </span>
                </div>

                <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">{activity.title}</h1>
                <p className="mt-1.5 text-lg font-semibold text-slate-500">{activity.area} - {activity.city}</p>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={17} className={s <= Math.floor(activity.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
                    ))}
                    <span className="ml-1 text-base font-black">{activity.rating}</span>
                    <span className="text-sm font-semibold text-slate-500">({activity.reviews} reviews)</span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  A {activity.difficulty.toLowerCase()}-level {activity.category} experience in {activity.city}. Hosted by {activity.host.name} with live slot booking, itinerary, safety gear, and all inclusions visible before you reserve.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: "Duration", value: activity.duration, icon: Timer },
                    { label: "Group", value: activity.groupSize, icon: Users },
                    { label: "Language", value: activity.language, icon: Languages },
                    { label: "Difficulty", value: activity.difficulty, icon: Zap },
                  ].map((spec) => (
                    <div key={spec.label} className="flex flex-col items-center rounded-2xl border border-stone-200 bg-white px-3 py-4 text-center shadow-sm">
                      <spec.icon className="size-5 text-slate-400" />
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">{spec.label}</p>
                      <p className="mt-1 text-sm font-black">{spec.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">Difficulty level</p>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-200">
                      <div className={`h-full rounded-full transition-all ${DIFF_COLOR[activity.difficulty]} ${DIFF_WIDTH[activity.difficulty]}`} />
                    </div>
                    <span className={`text-xs font-black ${activity.difficulty === "Easy" ? "text-emerald-700" : activity.difficulty === "Moderate" ? "text-amber-700" : "text-red-700"}`}>
                      {activity.difficulty}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">Per person</p>
                    <div className="mt-1 flex items-end gap-2">
                      <p className="text-3xl font-black">Rs. {activity.price.toLocaleString()}</p>
                      <p className="mb-1 text-sm font-bold text-slate-400 line-through">Rs. {activity.originalPrice.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">Free cancellation up to 24 hrs</p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">No hidden fees</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_26rem]">
            <div className="space-y-8">

              <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
                <div className="bg-slate-950 p-6 text-white sm:p-8">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-white/70">
                    <Route size={14} />Experience flow
                  </p>
                  <h2 className="mt-5 text-2xl font-black">Your activity from start to finish</h2>
                  <div className="mt-6 space-y-0">
                    {activity.itinerary.map((item, index) => (
                      <div key={item} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-slate-950">
                            {index + 1}
                          </div>
                          {index < activity.itinerary.length - 1 && (
                            <div className="my-1 h-8 w-0.5 bg-white/20" />
                          )}
                        </div>
                        <div className="pb-6">
                          <p className="pt-1.5 text-sm font-black">{item}</p>
                          <p className="mt-1 text-xs leading-5 text-white/50">Host-guided step with buffer time.</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">What makes this special</p>
                  <h2 className="mt-3 text-2xl font-black">Highlights worth booking for</h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {activity.highlights.map((feature) => (
                      <div key={feature} className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3.5 transition hover:bg-emerald-50">
                        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                        <span className="text-sm font-bold text-slate-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
                <div className="border-b border-stone-100 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Inclusions</p>
                  <h2 className="mt-2 text-2xl font-black">What is included and what is not</h2>
                </div>
                <div className="grid gap-0 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 divide-stone-100">
                  <div className="p-6">
                    <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
                      <CheckCircle2 size={14} />Included
                    </p>
                    <div className="space-y-2.5">
                      {activity.included.map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl bg-emerald-50/60 px-4 py-3 transition hover:bg-emerald-50">
                          <BadgeCheck className="size-4 shrink-0 text-emerald-600" />
                          <span className="text-sm font-bold text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-red-600">
                      <XCircle size={14} />Not included
                    </p>
                    <div className="space-y-2.5">
                      {NOT_INCLUDED.map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3">
                          <XCircle className="size-4 shrink-0 text-red-400" />
                          <span className="text-sm font-bold text-slate-500">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-stone-200 bg-[#e8dfd1] p-6 shadow-sm">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-700 shadow-sm">
                    <MapPin size={14} />Meeting map
                  </p>
                  <svg className="absolute inset-0 h-full w-full opacity-60" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M5 25 C23 32,37 18,55 28 S80 48,96 36" fill="none" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
                    <path d="M9 76 C28 58,46 72,65 56 S83 37,96 48" fill="none" stroke="#a8a29e" strokeWidth="2" strokeLinecap="round" />
                    <path d="M31 10 C42 28,48 44,55 88" fill="none" stroke="#7c2d12" strokeWidth="1.5" strokeDasharray="3.5 3.5" strokeLinecap="round" opacity="0.5" />
                    <circle cx="52" cy="48" r="3.5" fill="#7c2d12" opacity="0.15" />
                    <circle cx="70" cy="36" r="2" fill="#a8a29e" opacity="0.5" />
                    <circle cx="28" cy="62" r="2" fill="#a8a29e" opacity="0.5" />
                  </svg>
                  <div className="absolute left-[52%] top-[48%] -translate-x-1/2 -translate-y-1/2">
                    <div className="flex size-14 items-center justify-center rounded-full bg-[#7c2d12] text-white shadow-2xl ring-4 ring-white/30">
                      <MapPin size={26} />
                    </div>
                    <div className="mx-auto mt-1 h-4 w-0.5 bg-[#7c2d12]/40" />
                    <div className="mx-auto h-2 w-2 rounded-full bg-[#7c2d12]/25" />
                  </div>
                  <div className="absolute bottom-5 left-5 right-5 rounded-2xl bg-white/96 p-4 shadow-lg backdrop-blur">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">Meet here</p>
                        <p className="mt-1 font-black text-slate-950">{activity.area}</p>
                        <p className="mt-1 text-xs text-slate-500">{activity.city} - Arrive 15 min early</p>
                      </div>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7c2d12] text-white shadow">
                        <MapPin size={16} />
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2 text-xs font-bold">
                      <span className="flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-slate-600"><Clock size={12} />On-time start</span>
                      <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700"><ShieldCheck size={12} />Safe zone</span>
                    </div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex size-12 items-center justify-center rounded-2xl bg-[#7c2d12]/10 text-[#7c2d12]">
                        <Award size={22} />
                      </div>
                      <div>
                        <h3 className="font-black">{activity.host.name}</h3>
                        <p className="text-xs text-slate-500">{activity.host.responseTime}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">Verified</span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {[
                      { icon: MessageCircle, text: "Slot help" },
                      { icon: Camera, text: "Photo spots" },
                      { icon: Sun, text: "Best light" },
                      { icon: Clock, text: "On-time start" },
                    ].map(({ icon: HIcon, text }) => (
                      <span key={text} className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3 text-xs font-bold text-slate-600">
                        <HIcon size={14} className="text-slate-400" />{text}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Safety standards</p>
                    <div className="mt-3 space-y-2">
                      {["Certified equipment", "Safety briefing mandatory", "Emergency protocols active", "Licensed guide"].map((s) => (
                        <p key={s} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                          <ShieldCheck size={13} className="text-emerald-600" />{s}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-700"><Ticket size={20} /></div>
                      <h3 className="text-lg font-black">What to bring</h3>
                    </div>
                    <div className="mt-5 space-y-2.5">
                      {prepItems.map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm font-bold text-slate-700">
                          <Backpack className="size-4 shrink-0 text-orange-500" />{item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700"><AlertCircle size={20} /></div>
                      <h3 className="text-lg font-black">Cancellation policy</h3>
                    </div>
                    <div className="mt-5 space-y-3">
                      {[
                        { time: "24+ hours before", policy: "Full refund", color: "text-emerald-700" },
                        { time: "12-24 hours before", policy: "50% refund", color: "text-amber-700" },
                        { time: "Under 12 hours", policy: "Non-refundable", color: "text-red-700" },
                        { time: "Weather cancellation", policy: "Full refund", color: "text-emerald-700" },
                      ].map((row) => (
                        <div key={row.time} className="flex items-center justify-between rounded-xl bg-stone-50 px-4 py-3">
                          <span className="text-xs font-bold text-slate-500">{row.time}</span>
                          <span className={`text-xs font-black ${row.color}`}>{row.policy}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Guest reviews</p>
                    <h2 className="mt-2 text-2xl font-black">{activity.rating} out of 5 stars</h2>
                  </div>
                  <p className="text-sm font-bold text-slate-500">{activity.reviews} verified reviews</p>
                </div>
                <div className="mt-6 grid gap-6 sm:grid-cols-[20rem_1fr]">
                  <div className="space-y-2.5">
                    {RATING_BREAKDOWN.map((row) => {
                      const pct = Math.round((row.count / totalRatings) * 100)
                      return (
                        <div key={row.stars} className="flex items-center gap-3">
                          <span className="w-5 text-right text-xs font-black text-slate-500">{row.stars}</span>
                          <Star size={12} className="shrink-0 fill-amber-400 text-amber-400" />
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-stone-200">
                            <div className="h-full rounded-full bg-amber-400 transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="w-7 text-xs font-bold text-slate-400">{row.count}</span>
                        </div>
                      )
                    })}
                  </div>
                  <div className="flex flex-col items-center justify-center rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                    <p className="text-6xl font-black text-slate-950">{activity.rating}</p>
                    <div className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} size={18} className={s <= Math.floor(activity.rating) ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
                      ))}
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-500">{activity.reviews} total reviews</p>
                  </div>
                </div>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {MOCK_REVIEWS.map((review, i) => (
                    <div key={i} className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-full bg-[#7c2d12] text-xs font-black text-white">{review.initials}</div>
                          <div>
                            <p className="text-sm font-black">{review.name}</p>
                            <p className="text-xs text-slate-400">{review.date}</p>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} size={12} className={s <= review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"} />
                          ))}
                        </div>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600">{review.text}</p>
                      <button
                        onClick={() => setHelpfulVotes((v) => ({ ...v, [i]: !v[i] }))}
                        className={`mt-4 flex items-center gap-1.5 text-xs font-bold transition ${helpfulVotes[i] ? "text-slate-950" : "text-slate-400 hover:text-slate-700"}`}
                      >
                        <ThumbsUp size={13} />
                        Helpful {helpfulVotes[i] ? review.helpful + 1 : review.helpful}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Common questions</p>
                <h2 className="mt-2 text-2xl font-black">Frequently asked</h2>
                <div className="mt-6 space-y-2">
                  {FAQ_ITEMS.map((item, i) => (
                    <div key={i} className="overflow-hidden rounded-2xl border border-stone-100 bg-stone-50">
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="text-sm font-black text-slate-800">{item.q}</span>
                        <ChevronDown size={18} className={`shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`} />
                      </button>
                      {openFaq === i && (
                        <div className="border-t border-stone-200 px-5 pb-4 pt-3">
                          <p className="text-sm leading-6 text-slate-600">{item.a}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <aside className="h-fit space-y-4 lg:sticky lg:top-24">
              <div className="overflow-hidden rounded-[1.75rem] border border-stone-200 bg-white shadow-2xl shadow-stone-200/80">
                <div className="bg-[#7c2d12] p-5 text-white">
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-white/55">
                    <Ticket size={15} />Activity pass
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-white/55">Per person</p>
                      <div className="mt-1 flex items-end gap-2">
                        <p className="text-3xl font-black">Rs. {activity.price.toLocaleString()}</p>
                        <p className="mb-0.5 text-sm text-white/35 line-through">Rs. {activity.originalPrice.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`rounded-full px-3 py-1 text-xs font-black ${
                        activity.difficulty === "Easy" ? "bg-emerald-400/20 text-emerald-200" :
                        activity.difficulty === "Moderate" ? "bg-amber-400/20 text-amber-200" : "bg-red-400/20 text-red-200"
                      }`}>{activity.difficulty}</p>
                      <p className="mt-1 text-xs text-white/35">Certified host</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <label>
                    <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">Date</span>
                    <input
                      type="date"
                      min={tomorrowInputValue}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-bold outline-none focus:border-[#7c2d12] focus:ring-2 focus:ring-[#7c2d12]/10"
                    />
                  </label>

                  <div>
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">Available slots</span>
                    <div className="grid gap-2">
                      {activity.startTimes.map((slot, idx) => {
                        const spots = SLOT_SPOTS[idx % SLOT_SPOTS.length]
                        return (
                          <button
                            key={slot}
                            onClick={() => setTime(slot)}
                            className={`rounded-xl border px-4 py-3.5 text-left text-sm font-black transition ${
                              time === slot ? "border-[#7c2d12] bg-[#7c2d12] text-white" : "border-stone-200 bg-stone-50 text-slate-700 hover:border-[#7c2d12]/30 hover:bg-white"
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Clock size={14} className={time === slot ? "text-white/70" : "text-slate-400"} />
                                {slot}
                              </span>
                              <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black ${
                                time === slot ? "bg-white/20 text-white" :
                                spots <= 4 ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"
                              }`}>
                                {spots} spots
                              </span>
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">Guests</span>
                    <div className="flex items-center gap-2 rounded-xl border border-stone-200 p-1">
                      <button onClick={() => setGuests(Math.max(1, guests - 1))} className="flex size-10 items-center justify-center rounded-lg bg-stone-100 text-lg font-black text-slate-700 transition hover:bg-stone-200">-</button>
                      <span className="flex-1 text-center text-sm font-black">{guests} {guests === 1 ? "guest" : "guests"}</span>
                      <button onClick={() => setGuests(Math.min(12, guests + 1))} className="flex size-10 items-center justify-center rounded-lg bg-stone-100 text-lg font-black text-slate-700 transition hover:bg-stone-200">+</button>
                    </div>
                  </div>

                  <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3.5 text-sm font-bold text-slate-700 transition hover:border-stone-300 hover:bg-white">
                    <span>Private group upgrade <span className="text-xs font-bold text-slate-400">+Rs. 1,200</span></span>
                    <input type="checkbox" checked={privateGroup} onChange={(e) => setPrivateGroup(e.target.checked)} className="size-4 accent-[#7c2d12]" />
                  </label>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Rs. {activity.price.toLocaleString()} x {guests} {guests === 1 ? "guest" : "guests"}</span>
                        <span className="font-bold">Rs. {subtotal.toLocaleString()}</span>
                      </div>
                      {privateGroup && (
                        <div className="flex justify-between text-slate-500">
                          <span>Private group</span>
                          <span className="font-bold">Rs. {privateFee.toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-500">
                        <span>Service fee (8%)</span>
                        <span className="font-bold">Rs. {serviceFee.toLocaleString()}</span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>You save</span>
                          <span>-Rs. {(savings * guests).toLocaleString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-stone-200 pt-3 text-base">
                        <span className="font-black">Total</span>
                        <span className="font-black">Rs. {total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => time && setConfirmed(true)}
                    disabled={!time}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#7c2d12] text-sm font-black text-white shadow-lg shadow-[#7c2d12]/20 transition hover:bg-[#5f220d] active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none"
                  >
                    <CalendarDays size={17} />
                    {!time ? "Select a time slot first" : `Reserve Rs. ${total.toLocaleString()}`}
                  </button>

                  {confirmed && (
                    <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />
                        <div>
                          <p className="text-sm font-black text-emerald-800">Booking request sent!</p>
                          <p className="mt-1 text-xs font-semibold text-emerald-600">
                            {date} at {time} - {guests} {guests === 1 ? "guest" : "guests"}. {activity.host.name} will confirm your slot.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3"><MessageCircle size={14} />Slot help</span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3"><Camera size={14} />Photo spots</span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3"><CreditCard size={14} />Secure payment</span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3"><ShieldCheck size={14} />Safety cert.</span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">Why book with us</p>
                <div className="mt-4 space-y-3">
                  {[
                    { icon: ShieldCheck, text: "Certified and verified activity hosts" },
                    { icon: BadgeCheck, text: "Instant slot confirmation" },
                    { icon: CreditCard, text: "Pay at confirmation only" },
                    { icon: Clock, text: "24/7 guest support" },
                  ].map(({ icon: TIcon, text }) => (
                    <div key={text} className="flex items-center gap-3 text-sm font-bold text-slate-700">
                      <TIcon className="size-5 shrink-0 text-emerald-600" />{text}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}