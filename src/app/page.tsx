"use client"

import { useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useApp } from "@/lib/store"
import { Landing } from "@/components/platform/landing"
import { AuthView } from "@/components/platform/auth-view"
import { ProjectBuilder } from "@/components/platform/project-builder"
import { ClientApp } from "@/components/platform/client-app"
import { AdminApp } from "@/components/platform/admin-app"

export default function Home() {
  const { user, ready, view, setUser, setReady, setView } = useApp()

  // Vérification de session au chargement
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user)
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [setUser, setReady])

  // Synchronisation entre onglets
  useEffect(() => {
    const onStorage = () => {}
    window.addEventListener("focus", onStorage)
    return () => window.removeEventListener("focus", onStorage)
  }, [])

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={28} className="animate-spin text-emerald-400" />
          <p className="text-sm text-zinc-500">Chargement d&apos;AUTOMATIC…</p>
        </div>
      </div>
    )
  }

  // Redirection de sécurité : vues protégées sans session
  const protectedView = (view === "client" || view === "admin") && !user
  const effectiveView = protectedView ? "login" : view

  // Si l'utilisateur est connecté et demande builder depuis l'extérieur, on garde builder
  if (effectiveView === "login" || effectiveView === "register") {
    return <AuthView mode={effectiveView} />
  }

  if (effectiveView === "builder") {
    return <ProjectBuilder />
  }

  if (effectiveView === "client" && user) {
    return <ClientApp user={user} />
  }

  if (effectiveView === "admin" && user) {
    if (user.role !== "ADMIN") {
      return <ClientApp user={user} />
    }
    return <AdminApp user={user} />
  }

  return (
    <Landing
      user={user}
      onNavigate={(v) => {
        if ((v === "client" || v === "admin" || v === "builder") && !user && v !== "builder") {
          setView("login")
          return
        }
        setView(v)
      }}
    />
  )
}
