"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import axios from "axios"
import type { AiChatMessage, AiChatResponse } from "@/types/ai-chat"

const STORAGE_KEY = "gethotels-ai-chat"

const INITIAL_MESSAGE: AiChatMessage = {
  id: 0,
  role: "assistant",
  text: "Hi! I'm your AI travel assistant. Ask me anything about hotels, tours, or stays on GetHotels.",
}

const SUGGESTIONS = [
  "Find hotels under ₹3000",
  "Best hotels in Goa",
  "Show popular stays",
]

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AiChatMessage[]>([INITIAL_MESSAGE])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved) as AiChatMessage[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
        }
      }
    } catch {
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      
    }
  }, [messages])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  async function send(text: string) {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    const userMsg: AiChatMessage = { id: Date.now(), role: "user", text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const res = await axios.post("/api/ai", {
        message: trimmed,
        history: messages.map((m) => ({ role: m.role, content: m.text })),
      })
      const data = res.data as AiChatResponse
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          text: data.message ?? "Sorry, I couldn't get a response.",
          hotels: data.hotels,
          tours: data.tours,
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: "assistant", text: "Something went wrong. Please try again." },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-24 right-3 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
        {!open && (
          <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg">
            Ask AI about hotels ✨
          </div>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close AI chat" : "Open AI chat"}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 shadow-[0_8px_30px_rgba(99,102,241,0.45)] transition-all duration-300 hover:scale-110 hover:shadow-[0_12px_40px_rgba(99,102,241,0.55)] active:scale-95"
        >
          {!open && <span className="absolute inset-0 animate-ping rounded-full bg-indigo-400 opacity-25" />}
          {open ? (
            <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2a1 1 0 01.993.883L13 3v2a1 1 0 01-1.993.117L11 5V3a1 1 0 011-1zm6.364 2.05a1 1 0 011.497 1.32l-.083.094-1.414 1.414a1 1 0 01-1.497-1.32l.083-.094 1.414-1.414zM5.636 4.05l1.414 1.414a1 1 0 01-1.32 1.497l-.094-.083L4.222 5.464A1 1 0 015.542 3.967l.094.083zM20 11a1 1 0 01.117 1.993L20 13h-2a1 1 0 01-.117-1.993L18 11h2zM6 11a1 1 0 01.117 1.993L6 13H4a1 1 0 01-.117-1.993L4 11h2zm12.364 6.95l.094.083a1 1 0 01-1.32 1.497l-.094-.083-1.414-1.414a1 1 0 011.32-1.497l.094.083 1.32 1.414zm-12.728 0l1.414-1.414a1 1 0 011.497 1.32l-.083.094-1.414 1.414a1 1 0 01-1.497-1.32l.083-.094zM12 18a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 011-1z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          )}
        </button>
      </div>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-28 right-3 z-50 flex w-[calc(100vw-1.5rem)] max-w-[22rem] flex-col rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:right-6 sm:w-96 sm:max-w-none md:bottom-24" style={{ maxHeight: "min(560px, calc(100vh - 7rem))" }}>
          {/* Header */}
          <div className="relative overflow-hidden bg-gradient-to-br from-sky-500 to-indigo-600 px-5 py-4">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
            <div className="absolute -bottom-6 -left-4 h-20 w-20 rounded-full bg-white/10" />
            <div className="relative flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur">
                  <svg className="h-[18px] w-[18px] text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2a1 1 0 01.993.883L13 3v2a1 1 0 01-1.993.117L11 5V3a1 1 0 011-1zm6.364 2.05a1 1 0 011.497 1.32l-.083.094-1.414 1.414a1 1 0 01-1.497-1.32l.083-.094 1.414-1.414zM5.636 4.05l1.414 1.414a1 1 0 01-1.32 1.497l-.094-.083L4.222 5.464A1 1 0 015.542 3.967l.094.083zM20 11a1 1 0 01.117 1.993L20 13h-2a1 1 0 01-.117-1.993L18 11h2zM6 11a1 1 0 01.117 1.993L6 13H4a1 1 0 01-.117-1.993L4 11h2zm12.364 6.95l.094.083a1 1 0 01-1.32 1.497l-.094-.083-1.414-1.414a1 1 0 011.32-1.497l.094.083 1.32 1.414zm-12.728 0l1.414-1.414a1 1 0 011.497 1.32l-.083.094-1.414 1.414a1 1 0 01-1.497-1.32l.083-.094zM12 18a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 011-1z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">AI Travel Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    <p className="text-[11px] text-white/80">Online · GetHotels AI</p>
                  </div>
                </div>
              </div>
              {/* Clear chat button */}
              <button
                onClick={() => setMessages([INITIAL_MESSAGE])}
                className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/70 hover:bg-white/20 hover:text-white transition"
                title="Clear chat"
              >
                Clear
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {msg.role === "assistant" && (
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600">
                    <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M12 2a1 1 0 011 1v2a1 1 0 01-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 011-1zM2 12a1 1 0 011-1h2a1 1 0 010 2H3a1 1 0 01-1-1zm16 0a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z" />
                    </svg>
                  </div>
                )}
                <div className="flex flex-col gap-2 max-w-[85%]">
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "rounded-tr-sm bg-gradient-to-br from-sky-500 to-indigo-600 text-white"
                        : "rounded-tl-sm bg-slate-100 text-slate-800"
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Hotel cards */}
                  {msg.hotels && msg.hotels.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {msg.hotels.map((hotel) => (
                        <Link
                          key={hotel.link}
                          href={hotel.link}
                          className="group flex overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                          {hotel.image && (
                            <div className="h-16 w-20 shrink-0 overflow-hidden">
                              <img
                                src={hotel.image}
                                alt={hotel.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="flex flex-col justify-center px-2.5 py-1.5 min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{hotel.name}</p>
                            <p className="text-[10px] text-slate-500">{hotel.city}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-amber-500">★ {hotel.rating.toFixed(1)}</span>
                              {hotel.startingFrom && (
                                <span className="text-[10px] text-emerald-600 font-medium">
                                  from ₹{hotel.startingFrom.toLocaleString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Tour cards */}
                  {msg.tours && msg.tours.length > 0 && (
                    <div className="flex flex-col gap-2">
                      {msg.tours.map((tour) => (
                        <Link
                          key={tour.link}
                          href={tour.link}
                          className="group flex items-center justify-between overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">{tour.name}</p>
                            <p className="text-[10px] text-slate-500">{tour.city} · {tour.duration} days</p>
                          </div>
                          <span className="ml-2 shrink-0 text-[10px] font-medium text-emerald-600">
                            ₹{tour.price.toLocaleString()}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex gap-2">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600">
                  <svg className="h-3.5 w-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M12 2a1 1 0 011 1v2a1 1 0 01-2 0V3a1 1 0 011-1zm0 16a1 1 0 011 1v2a1 1 0 01-2 0v-2a1 1 0 011-1zM2 12a1 1 0 011-1h2a1 1 0 010 2H3a1 1 0 01-1-1zm16 0a1 1 0 011-1h2a1 1 0 010 2h-2a1 1 0 01-1-1z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestion chips */}
          {messages.length <= 1 && !loading && (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input bar */}
          <div className="border-t border-slate-100 p-3">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input) }}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about hotels, prices…"
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
                aria-label="Send"
              >
                <svg className="h-3.5 w-3.5 translate-x-px" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.4} d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
