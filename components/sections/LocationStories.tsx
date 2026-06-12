"use client"

import { useEffect, useRef, useState } from "react"

const stories = [
  {
    tag: "Fact",
    title: "Rajaji National Park Gateway",
    text: "The city is the gateway to Rajaji National Park, and the nearby Sal forests are part of its vital buffer zone.",
  },
  {
    tag: "Story",
    title: "Uttarakhand’s Interim Capital",
    text: "When Uttarakhand formed in November 2000, Dehradun became the interim capital and remains the administrative hub.",
  },
  {
    tag: "Highlight",
    title: "Mindrolling Monastery",
    text: "Dehradun is home to one of the world's largest Buddhist stupas, the iconic Mindrolling Monastery.",
  },
  {
    tag: "Local Tip",
    title: "Cultural Walk",
    text: "Mall Road is the best place to sample Kumaoni snacks, street tea, and local handicrafts before your trip.",
  },
  {
    tag: "Must-See",
    title: "Historic Landmarks",
    text: "Explore colonial buildings and hidden temples around the city for a quick cultural overview.",
  },
]

export default function LocationStories() {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return

    let frame = 0

    const step = () => {
      if (!isPaused && track.scrollWidth > track.clientWidth) {
        const next = track.scrollLeft + 0.75
        const maxScroll = track.scrollWidth - track.clientWidth
        track.scrollLeft = next >= maxScroll ? 0 : next
      }
      frame = window.requestAnimationFrame(step)
    }

    frame = window.requestAnimationFrame(step)

    return () => window.cancelAnimationFrame(frame)
  }, [isPaused])

  return (
    <section className="relative py-20 bg-gradient-to-b from-slate-50 to-white overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-15 blur-3xl" />

      <div className="container mx-auto px-6 relative">
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
            Local Stories
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Nearby stories & <span className="gradient-text">must-know facts</span>
          </h2>
          <p className="text-slate-500">
            Swipe through local tales, tips, and fascinating facts
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl bg-white p-4 shadow-xl shadow-slate-200/50 border border-slate-100">
          <div
            ref={trackRef}
            className="flex gap-5 overflow-x-auto pb-2 no-scrollbar"
          >
            {stories.map((story, idx) => {
              const colors = [
                { border: "border-emerald-200", bg: "from-emerald-500/10 to-teal-500/10", tag: "text-emerald-600 bg-emerald-50", icon: "🌿" },
                { border: "border-blue-200", bg: "from-blue-500/10 to-indigo-500/10", tag: "text-blue-600 bg-blue-50", icon: "🏛️" },
                { border: "border-amber-200", bg: "from-amber-500/10 to-orange-500/10", tag: "text-amber-600 bg-amber-50", icon: "🕉️" },
                { border: "border-rose-200", bg: "from-rose-500/10 to-pink-500/10", tag: "text-rose-600 bg-rose-50", icon: "🍵" },
                { border: "border-purple-200", bg: "from-purple-500/10 to-violet-500/10", tag: "text-purple-600 bg-purple-50", icon: "🏰" },
              ]
              const c = colors[idx % colors.length]

              return (
                <article
                  key={story.title}
                  className={`min-w-[300px] shrink-0 rounded-2xl border ${c.border} bg-gradient-to-br ${c.bg} p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default`}
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-xs uppercase tracking-widest font-bold px-3 py-1 rounded-full ${c.tag}`}>
                      {story.tag}
                    </span>
                    <span className="text-2xl">{c.icon}</span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{story.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-600">{story.text}</p>
                </article>
              )
            })}
          </div>
        </div>

        {/* Scroll hint */}
        <p className="text-center mt-4 text-xs text-slate-400 flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
          </svg>
          Auto-scrolling · Hover to pause
        </p>
      </div>
    </section>
  )
}
