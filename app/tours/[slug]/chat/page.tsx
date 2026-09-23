"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { ArrowLeft, Flag, Lock, MessageCircle, Pin, Send, ShieldOff, Users, X } from "lucide-react"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import { useAuth } from "@/contexts/AuthContext"
import api, { getApiErrorMessage } from "@/lib/axios"

type ChatMessage = {
  id: string
  message: string | null
  messageType: "TEXT" | "IMAGE" | "SYSTEM"
  createdAt: string
  User?: { id?: string; name: string }
}

type Announcement = {
  id: string
  title: string
  message: string
  severity: string
  isPinned: boolean
  createdAt: string
}

export default function TravelerTourChatPage() {
  const params = useParams()
  const slug = typeof params.slug === "string" ? params.slug : ""
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [roomName, setRoomName] = useState("Tour group chat")
  const [draft, setDraft] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({})
  const [reporting, setReporting] = useState<ChatMessage | null>(null)
  const [reportReason, setReportReason] = useState("HARASSMENT")
  const [reportDetails, setReportDetails] = useState("")
  const [safetyBusy, setSafetyBusy] = useState(false)
  const [notice, setNotice] = useState("")
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const socketUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001",
    [],
  )

  useEffect(() => {
    if (!loading && !user) {
      setIsLoading(false)
      setError("Please log in to open tour chat")
      return
    }
    if (!slug || loading || !user?.id) return

    let ignore = false

    const loadChat = async (showLoading = false) => {
      if (showLoading) setIsLoading(true)
      setError("")
      try {
        const [{ data: payload }, { data: announcementPayload }] = await Promise.all([
          api.get(`/tour/${slug}/chat?scope=participant`, { headers: { "Cache-Control": "no-store" } }),
          api.get(`/tour/${slug}/announcements`, { headers: { "Cache-Control": "no-store" } }),
        ])
        if (!ignore) {
          setRoomName(payload?.data?.name ?? "Tour group chat")
          setMessages(Array.isArray(payload?.data?.messages) ? payload.data.messages : [])
          setAnnouncements(Array.isArray(announcementPayload?.data) ? announcementPayload.data : [])
        }
      } catch (chatError) {
        if (!ignore) setError(getApiErrorMessage(chatError, "Could not load chat"))
      } finally {
        if (!ignore && showLoading) setIsLoading(false)
      }
    }

    loadChat(true)

    const nextSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    nextSocket.emit("tour:join", { tourId: slug })

    nextSocket.on("connect", () => {
      nextSocket.emit("tour:join", { tourId: slug })
    })

    nextSocket.on("tour:message:new", (message: ChatMessage) => {
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message])
    })

    nextSocket.on("tour:typing:start", (payload: { userId?: string; name?: string }) => {
      if (!payload.userId || payload.userId === user.id) return
      setTypingUsers((current) => ({ ...current, [payload.userId as string]: payload.name || "Traveler" }))
    })

    nextSocket.on("tour:typing:stop", (payload: { userId?: string }) => {
      if (!payload.userId) return
      setTypingUsers((current) => {
        const next = { ...current }
        delete next[payload.userId as string]
        return next
      })
    })

    nextSocket.on("tour:message:error", (payload: { error?: string }) => {
      setError(payload.error ?? "Message failed")
    })

    const announcementPoll = window.setInterval(async () => {
      try {
        const { data } = await api.get(`/tour/${slug}/announcements`, { headers: { "Cache-Control": "no-store" } })
        if (!ignore && Array.isArray(data?.data)) setAnnouncements(data.data)
      } catch { /* The primary chat error state remains authoritative. */ }
    }, 30_000)

    setSocket(nextSocket)

    return () => {
      ignore = true
      window.clearInterval(announcementPoll)
      nextSocket.disconnect()
      setSocket(null)
    }
  }, [loading, slug, socketUrl, user?.id])

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = draft.trim()
    if (!slug || !message || isSending) return

    setIsSending(true)
    setError("")
    try {
      if (socket?.connected && user?.id) {
        socket.emit("tour:message:send", { tourId: slug, message })
      } else {
        const { data: payload } = await api.post(`/tour/${slug}/chat?scope=participant`, { message })
        if (payload?.data) setMessages((current) => [...current, payload.data])
      }
      setDraft("")
    } catch (chatError) {
      setError(getApiErrorMessage(chatError, "Could not send message"))
    } finally {
      setIsSending(false)
    }
  }

  const updateDraft = (value: string) => {
    setDraft(value)
    if (socket?.connected && user?.id) {
      socket.emit(value.trim() ? "tour:typing:start" : "tour:typing:stop", { tourId: slug })
    }
  }

  const submitReport = async () => {
    if (!reporting?.id || safetyBusy) return
    setSafetyBusy(true)
    setError("")
    setNotice("")
    try {
      await api.post(`/tour/${slug}/chat/${reporting.id}/report`, {
        reason: reportReason,
        details: reportDetails,
      })
      setReporting(null)
      setReportDetails("")
      setNotice("Report submitted privately to the safety team.")
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not submit this report"))
    } finally {
      setSafetyBusy(false)
    }
  }

  const blockPerson = async () => {
    const blockedId = reporting?.User?.id
    if (!blockedId || safetyBusy) return
    setSafetyBusy(true)
    setError("")
    setNotice("")
    try {
      await api.post(`/tour/${slug}/blocks/${blockedId}`)
      setMessages((current) => current.filter((message) => message.User?.id !== blockedId))
      setReporting(null)
      setNotice("This person is blocked. Their Trip Circle messages are now hidden from you.")
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not block this person"))
    } finally {
      setSafetyBusy(false)
    }
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href={`/tours/${slug}`} className="inline-flex items-center gap-2 text-sm font-black text-slate-600 hover:text-cyan-700">
            <ArrowLeft className="h-4 w-4" />
            Back to tour
          </Link>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="font-black text-slate-950">{roomName}</h1>
                  <p className="text-xs font-semibold text-slate-500">Unlocked for joined travelers</p>
                </div>
              </div>
              <MessageCircle className="h-5 w-5 text-cyan-700" />
            </div>

            <div className="min-h-[55vh] space-y-4 bg-slate-50 p-5">
              {notice ? <p role="status" className="border-l-2 border-emerald-500 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900">{notice}</p> : null}
              {announcements.slice(0, 3).map((announcement) => (
                <article key={announcement.id} className={`border-l-2 bg-white px-4 py-3 ${announcement.severity === "URGENT" ? "border-rose-600" : announcement.severity === "IMPORTANT" ? "border-amber-500" : "border-cyan-600"}`}>
                  <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-slate-700">{announcement.isPinned ? <Pin className="h-3.5 w-3.5" /> : null}{announcement.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{announcement.message}</p>
                </article>
              ))}
              {isLoading ? (
                <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-600">Loading chat...</p>
              ) : error ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900">
                  <Lock className="h-5 w-5" />
                  <h2 className="mt-3 font-black">Chat is locked</h2>
                  <p className="mt-2 text-sm font-semibold">{error}</p>
                </div>
              ) : messages.length === 0 ? (
                <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-600">Chat is ready. The first group messages will appear here.</p>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`max-w-[78%] rounded-2xl p-4 shadow-sm ${message.messageType === "SYSTEM" ? "bg-slate-950 text-white" : "bg-white text-slate-800"}`}>
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] opacity-70">{message.messageType === "SYSTEM" ? <Pin className="h-3.5 w-3.5" /> : null}{message.User?.name ?? (message.messageType === "SYSTEM" ? "System" : "Traveler")}</p>
                    <p className="mt-2 text-sm font-medium leading-6">{message.message ?? "Shared an update."}</p>
                    {message.messageType !== "SYSTEM" && message.User?.id && message.User.id !== user?.id ? (
                      <button
                        type="button"
                        onClick={() => { setReporting(message); setError(""); setNotice("") }}
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 transition hover:text-rose-700"
                      >
                        <Flag className="h-3.5 w-3.5" /> Report or block
                      </button>
                    ) : null}
                  </div>
                ))
              )}
              {Object.keys(typingUsers).length > 0 && !error ? (
                <p className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">{Object.values(typingUsers).join(", ")} typing...</p>
              ) : null}
            </div>

            {reporting ? (
              <section className="border-t border-slate-200 bg-white p-5" aria-label="Message safety actions">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-rose-700">Private safety report</p>
                    <h2 className="mt-1 font-black text-slate-950">Report a message from {reporting.User?.name ?? "this person"}</h2>
                    <p className="mt-1 text-xs text-slate-500">The reported person will not be told who submitted the report.</p>
                  </div>
                  <button type="button" onClick={() => setReporting(null)} className="p-2 text-slate-500 hover:text-slate-950" aria-label="Close safety actions"><X className="h-4 w-4" /></button>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-[220px_1fr]">
                  <select value={reportReason} onChange={(event) => setReportReason(event.target.value)} className="h-11 border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-cyan-700">
                    <option value="HARASSMENT">Harassment</option>
                    <option value="HATE_OR_ABUSE">Hate or abuse</option>
                    <option value="SEXUAL_CONTENT">Sexual content</option>
                    <option value="THREAT_OR_SAFETY">Threat or safety concern</option>
                    <option value="SCAM_OR_SPAM">Scam or spam</option>
                    <option value="PRIVACY_VIOLATION">Privacy violation</option>
                    <option value="OTHER">Other</option>
                  </select>
                  <input value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} maxLength={2000} placeholder="Optional details (required for Other)" className="h-11 border border-slate-300 px-3 text-sm outline-none focus:border-cyan-700" />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={safetyBusy || (reportReason === "OTHER" && reportDetails.trim().length < 10)} onClick={() => void submitReport()} className="inline-flex h-10 items-center gap-2 bg-rose-700 px-4 text-sm font-bold text-white hover:bg-rose-800 disabled:opacity-40"><Flag className="h-4 w-4" />Submit report</button>
                  <button type="button" disabled={safetyBusy || !reporting.User?.id} onClick={() => void blockPerson()} className="inline-flex h-10 items-center gap-2 border border-slate-300 px-4 text-sm font-bold text-slate-700 hover:border-slate-950 hover:text-slate-950 disabled:opacity-40"><ShieldOff className="h-4 w-4" />Block this person</button>
                </div>
              </section>
            ) : null}

            <div className="border-t border-slate-200 p-4">
              <form onSubmit={sendMessage} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2">
                <input
                  value={draft}
                  onChange={(event) => updateDraft(event.target.value)}
                  disabled={loading || !user || Boolean(error && messages.length === 0) || isSending}
                  placeholder="Write a message"
                  className="flex-1 bg-transparent px-2 text-sm font-semibold outline-none disabled:text-slate-400"
                />
                <button
                  disabled={!draft.trim() || loading || !user || isSending || Boolean(error && messages.length === 0)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white hover:bg-cyan-700 disabled:bg-slate-300"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
