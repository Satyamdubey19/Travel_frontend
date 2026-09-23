'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Tour } from '@/lib/tours'
import { useState } from 'react'
import { useWishlist } from '@/contexts/WishlistContext'
import { MapPin, Clock, Users, Star, Calendar, ArrowRight, Heart } from 'lucide-react'

type TourCardProps = {
  tour: Tour
  layout?: 'grid' | 'list'
}

const categoryStyles: Record<string, { dot: string; label: string }> = {
  adventure: { dot: 'bg-cyan-400', label: 'Adventure' },
  relaxation: { dot: 'bg-emerald-400', label: 'Relaxation' },
  cultural: { dot: 'bg-indigo-400', label: 'Cultural' },
  wildlife: { dot: 'bg-amber-400', label: 'Wildlife' },
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
      className={`size-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md backdrop-blur-md ${
        inWishlist
          ? 'bg-white text-rose-500 shadow-rose-500/25 scale-105'
          : 'bg-white/85 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-white hover:scale-110 active:scale-95'
      }`}
      aria-label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={`size-4 transition-transform duration-300 ${
          inWishlist ? 'fill-rose-500 text-rose-500' : 'text-slate-700 dark:text-slate-200'
        } ${isAnimating ? 'scale-125' : 'scale-100'}`}
      />
    </button>
  )

  if (layout === 'list') {
    return (
      <Link href={`/tours/${tour.slug}`} className="block">
        <div className="group flex flex-col sm:flex-row overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.07)] hover:shadow-[0_22px_48px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-1 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer">
          <div className="relative w-full sm:w-72 h-56 sm:h-auto min-h-[220px] flex-shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image
              src={tour.image}
              alt={tour.title}
              fill
              sizes="(min-width: 640px) 288px, 100vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 backdrop-blur-md px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white border border-white/20 shadow-sm">
                <span className={`size-1.5 rounded-full ${categoryStyles[tour.category]?.dot || 'bg-cyan-400'} animate-pulse`} />
                {categoryStyles[tour.category]?.label || tour.category}
              </span>
            </div>

            <div className="absolute top-3.5 right-3.5 z-10">
              {wishlistButton}
            </div>

            <div className="absolute bottom-3.5 left-3.5 z-10">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/95 border border-white/15 shadow-sm">
                <Clock className="size-3 text-cyan-300" />
                {tour.duration} {tour.duration === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>

          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                  <MapPin className="size-3.5 text-cyan-600 shrink-0" />
                  <span className="truncate">{tour.destination}</span>
                </p>
                <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300 shrink-0">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span>{tour.rating.toFixed(1)}</span>
                  <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">({tour.reviews})</span>
                </div>
              </div>

              <h3 className="mt-2 text-lg font-extrabold text-slate-950 dark:text-white tracking-tight leading-snug line-clamp-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                {tour.title}
              </h3>

              <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
                {tour.description}
              </p>

              <div className="mt-3 flex flex-wrap gap-1.5">
                {tour.highlights.slice(0, 3).map((h, i) => (
                  <span key={i} className="rounded-md bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                    {h}
                  </span>
                ))}
                {tour.highlights.length > 3 && (
                  <span className="rounded-md bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                    +{tour.highlights.length - 3} more
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-slate-400" />
                  {tour.groupSize}
                </span>
                <span className="text-slate-300 dark:text-slate-700">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-slate-400" />
                  {tour.bestTimeToVisit.split(',')[0]}
                </span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800/80">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Starting from</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-slate-950 dark:text-white tracking-tight">₹{tour.price.toLocaleString('en-IN')}</span>
                  <span className="text-xs font-medium text-slate-400">/ person</span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-4 py-2 text-xs shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-all duration-300">
                View Tour
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/tours/${tour.slug}`} className="block h-full">
      <div className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.07)] hover:shadow-[0_22px_48px_-12px_rgba(15,23,42,0.18)] hover:-translate-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer">
        <div className="relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
          <Image
            src={tour.image}
            alt={tour.title}
            fill
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

          <div className="absolute top-3.5 left-3.5 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 backdrop-blur-md px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white border border-white/20 shadow-sm">
              <span className={`size-1.5 rounded-full ${categoryStyles[tour.category]?.dot || 'bg-cyan-400'} animate-pulse`} />
              {categoryStyles[tour.category]?.label || tour.category}
            </span>
          </div>

          <div className="absolute top-3.5 right-3.5 z-10">
            {wishlistButton}
          </div>

          <div className="absolute bottom-3.5 left-3.5 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/95 border border-white/15 shadow-sm">
              <Clock className="size-3 text-cyan-300" />
              {tour.duration} {tour.duration === 1 ? 'Day' : 'Days'}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-between p-5 gap-3">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
                <MapPin className="size-3.5 text-cyan-600 shrink-0" />
                <span className="truncate">{tour.destination}</span>
              </p>
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300 shrink-0">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span>{tour.rating.toFixed(1)}</span>
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">({tour.reviews})</span>
              </div>
            </div>

            <h3 className="mt-1 text-[17px] font-extrabold text-slate-950 dark:text-white tracking-tight leading-snug line-clamp-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
              {tour.title}
            </h3>

            <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400 line-clamp-2">
              {tour.description}
            </p>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {tour.highlights.slice(0, 3).map((h, i) => (
                <span key={i} className="rounded-md bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                  {h}
                </span>
              ))}
              {tour.highlights.length > 3 && (
                <span className="rounded-md bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                  +{tour.highlights.length - 3}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Users className="size-3.5 text-slate-400" />
                {tour.groupSize}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="size-3.5 text-slate-400" />
                {tour.bestTimeToVisit.split(',')[0]}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Starting from</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-950 dark:text-white tracking-tight">₹{tour.price.toLocaleString('en-IN')}</span>
                <span className="text-xs font-medium text-slate-400">/ person</span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-4 py-2 text-xs shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-all duration-300">
              Explore
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}
