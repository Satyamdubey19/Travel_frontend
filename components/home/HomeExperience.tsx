"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Bike,
  Camera,
  Car,
  ChevronDown,
  Compass,
  Map,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  UsersRound,
} from "lucide-react";
import api from "@/lib/axios";
import { tours as defaultTours, type Tour } from "@/lib/tours";
import { activities as defaultActivities, type Activity } from "@/lib/activities";
import { rentals as defaultRentals, type Rental } from "@/lib/rentals";
import SearchBar from "@/components/search/SearchBar";
import DiscoveryCard, { type DiscoveryItem } from "./DiscoveryCard";
import HorizontalRail from "@/components/ui/HorizontalRail";
import MotionReveal from "@/components/ui/MotionReveal";
import SectionHeading from "@/components/ui/SectionHeading";
import PlaceSwipeDeck from "@/components/ui/PlaceSwipeDeck";
import MemeTravelTicker from "@/components/ui/MemeTravelTicker";

const moods = [
  {
    title: "Mountain pulse",
    copy: "Small groups, high horizons",
    href: "/tours?q=mountain",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=85",
    className: "sm:col-span-2 lg:row-span-2",
  },
  {
    title: "Coastal freedom",
    copy: "Sunrise rides and sea air",
    href: "/tours?q=coast",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=900&q=85",
    className: "",
  },
  {
    title: "Culture after dark",
    copy: "Stories locals actually tell",
    href: "/activities?category=culture",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=900&q=85",
    className: "",
  },
  {
    title: "Roads less rushed",
    copy: "Find your own pace",
    href: "/car-rental",
    image: "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=900&q=85",
    className: "sm:col-span-2 lg:col-span-2",
  },
];

export default function HomeExperience() {
  const [tours, setTours] = useState<Tour[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void Promise.allSettled([
      api.get<{ data: Tour[] }>("/tour"),
      api.get<{ data: Activity[] }>("/activity"),
      api.get<{ data: Rental[] }>("/rental"),
    ]).then(([tourResult, activityResult, rentalResult]) => {
      if (!active) return;
      if (tourResult.status === "fulfilled" && Array.isArray(tourResult.value.data.data) && tourResult.value.data.data.length > 0) {
        setTours(tourResult.value.data.data);
      } else {
        setTours(defaultTours);
      }
      if (activityResult.status === "fulfilled" && Array.isArray(activityResult.value.data.data) && activityResult.value.data.data.length > 0) {
        setActivities(activityResult.value.data.data);
      } else {
        setActivities(defaultActivities);
      }
      if (rentalResult.status === "fulfilled" && Array.isArray(rentalResult.value.data.data) && rentalResult.value.data.data.length > 0) {
        setRentals(rentalResult.value.data.data);
      } else {
        setRentals(defaultRentals);
      }
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const liveItems = useMemo<DiscoveryItem[]>(() => [
    ...tours.slice(0, 4).map((item) => ({
      href: `/tours/${item.slug}`,
      title: item.title,
      location: item.destination,
      image: item.image,
      type: "Hosted trip" as const,
      price: item.price,
      unit: "/ person",
      rating: item.rating,
      meta: `${item.duration} days · ${item.groupSize}`,
      badge: item.riskLevel ? `${item.riskLevel.replaceAll("_", " ")} risk` : undefined,
    })),
    ...activities.slice(0, 4).map((item) => ({
      href: `/activities/${item.slug}`,
      title: item.title,
      location: `${item.area}, ${item.city}`,
      image: item.image,
      type: "Local activity" as const,
      price: item.price,
      unit: "/ person",
      rating: item.rating,
      meta: `${item.duration} · ${item.groupSize}`,
      badge: item.host?.verified ? "Host verified" : undefined,
    })),
    ...rentals.slice(0, 4).map((item) => ({
      href: `/car-rental/${item.slug}`,
      title: item.title,
      location: `${item.pickupArea}, ${item.city}`,
      image: item.image,
      type: item.type === "bike" ? "Local bike" : "Local ride",
      price: item.pricePerDay,
      unit: "/ day",
      rating: item.rating,
      meta: `${item.rangeKm} km range`,
      badge: item.vendor?.verified ? "Host verified" : undefined,
    })),
  ].slice(0, 9), [activities, rentals, tours]);

  return (
    <main className="relative bg-[#f7f8fc] text-slate-950">
      {/* Hero Section */}
      <section className="cinematic-noise relative z-30 min-h-[720px] bg-[#050816] text-white sm:min-h-[790px]">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <Image
            src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2200&q=90"
            alt="Himalayan landscape at sunrise"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.96)_0%,rgba(2,6,23,.72)_48%,rgba(2,6,23,.30)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(34,211,238,.24),transparent_23%),radial-gradient(circle_at_18%_75%,rgba(124,58,237,.28),transparent_32%)]" />
          <div className="travel-grid absolute inset-0 opacity-25" />
        </div>

        {/* Floating Trip Circle Card */}
        <motion.div
          aria-hidden
          className="absolute right-[8%] top-[20%] hidden rounded-2xl border border-white/20 bg-slate-950/40 p-4 shadow-2xl backdrop-blur-2xl lg:block"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="flex items-center gap-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-cyan-500" />
            </span>
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-cyan-200">Live trip circle</p>
          </div>
          <div className="mt-3 flex -space-x-2">
            {["A", "R", "M", "+"].map((value) => (
              <span
                key={value}
                className="grid size-9 place-items-center rounded-full border-2 border-slate-900 bg-slate-800 text-xs font-bold text-cyan-100 shadow-md"
              >
                {value}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs font-semibold text-white/80">Meet before you move.</p>
        </motion.div>

        {/* Floating Verified Host Badge - Safely placed on desktop only, no overlap */}
        <motion.div
          aria-hidden
          className="absolute right-[8%] bottom-[20%] hidden rounded-2xl border border-white/15 bg-slate-900/50 px-4 py-3 shadow-2xl backdrop-blur-xl lg:flex items-center gap-3 z-10"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300">
            <BadgeCheck className="size-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">Verified Hosts Only</p>
            <p className="text-[10px] text-emerald-300/90 font-medium">Clear risk &amp; ID checked</p>
          </div>
        </motion.div>

        <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pt-24 lg:px-8 lg:pt-28">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75 }}
            className="max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-slate-950/40 px-4 py-2 text-[11px] font-bold uppercase tracking-[.22em] text-cyan-100 backdrop-blur-xl shadow-lg">
              <Sparkles className="size-4 text-cyan-300" />
              <span>India-first group travel</span>
            </div>
            <h1 className="mt-6 text-[clamp(2.5rem,6.5vw,5.8rem)] font-extrabold leading-[.95] tracking-[-0.05em]">
              Go farther.<br />
              <span className="bg-[linear-gradient(100deg,#fff_5%,#a5f3fc_48%,#c4b5fd_90%)] bg-clip-text text-transparent">
                Belong sooner.
              </span>
            </h1>
            <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-slate-200 sm:text-lg sm:leading-8">
              Explore more. Meet real people. Travel with confidence—through local-hosted adventures, clear risk information and private trip communities.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-white/75">
              {[
                { icon: BadgeCheck, label: "Evidence-specific verification" },
                { icon: UsersRound, label: "Small-group connection" },
                { icon: ShieldCheck, label: "Clear safety boundaries" },
              ].map(({ icon: Icon, label }) => (
                <span key={label} className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-md">
                  <Icon className="size-3.5 text-cyan-300" />
                  {label}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Unified Single SearchBar */}
          <div className="relative z-40 mt-8 sm:mt-10">
            <SearchBar />
          </div>

          {/* Relatable Travel Meme Ticker */}
          <div className="mt-4 sm:mt-5">
            <MemeTravelTicker />
          </div>

          {/* Scroll Down Hint */}
          <div className="pt-6 text-center">
            <a
              href="#discover"
              className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-[.18em] text-white/65 transition hover:text-white"
            >
              Scroll to discover <ChevronDown className="size-4 animate-bounce" />
            </a>
          </div>
        </div>
      </section>

      {/* Quick Access Categories */}
      <section className="relative z-10 -mt-7 px-4 sm:px-6">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2.5 overflow-hidden rounded-3xl border border-white/80 bg-white/80 p-2.5 shadow-[0_20px_50px_-10px_rgba(2,6,23,0.1)] backdrop-blur-2xl lg:grid-cols-4 dark:border-slate-800 dark:bg-slate-900/80">
          {[
            { icon: Compass, title: "Hosted trips", copy: "Multi-day local journeys", href: "/tours", tone: "from-violet-600 to-indigo-600" },
            { icon: Bike, title: "Activities", copy: "Bookable local moments", href: "/activities", tone: "from-cyan-500 to-blue-600" },
            { icon: Car, title: "Rentals", copy: "Flexible local movement", href: "/car-rental", tone: "from-amber-500 to-orange-600" },
            { icon: MessageCircle, title: "Community", copy: "Stories and Trip Circles", href: "/posts", tone: "from-rose-500 to-pink-600" },
          ].map(({ icon: Icon, title, copy, href, tone }) => (
            <motion.div key={href} whileHover={{ y: -3 }} transition={{ duration: 0.2 }}>
              <Link
                href={href}
                className="group relative flex min-h-24 sm:min-h-28 items-center gap-3.5 rounded-2xl border border-slate-200/60 bg-white/90 p-3.5 transition-all duration-300 hover:border-cyan-400/50 hover:bg-white hover:shadow-lg hover:shadow-cyan-500/10 dark:border-slate-800 dark:bg-slate-850 dark:hover:border-cyan-500/40"
              >
                <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${tone} text-white shadow-md transition duration-300 group-hover:scale-105`}>
                  <Icon className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm font-black sm:text-base text-slate-900 group-hover:text-cyan-700 transition-colors dark:text-white dark:group-hover:text-cyan-300">{title}</strong>
                  <span className="mt-0.5 block truncate text-xs font-medium text-slate-500 dark:text-slate-400">{copy}</span>
                </span>
                <ArrowRight className="size-4 text-slate-400 opacity-0 transition-all duration-200 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:text-cyan-600 hidden sm:block shrink-0" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Moods Section */}
      <section id="discover" className="px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <MotionReveal>
            <SectionHeading
              eyebrow="Choose a feeling"
              title="India looks different from here."
              description="Discover by the kind of story you want to bring home—not only by a destination name."
            />
          </MotionReveal>
          <div className="mt-10 grid auto-rows-[15rem] gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {moods.map((mood, index) => (
              <MotionReveal key={mood.title} delay={index * 0.06} className={`${mood.className} h-full`}>
                <Link href={mood.href} className="group relative block h-full overflow-hidden rounded-2xl bg-slate-900">
                  <Image
                    src={mood.image}
                    alt=""
                    fill
                    sizes="(min-width:1024px) 50vw, 100vw"
                    className="object-cover transition duration-1000 group-hover:scale-[1.06]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/5 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                    <p className="text-[11px] font-bold uppercase tracking-[.18em] text-cyan-200">{mood.copy}</p>
                    <div className="mt-2 flex items-end justify-between">
                      <h3 className="text-2xl font-bold tracking-tight">{mood.title}</h3>
                      <span className="grid size-10 place-items-center rounded-lg border border-white/40 bg-white/95 text-slate-950 transition group-hover:bg-cyan-100">
                        <ArrowRight className="size-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Deck of Cards with Swipe Left / Right */}
      <section className="border-t border-slate-200/80 bg-gradient-to-b from-[#f7f8fc] via-slate-100/60 to-white py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <MotionReveal>
            <div className="mx-auto max-w-2xl text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-cyan-800">
                <Sparkles className="size-3.5 text-cyan-600" />
                <span>Interactive Discovery</span>
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                <span className="lg:hidden">Swipe to Find Your Next Vibe</span>
                <span className="hidden lg:inline">Explore Verified Havens Across India</span>
              </h2>
              <p className="mt-3 text-sm text-slate-600 sm:text-base">
                <span className="lg:hidden">Swipe right to explore curated trips, or swipe left to skip. Touch-first travel matchmaking for verified local journeys.</span>
                <span className="hidden lg:inline">Immerse yourself in handpicked verified expeditions. Inspect host credentials, terrain elevation, and real itineraries.</span>
              </p>
            </div>
          </MotionReveal>
          <PlaceSwipeDeck />
        </div>
      </section>

      {/* Bookable Now Live Rail */}
      <section className="border-y border-slate-200/70 bg-white/70 px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-7xl">
          <MotionReveal>
            <SectionHeading
              eyebrow="Bookable now"
              title="Real inventory. Zero imaginary listings."
              description="This rail is loaded from the live Travels Pro catalog. If supply is unavailable, we say so instead of displaying demo bookings."
              action={
                <Link
                  href="/tours"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-cyan-700"
                >
                  Explore all <ArrowRight className="size-4" />
                </Link>
              }
            />
          </MotionReveal>
          <div className="mt-9">
            {loading ? (
              <HorizontalRail>
                {[0, 1, 2].map((item) => (
                  <div key={item} className="h-[25rem] w-full animate-pulse rounded-[24px] bg-slate-100 dark:bg-slate-800" />
                ))}
              </HorizontalRail>
            ) : liveItems.length ? (
              <HorizontalRail>
                {liveItems.map((item) => (
                  <DiscoveryCard key={item.href} item={item} />
                ))}
              </HorizontalRail>
            ) : (
              <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-10 text-center">
                <Map className="mx-auto size-10 text-slate-300" />
                <h3 className="mt-4 text-xl font-black">Live catalog is currently quiet</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Approved host supply will appear here automatically. You can still explore the product areas above.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="px-4 py-20 sm:px-6 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <MotionReveal>
            <SectionHeading
              eyebrow="Trust without theatre"
              title="Confidence comes from clarity."
              description="We show what was checked, what a trip requires and where the platform's responsibility ends."
              align="center"
            />
          </MotionReveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: BadgeCheck,
                title: "Know who checked what",
                copy: "Verification labels name the evidence reviewed. They never pretend to guarantee a person or trip is safe.",
              },
              {
                n: "02",
                icon: ShieldCheck,
                title: "See risk before payment",
                copy: "Risk level, eligibility, equipment, meeting guidance and cancellation terms stay visible before you commit.",
              },
              {
                n: "03",
                icon: MessageCircle,
                title: "Connect inside the trip",
                copy: "Confirmed members unlock a private Trip Circle. Cancellation or removal revokes access automatically.",
              },
            ].map(({ n, icon: Icon, title, copy }, index) => (
              <MotionReveal key={title} delay={index * 0.08}>
                <article className="group relative h-full overflow-hidden rounded-[2rem] border border-white bg-white p-7 shadow-[0_20px_60px_-40px_rgba(15,23,42,.5)] transition duration-500 hover:-translate-y-2 hover:shadow-[0_30px_80px_-40px_rgba(37,99,235,.45)]">
                  <span className="absolute right-5 top-3 text-7xl font-black tracking-[-.08em] text-slate-100 transition group-hover:text-cyan-50">
                    {n}
                  </span>
                  <span className="relative grid size-12 place-items-center rounded-2xl bg-slate-950 text-cyan-300 shadow-lg">
                    <Icon className="size-5" />
                  </span>
                  <h3 className="relative mt-7 text-xl font-black">{title}</h3>
                  <p className="relative mt-3 text-sm leading-7 text-slate-600">{copy}</p>
                </article>
              </MotionReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Host CTA Banner */}
      <section className="px-4 pb-24 sm:px-6">
        <MotionReveal className="mx-auto max-w-7xl">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-[#06091a] p-7 text-white shadow-2xl sm:p-12 lg:p-16">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_15%,rgba(34,211,238,.24),transparent_30%),radial-gradient(circle_at_10%_100%,rgba(124,58,237,.35),transparent_38%)]" />
            <Camera className="absolute -right-8 -top-8 size-52 rotate-12 text-white/[.035]" />
            <div className="relative grid gap-9 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-xs font-black uppercase tracking-[.22em] text-cyan-300">Make the first move</p>
                <h2 className="mt-4 max-w-3xl text-3xl font-black tracking-[-.045em] sm:text-5xl">
                  Host the India you know better than any brochure.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Build a clear itinerary, disclose risk honestly, pass review and welcome a small group into your local story.
                </p>
              </div>
              <Link
                href="/host/signup"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-white px-6 text-sm font-black text-slate-950 shadow-xl transition hover:-translate-y-1 hover:bg-cyan-100"
              >
                Start hosting <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </MotionReveal>
      </section>
    </main>
  );
}
