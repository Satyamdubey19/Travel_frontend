"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import axios from "axios"
import type { AiChatMessage, AiChatResponse } from "@/types/ai-chat"

const STORAGE_KEY = "gethotels-ai-chat"

const INITIAL_MESSAGE: AiChatMessage = {
  id: 0,
  role: "assistant",
  text: "Hi! I'm your AI travel assistant. Ask me anything about tours, activities, or rentals on GetHotels.",
}

const SUGGESTIONS = ["Show popular tours", "Find activities in Goa", "Compare rentals"]

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
        if (Array.isArray(parsed) && parsed.length > 0) setMessages(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {}
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
          tours: data.tours,
          activities: data.activities,
          rentals: data.rentals,
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
      <div className="fixed bottom-24 right-3 z-50 flex flex-col items-end gap-3 md:bottom-6 md:right-6">
        {!open ? (
          <div className="animate-fade-in rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-lg">
            Ask AI about trips
          </div>
        ) : null}
        <button
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close AI chat" : "Open AI chat"}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-[0_8px_30px_rgba(99,102,241,0.45)] transition-all duration-300 hover:scale-110"
        >
          {open ? "x" : "AI"}
        </button>
      </div>

      {open ? (
        <div className="fixed bottom-28 right-3 z-50 flex w-[calc(100vw-1.5rem)] max-w-[22rem] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:right-6 sm:w-96 sm:max-w-none md:bottom-24" style={{ maxHeight: "min(560px, calc(100vh - 7rem))" }}>
          <div className="bg-gradient-to-br from-sky-500 to-indigo-600 px-5 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">AI Travel Assistant</p>
                <p className="text-[11px] text-white/80">Online - GetHotels AI</p>
              </div>
              <button
                onClick={() => setMessages([INITIAL_MESSAGE])}
                className="rounded-full bg-white/10 px-2 py-1 text-[10px] text-white/70 transition hover:bg-white/20 hover:text-white"
                title="Clear chat"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                <div className="flex max-w-[85%] flex-col gap-2">
                  <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${msg.role === "user" ? "rounded-tr-sm bg-gradient-to-br from-sky-500 to-indigo-600 text-white" : "rounded-tl-sm bg-slate-100 text-slate-800"}`}>
                    {msg.text}
                  </div>

                  {msg.tours?.length ? (
                    <div className="flex flex-col gap-2">
                      {msg.tours.map((tour: any) => (
                        <Link key={tour.link} href={tour.link} className="group flex items-center justify-between overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md">
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-slate-800 group-hover:text-indigo-600">{tour.name}</p>
                            <p className="text-[10px] text-slate-500">{tour.city} - {tour.duration} days</p>
                          </div>
                          <span className="ml-2 shrink-0 text-[10px] font-medium text-emerald-600">Rs. {tour.price.toLocaleString()}</span>
                        </Link>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-slate-100 px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400 [animation-delay:300ms]" />
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          {messages.length <= 1 && !loading ? (
            <div className="flex flex-wrap gap-1.5 px-4 pb-3">
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => send(suggestion)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          ) : null}

          <div className="border-t border-slate-100 p-3">
            <form
              onSubmit={(event) => {
                event.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about trips, activities..."
                disabled={loading}
                className="flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white shadow-sm transition hover:opacity-90 disabled:opacity-40"
                aria-label="Send"
              >
                -
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}
