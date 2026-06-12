type BrandsSectionProps = {
  brands: {
    id: string;
    name: string;
    image: string;
  }[];
};

export default function BrandsSection({ brands }: BrandsSectionProps) {
  return (
    <section className="space-y-8 py-16">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Brands</p>
        <h2 className="mt-3 text-4xl font-black text-center text-black">Select from premium hotel brands worldwide</h2>
      </div>
      <div className="grid gap-6 md:grid-cols-5">
        {brands.map((brand) => (
          <div
            key={brand.id}
            className="group relative overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl shadow-slate-200/10 transition hover:-translate-y-1"
          >
            <div
              className="absolute inset-0 bg-cover bg-center opacity-90 transition duration-500 group-hover:scale-105"
              style={{ backgroundImage: `url('${brand.image}')` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/10 to-transparent" />
            <div className="relative flex h-full items-end p-6">
              <span className="text-xl font-semibold tracking-tight">{brand.name}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
