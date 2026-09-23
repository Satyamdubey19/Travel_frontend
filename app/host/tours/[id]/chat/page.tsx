"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { ArrowLeft, Bell, Megaphone, Pin, Send, Shield, Users, X } from "lucide-react"
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

function formatTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value))
}

export default function TourChatPage() {
  const params = useParams()
  const tourId = typeof params.id === "string" ? params.id : ""
  const { user, loading } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [roomName, setRoomName] = useState("Tour community")
  const [draft, setDraft] = useState("")
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState("")
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [showAnnouncement, setShowAnnouncement] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState("")
  const [announcementMessage, setAnnouncementMessage] = useState("")
  const [announcementBusy, setAnnouncementBusy] = useState(false)

  const socketUrl = useMemo(
    () => process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:3001",
    [],
  )

  useEffect(() => {
    if (!loading && !user) {
      setIsLoading(false)
      setError("Please log in as the tour host to open chat")
      return
    }
    if (!tourId || loading || !user?.id) return

    let ignore = false

    const loadChat = async () => {
      setIsLoading(true)
      setError("")
      try {
        const [{ data: payload }, { data: announcementPayload }] = await Promise.all([
          api.get(`/tour/${tourId}/chat`, { headers: { "Cache-Control": "no-store" } }),
          api.get(`/tour/${tourId}/announcements`, { headers: { "Cache-Control": "no-store" } }),
        ])
        if (!ignore) {
          setRoomName(payload?.data?.name ?? "Tour community")
          setMessages(Array.isArray(payload?.data?.messages) ? payload.data.messages : [])
          setAnnouncements(Array.isArray(announcementPayload?.data) ? announcementPayload.data : [])
        }
      } catch (chatError) {
        if (!ignore) setError(getApiErrorMessage(chatError, "Could not load chat"))
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    void loadChat()

    const nextSocket = io(socketUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    })

    nextSocket.emit("tour:join", { tourId })

    nextSocket.on("connect", () => {
      nextSocket.emit("tour:join", { tourId })
    })

    nextSocket.on("tour:message:new", (message: ChatMessage) => {
      setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message])
    })

    nextSocket.on("tour:message:error", (payload: { error?: string }) => {
      setError(payload.error ?? "Message failed")
    })

    const announcementPoll = window.setInterval(async () => {
      try {
        const { data } = await api.get(`/tour/${tourId}/announcements`, { headers: { "Cache-Control": "no-store" } })
        if (!ignore && Array.isArray(data?.data)) setAnnouncements(data.data)
      } catch { /* Chat remains usable during a transient announcement refresh failure. */ }
    }, 30_000)

    setSocket(nextSocket)

    return () => {
      ignore = true
      window.clearInterval(announcementPoll)
      nextSocket.disconnect()
      setSocket(null)
    }
  }, [loading, socketUrl, tourId, user?.id])

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = draft.trim()
    if (!tourId || !user?.id || !message || isSending) return

    setIsSending(true)
    setError("")
    try {
      if (socket?.connected) {
        socket.emit("tour:message:send", { tourId, message })
      } else {
        const { data: payload } = await api.post(`/tour/${tourId}/chat`, { message })
        if (payload?.data) setMessages((current) => [...current, payload.data])
      }
      setDraft("")
    } catch (chatError) {
      setError(getApiErrorMessage(chatError, "Could not send message"))
    } finally {
      setIsSending(false)
    }
  }

  const createAnnouncement = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (announcementTitle.trim().length < 3 || announcementMessage.trim().length < 3 || announcementBusy) return
    setAnnouncementBusy(true)
    setError("")
    try {
      const { data } = await api.post(`/tour/${tourId}/announcements`, {
        title: announcementTitle,
        message: announcementMessage,
        severity: "INFO",
        isPinned: false,
      })
      if (data?.data) setAnnouncements((current) => [data.data, ...current])
      setAnnouncementTitle("")
      setAnnouncementMessage("")
      setShowAnnouncement(false)
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Could not publish announcement"))
    } finally {
      setAnnouncementBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-5 lg:grid-cols-[300px_1fr_320px]">
        <aside className="border border-slate-200 bg-white p-5 shadow-sm">
          <Link href="/host/tours" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-cyan-700"><ArrowLeft className="h-4 w-4" />Back to tours</Link>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-700">Group chat</p>
          <h1 className="mt-2 text-2xl font-black text-slate-950">Tour community</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">Private, booking-gated communication for the active trip group.</p>
          <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm text-slate-600">
            <p className="flex items-center gap-3"><Shield className="h-4 w-4 text-cyan-700" />Server-verified membership</p>
            <p className="flex items-center gap-3"><Bell className="h-4 w-4 text-cyan-700" />Stored host announcements</p>
            <p className="flex items-center gap-3"><Users className="h-4 w-4 text-cyan-700" />Cancellation revokes access</p>
          </div>
        </aside>

        <main className="flex min-h-[78vh] flex-col overflow-hidden border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center bg-cyan-50 text-cyan-700"><Users className="h-5 w-5" /></div>
              <div>
                <p className="font-black text-slate-950">{roomName}</p>
                <p className="text-xs font-semibold text-slate-500">{socket?.connected ? "Live chat connected" : "Live chat reconnecting"}</p>
              </div>
            </div>
            <button onClick={() => setShowAnnouncement(true)} className="bg-cyan-700 px-4 py-2 text-sm font-black text-white hover:bg-cyan-800"><Megaphone className="mr-2 inline h-4 w-4" />Announce</button>
          </div>

          {showAnnouncement ? (
            <form onSubmit={createAnnouncement} className="border-b border-slate-200 bg-cyan-50 p-5">
              <div className="flex items-center justify-between"><p className="text-sm font-black text-cyan-950">Publish a stored Trip Circle announcement</p><button type="button" onClick={() => setShowAnnouncement(false)} aria-label="Close announcement form"><X className="h-4 w-4" /></button></div>
              <div className="mt-3 grid gap-3 sm:grid-cols-[220px_1fr_auto]">
                <input value={announcementTitle} onChange={(event) => setAnnouncementTitle(event.target.value)} maxLength={120} placeholder="Short title" className="h-11 border border-cyan-200 bg-white px-3 text-sm outline-none focus:border-cyan-700" />
                <input value={announcementMessage} onChange={(event) => setAnnouncementMessage(event.target.value)} maxLength={2000} placeholder="Confirmed route, pickup, or preparation update" className="h-11 border border-cyan-200 bg-white px-3 text-sm outline-none focus:border-cyan-700" />
                <button disabled={announcementBusy || announcementTitle.trim().length < 3 || announcementMessage.trim().length < 3} className="h-11 bg-slate-950 px-5 text-sm font-bold text-white disabled:opacity-40">Publish</button>
              </div>
            </form>
          ) : null}

          <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
            {isLoading ? (
              <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-600">Loading chat...</p>
            ) : error && messages.length === 0 ? (
              <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">{error}</p>
            ) : messages.length === 0 ? (
              <p className="rounded-2xl bg-white p-4 text-sm font-semibold text-slate-600">Chat is ready. New group messages will appear here.</p>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`max-w-[78%] border p-4 shadow-sm ${message.User?.id === user?.id ? "ml-auto border-slate-950 bg-slate-950 text-white" : "border-slate-200 bg-white text-slate-800"}`}>
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-xs font-black uppercase tracking-[0.16em] opacity-70">{message.User?.name ?? "Traveler"}</p>
                    <p className="text-xs opacity-60">{formatTime(message.createdAt)}</p>
                  </div>
                  <p className="mt-2 text-sm font-medium leading-6">{message.message ?? "Shared an update."}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-200 p-4">
            {error && messages.length > 0 ? <p className="mb-2 text-sm font-semibold text-amber-700">{error}</p> : null}
            <form onSubmit={sendMessage} className="flex items-center gap-2 border border-slate-200 bg-white p-2">
              <input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                disabled={loading || !user || isSending || Boolean(error && messages.length === 0)}
                placeholder="Write a message or announcement"
                className="flex-1 bg-transparent px-2 text-sm font-semibold outline-none disabled:text-slate-400"
              />
              <button disabled={!draft.trim() || loading || !user || isSending || Boolean(error && messages.length === 0)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-white hover:bg-cyan-700 disabled:bg-slate-300" aria-label="Send message">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </main>

        <aside className="border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Announcements</p>
          <div className="mt-4 space-y-3">
            {announcements.length === 0 ? <p className="border border-dashed border-slate-300 p-4 text-sm text-slate-500">No stored announcements yet.</p> : announcements.map((announcement) => (
              <article key={announcement.id} className="border-l-2 border-cyan-600 bg-slate-50 p-4">
                <p className="flex items-center gap-2 text-sm font-black text-slate-950">{announcement.isPinned ? <Pin className="h-3.5 w-3.5 text-cyan-700" /> : null}{announcement.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{announcement.message}</p>
              </article>
            ))}
          </div>
          <div className="mt-6 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
            Keep group updates short and confirm route or pickup changes before posting.
          </div>
        </aside>
      </div>
    </div>
  )
}
