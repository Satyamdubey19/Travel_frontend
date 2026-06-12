'use client'

import { useState } from 'react'
import { CalendarDays, Users } from 'lucide-react'
import TravelListingCard from '@/components/home/TravelListingCard'
import { useWishlist } from '@/contexts/WishlistContext'
import { tours, Tour } from '@/lib/tours'
import type { WishlistPopup } from '@/types/sections'

const featuredTours = tours.slice(0, 3)

export default function HomeFeaturedTours() {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist()
  const [popup, setPopup] = useState<WishlistPopup>(null)
  const [animating, setAnimating] = useState<string | null>(null)

  const handleWishlist = (e: React.MouseEvent, tour: Tour) => {
    e.preventDefault()
    e.stopPropagation()

    const wasInWishlist = isInWishlist(tour.slug, 'tour')

    if (wasInWishlist) {
      removeFromWishlist(tour.slug, 'tour')
      setPopup({ slug: tour.slug, action: 'removed' })
    } else {
      addToWishlist({
        id: tour.slug,
        slug: tour.slug,
        title: tour.title,
        image: tour.image,
        price: tour.price,
        type: 'tour',
      })
      setPopup({ slug: tour.slug, action: 'added' })
    }

    setAnimating(tour.slug)
    setTimeout(() => setAnimating(null), 420)
    setTimeout(() => setPopup(null), 1600)
  }

  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {featuredTours.map((tour) => {
        const inWishlist = isInWishlist(tour.slug, 'tour')
        const showPopup = popup?.slug === tour.slug

        return (
          <TravelListingCard
            key={tour.id}
            href={`/tours/${tour.slug}`}
            title={tour.title}
            image={tour.image}
            location={tour.destination}
            eyebrow={tour.category}
            rating={tour.rating}
            description={tour.description}
            price={tour.price}
            priceLabel="Per person"
            ctaLabel="View tour"
            tags={tour.highlights}
            imageClassName="h-64"
            meta={[
              { icon: CalendarDays, label: `${tour.duration} days` },
              { icon: Users, label: tour.groupSize },
            ]}
            wishlist={{
              saved: inWishlist,
              label: 'Save to wishlist',
              activeLabel: 'Remove from wishlist',
              animating: animating === tour.slug,
              toast: showPopup ? (popup?.action === 'added' ? 'Saved to wishlist' : 'Removed') : undefined,
              toastTone: popup?.action === 'added' ? 'saved' : 'removed',
              onToggle: (event) => handleWishlist(event, tour),
            }}
            className="hover:shadow-[0_30px_80px_-34px_rgba(8,124,111,0.65)]"
          />
        )
      })}
    </div>
  )
}
