"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/layout/Header/Header";
import Footer from "@/components/layout/Footer/Footer";
import { findActivityBySlug, type Activity } from "@/lib/activities";
import api, { getApiErrorMessage } from "@/lib/axios";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import { useAuth } from "@/contexts/AuthContext";
import PolicyModal from "@/components/policy/PolicyModal";
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
  Ticket,
  Timer,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

const getDateInputValue = (offsetDays = 1) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split("T")[0];
};

const tomorrowInputValue = getDateInputValue(1);

const FAQ_ITEMS = [
  {
    q: "Is prior experience required?",
    a: "No prior experience is necessary. Our certified guides will brief you on everything you need to know before the activity begins.",
  },
  {
    q: "What should I wear?",
    a: "Comfortable, weather-appropriate clothing is recommended. Closed-toe shoes are required for most activities. Check the Bring section for specific requirements.",
  },
  {
    q: "How many people are in the group?",
    a: "Live remaining capacity is shown for each dated slot. Availability is checked again by the server before payment.",
  },
  {
    q: "Is it safe for kids?",
    a: "Age and health requirements vary by activity. Check the difficulty level and contact the host if concerned. Most Easy-level activities welcome guests aged 8 and above.",
  },
  {
    q: "What is the cancellation policy?",
    a: "The host's published policy is shown in the booking summary. Review it before payment; self-service activity cancellation is still being completed.",
  },
  {
    q: "What if the weather is bad?",
    a: "The verified host is responsible for deciding whether conditions are safe. Reschedule and refund handling must follow the published policy and platform support process.",
  },
];

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
};

const NOT_INCLUDED = [
  "Personal expenses",
  "Transport to meeting point",
  "Meals (unless listed)",
  "Gratuities",
];

const DIFF_COLOR: Record<string, string> = {
  Easy: "bg-emerald-500",
  Moderate: "bg-amber-500",
  High: "bg-red-500",
};

const DIFF_WIDTH: Record<string, string> = {
  Easy: "w-1/3",
  Moderate: "w-2/3",
  High: "w-full",
};

type ActivityReview = {
  id: string;
  rating: number;
  title?: string | null;
  comment: string;
  response?: string | null;
  responseAt?: string | null;
  createdAt: string;
  User: { name: string; UserProfile?: { avatarUrl?: string | null } | null };
};

export default function ActivityDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const slug = typeof params.slug === "string" ? params.slug : "";
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [date, setDate] = useState(tomorrowInputValue);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [guests, setGuests] = useState(2);
  const [bookingError, setBookingError] = useState("");
  const [bookingCode, setBookingCode] = useState("");
  const [bookingBusy, setBookingBusy] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    crypto.randomUUID(),
  );
  const [reviews, setReviews] = useState<ActivityReview[]>([]);
  const [activeImage, setActiveImage] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [policyAgreed, setPolicyAgreed] = useState(false);
  const [activePolicyModal, setActivePolicyModal] = useState<null | "TRAVELER_SAFETY_POLICY" | "CANCELLATION_POLICY">(null);
  useEffect(() => {
    if (!slug) return;
    void Promise.all([
      api.get<{ data: Activity }>(`/activity/${encodeURIComponent(slug)}`),
      api.get<{ data: ActivityReview[] }>(
        `/activity/${encodeURIComponent(slug)}/reviews`,
      ).catch(() => ({ data: { data: [] as ActivityReview[] } })),
    ])
      .then(([activityResponse, reviewResponse]) => {
        const liveActivity = activityResponse.data?.data || findActivityBySlug(slug);
        if (liveActivity) {
          setActivity(liveActivity);
          setReviews(reviewResponse.data?.data ?? []);
          const firstSlot = liveActivity.slots?.find(
            (slot) => slot.spotsLeft > 0,
          );
          if (firstSlot) {
            setDate(firstSlot.date.slice(0, 10));
            setSelectedSlotId(firstSlot.id);
          }
        } else {
          setActivity(null);
          setLoadError("Activity not found");
        }
      })
      .catch((requestError) => {
        const fallback = findActivityBySlug(slug);
        if (fallback) {
          setActivity(fallback);
          const firstSlot = fallback.slots?.find(
            (slot) => slot.spotsLeft > 0,
          );
          if (firstSlot) {
            setDate(firstSlot.date.slice(0, 10));
            setSelectedSlotId(firstSlot.id);
          }
        } else {
          setLoadError(getApiErrorMessage(requestError, "Activity unavailable"));
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7]">
        <Header />
        <main className="mx-auto min-h-[70vh] max-w-7xl animate-pulse px-4 py-10">
          <div className="h-[34rem] rounded-[2rem] bg-slate-200" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="container mx-auto flex min-h-[60vh] max-w-4xl flex-col items-center justify-center px-4 text-center">
          <Compass className="size-12 text-slate-300" />
          <h1 className="mt-4 text-2xl font-black text-slate-950">
            Activity not found
          </h1>
          <p className="mt-2 text-slate-500">
            {loadError || "This activity is no longer available."}
          </p>
          <Link
            href="/activities"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white"
          >
            <ArrowLeft size={16} />
            Back to activities
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const galleryImages = [
    activity.image,
    ...(ACTIVITY_GALLERY[activity.category] || []).filter(
      (img) => img !== activity.image,
    ),
  ].slice(0, 4);
  const subtotal = activity.price * guests;
  const total = subtotal;
  const savings = activity.originalPrice - activity.price;
  const availableDates = Array.from(
    new Set((activity.slots ?? []).map((slot) => slot.date.slice(0, 10))),
  );
  const visibleSlots = (activity.slots ?? []).filter(
    (slot) => slot.date.slice(0, 10) === date,
  );
  const selectedSlot = visibleSlots.find((slot) => slot.id === selectedSlotId);
  const prepItems = [
    "Comfortable shoes",
    "Valid ID",
    "Water bottle (500ml+)",
    "Arrive 15 min early",
  ];

  const startCheckout = async () => {
    if (!user) {
      router.push(
        `/login?callbackUrl=${encodeURIComponent(`/activities/${slug}`)}`,
      );
      return;
    }
    if (!selectedSlot || selectedSlot.spotsLeft < guests) {
      setBookingError("Select a slot with enough remaining spots");
      return;
    }
    if (!user.phone) {
      setBookingError("Add a phone number to your profile before booking");
      return;
    }
    if (!policyAgreed) {
      setBookingError("Please accept the Traveler Safety Guidelines and Cancellation Policy before continuing");
      return;
    }

    try {
      setBookingBusy(true);
      setBookingError("");
      setBookingCode("");
      const intent = await api.post<{
        data: { id: string; bookingCode: string };
      }>(`/activity/${encodeURIComponent(slug)}/booking`, {
        slotId: selectedSlot.id,
        guestCount: guests,
        contactName: user.name,
        contactEmail: user.email,
        contactPhone: user.phone,
        idempotencyKey,
      });
      const order = await api.post<{
        data: {
          orderId: string;
          amount: number;
          currency: string;
          keyId: string;
        };
      }>(`/activity/${encodeURIComponent(slug)}/payment/order`, {
        bookingId: intent.data.data.id,
      });
      const payment = await openRazorpayCheckout({
        key: order.data.data.keyId,
        amount: order.data.data.amount,
        currency: order.data.data.currency,
        name: "Travels Pro",
        description: activity.title,
        order_id: order.data.data.orderId,
        prefill: { name: user.name, email: user.email, contact: user.phone },
        notes: {
          activity: activity.title,
          bookingCode: intent.data.data.bookingCode,
        },
        theme: { color: "#7c2d12" },
      });
      await api.post(
        `/activity/${encodeURIComponent(slug)}/payment/verify`,
        payment,
      );
      setBookingCode(intent.data.data.bookingCode);
      setIdempotencyKey(crypto.randomUUID());
    } catch (requestError) {
      setBookingError(
        getApiErrorMessage(
          requestError,
          requestError instanceof Error
            ? requestError.message
            : "Activity checkout failed",
        ),
      );
    } finally {
      setBookingBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-slate-950">
      <Header />
      <main>
        <section className="border-b border-stone-200 bg-gradient-to-b from-white to-[#f7f4ee]">
          <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Link
                href="/activities"
                className="inline-flex items-center gap-1.5 text-slate-700 transition hover:text-slate-950"
              >
                <ArrowLeft size={15} />
                Activities
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
                      <Timer size={13} />
                      {activity.duration}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-white/90 px-3 py-2 text-xs font-black text-slate-800 shadow backdrop-blur">
                      <Users size={13} />
                      {activity.groupSize}
                    </span>
                    <span
                      className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-black text-white shadow backdrop-blur ${
                        activity.difficulty === "Easy"
                          ? "bg-emerald-600/90"
                          : activity.difficulty === "Moderate"
                            ? "bg-amber-500/90"
                            : "bg-red-600/90"
                      }`}
                    >
                      <Zap size={13} />
                      {activity.difficulty}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {galleryImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`relative h-20 flex-1 overflow-hidden rounded-xl border-2 transition duration-200 ${
                        activeImage === i
                          ? "scale-[1.02] border-[#7c2d12] shadow-lg"
                          : "border-transparent opacity-60 hover:opacity-90"
                      }`}
                    >
                      <img
                        src={img}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="lg:pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#7c2d12] px-3 py-1 text-xs font-black uppercase tracking-[0.15em] text-white">
                    <Sparkles size={13} />
                    {activity.category}
                  </span>
                  {activity.host.verified && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-black text-emerald-700">
                      <ShieldCheck size={13} />
                      Certified host
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
                    <BadgeCheck size={13} />
                    Instant booking
                  </span>
                </div>

                <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
                  {activity.title}
                </h1>
                <p className="mt-1.5 text-lg font-semibold text-slate-500">
                  {activity.area} - {activity.city}
                </p>

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={17}
                        className={
                          s <= Math.floor(activity.rating)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                        }
                      />
                    ))}
                    <span className="ml-1 text-base font-black">
                      {activity.rating}
                    </span>
                    <span className="text-sm font-semibold text-slate-500">
                      ({activity.reviews} reviews)
                    </span>
                  </div>
                </div>

                <p className="mt-5 text-sm leading-7 text-slate-600">
                  A {activity.difficulty.toLowerCase()}-level{" "}
                  {activity.category} experience in {activity.city}. Hosted by{" "}
                  {activity.host.name} with live slot booking, itinerary, safety
                  gear, and all inclusions visible before you reserve.
                </p>

                <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    {
                      label: "Duration",
                      value: activity.duration,
                      icon: Timer,
                    },
                    { label: "Group", value: activity.groupSize, icon: Users },
                    {
                      label: "Language",
                      value: activity.language,
                      icon: Languages,
                    },
                    {
                      label: "Difficulty",
                      value: activity.difficulty,
                      icon: Zap,
                    },
                  ].map((spec) => (
                    <div
                      key={spec.label}
                      className="flex flex-col items-center rounded-2xl border border-stone-200 bg-white px-3 py-4 text-center shadow-sm"
                    >
                      <spec.icon className="size-5 text-slate-400" />
                      <p className="mt-2 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                        {spec.label}
                      </p>
                      <p className="mt-1 text-sm font-black">{spec.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-5">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                    Difficulty level
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-200">
                      <div
                        className={`h-full rounded-full transition-all ${DIFF_COLOR[activity.difficulty]} ${DIFF_WIDTH[activity.difficulty]}`}
                      />
                    </div>
                    <span
                      className={`text-xs font-black ${activity.difficulty === "Easy" ? "text-emerald-700" : activity.difficulty === "Moderate" ? "text-amber-700" : "text-red-700"}`}
                    >
                      {activity.difficulty}
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex items-end justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">
                      Per person
                    </p>
                    <div className="mt-1 flex items-end gap-2">
                      <p className="text-3xl font-black">
                        Rs. {activity.price.toLocaleString()}
                      </p>
                      <p className="mb-1 text-sm font-bold text-slate-400 line-through">
                        Rs. {activity.originalPrice.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-emerald-600">
                      Free cancellation up to 24 hrs
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      No hidden fees
                    </p>
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
                    <Route size={14} />
                    Experience flow
                  </p>
                  <h2 className="mt-5 text-2xl font-black">
                    Your activity from start to finish
                  </h2>
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
                          <p className="mt-1 text-xs leading-5 text-white/50">
                            Host-guided step with buffer time.
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-6 sm:p-8">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    What makes this special
                  </p>
                  <h2 className="mt-3 text-2xl font-black">
                    Highlights worth booking for
                  </h2>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    {activity.highlights.map((feature) => (
                      <div
                        key={feature}
                        className="flex items-center gap-3 rounded-2xl bg-stone-50 px-4 py-3.5 transition hover:bg-emerald-50"
                      >
                        <CheckCircle2 className="size-5 shrink-0 text-emerald-600" />
                        <span className="text-sm font-bold text-slate-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="overflow-hidden rounded-[2rem] border border-stone-200 bg-white shadow-sm">
                <div className="border-b border-stone-100 p-6">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                    Inclusions
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    What is included and what is not
                  </h2>
                </div>
                <div className="grid gap-0 divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0 divide-stone-100">
                  <div className="p-6">
                    <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-emerald-700">
                      <CheckCircle2 size={14} />
                      Included
                    </p>
                    <div className="space-y-2.5">
                      {activity.included.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-xl bg-emerald-50/60 px-4 py-3 transition hover:bg-emerald-50"
                        >
                          <BadgeCheck className="size-4 shrink-0 text-emerald-600" />
                          <span className="text-sm font-bold text-slate-700">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.15em] text-red-600">
                      <XCircle size={14} />
                      Not included
                    </p>
                    <div className="space-y-2.5">
                      {NOT_INCLUDED.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3"
                        >
                          <XCircle className="size-4 shrink-0 text-red-400" />
                          <span className="text-sm font-bold text-slate-500">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
                <div className="relative min-h-[22rem] overflow-hidden rounded-[2rem] border border-stone-200 bg-[#e8dfd1] p-6 shadow-sm">
                  <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em] text-slate-700 shadow-sm">
                    <MapPin size={14} />
                    Meeting map
                  </p>
                  <svg
                    className="absolute inset-0 h-full w-full opacity-60"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M5 25 C23 32,37 18,55 28 S80 48,96 36"
                      fill="none"
                      stroke="#ffffff"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9 76 C28 58,46 72,65 56 S83 37,96 48"
                      fill="none"
                      stroke="#a8a29e"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M31 10 C42 28,48 44,55 88"
                      fill="none"
                      stroke="#7c2d12"
                      strokeWidth="1.5"
                      strokeDasharray="3.5 3.5"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    <circle
                      cx="52"
                      cy="48"
                      r="3.5"
                      fill="#7c2d12"
                      opacity="0.15"
                    />
                    <circle
                      cx="70"
                      cy="36"
                      r="2"
                      fill="#a8a29e"
                      opacity="0.5"
                    />
                    <circle
                      cx="28"
                      cy="62"
                      r="2"
                      fill="#a8a29e"
                      opacity="0.5"
                    />
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
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                          Meet here
                        </p>
                        <p className="mt-1 font-black text-slate-950">
                          {activity.area}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {activity.city} - Arrive 15 min early
                        </p>
                      </div>
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[#7c2d12] text-white shadow">
                        <MapPin size={16} />
                      </span>
                    </div>
                    <div className="mt-3 flex gap-2 text-xs font-bold">
                      <span className="flex items-center gap-1 rounded-lg bg-stone-100 px-2 py-1 text-slate-600">
                        <Clock size={12} />
                        On-time start
                      </span>
                      <span className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-emerald-700">
                        <ShieldCheck size={12} />
                        Safe zone
                      </span>
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
                        <p className="text-xs text-slate-500">
                          {activity.host.responseTime}
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                      Verified
                    </span>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2">
                    {[
                      { icon: MessageCircle, text: "Slot help" },
                      { icon: Camera, text: "Photo spots" },
                      { icon: Sun, text: "Best light" },
                      { icon: Clock, text: "On-time start" },
                    ].map(({ icon: HIcon, text }) => (
                      <span
                        key={text}
                        className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3 text-xs font-bold text-slate-600"
                      >
                        <HIcon size={14} className="text-slate-400" />
                        {text}
                      </span>
                    ))}
                  </div>
                  <div className="mt-4 rounded-2xl bg-stone-50 p-4">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Safety standards
                    </p>
                    <div className="mt-3 space-y-2">
                      {[
                        "Certified equipment",
                        "Safety briefing mandatory",
                        "Emergency protocols active",
                        "Licensed guide",
                      ].map((s) => (
                        <p
                          key={s}
                          className="flex items-center gap-2 text-xs font-bold text-slate-600"
                        >
                          <ShieldCheck size={13} className="text-emerald-600" />
                          {s}
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
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                        <Ticket size={20} />
                      </div>
                      <h3 className="text-lg font-black">What to bring</h3>
                    </div>
                    <div className="mt-5 space-y-2.5">
                      {prepItems.map((item) => (
                        <div
                          key={item}
                          className="flex items-center gap-3 rounded-xl bg-stone-50 px-4 py-3 text-sm font-bold text-slate-700"
                        >
                          <Backpack className="size-4 shrink-0 text-orange-500" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-700">
                        <AlertCircle size={20} />
                      </div>
                      <h3 className="text-lg font-black">
                        Cancellation policy
                      </h3>
                    </div>
                    <div className="mt-5 rounded-2xl bg-stone-50 p-4 text-sm font-semibold leading-6 text-slate-700">
                      {activity.cancellationPolicy ||
                        "The host has not published a cancellation policy. Checkout should not proceed until clear cancellation terms are available."}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                      Guest reviews
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Verified activity feedback
                    </h2>
                  </div>
                  <p className="text-sm font-bold text-slate-500">
                    {activity.reviews} published
                  </p>
                </div>
                <div className="mt-6 grid gap-6 rounded-[1.5rem] border border-stone-200 bg-white p-6 shadow-sm sm:grid-cols-[12rem_1fr] sm:items-center">
                  <div className="text-center sm:border-r sm:border-stone-200">
                    <p className="text-5xl font-black text-slate-950">
                      {activity.reviews > 0 ? activity.rating : "—"}
                    </p>
                    <div className="mt-2 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={18}
                          className={
                            activity.reviews > 0 &&
                            s <= Math.floor(activity.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-slate-200 text-slate-200"
                          }
                        />
                      ))}
                    </div>
                    <p className="mt-2 text-sm font-bold text-slate-500">
                      {activity.reviews} review
                      {activity.reviews === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-900">
                      Booking-linked feedback only
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Reviews can be submitted only from completed activity
                      bookings. Updated ratings are recalculated from published
                      reviews.
                    </p>
                  </div>
                </div>
                {reviews.length > 0 ? (
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    {reviews.map((review) => (
                      <article
                        key={review.id}
                        className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-black text-slate-900">
                              {review.User.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )}
                            </p>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                size={12}
                                className={
                                  star <= review.rating
                                    ? "fill-amber-400 text-amber-400"
                                    : "fill-slate-200 text-slate-200"
                                }
                              />
                            ))}
                          </div>
                        </div>
                        {review.title && (
                          <h3 className="mt-4 text-sm font-black text-slate-900">
                            {review.title}
                          </h3>
                        )}
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {review.comment}
                        </p>
                        {review.response && (
                          <div className="mt-4 rounded-xl border-l-4 border-cyan-500 bg-cyan-50 p-3">
                            <p className="text-xs font-black uppercase tracking-wide text-cyan-800">
                              Host response
                            </p>
                            <p className="mt-1 text-sm leading-6 text-cyan-950">
                              {review.response}
                            </p>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-white p-5 text-sm font-semibold text-slate-500">
                    No verified written reviews yet.
                  </p>
                )}
              </div>

              <div className="rounded-[2rem] border border-stone-200 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                  Common questions
                </p>
                <h2 className="mt-2 text-2xl font-black">Frequently asked</h2>
                <div className="mt-6 space-y-2">
                  {FAQ_ITEMS.map((item, i) => (
                    <div
                      key={i}
                      className="overflow-hidden rounded-2xl border border-stone-100 bg-stone-50"
                    >
                      <button
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                      >
                        <span className="text-sm font-black text-slate-800">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-slate-400 transition-transform duration-200 ${openFaq === i ? "rotate-180" : ""}`}
                        />
                      </button>
                      {openFaq === i && (
                        <div className="border-t border-stone-200 px-5 pb-4 pt-3">
                          <p className="text-sm leading-6 text-slate-600">
                            {item.a}
                          </p>
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
                    <Ticket size={15} />
                    Activity pass
                  </p>
                  <div className="mt-4 flex items-end justify-between">
                    <div>
                      <p className="text-xs text-white/55">Per person</p>
                      <div className="mt-1 flex items-end gap-2">
                        <p className="text-3xl font-black">
                          Rs. {activity.price.toLocaleString()}
                        </p>
                        <p className="mb-0.5 text-sm text-white/35 line-through">
                          Rs. {activity.originalPrice.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          activity.difficulty === "Easy"
                            ? "bg-emerald-400/20 text-emerald-200"
                            : activity.difficulty === "Moderate"
                              ? "bg-amber-400/20 text-amber-200"
                              : "bg-red-400/20 text-red-200"
                        }`}
                      >
                        {activity.difficulty}
                      </p>
                      <p className="mt-1 text-xs text-white/35">
                        Certified host
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <label>
                    <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Date
                    </span>
                    <select
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setSelectedSlotId("");
                      }}
                      className="h-11 w-full rounded-xl border border-stone-200 px-3 text-sm font-bold outline-none focus:border-[#7c2d12] focus:ring-2 focus:ring-[#7c2d12]/10"
                    >
                      <option value="">Select an available date</option>
                      {availableDates.map((value) => (
                        <option key={value} value={value}>
                          {new Date(`${value}T00:00:00`).toLocaleDateString(
                            "en-IN",
                            {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </option>
                      ))}
                    </select>
                  </label>

                  <div>
                    <span className="mb-2 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Available slots
                    </span>
                    <div className="grid gap-2">
                      {visibleSlots.map((slot) => {
                        const spots = slot.spotsLeft;
                        return (
                          <button
                            key={slot.id}
                            type="button"
                            disabled={spots < 1}
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`rounded-xl border px-4 py-3.5 text-left text-sm font-black transition ${
                              selectedSlotId === slot.id
                                ? "border-[#7c2d12] bg-[#7c2d12] text-white"
                                : "border-stone-200 bg-stone-50 text-slate-700 hover:border-[#7c2d12]/30 hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                            }`}
                          >
                            <span className="flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Clock
                                  size={14}
                                  className={
                                    selectedSlotId === slot.id
                                      ? "text-white/70"
                                      : "text-slate-400"
                                  }
                                />
                                {slot.startTime}
                              </span>
                              <span
                                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-black ${
                                  selectedSlotId === slot.id
                                    ? "bg-white/20 text-white"
                                    : spots <= 4
                                      ? "bg-red-50 text-red-600"
                                      : "bg-emerald-50 text-emerald-700"
                                }`}
                              >
                                {spots} spots
                              </span>
                            </span>
                          </button>
                        );
                      })}
                      {!visibleSlots.length && (
                        <p className="rounded-xl bg-stone-50 p-4 text-sm font-semibold text-slate-500">
                          No bookable slots on this date.
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="mb-1.5 block text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                      Guests
                    </span>
                    <div className="flex items-center gap-2 rounded-xl border border-stone-200 p-1">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className="flex size-10 items-center justify-center rounded-lg bg-stone-100 text-lg font-black text-slate-700 transition hover:bg-stone-200"
                      >
                        -
                      </button>
                      <span className="flex-1 text-center text-sm font-black">
                        {guests} {guests === 1 ? "guest" : "guests"}
                      </span>
                      <button
                        onClick={() =>
                          setGuests(
                            Math.min(selectedSlot?.spotsLeft ?? 20, guests + 1),
                          )
                        }
                        className="flex size-10 items-center justify-center rounded-lg bg-stone-100 text-lg font-black text-slate-700 transition hover:bg-stone-200"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-stone-50 p-4">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">
                          Rs. {activity.price.toLocaleString()} x {guests}{" "}
                          {guests === 1 ? "guest" : "guests"}
                        </span>
                        <span className="font-bold">
                          Rs. {subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Taxes and fees</span>
                        <span className="font-bold">Included</span>
                      </div>
                      {savings > 0 && (
                        <div className="flex justify-between font-bold text-emerald-700">
                          <span>You save</span>
                          <span>
                            -Rs. {(savings * guests).toLocaleString()}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between border-t border-stone-200 pt-3 text-base">
                        <span className="font-black">Total</span>
                        <span className="font-black">
                          Rs. {total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3.5 text-xs text-slate-700">
                    <label className="flex cursor-pointer items-start gap-2.5">
                      <input
                        type="checkbox"
                        checked={policyAgreed}
                        onChange={(e) => setPolicyAgreed(e.target.checked)}
                        className="mt-0.5 size-4 accent-[#7c2d12] rounded cursor-pointer"
                      />
                      <span className="leading-snug">
                        I voluntarily accept the{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setActivePolicyModal("TRAVELER_SAFETY_POLICY");
                          }}
                          className="font-bold text-[#7c2d12] hover:underline underline-offset-2"
                        >
                          Traveler Safety Guidelines
                        </button>{" "}
                        and{" "}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setActivePolicyModal("CANCELLATION_POLICY");
                          }}
                          className="font-bold text-[#7c2d12] hover:underline underline-offset-2"
                        >
                          Cancellation Policy
                        </button>
                        .
                      </span>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => void startCheckout()}
                    disabled={
                      bookingBusy ||
                      !activity.cancellationPolicy ||
                      !selectedSlot ||
                      selectedSlot.spotsLeft < guests ||
                      !policyAgreed
                    }
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#7c2d12] text-sm font-black text-white shadow-lg shadow-[#7c2d12]/20 transition hover:bg-[#5f220d] disabled:cursor-not-allowed disabled:bg-stone-200 disabled:text-stone-500 disabled:shadow-none"
                  >
                    <CalendarDays size={17} />
                    {bookingBusy
                      ? "Opening secure payment…"
                      : !user
                        ? "Sign in to book"
                        : `Pay Rs. ${total.toLocaleString()}`}
                  </button>

                  {bookingError && (
                    <div
                      role="alert"
                      className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold leading-5 text-rose-800"
                    >
                      {bookingError}
                    </div>
                  )}
                  {!activity.cancellationPolicy && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold leading-5 text-amber-800">
                      Booking is paused until the host publishes clear
                      cancellation terms.
                    </div>
                  )}
                  {bookingCode && (
                    <div
                      role="status"
                      className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold leading-5 text-emerald-800"
                    >
                      <span className="block text-sm font-black">
                        Activity confirmed
                      </span>
                      Booking reference {bookingCode}. It is now available in My
                      Bookings.
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3">
                      <MessageCircle size={14} />
                      Slot help
                    </span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3">
                      <Camera size={14} />
                      Photo spots
                    </span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3">
                      <CreditCard size={14} />
                      Secure payment
                    </span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-stone-50 p-3">
                      <ShieldCheck size={14} />
                      Safety cert.
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-stone-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-400">
                  Why book with us
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      icon: ShieldCheck,
                      text: "Certified and verified activity hosts",
                    },
                    { icon: BadgeCheck, text: "Instant slot confirmation" },
                    { icon: CreditCard, text: "Pay at confirmation only" },
                    { icon: Clock, text: "24/7 guest support" },
                  ].map(({ icon: TIcon, text }) => (
                    <div
                      key={text}
                      className="flex items-center gap-3 text-sm font-bold text-slate-700"
                    >
                      <TIcon className="size-5 shrink-0 text-emerald-600" />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
      <Footer />
      <PolicyModal
        isOpen={Boolean(activePolicyModal)}
        policyType={activePolicyModal || "TRAVELER_SAFETY_POLICY"}
        onClose={() => setActivePolicyModal(null)}
      />
    </div>
  );
}
