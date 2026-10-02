"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import type { ChatMessage, Message, User } from "@/lib/platform"
import { timeAgo } from "@/lib/platform"
import { cn } from "@/lib/utils"
import { Loader2, SendHorizonal } from "lucide-react"

function useSocket(user: User | null, projectId: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!user || !projectId) return
    // Gateway : jamais de port dans l'URL, uniquement XTransformPort
    const s = io("/?XTransformPort=3003", {
      transports: ["websocket", "polling"],
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 8,
      timeout: 8000,
    })
    s.on("connect", () => {
      setConnected(true)
      s.emit("user:join", { userId: user.id, name: user.name, role: user.role })
      s.emit("project:join", projectId)
    })
    s.on("disconnect", () => setConnected(false))
    s.on("connect_error", () => setConnected(false))
    setSocket(s)
    return () => {
      s.removeAllListeners()
      s.disconnect()
      setSocket(null)
      setConnected(false)
    }
  }, [user, projectId])

  // Rejoindre / quitter les salles quand le projet change
  useEffect(() => {
    if (!socket || !projectId) return
    socket.emit("project:join", projectId)
    return () => {
      if (projectId) socket.emit("project:leave", projectId)
    }
  }, [socket, projectId])

  return { socket, connected }
}

export function ChatPanel({
  user,
  projectId,
  targetUserIds,
  className,
}: {
  user: User | null
  projectId: string | null
  targetUserIds?: string[]
  className?: string
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [typing, setTyping] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { socket, connected } = useSocket(user, projectId)

  // Chargement de l'historique
  const loadHistory = useCallback(async () => {
    if (!projectId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/projects/${projectId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(
          (data.messages as Message[]).map((m) => ({
            id: m.id,
            projectId: m.projectId,
            text: m.text,
            senderId: m.senderId,
            senderName: m.sender.name,
            senderRole: m.sender.role,
            createdAt: m.createdAt,
          }))
        )
      }
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    setMessages([])
    loadHistory()
  }, [projectId, loadHistory])

  // Réception temps réel + repli polling si socket indisponible
  useEffect(() => {
    if (!socket) return
    const onMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        // dédoublonnage (optimiste vs serveur)
        if (prev.some((m) => m.id === msg.id)) return prev
        return [...prev, msg]
      })
      requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 999999, behavior: "smooth" }))
    }
    const onTyping = ({ name, isTyping }: { name: string; isTyping: boolean }) => {
      setTyping(isTyping ? name : null)
    }
    socket.on("chat:message", onMessage)
    socket.on("chat:typing", onTyping)
    return () => {
      socket.off("chat:message", onMessage)
      socket.off("chat:typing", onTyping)
    }
  }, [socket])

  // Repli : rafraîchit l'historique périodiquement quand le temps réel est coupé
  useEffect(() => {
    if (connected || !projectId) return
    const t = setInterval(loadHistory, 5000)
    return () => clearInterval(t)
  }, [connected, projectId, loadHistory])

  useEffect(() => {
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 999999 }))
  }, [messages.length])

  function send() {
    const text = input.trim()
    if (!text || !user || !projectId) return
    const msg: ChatMessage & { targetUserIds?: string[] } = {
      id: `tmp-${Date.now()}`,
      projectId,
      text,
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      createdAt: new Date().toISOString(),
      targetUserIds,
    }
    // envoi socket (temps réel) + persistance API
    socket?.emit("chat:send", msg)
    setMessages((prev) => [...prev, msg])
    fetch(`/api/projects/${projectId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json()
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...msg, id: data.message.id, createdAt: data.message.createdAt } : m))
          )
        } else {
          const err = await res.json().catch(() => ({}))
          toast.error(err.error ?? "Message non envoyé")
        }
      })
      .catch(() => toast.error("Connexion perdue — message non envoyé"))
    setInput("")
    socket?.emit("chat:typing", { projectId, name: user.name, isTyping: false })
  }

  function onInputChange(v: string) {
    setInput(v)
    if (!socket || !projectId || !user) return
    socket.emit("chat:typing", { projectId, name: user.name, isTyping: true })
    if (typingTimeout.current) clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(() => {
      socket.emit("chat:typing", { projectId, name: user.name, isTyping: false })
    }, 1500)
  }

  return (
    <div className={cn("flex flex-col rounded-2xl border border-white/5 bg-zinc-900/60 overflow-hidden", className)}>
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <span className={cn("w-2 h-2 rounded-full", connected ? "bg-emerald-400" : "bg-zinc-600")} />
        <span className="text-sm font-semibold">Discussion projet</span>
        <span className="text-xs text-zinc-500 ml-auto">{connected ? "Temps réel actif" : "Mode différé"}</span>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px] min-h-[260px]">
        {loading ? (
          <div className="flex items-center justify-center h-full text-zinc-500"><Loader2 size={20} className="animate-spin" /></div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm gap-2">
            <span className="text-3xl">💬</span>
            <p>Aucun message pour l'instant.</p>
            <p className="text-xs">Lancez la discussion avec votre interlocuteur !</p>
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.senderId === user?.id
            return (
              <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[80%] rounded-2xl px-3.5 py-2.5",
                  mine ? "bg-emerald-500/90 text-zinc-950 rounded-br-md" : "bg-zinc-800 text-zinc-100 rounded-bl-md")}>
                  {!mine && (
                    <p className={cn("text-xs font-semibold mb-0.5", m.senderRole === "ADMIN" ? "text-emerald-400" : "text-zinc-400")}>
                      {m.senderName}{m.senderRole === "ADMIN" ? " · Équipe" : ""}
                    </p>
                  )}
                  <p className="text-sm whitespace-pre-wrap break-words">{m.text}</p>
                  <p className={cn("text-[10px] mt-1 text-right", mine ? "text-zinc-800" : "text-zinc-500")}>{timeAgo(m.createdAt)}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {typing && <p className="px-4 pb-1 text-xs text-zinc-500 italic">{typing} écrit…</p>}

      <div className="p-3 border-t border-white/5 flex gap-2">
        <Input
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
          placeholder="Écrivez votre message…"
          className="bg-zinc-950/60 border-zinc-800"
        />
        <Button onClick={send} size="icon" className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shrink-0" aria-label="Envoyer">
          <SendHorizonal size={17} />
        </Button>
      </div>
    </div>
  )
}
