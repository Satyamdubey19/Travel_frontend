"use client"

import { useState } from "react"
import Link from "next/link"
import { tours } from "@/lib/tours"

const TourPackages = () => {
  const [activeFilter, setActiveFilter] = useState("All")

  const categories = [...new Set(tours.map(t => t.category))]
  const filters = ["All", ...categories]

  const filteredPackages = activeFilter === "All"
    ? tours
    : tours.filter(t => t.category === activeFilter)

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background accents */}
      <div className="absolute top-20 right-0 w-80 h-80 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-25 blur-3xl" />
      <div className="absolute bottom-10 left-0 w-64 h-64 bg-gradient-to-tr from-amber-100 to-pink-100 rounded-full opacity-20 blur-3xl" />

      <div className="container mx-auto px-6 relative">
        {/* Section header */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
            Tour Packages
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900">
            Curated places to <span className="gradient-text">explore</span>
          </h2>
          <p className="mt-4 text-slate-500 leading-relaxed">
            Beautiful imagery and clean city names make it easy to browse your next getaway.
          </p>

          {/* Filter tabs */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            {filters.map(filter => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
                  activeFilter === filter
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                    : "bg-white text-slate-600 hover:bg-blue-50 hover:text-blue-600 border border-slate-200"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid md:grid-cols-3 md:gap-7">
          {filteredPackages.map((item, idx) => (
            <Link
              key={item.slug}
              href={`/tours/${item.slug}`}
              className={`group overflow-hidden rounded-3xl bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-${(idx + 1) * 100} block`}
            >
              <div className="relative h-72 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                {/* Category badge */}
                <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                  {item.category}
                </div>

                {/* Duration badge */}
                <div className="absolute top-4 right-4 bg-white/95 rounded-full px-3 py-1 text-xs font-bold text-slate-800 shadow-lg">
                  {item.duration} Days
                </div>

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <p className="text-xs uppercase tracking-[0.35em] text-blue-300 font-bold mb-2">Tour package</p>
                  <h3 className="text-2xl font-black text-white drop-shadow-lg">{item.title}</h3>
                </div>
              </div>

              {/* Price bar */}
              <div className="flex items-center justify-between p-5 border-t border-slate-100">
                <div>
                  <p className="text-xs text-slate-400 uppercase font-semibold">Starting from</p>
                  <p className="text-xl font-black text-blue-600">₹{item.price.toLocaleString()}</p>
                </div>
                <span className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-full group-hover:shadow-lg group-hover:shadow-blue-600/25 transition-all duration-300">
                  Explore
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile scrollable cards */}
        <div className="md:hidden">
          <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar snap-x snap-mandatory px-1">
            {filteredPackages.map((item) => (
              <Link
                key={item.slug}
                href={`/tours/${item.slug}`}
                className="min-w-[85%] snap-start shrink-0 rounded-3xl overflow-hidden bg-white shadow-lg active:scale-[0.98] transition-transform block"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />

                  <div className="absolute top-4 left-4 glass rounded-full px-3 py-1 text-xs font-bold text-white uppercase tracking-wider">
                    {item.category}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/95 rounded-full px-3 py-1 text-xs font-bold text-slate-800 shadow-lg">
                    {item.duration} Days
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                    <p className="text-xs uppercase tracking-[0.35em] text-blue-300 font-bold mb-1">Tour package</p>
                    <h3 className="text-xl font-black drop-shadow-lg">{item.title}</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between p-5 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 uppercase font-semibold">Starting from</p>
                    <p className="text-xl font-black text-blue-600">₹{item.price.toLocaleString()}</p>
                  </div>
                  <span className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-sm font-bold rounded-full">
                    Explore
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TourPackages
