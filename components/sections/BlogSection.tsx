type BlogSectionProps = {
  blogs: {
    id: string
    title: string
    excerpt: string
    author: string
    date: string
    image: string
  }[]
}

export default function BlogSection({ blogs }: BlogSectionProps) {
  return (
    <section className="space-y-8 py-16">
      <div className="text-center">
        <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Blogs</p>
        <h2 className="mt-3 text-4xl font-black text-center text-black">Latest travel stories and tips</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-4">
        {blogs.map((blog) => (
          <article key={blog.id} className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
            <img src={blog.image} alt={blog.title} className="h-52 w-full object-cover" />
            <div className="space-y-3 p-6">
              <h3 className="text-xl font-semibold text-white">{blog.title}</h3>
              <p className="text-sm leading-6 text-slate-600">{blog.excerpt}</p>
              <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-slate-500">
                <span>{blog.author}</span>
                <span>{blog.date}</span>
              </div>
              <a href="#" className="inline-flex items-center text-sm font-semibold text-sky-600 transition hover:text-sky-700">
                Read more →
              </a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
