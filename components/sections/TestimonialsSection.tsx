"use client"

import { useState, useEffect, useRef } from "react"

const testimonials = [
  {
    name: "Priya Sharma",
    location: "Delhi, India",
    avatar: "PS",
    rating: 5,
    text: "GetHotels made our family trip to Mussoorie absolutely seamless. The hotel recommendations were spot-on and the booking process was incredibly smooth!",
    trip: "Family Trip to Mussoorie",
  },
  {
    name: "Rahul Verma",
    location: "Mumbai, India",
    avatar: "RV",
    rating: 5,
    text: "I've tried many booking platforms, but GetHotels stands out with its curated selection and genuine reviews. Found my perfect mountain retreat in minutes.",
    trip: "Solo Trip to Dehradun",
  },
  {
    name: "Anita Kapoor",
    location: "Bangalore, India",
    avatar: "AK",
    rating: 5,
    text: "The tour packages are brilliantly curated. Our Rishikesh adventure was packed with thrilling activities and comfortable stays. Highly recommend!",
    trip: "Adventure in Rishikesh",
  },
  {
    name: "Vikram Singh",
    location: "Jaipur, India",
    avatar: "VS",
    rating: 4,
    text: "Excellent customer service and great deals. The staff went above and beyond to ensure we had the best experience during our honeymoon trip.",
    trip: "Honeymoon Trip",
  },
  {
    name: "Meera Patel",
    location: "Ahmedabad, India",
    avatar: "MP",
    rating: 5,
    text: "From browsing to booking, everything was effortless. The photos matched reality and the host was incredibly welcoming. Will definitely book again!",
    trip: "Weekend Getaway",
  },
]

const avatarColors = [
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-purple-500 to-violet-600",
]

export default function TestimonialsSection() {
  const [active, setActive] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const handleSelect = (idx: number) => {
    setActive(idx)
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length)
    }, 5000)
  }

  const t = testimonials[active]

  return (
    <section className="relative py-20 overflow-hidden bg-gradient-to-b from-white to-slate-50">
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-purple-100 rounded-full opacity-15 blur-3xl" />

      <div className="container mx-auto px-6 relative">
        <div className="mb-14 text-center max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            What travelers <span className="gradient-text">say about us</span>
          </h2>
          <p className="text-slate-500">
            Real experiences from real travelers who chose GetHotels
          </p>
        </div>

        {/* Main testimonial card */}
        <div className="max-w-3xl mx-auto">
          <div className="relative bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
            {/* Quote icon */}
            <div className="absolute -top-5 left-10 w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609L9.978 5.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H0z" />
              </svg>
            </div>

            {/* Stars */}
            <div className="flex gap-1 mb-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`w-5 h-5 ${i < t.rating ? "text-amber-400" : "text-slate-200"}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            {/* Text */}
            <p className="text-lg md:text-xl text-slate-700 leading-relaxed mb-8 min-h-[80px]">
              &ldquo;{t.text}&rdquo;
            </p>

            {/* Author */}
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[active % avatarColors.length]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                {t.avatar}
              </div>
              <div>
                <p className="font-bold text-slate-900">{t.name}</p>
                <p className="text-sm text-slate-500">{t.location} · {t.trip}</p>
              </div>
            </div>
          </div>

          {/* Avatar selector */}
          <div className="flex items-center justify-center gap-4 mt-8">
            {testimonials.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatarColors[idx % avatarColors.length]} flex items-center justify-center text-white font-bold text-xs transition-all duration-300 ${
                  active === idx
                    ? "ring-4 ring-blue-200 scale-110 shadow-lg"
                    : "opacity-50 hover:opacity-80 hover:scale-105"
                }`}
              >
                {item.avatar}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
