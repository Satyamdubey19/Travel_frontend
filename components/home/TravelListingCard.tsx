"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Heart, MapPin, Star, type LucideIcon } from "lucide-react"
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
    if (!candidate) return imageFallback ?? "/images/travel-listing-fallback.png"
    if (
      candidate.startsWith("/") ||
      candidate.startsWith("https://images.unsplash.com") ||
      candidate.startsWith("https://res.cloudinary.com")
    ) {
      return candidate
    }
    return imageFallback ?? "/images/travel-listing-fallback.png"
  }

  const safeImage = getSafeImage(image)
  const [failedImage, setFailedImage] = useState<{ source: string; replacement: string } | null>(null)
  const currentImage = failedImage?.source === safeImage ? failedImage.replacement : safeImage
  const [visualSavedOverride, setVisualSavedOverride] = useState<boolean | null>(null)
  const [visualAnimating, setVisualAnimating] = useState(false)
  const [visualToast, setVisualToast] = useState<string | null>(null)

  const handleWishlistClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!wishlist) return

    const nextSaved = !(visualSavedOverride ?? wishlist.saved)
    setVisualSavedOverride(nextSaved)
    setVisualAnimating(true)
    setVisualToast(nextSaved ? "Saved to wishlist" : "Removed")
    window.setTimeout(() => setVisualAnimating(false), 420)
    window.setTimeout(() => setVisualSavedOverride(null), 800)
    window.setTimeout(() => setVisualToast(null), 1400)
    wishlist.onToggle(event)
  }

  const wishlistSaved = visualSavedOverride ?? wishlist?.saved ?? false
  const wishlistAnimating = Boolean(wishlist?.animating || visualAnimating)
  const wishlistToast = wishlist?.toast ?? visualToast

  return (
    <div
      className={cn(
        "group flex h-full flex-col overflow-hidden rounded-[26px] border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.07)] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1.5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-[0_22px_48px_-12px_rgba(15,23,42,0.18)] cursor-pointer",
        className
      )}
    >
      {/* Photography Header */}
      <div className={cn("relative h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800", imageClassName)}>
        <Link href={href} className="absolute inset-0">
          <Image
            src={currentImage}
            alt={title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
            onError={(event) => {
              if (!imageFallback) return
              const target = event.currentTarget
              if (!target.src.includes(imageFallback)) setFailedImage({ source: safeImage, replacement: imageFallback })
            }}
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/35" />

        {eyebrow ? (
          <div className="absolute left-3.5 top-3.5 flex max-w-[calc(100%-4.5rem)] flex-wrap gap-1.5 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/75 backdrop-blur-md px-3 py-1 text-[10.5px] font-bold uppercase tracking-wider text-white border border-white/20 shadow-sm">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {eyebrow}
            </span>
          </div>
        ) : null}

        {wishlist ? (
          <div className="absolute right-3.5 top-3.5 z-10">
            <button
              type="button"
              onClick={handleWishlistClick}
              className={cn(
                "flex size-9 items-center justify-center rounded-full bg-white/85 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 shadow-md backdrop-blur-md transition-all duration-300 hover:bg-white hover:scale-110 active:scale-95",
                wishlistSaved && "bg-white text-rose-500 shadow-rose-500/25 scale-105 hover:bg-white hover:text-rose-600",
                wishlistAnimating && "scale-110"
              )}
              aria-label={wishlistSaved ? wishlist.activeLabel : wishlist.label}
            >
              <Heart
                className={cn(
                  "size-4 transition-transform duration-300",
                  wishlistSaved ? "fill-rose-500 text-rose-500" : "text-slate-700 dark:text-slate-200",
                  wishlistAnimating && "scale-125"
                )}
              />
            </button>
            {wishlistToast ? (
              <div className="pointer-events-none absolute right-0 top-11 z-20 flex min-w-max items-center gap-1.5 rounded-full bg-slate-900/90 dark:bg-white/90 px-3 py-1.5 text-xs font-bold text-white dark:text-slate-900 shadow-lg backdrop-blur-md animate-in fade-in zoom-in-95 duration-200">
                <Heart className="size-3 fill-rose-500 text-rose-500" />
                {wishlistToast}
              </div>
            ) : null}
          </div>
        ) : null}

        {meta.length > 0 ? (
          <div className="absolute inset-x-3.5 bottom-3.5 flex flex-wrap gap-2 z-10">
            {meta.slice(0, 2).map((item) => (
              <span
                key={item.label}
                className="inline-flex items-center gap-1.5 rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/95 border border-white/15 shadow-sm"
              >
                <item.icon className="size-3 text-cyan-300" />
                {item.label}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Card Body */}
      <Link href={href} className="flex flex-1 flex-col justify-between p-5 gap-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 truncate">
              <MapPin className="size-3.5 text-cyan-600 shrink-0" />
              <span className="truncate">{location}</span>
            </p>
            {typeof rating === "number" && rating > 0 ? (
              <div className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-400/10 px-2.5 py-0.5 text-xs font-bold text-amber-900 dark:text-amber-300 shrink-0">
                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
              </div>
            ) : null}
          </div>

          <h3 className="mt-2 text-[17px] sm:text-lg font-extrabold text-slate-950 dark:text-white tracking-tight leading-snug line-clamp-1 group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
            {title}
          </h3>

          {description ? (
            <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}

          {tags.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50"
                >
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="rounded-md bg-slate-50 dark:bg-slate-800/40 px-2 py-0.5 text-[11px] font-medium text-slate-400">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          ) : null}
        </div>

        {/* Pricing & CTA */}
        <div className="flex items-end justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Starting from
            </p>
            <div className="mt-0.5 flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                ₹{safePrice.toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {priceLabel}
              </span>
            </div>
            {safeOriginalPrice && safeOriginalPrice > safePrice ? (
              <p className="text-[11px] font-semibold text-slate-400 line-through">
                ₹{safeOriginalPrice.toLocaleString("en-IN")}
              </p>
            ) : null}
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold px-4 py-2 text-xs shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-all duration-300 shrink-0">
            {ctaLabel}
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </div>
  )
}
