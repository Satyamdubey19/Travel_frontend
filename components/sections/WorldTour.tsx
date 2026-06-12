type WorldTourProps = {
  tours: {
    id: string
    title: string
    location: string
    details: string
    nights: string
    price: string
    image: string
  }[]
}

export default function WorldTour({ tours }: WorldTourProps) {
  return (
    <section className="space-y-8 py-16">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">World Tours</p>
        <h2 className="mt-3 text-4xl font-black text-center text-black">Handpicked international holiday packages</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        {tours.map((tour) => (
          <article
            key={tour.id}
            className="group relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-900/20"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url('${tour.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/35 to-transparent" />
            <div className="relative flex h-full flex-col justify-between p-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300/90">{tour.location}</p>
                <h3 className="mt-4 text-3xl font-semibold">{tour.title}</h3>
                <p className="mt-4 max-w-xs text-sm leading-6 text-slate-200">{tour.details}</p>
              </div>
              <div className="mt-6 flex items-center justify-between gap-4">
                <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-white/90">{tour.nights}</span>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-950">
                    {tour.price}
                  </span>
                  <button className="rounded-full bg-sky-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-700">
                    View
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
