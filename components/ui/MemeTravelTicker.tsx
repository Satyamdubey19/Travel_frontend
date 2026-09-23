"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dices, Flame, Quote } from "lucide-react"

export interface TravelQuote {
  id: number
  quote: string
  context: string
  tag: string
  emoji: string
}

export const TRAVEL_MEME_QUOTES: TravelQuote[] = [
  {
    id: 1,
    quote: "Goa trip plan ban gaya hai... bhagwan kare iss baar WhatsApp group mute na ho jaye!",
    context: "Group Chat Reality",
    tag: "Goa Trope",
    emoji: "🌴🤞",
  },
  {
    id: 2,
    quote: "Status: In the mountains. Slack: Muted. Boss: 'Network weak hai' (even on 5G).",
    context: "Work-Life Antidote",
    tag: "WFH Pahad",
    emoji: "🏔️📵",
  },
  {
    id: 3,
    quote: "Eating ₹80 Maggi at 12,000 feet in freezing cold hits harder than any 5-star buffet.",
    context: "Pahadi Gourmet",
    tag: "Maggi Hits",
    emoji: "🍜☕",
  },
  {
    id: 4,
    quote: "HR: 'Your leave is approved.' Me: Already 400km away on the highway playing retro tracks.",
    context: "Leave Velocity",
    tag: "Sprint Out",
    emoji: "🚗💨",
  },
  {
    id: 5,
    quote: "Bunny was right: 'Kahin pahunchne ke liye kahin se nikalna zaroori hota hai...'",
    context: "YJHD Philosophy",
    tag: "Bunny Mode",
    emoji: "🎒✨",
  },
  {
    id: 6,
    quote: "Packed 14 outfits for a 2-day weekend getaway just in case I suddenly become an influencer.",
    context: "Overpacking Truth",
    tag: "Luggage Drama",
    emoji: "🧳📸",
  },
  {
    id: 7,
    quote: "Dil chahta hai Ladakh bike expedition, bank account keh raha hai terrace pe walk kar le.",
    context: "Monthly Budget",
    tag: "Pocket Check",
    emoji: "🏍️💸",
  },
  {
    id: 8,
    quote: "Google Maps: 'Take a U-turn'. Local tapri uncle: 'Beta Maps band karo, seedha upar chadh jao.'",
    context: "Local Wisdom",
    tag: "Desi GPS",
    emoji: "🗺️☕",
  },
  {
    id: 9,
    quote: "Book the trip. You can always apologize to your Monday morning standup later.",
    context: "Impulse Bookings",
    tag: "No Regrets",
    emoji: "🌄🕶️",
  },
  {
    id: 10,
    quote: "Rishikesh river raft guide: 'Koi nahi girega!' Also the guide at the third rapid: *SPLASH*",
    context: "White Water Drama",
    tag: "Adrenaline",
    emoji: "🌊🛶",
  },
]

interface MemeTravelTickerProps {
  variant?: "ribbon" | "pill" | "subtle"
  className?: string
  autoPlay?: boolean
}

export default function MemeTravelTicker({
  variant = "ribbon",
  className = "",
  autoPlay = true,
}: MemeTravelTickerProps) {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (!autoPlay || isPaused) return
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TRAVEL_MEME_QUOTES.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [autoPlay, isPaused])

  const nextQuote = () => {
    setIndex((prev) => (prev + 1) % TRAVEL_MEME_QUOTES.length)
  }

  const current = TRAVEL_MEME_QUOTES[index]

  if (variant === "pill") {
    return (
      <div
        className={`inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-amber-50/80 px-3 py-1.5 text-xs text-amber-950 shadow-sm backdrop-blur-md dark:border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-200 ${className}`}
      >
        <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-amber-400 text-amber-950 font-black text-[10px]">
          {current.emoji.slice(0, 2)}
        </span>
        <p className="truncate text-xs font-semibold">{current.quote}</p>
      </div>
    )
  }

  if (variant === "subtle") {
    return (
      <div className={`flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 ${className}`}>
        <Quote className="size-3.5 text-cyan-500 shrink-0" />
        <span className="truncate italic font-medium">&ldquo;{current.quote}&rdquo;</span>
        <button
          type="button"
          onClick={nextQuote}
          title="Next travel meme"
          className="ml-auto flex size-6 items-center justify-center rounded-md hover:bg-slate-200/50 text-slate-400 hover:text-slate-700 transition"
        >
          <Dices className="size-3.5" />
        </button>
      </div>
    )
  }

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative mx-auto w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-slate-900/90 via-slate-950/95 to-slate-900/90 p-3 sm:p-3.5 shadow-xl shadow-slate-950/20 backdrop-blur-xl ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex shrink-0 items-center gap-2">
          <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-slate-950 shadow-sm">
            <Flame className="size-3 fill-slate-950" />
            <span>Travel Truth</span>
          </span>
          <span className="hidden sm:inline-block rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
            #{current.id} {current.tag}
          </span>
        </div>

        <div className="relative min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex items-center gap-2 truncate text-xs sm:text-sm font-medium text-slate-200"
            >
              <span className="text-base sm:text-lg">{current.emoji}</span>
              <p className="truncate text-slate-100 font-semibold">
                &ldquo;{current.quote}&rdquo;
              </p>
              <span className="hidden md:inline text-[11px] text-slate-400 font-normal shrink-0">
                — {current.context}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          type="button"
          onClick={nextQuote}
          aria-label="Shuffle meme quote"
          title="Shuffle quote"
          className="flex shrink-0 items-center gap-1.5 rounded-xl border border-white/10 bg-white/10 px-2.5 py-1 text-[11px] font-bold text-white transition hover:bg-white/20 active:scale-95"
        >
          <Dices className="size-3.5 text-cyan-300" />
          <span className="hidden sm:inline">Next Meme</span>
        </button>
      </div>
    </div>
  )
}
