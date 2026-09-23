"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3, MapPin, ShieldCheck, Star } from "lucide-react";

export type DiscoveryItem = {
  href: string;
  title: string;
  location: string;
  image: string;
  type: string;
  price: number;
  unit: string;
  rating?: number;
  meta?: string;
  badge?: string;
};

function safeImage(value: string) {
  return value?.startsWith("/") ||
    value?.startsWith("https://images.unsplash.com") ||
    value?.startsWith("https://res.cloudinary.com")
    ? value
    : "/images/travel-listing-fallback.png";
}

export default function DiscoveryCard({ item }: { item: DiscoveryItem }) {
  return (
    <Link
      href={item.href}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-slate-200/80 bg-white shadow-[0_4px_20px_-4px_rgba(15,23,42,0.06),0_12px_32px_-8px_rgba(15,23,42,0.07)] transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-slate-300 hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.16)] dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 select-none cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500"
    >
      {/* Visual Photography Header */}
      <div className="relative h-52 sm:h-56 lg:h-60 w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <Image
          src={safeImage(item.image)}
          alt={item.title}
          fill
          sizes="(min-width: 1280px) 380px, (min-width: 1024px) 30vw, (min-width: 640px) 45vw, 88vw"
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-105"
        />
        {/* Subtle Cinematic Vignette */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/45" />

        {/* Top Badges */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-start justify-between gap-1.5 z-10 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5 max-w-[75%]">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-950/80 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white border border-white/20 shadow-sm">
              <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
              {item.type}
            </span>
            {item.badge && (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-extrabold text-emerald-800 shadow-sm border border-emerald-100">
                <ShieldCheck className="size-3 text-emerald-600" />
                <span className="capitalize">{item.badge}</span>
              </span>
            )}
          </div>

          {item.rating && item.rating > 0 ? (
            <div className="inline-flex items-center gap-1 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 py-1 text-xs font-black text-slate-900 dark:text-white shadow-md border border-slate-200/60 dark:border-slate-700/60 shrink-0">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          ) : null}
        </div>

        {/* Bottom Floating Location Badge */}
        <div className="absolute inset-x-3.5 bottom-3.5 flex items-center justify-between gap-2 z-10 pointer-events-none">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-black/65 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white/95 border border-white/15 shadow-sm truncate max-w-[85%]">
            <MapPin className="size-3 text-cyan-300 shrink-0" />
            <span className="truncate">{item.location}</span>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5 gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold sm:font-extrabold text-slate-900 dark:text-white tracking-tight leading-snug line-clamp-2 min-h-[2.75rem] sm:min-h-[3.25rem] group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
            {item.title}
          </h3>

          {item.meta && (
            <div className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-2.5 py-1 border border-slate-100 dark:border-slate-800">
                <Clock3 className="size-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span className="truncate">{item.meta}</span>
              </span>
            </div>
          )}
        </div>

        {/* Pricing & Centered Action CTA */}
        <div className="flex items-center justify-between gap-3 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 mt-auto">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">
              Starting from
            </p>
            <div className="mt-0.5 flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black text-slate-950 dark:text-white tracking-tight">
                ₹{Math.max(0, Math.round(item.price)).toLocaleString("en-IN")}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                {item.unit}
              </span>
            </div>
          </div>

          <span className="grid size-11 place-items-center rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md transition-all duration-300 group-hover:bg-cyan-700 dark:group-hover:bg-cyan-400 dark:group-hover:text-slate-950 group-hover:scale-105 group-hover:shadow-lg shrink-0">
            <ArrowUpRight className="size-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
