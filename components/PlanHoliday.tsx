type PlanHolidayProps = {
  cards: {
    id: string;
    title: string;
    subtitle: string;
    image: string;
  }[];
};

export default function PlanHoliday({ cards }: PlanHolidayProps) {
  return (
    <section className="space-y-6 py-16">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-sky-600">Plan Your Holiday</p>
        <h2 className="mt-3 text-4xl font-black text-white">Plan Your Holiday</h2>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-6 sm:grid-cols-2">
          {cards.slice(0, 2).map((card) => (
            <div
              key={card.id}
              className="group relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-900/20"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition duration-500 group-hover:scale-105"
                style={{ backgroundImage: `url('${card.image}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/60 to-transparent" />
              <div className="relative p-8">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300/90">{card.subtitle}</p>
                <h3 className="mt-6 text-2xl font-semibold">{card.title}</h3>
              </div>
            </div>
          ))}
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {cards.slice(2).map((card) => (
            <div key={card.id} className="overflow-hidden rounded-[2rem] bg-white shadow-xl shadow-slate-200">
              <img src={card.image} alt={card.title} className="h-44 w-full object-cover" />
              <div className="p-5">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-500">{card.subtitle}</p>
                <h3 className="mt-3 text-xl font-semibold text-white">{card.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
