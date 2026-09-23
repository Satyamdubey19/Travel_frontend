"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion"
import {
  Compass,
  Heart,
  MapPin,
  RotateCcw,
  Sparkles,
  Star,
  X,
  ArrowRight,
  ShieldCheck,
  Clock,
  Users,
  Mountain,
  Waves,
  Landmark,
  TreePine,
  ChevronLeft,
  ChevronRight,
  Flame,
} from "lucide-react"

export interface HostInfo {
  name: string
  avatar: string
  rating: number
  verified: boolean
  toursCount: number
  role: string
}

export interface PlaceItem {
  id: string
  title: string
  location: string
  state?: string
  image: string
  gallery?: string[]
  price: number
  originalPrice?: number
  unit?: string
  duration?: string
  groupSize?: string
  rating?: number
  reviews?: number
  category?: string
  href: string
  badge?: string
  description?: string
  elevation?: string
  bestSeason?: string
  difficulty?: string
  highlights?: string[]
  host?: HostInfo
}

export const defaultPlaces: PlaceItem[] = [
  {
    id: "place-1",
    title: "High Altitude Spiti Valley Expedition",
    location: "Spiti Valley, Himachal Pradesh",
    state: "Himachal Pradesh",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
    ],
    price: 18500,
    originalPrice: 22000,
    unit: "/ person",
    duration: "7 Days",
    groupSize: "4-8 Explorers",
    rating: 4.9,
    reviews: 54,
    category: "Mountain pulse",
    elevation: "12,500 ft",
    bestSeason: "Jun - Oct",
    difficulty: "Moderate",
    href: "/tours/spiti-valley-overland-expedition",
    badge: "Host verified",
    description: "Traverse high trans-Himalayan passes, explore 1,000-year-old Buddhist monasteries, and stargaze by the turquoise shores of Chandratal.",
    highlights: [
      "Key Monastery private morning chant",
      "Chandratal high-altitude dome camp",
      "Trans-Himalayan 4x4 rugged pass transit",
      "Certified High-Altitude First Responder",
    ],
    host: {
      name: "Tenzin Norbu",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: 4.9,
      verified: true,
      toursCount: 48,
      role: "Spiti Native & High-Pass Trek Leader",
    },
  },
  {
    id: "place-2",
    title: "Varkala Cliffside Sunrise & Arabian Surf",
    location: "Varkala Cliff, Kerala",
    state: "Kerala",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80",
    ],
    price: 7800,
    originalPrice: 9500,
    unit: "/ person",
    duration: "4 Days",
    groupSize: "4-6 Explorers",
    rating: 4.8,
    reviews: 68,
    category: "Coastal freedom",
    elevation: "Sea Level",
    bestSeason: "Oct - Mar",
    difficulty: "Easy",
    href: "/tours/kerala-backwaters-and-spice-trail",
    badge: "Small group",
    description: "Catch your first wave on the Arabian Sea, recharge with clifftop yoga at sunrise, and savour authentic coastal Malabar cuisine.",
    highlights: [
      "Daily certified surf clinics & boards",
      "Sunrise red-cliff yoga sessions",
      "Fresh organic café & spice trail",
      "Stand-up paddleboarding at sunset",
    ],
    host: {
      name: "Suraj & Ananya",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      rating: 4.8,
      verified: true,
      toursCount: 36,
      role: "ISA Certified Surf Coaches",
    },
  },
  {
    id: "place-3",
    title: "Jaisalmer Royal Thar Dunes & Stargazing Camp",
    location: "Sam Sand Dunes, Jaisalmer, Rajasthan",
    state: "Rajasthan",
    image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
    ],
    price: 8900,
    originalPrice: 11200,
    unit: "/ person",
    duration: "3 Days",
    groupSize: "6-12 Explorers",
    rating: 4.9,
    reviews: 82,
    category: "Heritage & desert",
    elevation: "750 ft",
    bestSeason: "Oct - Mar",
    difficulty: "Gentle",
    href: "/tours/rajasthan-forts-desert-circuit",
    badge: "Heritage verified",
    description: "Venture deep into the Thar desert in private 4x4s, stay in luxury Swiss tents, and listen to soulful Manganiyar ballads by firelight.",
    highlights: [
      "Deep-desert 4x4 dune bashing",
      "Bespoke luxury desert camp stay",
      "Private Manganiyar folk ensemble",
      "Telescopic desert stargazing session",
    ],
    host: {
      name: "Rawat Singh",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      rating: 5.0,
      verified: true,
      toursCount: 62,
      role: "Thar Desert Historian & Host",
    },
  },
  {
    id: "place-4",
    title: "Wayanad Rainforest Treehouse & Spice Trail",
    location: "Wayanad, Western Ghats, Kerala",
    state: "Kerala",
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80",
    ],
    price: 11400,
    originalPrice: 13800,
    unit: "/ person",
    duration: "4 Days",
    groupSize: "2-6 Explorers",
    rating: 4.9,
    reviews: 41,
    category: "Rainforest & wild",
    elevation: "2,900 ft",
    bestSeason: "Sep - May",
    difficulty: "Easy",
    href: "/tours/coorg-coffee-estate-weekend",
    badge: "Eco sanctuary",
    description: "Perch 60 feet above the forest floor in a hand-crafted canopy treehouse, forage for wild spices, and spot elusive Western Ghats hornbills.",
    highlights: [
      "Private 60-ft canopy treehouse",
      "Organic cardamom & pepper foraging",
      "Bioluminescent mushroom night walk",
      "Bamboo raft river drift",
    ],
    host: {
      name: "Dr. George Mathew",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
      rating: 4.9,
      verified: true,
      toursCount: 29,
      role: "Botanist & Organic Planter",
    },
  },
  {
    id: "place-5",
    title: "Varanasi Ghats & Millennia Silk Trails",
    location: "Varanasi, Uttar Pradesh",
    state: "Uttar Pradesh",
    image: "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=800&q=80",
    ],
    price: 5400,
    originalPrice: 6800,
    unit: "/ person",
    duration: "2 Days",
    groupSize: "4-8 Explorers",
    rating: 4.9,
    reviews: 95,
    category: "Heritage & desert",
    elevation: "260 ft",
    bestSeason: "Oct - Mar",
    difficulty: "Gentle",
    href: "/activities/varanasi-spiritual-dawn-rowboat-walk",
    badge: "Culture legend",
    description: "Witness the cosmic Ganga Aarti from a reserved wooden hand-rowed boat, unlock hidden weavers' lanes, and immerse in millennia of living music.",
    highlights: [
      "VIP front-row Ganga Aarti wooden boat",
      "Secret 1,000-year-old weaving lanes",
      "Morning classical ragas on Assi Ghat",
      "Heritage culinary & masala chai trail",
    ],
    host: {
      name: "Pandit Anand",
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
      rating: 4.9,
      verified: true,
      toursCount: 110,
      role: "11th Gen Kashi Chronicler",
    },
  },
  {
    id: "place-6",
    title: "Zanskar Frozen River & High Passes",
    location: "Zanskar, Ladakh",
    state: "Ladakh",
    image: "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80",
    ],
    price: 26500,
    originalPrice: 31000,
    unit: "/ person",
    duration: "8 Days",
    groupSize: "4-6 Explorers",
    rating: 5.0,
    reviews: 27,
    category: "Mountain pulse",
    elevation: "14,800 ft",
    bestSeason: "Jan - Feb",
    difficulty: "Challenging",
    href: "/tours/ladakh-monastries-and-high-passes",
    badge: "Extreme alpine",
    description: "Walk the legendary Chadar route across crystalline frozen gorges, receive blessings at cliff-hanging gompas, and sleep in insulated dome tents.",
    highlights: [
      "Iconic Chadar ice route trek",
      "Karsha monastery private audience",
      "Geothermal natural hot spring stops",
      "Zero-emission solar heated tents",
    ],
    host: {
      name: "Stanzin Dorje",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
      rating: 5.0,
      verified: true,
      toursCount: 38,
      role: "UIAA Certified Alpine Mountaineer",
    },
  },
  {
    id: "place-7",
    title: "Gokarna Secret Cliff Cabana & Beach Hopping",
    location: "Gokarna, Karnataka",
    state: "Karnataka",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80",
    ],
    price: 6500,
    originalPrice: 8200,
    unit: "/ person",
    duration: "3 Days",
    groupSize: "4-8 Explorers",
    rating: 4.8,
    reviews: 74,
    category: "Coastal freedom",
    elevation: "Sea Level",
    bestSeason: "Oct - Apr",
    difficulty: "Easy",
    href: "/tours/goa-coastal-food-and-beach-tour",
    badge: "Hidden gem",
    description: "Trek secluded rocky cliffs between Half Moon and Paradise beaches, sleep in eco-cabanas overlooking the waves, and swim in bioluminescent coves.",
    highlights: [
      "5-beach coastal ridge cliff trek",
      "Private ocean-facing eco cabana",
      "Bioluminescence night dip",
      "Wood-fired sourdough & seafood feast",
    ],
    host: {
      name: "Ravi & Meera",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      rating: 4.8,
      verified: true,
      toursCount: 45,
      role: "Coastal Naturalists & Guides",
    },
  },
  {
    id: "place-8",
    title: "Cherrapunji Living Root Bridges & Dawki Waters",
    location: "East Khasi Hills, Meghalaya",
    state: "Meghalaya",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1600&q=85",
    gallery: [
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=800&q=80",
    ],
    price: 14800,
    originalPrice: 17500,
    unit: "/ person",
    duration: "5 Days",
    groupSize: "4-8 Explorers",
    rating: 5.0,
    reviews: 39,
    category: "Rainforest & wild",
    elevation: "4,600 ft",
    bestSeason: "Oct - May",
    difficulty: "Moderate",
    href: "/tours",
    badge: "Local elder guide",
    description: "Hike deep into bio-engineered botanical bridges, boat through emerald transparent waters in Dawki, and explore sacred Khasi cloud forests.",
    highlights: [
      "Double Decker Living Root Bridge hike",
      "Crystal transparent boat ride in Dawki",
      "Mawsmai limestone cavern discovery",
      "Khasi organic village community feast",
    ],
    host: {
      name: "Bah Bantei",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      rating: 5.0,
      verified: true,
      toursCount: 51,
      role: "Khasi Village Elder & Naturalist",
    },
  },
]

const CATEGORIES = [
  { label: "All Journeys", value: "all", icon: Compass },
  { label: "Mountain Pulse", value: "Mountain pulse", icon: Mountain },
  { label: "Coastal Freedom", value: "Coastal freedom", icon: Waves },
  { label: "Heritage & Desert", value: "Heritage & desert", icon: Landmark },
  { label: "Rainforest & Wild", value: "Rainforest & wild", icon: TreePine },
]

export interface PlaceSwipeDeckProps {
  places?: PlaceItem[]
  onSwipeLeft?: (place: PlaceItem) => void
  onSwipeRight?: (place: PlaceItem) => void
  className?: string
}

/* =========================================================================
   MOBILE / SMALL SCREEN: INTERACTIVE TINDER-STYLE GESTURE SWIPE DECK
   ========================================================================= */

function MobileSwipeCard({
  place,
  isTop,
  onSwipe,
}: {
  place: PlaceItem
  isTop: boolean
  onSwipe: (direction: "left" | "right") => void
}) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-220, 220], [-16, 16])
  const opacity = useTransform(x, [-260, -200, 0, 200, 260], [0, 1, 1, 1, 0])

  const passOpacity = useTransform(x, [-130, -40], [1, 0])
  const passScale = useTransform(x, [-130, -40], [1.1, 0.8])

  const exploreOpacity = useTransform(x, [40, 130], [0, 1])
  const exploreScale = useTransform(x, [40, 130], [0.8, 1.1])

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { x: number }; velocity: { x: number } }
  ) => {
    if (info.offset.x > 110 || info.velocity.x > 450) {
      onSwipe("right")
    } else if (info.offset.x < -110 || info.velocity.x < -450) {
      onSwipe("left")
    }
  }

  return (
    <motion.div
      style={isTop ? { x, rotate, opacity } : undefined}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDragEnd={isTop ? handleDragEnd : undefined}
      className={`absolute inset-0 select-none overflow-hidden rounded-[2rem] border border-white/40 bg-slate-900 text-white shadow-[0_25px_60px_-15px_rgba(2,6,23,0.35)] ${
        isTop ? "cursor-grab active:cursor-grabbing" : "pointer-events-none"
      }`}
    >
      <div className="relative h-full w-full">
        <Image
          src={place.image}
          alt={place.title}
          fill
          priority={isTop}
          sizes="(max-width: 640px) 90vw, 420px"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.15)_0%,rgba(2,6,23,0.4)_45%,rgba(2,6,23,0.95)_100%)]" />

        {isTop && (
          <>
            <motion.div
              style={{ opacity: passOpacity, scale: passScale }}
              className="pointer-events-none absolute right-6 top-8 z-30 -rotate-12 rounded-2xl border-2 border-rose-500 bg-rose-950/85 px-4 py-2 font-black uppercase tracking-widest text-rose-300 shadow-[0_0_25px_rgba(244,63,94,0.6)] backdrop-blur-md"
            >
              Pass
            </motion.div>

            <motion.div
              style={{ opacity: exploreOpacity, scale: exploreScale }}
              className="pointer-events-none absolute left-6 top-8 z-30 rotate-12 rounded-2xl border-2 border-cyan-400 bg-cyan-950/85 px-4 py-2 font-black uppercase tracking-widest text-cyan-200 shadow-[0_0_25px_rgba(6,182,212,0.6)] backdrop-blur-md"
            >
              Explore
            </motion.div>
          </>
        )}

        <div className="absolute inset-x-5 top-5 flex items-center justify-between gap-2">
          {place.category && (
            <span className="rounded-xl border border-white/20 bg-slate-950/60 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-200 backdrop-blur-xl">
              {place.category}
            </span>
          )}
          {place.badge && (
            <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-950/70 px-3 py-1 text-[11px] font-bold text-emerald-300 backdrop-blur-xl">
              <ShieldCheck className="size-3.5 text-emerald-400" />
              {place.badge}
            </span>
          )}
        </div>

        <div className="absolute inset-x-5 bottom-5 space-y-3">
          <div className="space-y-1">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
              <MapPin className="size-3.5" />
              <span>{place.location}</span>
            </p>
            <h3 className="text-2xl font-black leading-tight tracking-tight text-white">
              {place.title}
            </h3>
          </div>

          {place.description && (
            <p className="line-clamp-2 text-xs font-medium text-slate-300">
              {place.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-300">
            {place.duration && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 backdrop-blur-md">
                <Clock className="size-3 text-cyan-300" />
                {place.duration}
              </span>
            )}
            {place.groupSize && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 backdrop-blur-md">
                <Users className="size-3 text-cyan-300" />
                {place.groupSize}
              </span>
            )}
            {place.rating && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/10 px-2.5 py-1 text-amber-300 backdrop-blur-md">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {place.rating.toFixed(1)} {place.reviews ? `(${place.reviews})` : ""}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/15 pt-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Starting from
              </p>
              <div className="flex items-baseline gap-1.5">
                <p className="text-xl font-extrabold text-white">
                  ₹{place.price.toLocaleString("en-IN")}
                </p>
                {place.originalPrice && (
                  <span className="text-xs text-slate-400 line-through">
                    ₹{place.originalPrice.toLocaleString("en-IN")}
                  </span>
                )}
                <span className="text-xs font-semibold text-slate-300">{place.unit ?? "/ person"}</span>
              </div>
            </div>

            <Link
              href={place.href}
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-xs font-bold text-slate-950 shadow-lg transition hover:bg-cyan-100 active:scale-95"
            >
              <span>View</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

function MobilePlaceSwipeDeck({
  places,
  onSwipeLeft,
  onSwipeRight,
}: {
  places: PlaceItem[]
  onSwipeLeft?: (place: PlaceItem) => void
  onSwipeRight?: (place: PlaceItem) => void
}) {
  const [deck, setDeck] = React.useState<PlaceItem[]>(places)
  const [history, setHistory] = React.useState<{ place: PlaceItem; dir: "left" | "right" }[]>([])
  const [liked, setLiked] = React.useState<PlaceItem[]>([])

  const currentCard = deck[0]

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentCard) return

    if (direction === "left") {
      onSwipeLeft?.(currentCard)
    } else {
      onSwipeRight?.(currentCard)
      setLiked((prev) => [...prev, currentCard])
    }

    setHistory((prev) => [...prev, { place: currentCard, dir: direction }])
    setDeck((prev) => prev.slice(1))
  }

  const handleRewind = () => {
    if (history.length === 0) return
    const last = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    if (last.dir === "right") {
      setLiked((prev) => prev.filter((item) => item.id !== last.place.id))
    }
    setDeck((prev) => [last.place, ...prev])
  }

  const handleReset = () => {
    setDeck(places)
    setHistory([])
    setLiked([])
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center px-4">
      <div className="mb-4 flex w-full items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-sm">
            <Compass className="size-4" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Swipe Deck
          </span>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {deck.length} place{deck.length === 1 ? "" : "s"} left
        </span>
      </div>

      <div className="relative aspect-[3/4.4] w-full max-w-[360px] sm:max-w-[390px]">
        <AnimatePresence>
          {deck.length === 0 ? (
            <motion.div
              key="deck-empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex h-full w-full flex-col items-center justify-center rounded-[2rem] border border-slate-200/80 bg-white/90 p-7 text-center shadow-xl backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90"
            >
              <div className="grid size-16 place-items-center rounded-2xl bg-cyan-500/10 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400">
                <Sparkles className="size-8" />
              </div>
              <h3 className="mt-4 text-xl font-extrabold text-slate-950 dark:text-white">
                All Places Explored!
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                You liked {liked.length} destination{liked.length === 1 ? "" : "s"}. Ready to plan your journey or reshuffle?
              </p>
              {liked.length > 0 && (
                <div className="mt-4 flex flex-wrap justify-center gap-1.5">
                  {liked.map((item) => (
                    <span
                      key={item.id}
                      className="rounded-lg bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-800 dark:bg-cyan-950/60 dark:text-cyan-300"
                    >
                      {item.title.split(" ")[0]}
                    </span>
                  ))}
                </div>
              )}
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-6 py-2.5 text-xs font-bold text-white shadow-lg transition hover:bg-slate-800 active:scale-95 dark:bg-white dark:text-slate-950"
              >
                <RotateCcw className="size-3.5" />
                <span>Shuffle & Replay</span>
              </button>
            </motion.div>
          ) : (
            deck
              .slice(0, 3)
              .reverse()
              .map((place, index, arr) => {
                const isTop = index === arr.length - 1
                const depthIndex = arr.length - 1 - index
                const scale = 1 - depthIndex * 0.05
                const translateY = depthIndex * 12

                return (
                  <motion.div
                    key={place.id}
                    initial={false}
                    animate={{ scale, y: translateY }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    className="absolute inset-0"
                    style={{ zIndex: index }}
                  >
                    <MobileSwipeCard place={place} isTop={isTop} onSwipe={handleSwipe} />
                  </motion.div>
                )
              })
          )}
        </AnimatePresence>
      </div>

      {deck.length > 0 && (
        <div className="mt-5 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handleRewind}
            disabled={history.length === 0}
            className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-md transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
            aria-label="Rewind previous card"
          >
            <RotateCcw className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => handleSwipe("left")}
            className="flex size-14 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-600 shadow-md transition hover:bg-rose-600 hover:text-white hover:shadow-rose-500/25 active:scale-90 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-400"
            aria-label="Pass destination"
          >
            <X className="size-6" />
          </button>

          <button
            type="button"
            onClick={() => handleSwipe("right")}
            className="flex size-14 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 shadow-md transition hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 hover:text-white hover:shadow-cyan-500/30 active:scale-90 dark:border-cyan-900/50 dark:bg-cyan-950/40 dark:text-cyan-300"
            aria-label="Explore destination"
          >
            <Heart className="size-6 fill-current" />
          </button>

          {currentCard && (
            <Link
              href={currentCard.href}
              className="flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-md transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-90 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              aria-label="View current destination"
            >
              <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      )}

      <p className="mt-3 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        ← Swipe left to pass · Swipe right to explore →
      </p>
    </div>
  )
}

/* =========================================================================
   DESKTOP SCREEN: MODERN, ELEGANT & ATTRACTIVE SPATIAL DESTINATION STAGE
   ========================================================================= */

function DesktopPlaceShowcase({ places }: { places: PlaceItem[] }) {
  const [activeCategory, setActiveCategory] = React.useState<string>("all")
  const [activeId, setActiveId] = React.useState<string>(places[0]?.id ?? "")
  const [activeImageIndex, setActiveImageIndex] = React.useState<number>(0)
  const [wishlist, setWishlist] = React.useState<Set<string>>(new Set())

  const filteredPlaces = React.useMemo(() => {
    if (activeCategory === "all") return places
    return places.filter((p) => p.category === activeCategory)
  }, [places, activeCategory])

  React.useEffect(() => {
    if (!filteredPlaces.some((p) => p.id === activeId) && filteredPlaces.length > 0) {
      setActiveId(filteredPlaces[0].id)
      setActiveImageIndex(0)
    }
  }, [filteredPlaces, activeId])

  const activeIndex = filteredPlaces.findIndex((p) => p.id === activeId)
  const activePlace = filteredPlaces[activeIndex >= 0 ? activeIndex : 0] || places[0]

  const photos = React.useMemo(() => {
    if (!activePlace) return []
    return [activePlace.image, ...(activePlace.gallery || [])]
  }, [activePlace])

  const activePhoto = photos[activeImageIndex] || activePlace?.image

  const toggleWishlist = (id: string) => {
    setWishlist((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const navigatePrev = React.useCallback(() => {
    if (filteredPlaces.length <= 1) return
    const nextIdx = (activeIndex - 1 + filteredPlaces.length) % filteredPlaces.length
    setActiveId(filteredPlaces[nextIdx].id)
    setActiveImageIndex(0)
  }, [filteredPlaces, activeIndex])

  const navigateNext = React.useCallback(() => {
    if (filteredPlaces.length <= 1) return
    const nextIdx = (activeIndex + 1) % filteredPlaces.length
    setActiveId(filteredPlaces[nextIdx].id)
    setActiveImageIndex(0)
  }, [filteredPlaces, activeIndex])

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") navigatePrev()
      else if (e.key === "ArrowRight") navigateNext()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [navigatePrev, navigateNext])

  if (!activePlace) return null

  const isLiked = wishlist.has(activePlace.id)
  const discountPercent =
    activePlace.originalPrice && activePlace.originalPrice > activePlace.price
      ? Math.round(((activePlace.originalPrice - activePlace.price) / activePlace.originalPrice) * 100)
      : null

  return (
    <div className="w-full space-y-7">
      {/* Category Pills Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200/80 pb-5 dark:border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {CATEGORIES.map(({ label, value, icon: Icon }) => {
            const isSelected = activeCategory === value
            return (
              <button
                key={value}
                type="button"
                onClick={() => {
                  setActiveCategory(value)
                  setActiveImageIndex(0)
                }}
                className={`relative flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-all duration-300 ${
                  isSelected
                    ? "text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="desktopTabPill"
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-cyan-600 to-blue-600 shadow-md shadow-cyan-600/25"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <Icon className="relative z-10 size-3.5" />
                <span className="relative z-10">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Keyboard navigation hint & Place counter */}
        <div className="hidden items-center gap-3 text-xs text-slate-500 xl:flex">
          <span className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <span>←</span> / <span>→</span> keys to navigate
          </span>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            {activeIndex + 1} of {filteredPlaces.length}
          </span>
        </div>
      </div>

      {/* Main Split Stage Grid */}
      <div className="grid grid-cols-12 gap-7 items-stretch">
        {/* Left Hero Canvas (7 Columns) */}
        <div className="col-span-12 xl:col-span-7 flex flex-col justify-between overflow-hidden rounded-[2.5rem] border border-slate-200/80 bg-slate-950 text-white shadow-2xl shadow-slate-950/20 dark:border-slate-800">
          {/* Main Visual Stage */}
          <div className="relative aspect-[16/10] w-full overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${activePlace.id}-${activeImageIndex}`}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.45 }}
                className="absolute inset-0"
              >
                <Image
                  src={activePhoto}
                  alt={activePlace.title}
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 55vw"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>

            {/* Gradient Scrims */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-slate-950/50" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.2),transparent_45%)]" />

            {/* Top Badges Bar */}
            <div className="absolute inset-x-6 top-6 flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-2">
                {activePlace.category && (
                  <span className="rounded-xl border border-white/20 bg-slate-950/70 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-cyan-200 backdrop-blur-xl">
                    {activePlace.category}
                  </span>
                )}
                {activePlace.badge && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/30 bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-300 backdrop-blur-xl">
                    <ShieldCheck className="size-3.5 text-emerald-400" />
                    {activePlace.badge}
                  </span>
                )}
                {activePlace.elevation && (
                  <span className="inline-flex items-center gap-1 rounded-xl bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-xl">
                    <Mountain className="size-3.5 text-cyan-300" />
                    {activePlace.elevation}
                  </span>
                )}
              </div>

              {/* Prev / Next Quick Arrow Buttons */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={navigatePrev}
                  className="flex size-9 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 active:scale-95"
                  aria-label="Previous destination"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={navigateNext}
                  className="flex size-9 items-center justify-center rounded-full bg-slate-950/70 text-white backdrop-blur-md transition hover:bg-white hover:text-slate-950 active:scale-95"
                  aria-label="Next destination"
                >
                  <ChevronRight className="size-5" />
                </button>
              </div>
            </div>

            {/* Photo Gallery Thumbnails (Overlayed on bottom right of image) */}
            {photos.length > 1 && (
              <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2 rounded-2xl border border-white/20 bg-slate-950/75 p-1.5 backdrop-blur-xl">
                {photos.map((img, idx) => (
                  <button
                    key={img}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative size-11 overflow-hidden rounded-xl transition-all duration-200 ${
                      activeImageIndex === idx
                        ? "ring-2 ring-cyan-400 scale-105"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`Perspective ${idx + 1}`} fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Bottom Info Overlay */}
            <div className="absolute inset-x-6 bottom-5 z-10 max-w-xl space-y-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-cyan-300">
                <MapPin className="size-3.5" />
                <span>{activePlace.location}</span>
              </p>
              <h3 className="text-3xl font-black leading-tight tracking-tight text-white lg:text-4xl">
                {activePlace.title}
              </h3>
            </div>
          </div>

          {/* Details & Specs Under Image */}
          <div className="p-7 space-y-6">
            <p className="text-sm leading-relaxed text-slate-300">
              {activePlace.description}
            </p>

            {/* Highlighted Perks */}
            {activePlace.highlights && activePlace.highlights.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5">
                {activePlace.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200"
                  >
                    <Sparkles className="size-3.5 shrink-0 text-cyan-400" />
                    <span className="truncate">{highlight}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Host Section */}
            {activePlace.host && (
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3.5 backdrop-blur-md">
                <div className="flex items-center gap-3">
                  <div className="relative size-11 overflow-hidden rounded-full border-2 border-cyan-400/60">
                    <Image
                      src={activePlace.host.avatar}
                      alt={activePlace.host.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold text-white">{activePlace.host.name}</p>
                      {activePlace.host.verified && (
                        <ShieldCheck className="size-3.5 text-emerald-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{activePlace.host.role}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span>{activePlace.host.rating.toFixed(1)}</span>
                  <span className="text-slate-400">({activePlace.host.toursCount} journeys)</span>
                </div>
              </div>
            )}

            {/* Bottom Pricing & Primary CTA */}
            <div className="flex items-center justify-between border-t border-white/10 pt-5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Verified Tier Pricing
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-white">
                    ₹{activePlace.price.toLocaleString("en-IN")}
                  </span>
                  {activePlace.originalPrice && (
                    <span className="text-sm text-slate-400 line-through">
                      ₹{activePlace.originalPrice.toLocaleString("en-IN")}
                    </span>
                  )}
                  {discountPercent && (
                    <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                      {discountPercent}% OFF
                    </span>
                  )}
                  <span className="text-xs text-slate-300">{activePlace.unit ?? "/ person"}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleWishlist(activePlace.id)}
                  className={`flex size-11 items-center justify-center rounded-2xl border transition-all ${
                    isLiked
                      ? "border-rose-500/50 bg-rose-500/20 text-rose-400"
                      : "border-white/15 bg-white/5 text-slate-300 hover:border-white/30 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-label="Save to wishlist"
                >
                  <Heart className={`size-5 ${isLiked ? "fill-current" : ""}`} />
                </button>

                <Link
                  href={activePlace.href}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-cyan-500/25 transition-all duration-300 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Explore Full Itinerary</span>
                  <ArrowRight className="size-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Right Curated Collection Horizon (5 Columns) */}
        <div className="col-span-12 xl:col-span-5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
              Curated Destinations ({filteredPlaces.length})
            </h4>
            <span className="text-xs font-semibold text-cyan-600 dark:text-cyan-400">
              Click to preview
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto pr-1 max-h-[640px] scrollbar-thin">
            {filteredPlaces.map((place) => {
              const isSelected = place.id === activePlace.id
              const placeLiked = wishlist.has(place.id)

              return (
                <motion.div
                  key={place.id}
                  whileHover={{ scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => {
                    setActiveId(place.id)
                    setActiveImageIndex(0)
                  }}
                  className={`group relative flex cursor-pointer items-center gap-4 rounded-3xl border p-3.5 transition-all duration-300 ${
                    isSelected
                      ? "border-cyan-500/60 bg-cyan-500/10 shadow-lg shadow-cyan-500/10 dark:bg-cyan-950/30"
                      : "border-slate-200/80 bg-white/70 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700"
                  }`}
                >
                  {/* Thumbnail Image */}
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-2xl">
                    <Image
                      src={place.image}
                      alt={place.title}
                      fill
                      sizes="100px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-cyan-500/15" />
                    )}
                    {place.category && (
                      <span className="absolute bottom-1 left-1 rounded-md bg-slate-950/70 px-1.5 py-0.5 text-[9px] font-bold text-cyan-200 backdrop-blur-md">
                        {place.duration}
                      </span>
                    )}
                  </div>

                  {/* Content Info */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="flex items-center gap-1 text-[11px] font-semibold text-cyan-700 dark:text-cyan-400">
                        <MapPin className="size-3" />
                        <span className="truncate">{place.location}</span>
                      </p>
                      {placeLiked && (
                        <Heart className="size-3.5 fill-rose-500 text-rose-500 shrink-0" />
                      )}
                    </div>

                    <h5 className="truncate text-sm font-extrabold text-slate-950 dark:text-white">
                      {place.title}
                    </h5>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      {place.rating && (
                        <span className="flex items-center gap-0.5 font-bold text-amber-500">
                          <Star className="size-3 fill-current" />
                          {place.rating.toFixed(1)}
                        </span>
                      )}
                      <span>·</span>
                      <span>{place.groupSize}</span>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <p className="text-xs font-extrabold text-slate-900 dark:text-white">
                        ₹{place.price.toLocaleString("en-IN")}{" "}
                        <span className="text-[10px] font-normal text-slate-500">
                          {place.unit ?? "/ person"}
                        </span>
                      </p>

                      {isSelected ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950">
                          <span className="size-1.5 rounded-full bg-slate-950 animate-pulse" />
                          Viewing
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-400 group-hover:text-cyan-600 transition-colors">
                          Explore →
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Quick Discover Random Destination Banner */}
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-center dark:border-slate-800 dark:bg-slate-900/40">
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Not sure which journey matches your rhythm?
            </p>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Our travel specialists match small groups with verified hosts.
            </p>
            <button
              type="button"
              onClick={() => {
                const randomIdx = Math.floor(Math.random() * filteredPlaces.length)
                setActiveId(filteredPlaces[randomIdx].id)
                setActiveImageIndex(0)
              }}
              className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-cyan-600 hover:text-cyan-700 dark:text-cyan-400"
            >
              <Flame className="size-3.5" />
              <span>Surprise Me with a Destination</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* =========================================================================
   EXPORTED RESPONSIVE WRAPPER
   - Viewport < lg: Touch-first Tinder-style PlaceSwipeDeck
   - Viewport >= lg: Modern, Elegant Spatial Destination Explorer
   ========================================================================= */

export default function PlaceSwipeDeck({
  places = defaultPlaces,
  onSwipeLeft,
  onSwipeRight,
  className = "",
}: PlaceSwipeDeckProps) {
  return (
    <div className={`w-full ${className}`}>
      {/* Mobile & Small Screen (< 1024px) */}
      <div className="block lg:hidden">
        <MobilePlaceSwipeDeck
          places={places}
          onSwipeLeft={onSwipeLeft}
          onSwipeRight={onSwipeRight}
        />
      </div>

      {/* Desktop Screen (>= 1024px) */}
      <div className="hidden lg:block">
        <DesktopPlaceShowcase places={places} />
      </div>
    </div>
  )
}
