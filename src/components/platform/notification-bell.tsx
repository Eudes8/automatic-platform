"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { Notification as Notif, User } from "@/lib/platform"
import { timeAgo } from "@/lib/platform"
import { cn } from "@/lib/utils"
import { Bell, BellRing, Check } from "lucide-react"
import { toast } from "sonner"

const TYPE_EMOJI: Record<string, string> = {
  INFO: "ℹ️", SUCCESS: "✅", WARNING: "⚠️", ERROR: "❌",
  PROJECT: "📁", PAYMENT: "💳", CHAT: "💬", TICKET: "🎫",
}

export function useNotifications(user: User | null) {
  const [notifications, setNotifications] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications)
        setUnread(data.unread)
      }
    } catch {}
  }, [user])

  useEffect(() => {
    refresh()
    pollRef.current = setInterval(refresh, 20000)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [refresh])

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
    setUnread(0)
    setNotifications((n) => n.map((x) => ({ ...x, read: true })))
  }, [])

  const markOneRead = useCallback(async (id: string) => {
    await fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) })
    setNotifications((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x)))
    setUnread((u) => Math.max(0, u - 1))
  }, [])

  return { notifications, unread, refresh, markAllRead, markOneRead }
}

export function NotificationBell({
  user,
  notifications,
  unread,
  markAllRead,
  onOpenProject,
}: {
  user: User
  notifications: Notif[]
  unread: number
  markAllRead: () => void
  onOpenProject?: (projectId: string) => void
}) {
  const [open, setOpen] = useState(false)

  function handleNotificationClick(n: Notif) {
    if (!n.read) {
      fetch("/api/notifications/read", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) }).catch(() => {})
    }
    const pid = n.link?.match(/\/projects\/([\w-]+)/)?.[1]
    if (pid && onOpenProject) onOpenProject(pid)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="relative w-9 h-9 rounded-xl border border-zinc-800 bg-zinc-900/80 flex items-center justify-center text-zinc-300 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors cursor-pointer" aria-label="Notifications">
          {unread > 0 ? <BellRing size={17} className="text-emerald-400" /> : <Bell size={17} />}
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-500 text-zinc-950 text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[360px] p-0 border-white/10 bg-zinc-900/95 backdrop-blur-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <p className="font-semibold text-sm">Notifications</p>
          {unread > 0 && (
            <button onClick={markAllRead} className="text-xs text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer">
              <Check size={13} /> Tout marquer lu
            </button>
          )}
        </div>
        <ScrollArea className="h-[360px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 text-sm gap-2">
              <Bell size={22} />
              Aucune notification
            </div>
          ) : (
            notifications.map((n) => (
              <button key={n.id} onClick={() => handleNotificationClick(n)}
                className={cn("w-full text-left px-4 py-3 border-b border-white/5 flex gap-3 hover:bg-white/5 transition-colors cursor-pointer", !n.read && "bg-emerald-500/5")}>
                <span className="text-lg shrink-0">{TYPE_EMOJI[n.type] ?? "ℹ️"}</span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm truncate", !n.read && "font-semibold text-white")}>{n.title}</p>
                  <p className="text-xs text-zinc-400 line-clamp-2">{n.message}</p>
                  <p className="text-[10px] text-zinc-600 mt-1">{timeAgo(n.createdAt)}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0 mt-1" />}
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
