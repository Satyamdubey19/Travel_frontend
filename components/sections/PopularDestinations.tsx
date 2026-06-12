import Link from "next/link"

const destinations = [
  { city: "Dehradun", image: "/d1.jpg", properties: 45, tagline: "Gateway to the Himalayas" },
  { city: "Mussoorie", image: "/d2.jpg", properties: 38, tagline: "Queen of the Hills" },
  { city: "Rishikesh", image: "/d3.jpg", properties: 52, tagline: "Yoga Capital of the World" },
]

const Destinations = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-100 rounded-full opacity-30 blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-100 rounded-full opacity-20 blur-3xl translate-x-1/3 translate-y-1/3" />

      <div className="container mx-auto px-6 relative">
        {/* Section header */}
        <div className="mb-14 max-w-2xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
            Top Destinations
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Popular <span className="gradient-text">Cities</span>
          </h2>
          <p className="text-slate-500 text-base leading-relaxed">
            Discover top destinations and book stays in the most scenic cities across India
          </p>
        </div>

        {/* Destination cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {destinations.map((d, idx) => (
            <Link
              key={d.city}
              href={`/tours?city=${encodeURIComponent(d.city)}`}
              className={`group relative overflow-hidden rounded-3xl block shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-fade-in-up animation-delay-${(idx + 1) * 100}`}
            >
              <img
                src={d.image}
                alt={d.city}
                className="h-80 w-full object-cover transition duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent group-hover:from-blue-950/90 transition-all duration-500" />

              {/* Property count badge */}
              <div className="absolute top-5 right-5 glass-white rounded-full px-4 py-1.5 text-sm font-bold text-slate-800 shadow-lg">
                {d.properties} stays
              </div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-7">
                <p className="text-xs uppercase tracking-[0.35em] text-blue-300 font-bold mb-2">
                  {d.tagline}
                </p>
                <h3 className="text-3xl font-black text-white mb-3 drop-shadow-lg">
                  {d.city}
                </h3>
                <div className="flex items-center gap-2 text-white/80 text-sm font-medium opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                  <span>Explore Tours</span>
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Destinations
