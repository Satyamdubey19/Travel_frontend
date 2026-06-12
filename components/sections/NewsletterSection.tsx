"use client"

import { useState } from "react"

export default function NewsletterSection() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      setSubmitted(true)
      setEmail("")
    }
  }

  return (
    <section className="relative py-20 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />

      {/* Glowing orbs */}
      <div className="absolute top-10 left-10 w-64 h-64 bg-blue-500 rounded-full opacity-10 blur-3xl animate-float" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500 rounded-full opacity-10 blur-3xl animate-float animation-delay-200" />

      <div className="container mx-auto px-6 relative">
        <div className="max-w-3xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-blue-300 text-xs font-bold uppercase tracking-widest mb-6 backdrop-blur-sm border border-white/10">
            Stay Updated
          </span>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Get exclusive deals &<br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 bg-clip-text text-transparent">
              travel inspiration
            </span>
          </h2>
          <p className="text-blue-200/80 mb-10 text-lg max-w-xl mx-auto">
            Subscribe to our newsletter and be the first to know about special offers, new destinations, and travel tips
          </p>

          {submitted ? (
            <div className="inline-flex items-center gap-3 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl px-8 py-5 backdrop-blur-sm">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-300 font-semibold">Thank you! You&apos;re now subscribed.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="flex-1 relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full h-14 rounded-2xl bg-white/10 border border-white/15 px-6 text-white placeholder-blue-300/50 backdrop-blur-sm outline-none focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300"
                />
              </div>
              <button
                type="submit"
                className="h-14 px-8 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold text-sm transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-105 active:scale-[0.98]"
              >
                Subscribe
              </button>
            </form>
          )}

          <p className="text-blue-400/40 text-xs mt-6">
            No spam, unsubscribe anytime. We respect your privacy.
          </p>
        </div>
      </div>
    </section>
  )
}
