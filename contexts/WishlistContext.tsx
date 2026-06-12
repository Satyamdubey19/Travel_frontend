'use client'

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react'
import { Heart } from 'lucide-react'

export type WishlistItem = {
  id: string
  slug: string
  title: string
  image: string
  price: number
  type: 'hotel' | 'tour'
}

type WishlistContextType = {
  wishlist: WishlistItem[]
  addToWishlist: (item: WishlistItem) => void
  removeFromWishlist: (slug: string, type: 'hotel' | 'tour') => void
  isInWishlist: (slug: string, type: 'hotel' | 'tour') => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined)

type WishlistNotice = {
  message: string
}

type ServerWishlistItem = {
  id: string
  target: 'HOTEL' | 'TOUR' | 'RENTAL' | 'ACTIVITY'
  Hotel?: {
    title?: string | null
    slug?: string | null
    HotelImage?: Array<{ url?: string | null }>
  } | null
  Tour?: {
    title?: string | null
    slug?: string | null
    images?: string[] | null
    pricePerPerson?: number | null
  } | null
}

const mapServerWishlistItem = (item: ServerWishlistItem): WishlistItem | null => {
  if (item.target === 'HOTEL' && item.Hotel?.slug) {
    return {
      id: item.id,
      slug: item.Hotel.slug,
      title: item.Hotel.title ?? 'Hotel',
      image: item.Hotel.HotelImage?.[0]?.url ?? '/images/hotel-slider-fallback.png',
      price: 0,
      type: 'hotel',
    }
  }

  if (item.target === 'TOUR' && item.Tour?.slug) {
    return {
      id: item.id,
      slug: item.Tour.slug,
      title: item.Tour.title ?? 'Tour',
      image: item.Tour.images?.[0] ?? '/images/hotel-slider-fallback.png',
      price: item.Tour.pricePerPerson ?? 0,
      type: 'tour',
    }
  }

  return null
}

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([])
  const [isMounted, setIsMounted] = useState(false)
  const [notice, setNotice] = useState<WishlistNotice | null>(null)
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const showNotice = (nextNotice: WishlistNotice) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current)
    setNotice(nextNotice)
    noticeTimer.current = setTimeout(() => setNotice(null), 1800)
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('wishlist')
      if (stored) {
        try {
          setWishlist(JSON.parse(stored))
        } catch (e) {
          console.error('Failed to parse wishlist from localStorage:', e)
        }
      }
    }
    setIsMounted(true)
  }, [])

  useEffect(() => {
    if (!isMounted) return

    const syncWishlist = async () => {
      try {
        const response = await fetch('/api/wishlist')
        if (!response.ok) return

        const serverWishlist = (await response.json()) as ServerWishlistItem[]
        const mappedWishlist = serverWishlist
          .map(mapServerWishlistItem)
          .filter((item): item is WishlistItem => Boolean(item))

        setWishlist(mappedWishlist)
      } catch (error) {
        console.error('Failed to sync wishlist:', error)
      }
    }

    syncWishlist()
  }, [isMounted])

  useEffect(() => {
    if (isMounted && typeof window !== 'undefined') {
      localStorage.setItem('wishlist', JSON.stringify(wishlist))
    }
  }, [wishlist, isMounted])

  const addToWishlist = (item: WishlistItem) => {
    const exists = wishlist.some((w) => w.slug === item.slug && w.type === item.type)
    if (exists) return
    showNotice({ message: 'Added to wishlist' })
    setWishlist((prev) => {
      if (prev.some((w) => w.slug === item.slug && w.type === item.type)) return prev
      return [...prev, item]
    })

    fetch('/api/wishlist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        target: item.type === 'hotel' ? 'HOTEL' : 'TOUR',
        ...(item.type === 'hotel' ? { hotelSlug: item.slug } : { tourSlug: item.slug }),
      }),
    })
      .then(async (response) => {
        if (!response.ok) return
        const savedItem = (await response.json()) as { id?: string }
        if (!savedItem.id) return

        setWishlist((prev) =>
          prev.map((wishlistItem) =>
            wishlistItem.slug === item.slug && wishlistItem.type === item.type
              ? { ...wishlistItem, id: savedItem.id as string }
              : wishlistItem
          )
        )
      })
      .catch((error) => {
        console.error('Failed to save wishlist item:', error)
      })
  }

  const removeFromWishlist = (slug: string, type: 'hotel' | 'tour') => {
    const removedItem = wishlist.find((item) => item.slug === slug && item.type === type)
    if (!removedItem) return
    showNotice({ message: 'Removed from wishlist' })
    setWishlist((prev) => {
      return prev.filter((item) => !(item.slug === slug && item.type === type))
    })

    fetch('/api/wishlist', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: removedItem.id }),
    }).catch((error) => {
      console.error('Failed to remove wishlist item:', error)
    })
  }

  const isInWishlist = (slug: string, type: 'hotel' | 'tour') => {
    return wishlist.some((item) => item.slug === slug && item.type === type)
  }

  const clearWishlist = () => {
    setWishlist([])
  }

  return (
    <WishlistContext.Provider value={{ wishlist, addToWishlist, removeFromWishlist, isInWishlist, clearWishlist }}>
      {children}
      {notice ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-5 top-24 z-[1000] flex max-w-[min(24rem,calc(100vw-2rem))] items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-red-700 shadow-[0_20px_55px_rgba(15,23,42,0.20)] transition"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Heart className="size-4 fill-current" />
          </span>
          <span className="line-clamp-2">{notice.message}</span>
        </div>
      ) : null}
    </WishlistContext.Provider>
  )
}

export const useWishlist = () => {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider')
  }
  return context
}
