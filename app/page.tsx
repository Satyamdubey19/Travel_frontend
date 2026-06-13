import Link from "next/link"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"

const categories = [
  {
    title: "Trips & Tours",
    description: "Multi-day itineraries, hosted group trips, and curated travel packages.",
    href: "/tours",
  },
  {
    title: "Activities",
    description: "Local experiences, outdoor adventures, and bookable things to do.",
    href: "/activities",
  },
  {
    title: "Rentals",
    description: "Vehicles and travel rentals for flexible movement during your trip.",
    href: "/car-rental",
  },
]

export default function Home() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <section className="mx-auto flex min-h-[calc(100vh-56px)] max-w-6xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-sm font-bold uppercase tracking-[0.22em] text-sky-700">Travels Pro</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-black tracking-tight text-slate-950 sm:text-6xl">
            Plan trips, tours, activities, and rentals.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Continue with tours, activities, and rentals across the travel products active on this platform.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {categories.map((category) => (
              <Link
                key={category.href}
                href={category.href}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg"
              >
                <h2 className="text-xl font-black text-slate-950">{category.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{category.description}</p>
                <span className="mt-5 inline-flex text-sm font-bold text-sky-700">Explore</span>
              </Link>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
