"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Heart, MapPin, Star, type LucideIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import { Card, CardContent, CardFooter } from "@/components/ui/Card"
import { cn } from "@/lib/utils"

type TravelListingCardProps = {
  href: string
  title: string
  image: string
  imageFallback?: string
  location: string
  eyebrow?: string
  rating?: number
  description?: string
  price: number
  priceLabel: string
  originalPrice?: number
  ctaLabel: string
  tags?: string[]
  meta?: Array<{
    icon: LucideIcon
    label: string
  }>
  wishlist?: {
    saved: boolean
    label: string
    activeLabel: string
    animating?: boolean
    toast?: string
    toastTone?: "saved" | "removed"
    onToggle: (event: React.MouseEvent<HTMLButtonElement>) => void
  }
  className?: string
  imageClassName?: string
}

export default function TravelListingCard({
  href,
  title,
  image,
  imageFallback,
  location,
  eyebrow,
  rating,
  description,
  price,
  priceLabel,
  originalPrice,
  ctaLabel,
  tags = [],
  meta = [],
  wishlist,
  className,
  imageClassName,
}: TravelListingCardProps) {
  const safePrice = Math.max(0, Math.round(price || 0))
  const safeOriginalPrice = originalPrice ? Math.max(safePrice, Math.round(originalPrice)) : null
  const getSafeImage = (src?: string) => {
    const candidate = src?.trim()
    if (!candidate) return imageFallback ?? "/images/hotel-slider-fallback.png"
    if (candidate.startsWith("/") || candidate.startsWith("https://images.unsplash.com") || candidate.startsWith("https://res.cloudinary.com")) return candidate
    return imageFallback ?? "/images/hotel-slider-fallback.png"
  }
  const [currentImage, setCurrentImage] = useState(() => getSafeImage(image))
  const [visualSaved, setVisualSaved] = useState(wishlist?.saved ?? false)
  const [visualAnimating, setVisualAnimating] = useState(false)
  const [visualToast, setVisualToast] = useState<string | null>(null)

  useEffect(() => {
    setCurrentImage(getSafeImage(image))
  }, [image, imageFallback])

  useEffect(() => {
    setVisualSaved(wishlist?.saved ?? false)
  }, [wishlist?.saved])

  const handleWishlistClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!wishlist) return

    const nextSaved = !visualSaved
    setVisualSaved(nextSaved)
    setVisualAnimating(true)
    setVisualToast(nextSaved ? "Saved to wishlist" : "Removed")
    window.setTimeout(() => setVisualAnimating(false), 420)
    window.setTimeout(() => setVisualToast(null), 1400)
    wishlist.onToggle(event)
  }

  const wishlistSaved = visualSaved
  const wishlistAnimating = Boolean(wishlist?.animating || visualAnimating)
  const wishlistToast = wishlist?.toast ?? visualToast

  return (
    <Card
      className={cn(
        "group h-full gap-0 overflow-hidden rounded-[28px] border-0 bg-white p-0 shadow-[0_22px_60px_-36px_rgba(15,23,42,0.72)] ring-0 transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_84px_-44px_rgba(15,23,42,0.82)] active:scale-[0.99]",
        className
      )}
    >
      <div className={cn("relative h-56 overflow-hidden bg-slate-100", imageClassName)}>
        <Link href={href} className="absolute inset-0">
          <Image
            src={currentImage}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-110"
            onError={(event) => {
              if (!imageFallback) return
              const target = event.currentTarget
              if (!target.src.includes(imageFallback)) setCurrentImage(imageFallback)
            }}
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/48 via-transparent to-slate-950/10 opacity-95 transition group-hover:opacity-100" />
        <div className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-white/20 opacity-0 blur-sm transition duration-700 group-hover:left-[120%] group-hover:opacity-100" />

        <div className="absolute left-3 top-3 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-2">
          {eyebrow ? (
            <Badge className="max-w-full truncate rounded-full bg-white/92 px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-950 shadow-lg backdrop-blur">
              {eyebrow}
            </Badge>
          ) : null}
        </div>

        {wishlist ? (
          <div className="absolute right-3 top-3 z-10">
            <button
              type="button"
              onClick={handleWishlistClick}
              className={cn(
                "flex size-11 items-center justify-center rounded-full bg-white/95 text-slate-800 shadow-[0_12px_26px_rgba(15,23,42,0.18)] backdrop-blur transition duration-300 hover:scale-110 hover:bg-white hover:text-red-500 active:scale-95",
                wishlistSaved && "bg-red-500 text-white shadow-[0_16px_34px_rgba(239,68,68,0.34)] hover:bg-red-600 hover:text-white",
                !wishlistSaved && wishlistAnimating && "text-red-500",
                wishlistAnimating && "scale-110"
              )}
              aria-label={wishlistSaved ? wishlist.activeLabel : wishlist.label}
            >
              <Heart
                className={cn(
                  "size-[18px] transition-transform duration-200",
                  wishlistSaved && "fill-current",
                  wishlistAnimating && "scale-125"
                )}
              />
            </button>
            {wishlistToast ? (
              <div className="pointer-events-none absolute right-0 top-[3.25rem] z-20 flex min-w-max items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-extrabold text-red-600 shadow-[0_16px_36px_rgba(15,23,42,0.22)] ring-1 ring-red-100 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200">
                <Heart className="size-3.5 fill-current" />
                {wishlistToast}
              </div>
            ) : null}
          </div>
        ) : null}

        {meta.length > 0 ? (
          <div className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2">
            {meta.slice(0, 2).map((item) => (
              <span key={item.label} className="inline-flex items-center gap-1.5 rounded-full bg-white/94 px-3 py-1.5 text-[11px] font-bold text-slate-800 shadow-md backdrop-blur">
                <item.icon className="size-3.5 text-slate-700" />
                {item.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <Link href={href} className="flex flex-1 flex-col">
        <CardContent className="flex flex-1 flex-col px-5 pb-4 pt-5">
          <div>
            <div className="flex items-start justify-between gap-3">
              <h3 className="line-clamp-1 flex-1 text-lg font-extrabold text-slate-950 transition group-hover:text-slate-700">
                {title}
              </h3>
              {typeof rating === "number" && rating > 0 ? (
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-slate-950">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  {rating.toFixed(1)}
                </span>
              ) : null}
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <MapPin className="size-3.5 shrink-0 text-slate-400" />
              <span className="line-clamp-1">{location}</span>
            </p>
          </div>

          {description ? <p className="mt-3 line-clamp-2 text-[13px] leading-5 text-slate-600">{description}</p> : null}

          {tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {tags.slice(0, 3).map((tag) => (
                <span key={tag} className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600">
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </CardContent>

        <CardFooter className="mt-auto justify-between gap-3 bg-white px-5 pb-5 pt-3">
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">{priceLabel}</p>
            <div className="mt-1 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
              <p className="text-lg font-extrabold text-slate-950">Rs. {safePrice.toLocaleString()}</p>
              {safeOriginalPrice ? (
                <p className="text-xs font-semibold text-slate-400 line-through">Rs. {safeOriginalPrice.toLocaleString()}</p>
              ) : null}
            </div>
          </div>
          <Button asChild size="sm" className="h-10 rounded-full bg-slate-950 px-4 text-white shadow-[0_10px_24px_rgba(15,23,42,0.18)] transition hover:bg-slate-800 hover:shadow-[0_14px_30px_rgba(15,23,42,0.26)] active:scale-95">
            <span>
              {ctaLabel}
              <ArrowRight className="size-4" />
            </span>
          </Button>
        </CardFooter>
      </Link>
    </Card>
  )
}
