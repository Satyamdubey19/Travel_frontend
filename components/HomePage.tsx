import type { HomeData } from "@/lib/homeData";
import { tours } from "@/lib/tours";
import Link from "next/link";
import Image from "next/image";

type HomePageProps = {
  data: HomeData;
};

export default function HomePage({ data }: HomePageProps) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-950 dark:bg-black dark:text-white">
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="rounded-3xl bg-white/90 p-10 shadow-xl ring-1 ring-slate-200 dark:bg-zinc-900 dark:ring-slate-700">
          <div className="space-y-6 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-sky-700 dark:text-sky-300">
              Welcome to GetHotels
            </p>
            <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
              {data.hero.title}
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600 dark:text-slate-300">
              {data.hero.subtitle}
            </p>
            <button className="rounded-full bg-sky-700 px-8 py-3 text-sm font-semibold text-white transition hover:bg-sky-800">
              {data.hero.buttonLabel}
            </button>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {data.features.map((feature) => (
              <div
                key={feature.id}
                className="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-700 dark:bg-zinc-950"
              >
                <p className="text-sm font-semibold text-sky-700 dark:text-sky-300">
                  {feature.subtitle}
                </p>
                <h2 className="mt-3 text-xl font-semibold">{feature.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
                  Featured Hotels
                </p>
                <h2 className="text-3xl font-bold">Popular stays</h2>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {data.featuredHotels.map((hotel) => (
                <article
                  key={hotel.id}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-zinc-950"
                >
                  <div className="h-44 bg-gradient-to-br from-slate-900 via-slate-700 to-slate-500 p-6 text-white">
                    <p className="text-sm uppercase tracking-[0.25em] opacity-80">{hotel.location}</p>
                    <h3 className="mt-6 text-2xl font-semibold">{hotel.name}</h3>
                  </div>
                  <div className="space-y-4 p-6">
                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
                      {hotel.description}
                    </p>
                    <div className="flex items-center justify-between gap-3 text-sm font-semibold">
                      <span>Rating: {hotel.rating.toFixed(1)}</span>
                      <span className="text-slate-900 dark:text-slate-50">{hotel.price}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tours Section */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
              Curated Experiences
            </p>
            <h2 className="text-3xl font-bold">Featured Tours & Packages</h2>
          </div>
          <Link
            href="/tours"
            className="text-sky-700 hover:text-sky-800 font-semibold transition"
          >
            View All Packages →
          </Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {tours.slice(0, 3).map((tour) => (
            <Link key={tour.id} href={`/tours/${tour.slug}`}>
              <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm hover:shadow-lg transition dark:border-slate-700 dark:bg-zinc-950 cursor-pointer h-full flex flex-col">
                <div className="relative h-44 bg-slate-200 dark:bg-slate-800">
                  <Image
                    src={tour.image}
                    alt={tour.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-yellow-400 text-gray-900 px-2 py-1 rounded-full text-sm font-semibold">
                    ⭐ {tour.rating}
                  </div>
                </div>
                <div className="flex flex-col flex-grow space-y-4 p-6">
                  <div>
                    <h3 className="text-xl font-semibold line-clamp-2">{tour.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">📍 {tour.location.city}</p>
                  </div>
                  <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-2">
                    {tour.description}
                  </p>
                  <div className="flex items-center justify-between gap-3 text-sm font-semibold mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                    <span className="text-slate-600">📅 {tour.duration} Days</span>
                    <span className="text-sky-700">₹{tour.price.toLocaleString()}</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
