"use client"

import { useMemo, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { useApp } from "@/lib/store"
import { estimate, PROJECT_TYPES, FEATURES, formatXOF } from "@/lib/estimator"
import { toast } from "sonner"
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

const TYPE_EMOJI: Record<string, string> = {
  web: "🌐",
  mobile: "📱",
  ecommerce: "🛍️",
  saas: "⚙️",
  branding: "🎨",
}

export function ProjectBuilder({ embedded = false, onCreated }: { embedded?: boolean; onCreated?: () => void }) {
  const { user, setView } = useApp()
  const [step, setStep] = useState(1)
  const [projectType, setProjectType] = useState<string>("")
  const [selected, setSelected] = useState<string[]>([])
  const [urgency, setUrgency] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const est = useMemo(() => estimate(projectType || "web", selected, urgency), [projectType, selected, urgency])

  function toggleFeature(id: string) {
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  }

  async function createProject() {
    if (!title.trim()) {
      toast.error("Donnez un titre à votre projet")
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, category: projectType, features: selected, urgency }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success("Projet créé ! Notre équipe le prend en charge immédiatement. 🚀")
      if (onCreated) {
        onCreated()
      } else {
        setView(user?.role === "ADMIN" ? "admin" : "client")
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Erreur")
    } finally {
      setLoading(false)
    }
  }

  const shell = embedded ? "" : "min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-4"

  const steps = ["Type de projet", "Options", "Récapitulatif"]

  return (
    <div className={shell}>
      <div className={cn("w-full", embedded ? "max-w-4xl mx-auto" : "max-w-3xl")}>
        {!embedded && (
          <button onClick={() => setView("landing")} className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 mb-6 transition-colors">
            <ArrowLeft size={16} /> Retour à l'accueil
          </button>
        )}

        <div className={cn("rounded-3xl border border-white/5 bg-zinc-900/70 backdrop-blur-xl shadow-2xl overflow-hidden", embedded ? "p-6" : "p-8")}>
          {/* Header + stepper */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-emerald-400" fill="currentColor" />
              <h1 className="text-2xl font-bold">Project Builder</h1>
            </div>
            <div className="flex items-center gap-2">
              {steps.map((label, i) => (
                <div key={label} className="flex-1">
                  <div className={cn("h-1.5 rounded-full transition-colors", step > i ? "bg-emerald-500" : "bg-zinc-800")} />
                  <p className={cn("text-xs mt-2 font-medium", step > i ? "text-emerald-400" : "text-zinc-500")}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* ── STEP 1 : type ── */}
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p className="text-zinc-400 mb-5">Quel type de projet souhaitez-vous lancer ?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                  {PROJECT_TYPES.map((t) => {
                    const active = projectType === t.id
                    return (
                      <button key={t.id} onClick={() => setProjectType(t.id)}
                        className={cn("text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3",
                          active ? "border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/10" : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700")}>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-2xl", active ? "bg-emerald-500/20" : "bg-zinc-900")}>
                          {TYPE_EMOJI[t.id]}
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t.label}</p>
                          <p className="text-xs text-zinc-400 mt-0.5">{t.description}</p>
                          <p className="text-xs text-emerald-400 mt-1.5 font-medium">Base : {formatXOF(t.basePrice)}</p>
                        </div>
                        {active && <Check size={18} className="text-emerald-400 ml-auto shrink-0" />}
                      </button>
                    )
                  })}
                </div>
                <div className="flex justify-end">
                  <Button disabled={!projectType} onClick={() => setStep(2)} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                    Continuer <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 2 : features ── */}
            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <p className="text-zinc-400 mb-5">Sélectionnez les options souhaitées <span className="text-zinc-500">(tout est facultatif)</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 max-h-[320px] overflow-y-auto pr-1">
                  {FEATURES.map((f) => {
                    const active = selected.includes(f.id)
                    return (
                      <label key={f.id} className={cn("flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer",
                        active ? "border-emerald-500/60 bg-emerald-500/8" : "border-zinc-800 bg-zinc-950/50 hover:border-zinc-700")}>
                        <Checkbox checked={active} onCheckedChange={() => toggleFeature(f.id)} className="mt-0.5 border-zinc-600 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium">{f.label}</p>
                          <p className="text-xs text-zinc-500">{f.description}</p>
                        </div>
                        <span className="text-xs font-semibold text-emerald-400 ml-auto shrink-0">+{formatXOF(f.price)}</span>
                      </label>
                    )
                  })}
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl border border-zinc-800 bg-zinc-950/50 mb-8">
                  <div>
                    <p className="text-sm font-medium flex items-center gap-2"><Sparkles size={15} className="text-amber-400" /> Accélération du délai</p>
                    <p className="text-xs text-zinc-500">Votre projet passe en priorité : livraison 20% plus rapide (+20% budget)</p>
                  </div>
                  <Switch checked={urgency} onCheckedChange={setUrgency} className="data-[state=checked]:bg-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep(1)} className="text-zinc-400">Retour</Button>
                  <Button onClick={() => setStep(3)} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                    Voir l'estimation <ArrowRight size={16} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3 : récap ── */}
            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                {/* Estimation */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/12 to-teal-500/5 border border-emerald-500/25 mb-6">
                  <div className="flex items-end justify-between flex-wrap gap-3">
                    <div>
                      <p className="text-xs text-emerald-400 font-semibold tracking-wider uppercase mb-1">Estimation instantanée</p>
                      <p className="text-4xl font-black text-emerald-300">{formatXOF(est.total)}</p>
                      <p className="text-sm text-zinc-400 mt-1">Délai estimé : <span className="font-semibold text-zinc-200">{est.days} jours</span> · Paiement en 3 phases</p>
                    </div>
                    <div className="text-right space-y-1">
                      {est.weekly.map((w) => (
                        <p key={w.label} className="text-xs text-zinc-400">{w.label} : <span className="font-semibold text-zinc-200">{formatXOF(w.amount)}</span></p>
                      ))}
                    </div>
                  </div>
                  <details className="mt-4 text-sm">
                    <summary className="cursor-pointer text-emerald-400 font-medium">Détail du calcul ({est.breakdown.length} lignes)</summary>
                    <div className="mt-3 space-y-1.5">
                      {est.breakdown.map((b, i) => (
                        <div key={i} className="flex justify-between text-zinc-400">
                          <span>{b.label}</span><span className="font-medium text-zinc-300">{formatXOF(b.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>

                {/* Détails du projet */}
                <div className="space-y-4 mb-8">
                  <div className="space-y-2">
                    <Label htmlFor="ptitle">Titre du projet *</Label>
                    <Input id="ptitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ex : Boutique en ligne Adjovi" className="bg-zinc-950/60 border-zinc-800" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pdesc">Décrivez votre besoin en quelques mots</Label>
                    <Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)}
                      placeholder="Votre activité, vos objectifs, vos clients… Plus vous êtes précis, plus nous sommes rapides."
                      rows={3} className="bg-zinc-950/60 border-zinc-800 resize-none" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Button variant="ghost" onClick={() => setStep(2)} className="text-zinc-400">Retour</Button>
                  {!user ? (
                    <Button onClick={() => setView("register")} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                      Créer un compte pour finaliser <ArrowRight size={16} />
                    </Button>
                  ) : (
                    <Button onClick={createProject} disabled={loading} className="bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold">
                      {loading ? <Loader2 size={16} className="animate-spin mr-2" /> : <Sparkles size={16} className="mr-2" />}
                      Lancer mon projet
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
