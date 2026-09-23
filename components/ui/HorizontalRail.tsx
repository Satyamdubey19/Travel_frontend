"use client";

import type { ReactNode } from "react";
import React, { Children, useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface HorizontalRailProps {
  children: ReactNode;
  className?: string;
  itemClassName?: string;
  showSideArrows?: boolean;
}

export default function HorizontalRail({
  children,
  className,
  itemClassName = "basis-[86%] xs:basis-[78%] sm:basis-[calc(50%-12px)] lg:basis-[calc(33.333%-16px)] shrink-0 snap-start",
  showSideArrows = true,
}: HorizontalRailProps) {
  const rail = useRef<HTMLDivElement>(null);
  const items = Children.toArray(children).filter(Boolean);
  const totalItems = items.length;

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(totalItems > 1);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateScrollState = useCallback(() => {
    if (!rail.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = rail.current;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);

    const firstItem = rail.current.firstElementChild as HTMLElement | null;
    if (firstItem) {
      const step = firstItem.offsetWidth + 16;
      const idx = Math.round(scrollLeft / step);
      setActiveIndex(Math.max(0, Math.min(idx, totalItems - 1)));
    }
  }, [totalItems]);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;

    updateScrollState();

    const handleScroll = () => {
      window.requestAnimationFrame(updateScrollState);
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [updateScrollState]);

  const move = useCallback((direction: number) => {
    if (!rail.current) return;
    const firstItem = rail.current.firstElementChild as HTMLElement | null;
    const step = firstItem ? firstItem.offsetWidth + 20 : rail.current.clientWidth * 0.85;
    rail.current.scrollBy({
      left: direction * step,
      behavior: "smooth",
    });
  }, []);

  const scrollToIndex = useCallback((index: number) => {
    if (!rail.current) return;
    const childrenNodes = rail.current.children;
    if (childrenNodes[index]) {
      (childrenNodes[index] as HTMLElement).scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      });
    }
  }, []);

  if (totalItems === 0) return null;

  return (
    <div className={cn("relative group/rail w-full", className)}>
      {/* Desktop Floating Side Navigation Arrows */}
      {showSideArrows && totalItems > 1 && (
        <>
          <button
            type="button"
            onClick={() => move(-1)}
            disabled={!canScrollLeft}
            aria-label="Previous cards"
            className={cn(
              "hidden lg:grid absolute -left-5 top-[38%] -translate-y-1/2 z-20 size-11 place-items-center rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.12)] text-slate-800 dark:text-slate-100 transition-all duration-300 hover:scale-110 hover:border-cyan-500 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
              !canScrollLeft && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronLeft className="size-5" />
          </button>

          <button
            type="button"
            onClick={() => move(1)}
            disabled={!canScrollRight}
            aria-label="Next cards"
            className={cn(
              "hidden lg:grid absolute -right-5 top-[38%] -translate-y-1/2 z-20 size-11 place-items-center rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-[0_8px_24px_rgba(15,23,42,0.12)] text-slate-800 dark:text-slate-100 transition-all duration-300 hover:scale-110 hover:border-cyan-500 hover:text-cyan-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500",
              !canScrollRight && "opacity-0 pointer-events-none"
            )}
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      )}

      {/* Scrollable Track */}
      <div
        ref={rail}
        tabIndex={0}
        role="region"
        aria-label="Swipeable collection"
        className="flex snap-x snap-mandatory gap-4 sm:gap-6 overflow-x-auto overscroll-x-contain pb-6 pt-2 items-stretch scroll-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30 rounded-2xl [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        {items.map((child, index) => (
          <div
            key={index}
            className={cn("min-w-0 flex flex-col justify-stretch", itemClassName)}
          >
            {child}
          </div>
        ))}
      </div>

      {/* Centered Controls Section */}
      {totalItems > 1 && (
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <div className="flex items-center justify-center gap-3">
            {/* Prev Button */}
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={!canScrollLeft}
              aria-label="Previous cards"
              className={cn(
                "grid size-11 sm:size-12 place-items-center rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 shadow-sm transition-all duration-200 active:scale-95",
                canScrollLeft
                  ? "hover:border-cyan-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:shadow-md cursor-pointer text-slate-900 dark:text-white"
                  : "opacity-35 cursor-not-allowed"
              )}
            >
              <ArrowLeft className="size-4 sm:size-5" />
            </button>

            {/* Pagination Dots */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shadow-inner">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Jump to slide ${idx + 1}`}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    activeIndex === idx
                      ? "w-6 bg-cyan-600 dark:bg-cyan-400 shadow-sm"
                      : "w-2 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500"
                  )}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={() => move(1)}
              disabled={!canScrollRight}
              aria-label="Next cards"
              className={cn(
                "grid size-11 sm:size-12 place-items-center rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-md transition-all duration-200 active:scale-95",
                canScrollRight
                  ? "hover:bg-cyan-700 dark:hover:bg-cyan-400 hover:shadow-lg cursor-pointer"
                  : "opacity-35 cursor-not-allowed"
              )}
            >
              <ArrowRight className="size-4 sm:size-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
