'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Tour } from '@/lib/tours'
import { useState } from 'react'
import { useWishlist } from '@/contexts/WishlistContext'
import { MapPin, Clock, Users, Star, Calendar } from 'lucide-react'

type TourCardProps = {
  tour: Tour
  layout?: 'grid' | 'list'
}

const categoryColors: Record<string, string> = {
  adventure: 'bg-orange-500',
  relaxation: 'bg-emerald-500',
  cultural: 'bg-purple-500',
  wildlife: 'bg-amber-600',
}

export const TourCard = ({ tour, layout = 'grid' }: TourCardProps) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [isAnimating, setIsAnimating] = useState(false)

  const inWishlist = isInWishlist(tour.slug, 'tour')

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsAnimating(true)

    if (inWishlist) {
      removeFromWishlist(tour.slug, 'tour')
    } else {
      addToWishlist({
        id: tour.slug,
        slug: tour.slug,
        title: tour.title,
        image: tour.image,
        price: tour.price,
        type: 'tour',
      })
    }

    setTimeout(() => setIsAnimating(false), 300)
  }

  const wishlistButton = (
    <button
      onClick={handleWishlist}
      className={`absolute top-3 left-3 z-10 h-9 w-9 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 shadow-lg ${
        inWishlist ? 'bg-white text-red-500 hover:bg-red-50' : 'bg-white/90 backdrop-blur-sm hover:bg-white'
      }`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <svg
        className={`w-4 h-4 transition-all duration-300 ${inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'} ${isAnimating ? 'scale-125' : 'scale-100'}`}
        fill={inWishlist ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={inWishlist ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    </button>
  )

  if (layout === 'list') {
    return (
      <Link href={`/tours/${tour.slug}`}>
        <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row cursor-pointer">
          <div className="relative w-full sm:w-72 h-56 sm:h-auto flex-shrink-0 overflow-hidden">
            <Image src={tour.image} alt={tour.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            <span className={`absolute top-3 right-3 ${categoryColors[tour.category] || 'bg-blue-500'} text-white text-xs font-semibold px-3 py-1 rounded-full capitalize`}>
              {tour.category}
            </span>
            {wishlistButton}
          </div>
          <div className="flex-1 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition line-clamp-1 flex-1">{tour.title}</h3>
              <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-semibold">{tour.rating}</span>
                <span className="text-xs text-gray-400">({tour.reviews})</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
              <MapPin className="w-3.5 h-3.5" /> {tour.destination}
            </p>
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">{tour.description}</p>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {tour.highlights.slice(0, 4).map((h, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{h}</span>
              ))}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
              <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {tour.duration} Days</span>
              <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {tour.groupSize}</span>
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {tour.bestTimeToVisit}</span>
            </div>
            <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
              <div>
                <p className="text-xs text-gray-400">Starting from</p>
                <p className="text-xl font-bold text-blue-600">₹{tour.price.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/person</span></p>
              </div>
              <span className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all group-hover:shadow-lg">
                View Details
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/tours/${tour.slug}`}>
      <div className="group bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 h-full flex flex-col transform hover:-translate-y-2 cursor-pointer">
        <div className="relative h-56 w-full overflow-hidden">
          <Image src={tour.image} alt={tour.title} fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
            <Clock className="w-3 h-3" /> {tour.duration} Days
          </div>
          <span className={`absolute top-3 right-3 ${categoryColors[tour.category] || 'bg-blue-500'} text-white text-xs font-semibold px-3 py-1 rounded-full capitalize shadow-lg`}>
            {tour.category}
          </span>
          <div className="absolute bottom-3 right-3 bg-yellow-400/95 backdrop-blur-sm text-gray-900 px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
            <Star className="w-3 h-3 fill-gray-900" /> {tour.rating} <span className="text-gray-700 font-normal">({tour.reviews})</span>
          </div>
          {wishlistButton}
        </div>
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          <div>
            <h3 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-300">
              {tour.title}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-blue-500" /> {tour.destination}
            </p>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">{tour.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {tour.highlights.slice(0, 3).map((h, i) => (
              <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-full font-medium">{h}</span>
            ))}
            {tour.highlights.length > 3 && (
              <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-0.5 rounded-full">+{tour.highlights.length - 3} more</span>
            )}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {tour.groupSize}</span>
            <span className="text-gray-300">•</span>
            <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {tour.bestTimeToVisit.split(',')[0]}</span>
          </div>
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">From</p>
              <p className="text-xl font-bold text-blue-600">₹{tour.price.toLocaleString()}<span className="text-xs text-gray-400 font-normal">/person</span></p>
            </div>
            <span className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md group-hover:shadow-lg group-hover:scale-105 duration-300">
              Explore →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
