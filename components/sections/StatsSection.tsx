"use client"

import { useEffect, useRef, useState } from "react"

const stats = [
  { label: "Happy Travelers", value: 15000, suffix: "+", icon: "😊" },
  { label: "Hotels Listed", value: 500, suffix: "+", icon: "🏨" },
  { label: "Cities Covered", value: 50, suffix: "+", icon: "🌍" },
  { label: "5-Star Reviews", value: 8500, suffix: "+", icon: "⭐" },
]

function useCountUp(target: number, duration = 2000, shouldStart: boolean) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!shouldStart) return

    let start = 0
    const increment = target / (duration / 16)
    let frame: number

    const step = () => {
      start += increment
      if (start >= target) {
        setCount(target)
      } else {
        setCount(Math.floor(start))
        frame = requestAnimationFrame(step)
      }
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, shouldStart])

  return count
}

function StatItem({ stat, shouldAnimate }: { stat: typeof stats[0]; shouldAnimate: boolean }) {
  const count = useCountUp(stat.value, 2000, shouldAnimate)

  return (
    <div className="text-center group">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-3xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {stat.icon}
      </div>
      <p className="text-4xl md:text-5xl font-black text-slate-900 mb-2">
        {count.toLocaleString()}{stat.suffix}
      </p>
      <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
        {stat.label}
      </p>
    </div>
  )
}

export default function StatsSection() {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )

    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section ref={ref} className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute top-0 left-0 w-80 h-80 bg-blue-100 rounded-full opacity-20 blur-3xl -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full opacity-15 blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-6 relative">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
            Our Impact
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Trusted by thousands of <span className="gradient-text">travelers</span>
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            Join a growing community of adventurers who trust GetHotels for their perfect stay
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-7">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-3xl p-5 md:p-8 border border-slate-100 shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden"
            >
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-blue-50 text-2xl md:text-3xl mb-3 md:mb-4">
                  {stat.icon}
                </div>
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 mb-1 md:mb-2 break-words">
                  {isVisible ? <CountDisplay target={stat.value} suffix={stat.suffix} /> : `0${stat.suffix}`}
                </p>
                <p className="text-xs md:text-sm font-semibold text-slate-500 uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CountDisplay({ target, suffix }: { target: number; suffix: string }) {
  const count = useCountUp(target, 2000, true)
  return <>{count.toLocaleString()}{suffix}</>
}
