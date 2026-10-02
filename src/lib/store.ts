"use client"

import { create } from "zustand"
import type { User } from "@/lib/platform"

export type View = "landing" | "login" | "register" | "builder" | "client" | "admin"

type StoreState = {
  user: User | null
  ready: boolean // auth check terminée
  view: View
  setUser: (u: User | null) => void
  setReady: (r: boolean) => void
  setView: (v: View) => void
  logout: () => Promise<void>
}

export const useApp = create<StoreState>((set) => ({
  user: null,
  ready: false,
  view: "landing",
  setUser: (user) => set({ user }),
  setReady: (ready) => set({ ready }),
  setView: (view) => set({ view }),
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {})
    set({ user: null, view: "landing" })
  },
}))
