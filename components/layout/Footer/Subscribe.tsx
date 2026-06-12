export default function Subscribe() {
  return (
    <div className="space-y-4">
      <p className="text-sm font-semibold uppercase tracking-[0.24em]" style={{color: '#FFFFFF'}}>Subscribe</p>
      <p className="text-sm font-medium" style={{color: '#FFFFFF'}}>Get travel tips and exclusive deals delivered to your inbox.</p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          placeholder="Your email"
          className="w-full rounded-full border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/70 outline-none focus:border-white/40 focus:ring-2 focus:ring-white/30 transition"
        />
        <button className="rounded-full bg-[#081428] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#0c1d38] whitespace-nowrap">
          SUBSCRIBE
        </button>
      </div>
    </div>
  )
}
