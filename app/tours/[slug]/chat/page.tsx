"use client"

import type { FormEvent } from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { io, type Socket } from "socket.io-client"
import { ArrowLeft, Lock, MessageCircle, Pin, Send, Smile, Users } from "lucide-react"
import Header from "@/components/layout/Header/Header"
import Footer from "@/components/layout/Footer/Footer"
import { useAuth } from "@/contexts/AuthContext"
import api, { getApiErrorMessage } from "@/lib/axios"

type ChatMessage = {
  id: string
  message: string | null
  messageType: "TEXT" | "IMAGE" | "SYSTEM"
  createdAt: string
  User?: { name: string }
  reactions?: string[]
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
        const { data: payload } = await api.get(`/tour/${slug}/chat?scope=participant`, {
          headers: { "Cache-Control": "no-store" },
        })
        if (!ignore) {
          setRoomName(payload?.data?.name ?? "Tour group chat")
          setMessages(Array.isArray(payload?.data?.messages) ? payload.data.messages : [])
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

    nextSocket.on("tour:message:reaction", (payload: { messageId?: string; emoji?: string }) => {
      if (!payload.messageId || !payload.emoji) return
      setMessages((current) => current.map((message) => message.id === payload.messageId ? { ...message, reactions: [...(message.reactions ?? []), payload.emoji as string] } : message))
    })

    nextSocket.on("tour:message:error", (payload: { error?: string }) => {
      setError(payload.error ?? "Message failed")
    })

    setSocket(nextSocket)

    return () => {
      ignore = true
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
        socket.emit("tour:message:send", { tourId: slug, userId: user.id, message, scope: "participant" })
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
      socket.emit(value.trim() ? "tour:typing:start" : "tour:typing:stop", { tourId: slug, userId: user.id, name: user.name })
    }
  }

  const reactToMessage = (messageId: string, emoji = "👍") => {
    if (!socket?.connected || !user?.id) return
    socket.emit("tour:message:reaction", { tourId: slug, messageId, userId: user.id, emoji })
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
                    <div className="mt-3 flex items-center gap-2">
                      {(message.reactions ?? []).slice(0, 4).map((reaction, index) => <span key={`${reaction}-${index}`} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">{reaction}</span>)}
                      {message.messageType !== "SYSTEM" ? <button onClick={() => reactToMessage(message.id)} className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600"><Smile className="h-3 w-3" />React</button> : null}
                    </div>
                  </div>
                ))
              )}
              {Object.keys(typingUsers).length > 0 && !error ? (
                <p className="rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-500 shadow-sm">{Object.values(typingUsers).join(", ")} typing...</p>
              ) : null}
            </div>

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
