"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Logo } from "./logo"
import { useApp, type View } from "@/lib/store"
import { toast } from "sonner"
import { ArrowLeft, Loader2 } from "lucide-react"

export function AuthView({ mode }: { mode: "login" | "register" }) {
  const { setUser, setView } = useApp()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: "", email: "", password: "", companyName: "" })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const url = mode === "login" ? "/api/auth/login" : "/api/auth/register"
      const payload =
        mode === "login"
          ? { email: form.email, password: form.password }
          : { email: form.email, password: form.password, name: form.name, companyName: form.companyName }
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Une erreur est survenue")
      setUser(data.user)
      toast.success(mode === "login" ? `Bon retour, ${data.user.name} !` : "Compte créé avec succès 🎉")
      setView(data.user.role === "ADMIN" ? "admin" : "client")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  function fillDemo(kind: "admin" | "client") {
    setForm((f) => ({
      ...f,
      email: kind === "admin" ? "admin@automatic.com" : "client@demo.com",
      password: kind === "admin" ? "admin123" : "demo123",
    }))
    toast.info("Identifiants de démo remplis — cliquez sur Se connecter")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-4 relative overflow-hidden">
      <div className="absolute top-[-30%] left-[20%] w-[50%] h-[60%] bg-emerald-500/8 rounded-full blur-[120px]" />
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="relative w-full max-w-md">
        <button onClick={() => setView("landing")} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 mb-6 transition-colors cursor-pointer">
          <ArrowLeft size={16} /> Retour à l'accueil
        </button>
        <div className="p-8 rounded-3xl border border-white/5 bg-zinc-900/70 backdrop-blur-xl shadow-2xl">
          <div className="mb-8 flex justify-center"><Logo size="lg" /></div>
          <h1 className="text-2xl font-bold text-center mb-1">{mode === "login" ? "Bon retour !" : "Créer un compte"}</h1>
          <p className="text-sm text-zinc-400 text-center mb-8">
            {mode === "login" ? "Accédez à votre espace de pilotage." : "Rejoignez AUTOMATIC en 30 secondes."}
          </p>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Nom complet *</Label>
                  <Input id="name" value={form.name} onChange={set("name")} placeholder="Koffi Adjovi" required className="bg-zinc-950/60 border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Entreprise (optionnel)</Label>
                  <Input id="company" value={form.companyName} onChange={set("companyName")} placeholder="Adjovi & Fils" className="bg-zinc-950/60 border-zinc-800" />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="vous@exemple.com" required className="bg-zinc-950/60 border-zinc-800" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={form.password} onChange={set("password")} placeholder="••••••••" required minLength={6} className="bg-zinc-950/60 border-zinc-800" />
            </div>
            <Button type="submit" disabled={loading} className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
              {loading && <Loader2 size={16} className="animate-spin mr-2" />}
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>

          {mode === "login" && (
            <div className="mt-6 p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 text-xs text-zinc-400">
              <p className="font-semibold text-emerald-400 mb-1.5">Comptes de démonstration :</p>
              <div className="flex flex-col sm:flex-row gap-2">
                <button onClick={() => fillDemo("client")} className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer">
                  👤 Client : client@demo.com
                </button>
                <button onClick={() => fillDemo("admin")} className="flex-1 px-3 py-1.5 rounded-lg bg-zinc-950/60 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer">
                  🛡️ Admin : admin@automatic.com
                </button>
              </div>
            </div>
          )}

          <p className="text-sm text-zinc-400 text-center mt-6">
            {mode === "login" ? (
              <>Pas encore de compte ?{" "}
                <button onClick={() => setView("register")} className="text-emerald-400 hover:underline cursor-pointer font-medium">S'inscrire</button>
              </>
            ) : (
              <>Déjà un compte ?{" "}
                <button onClick={() => setView("login")} className="text-emerald-400 hover:underline cursor-pointer font-medium">Se connecter</button>
              </>
            )}
          </p>
        </div>
      </motion.div>
    </div>
  )
}
