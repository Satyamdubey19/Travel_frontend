'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { tours } from '@/lib/tours'

const TourPackages = () => {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [hoveredTour, setHoveredTour] = useState<string | null>(null)

  const toggleWishlist = (tourId: string) => {
    setWishlist((prev) =>
      prev.includes(tourId) ? prev.filter((id) => id !== tourId) : [...prev, tourId]
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-black mb-4">Popular Tour Packages</h2>
          <p className="text-gray-700 text-lg max-w-2xl mx-auto">
            Discover amazing travel experiences to India's most incredible destinations with carefully curated itineraries and premium accommodations
          </p>
        </div>

        {/* Tours Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {tours.map((tour) => (
            <div
              key={tour.id}
              className="group relative"
              onMouseEnter={() => setHoveredTour(tour.id)}
              onMouseLeave={() => setHoveredTour(null)}
            >
              <Link href={`/tours/${tour.slug}`}>
                <div className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col transform hover:-translate-y-2">
                  {/* Image Container */}
                  <div className="relative h-56 w-full overflow-hidden bg-gray-200">
                    <Image
                      src={tour.image}
                      alt={tour.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />

                    {/* Badges */}
                    <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {tour.duration} Days
                    </div>
                    <div className="absolute top-4 right-4 bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold">
                      ⭐ {tour.rating}
                    </div>

                    {/* Wishlist Button */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        toggleWishlist(tour.id)
                      }}
                      className={`absolute bottom-4 right-4 p-2 rounded-full transition-all duration-300 transform ${
                        wishlist.includes(tour.id)
                          ? 'bg-red-600 text-white scale-110'
                          : 'bg-white/90 text-gray-800 hover:bg-white hover:scale-110'
                      }`}
                    >
                      <svg
                        className="w-6 h-6"
                        fill={wishlist.includes(tour.id) ? 'currentColor' : 'none'}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    {/* Title & Location */}
                    <h3 className="text-xl font-bold text-black mb-2 line-clamp-2 group-hover:text-blue-600 transition">
                      {tour.title}
                    </h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mb-3">
                      <span>📍</span>
                      <span>{tour.location.city}, {tour.location.country}</span>
                    </p>

                    {/* Description */}
                    <p className="text-sm text-gray-700 mb-4 line-clamp-2 flex-grow">
                      {tour.description}
                    </p>

                    {/* Highlights */}
                    <div className="mb-4 pb-4 border-b border-gray-200">
                      <p className="text-xs font-bold text-black uppercase tracking-wide mb-2">
                        Highlights
                      </p>
                      <ul className="space-y-1">
                        {tour.highlights.slice(0, 3).map((highlight, idx) => (
                          <li key={idx} className="text-xs text-gray-600 flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">✓</span>
                            <span>{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Price & Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-500 uppercase font-semibold">
                          Starting at
                        </p>
                        <p className="text-2xl font-bold text-blue-600">
                          ₹{tour.price.toLocaleString()}
                        </p>
                      </div>
                      <button className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-lg transition-all inline-flex items-center gap-2 group/btn">
                        Explore
                        <svg
                          className="w-4 h-4 transition-transform group-hover/btn:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <p className="text-gray-700 mb-4">
            Looking for something special? Explore all our tour packages
          </p>
          <Link
            href="/tours"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-lg hover:shadow-xl transition-all hover:scale-105"
          >
            View All Tours →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default TourPackages
