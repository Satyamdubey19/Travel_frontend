type HeroSectionProps = {
  hero: {
    title: string;
    subtitle: string;
    location: string;
    dates: string;
    buttonLabel: string;
    backgroundImage: string;
  };
};

export default function HeroSection({ hero }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-2xl shadow-slate-900/20">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-95"
        style={{ backgroundImage: `url('${hero.backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-slate-950/85" />
      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:px-10 lg:px-14">
        <div className="max-w-3xl space-y-6 text-center sm:text-left">
          <p className="text-sm uppercase tracking-[0.35em] text-sky-300/90">Your next getaway</p>
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            {hero.title}
          </h1>
          <p className="max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
            {hero.subtitle}
          </p>
        </div>

        <div className="mt-12 rounded-[1.75rem] border border-white/10 bg-white/10 p-6 backdrop-blur-xl sm:p-8">
          <div className="grid gap-4 sm:grid-cols-[1.6fr_1fr_1fr]">
            <div className="rounded-3xl bg-white/95 p-4 text-slate-950 shadow-lg shadow-slate-950/10">
              <label className="text-xs uppercase tracking-[0.25em] text-slate-500">Location</label>
              <p className="mt-2 text-lg font-semibold">{hero.location}</p>
            </div>
            <div className="rounded-3xl bg-white/95 p-4 text-slate-950 shadow-lg shadow-slate-950/10">
              <label className="text-xs uppercase tracking-[0.25em] text-slate-500">Dates</label>
              <p className="mt-2 text-lg font-semibold">{hero.dates}</p>
            </div>
            <button className="rounded-3xl bg-sky-600 px-6 py-4 text-base font-semibold text-white transition hover:bg-sky-700">
              {hero.buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
